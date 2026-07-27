import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { message } from "@frfojo/components";
import type { BoNetGraphData, GraphNode, GidNodeKind } from "../types";
import {
  NODE_COLORS,
  NODE_RADIUS,
  NODE_KIND_LABELS,
  getNodeKindLabel,
  normalizeGid,
} from "../constants";
import {
  CENTER_CLUSTER_RADIUS,
  LAYOUT_ANCHOR_X,
  LAYOUT_ANCHOR_Y,
  cloneSimulationNodes,
  isInCenterCluster,
  shiftGraphNodes,
  tickForceSimulation,
} from "../utils/forceLayout";
import {
  E_NODE_TEXT_STYLE,
  getENodeRect,
  getNodeBounds,
  trimEdgeBetweenNodes,
} from "../utils/nodeGeometry";
import { modalConfirm } from "../utils/modalConfirm";

type AuditFocus = {
  gidA: string;
  gidB: string;
};

type GidGraphCanvasProps = {
  data: BoNetGraphData | null;
  loading?: boolean;
  centerGid?: string;
  /** 申请：拖拽提交；审核：只读查看 */
  bizMode?: "apply" | "audit";
  /** 审核模式下高亮的两个 GID 及连线 */
  auditFocus?: AuditFocus;
  onSwitchGid?: (gid: string) => void;
  onSubmitSuspectReview?: (
    suspectGid: string,
    kind: "C" | "D",
  ) => Promise<boolean>;
};

const AUDIT_FOCUS_COLOR = "#ed6c02";

type SuspectHoverTip = {
  nodeId: string;
  gid: string;
  lines: string[];
  clientX: number;
  clientY: number;
};

function getSuspectReasonLines(node: GraphNode): string[] {
  if (node.kind === "E" || !node.gid) return [];

  const lines: string[] = [];
  if (node.ruleHints?.length) {
    lines.push(...node.ruleHints);
  } else if (node.kind === "D") {
    lines.push(`${NODE_KIND_LABELS.D}（规则疑似）`);
  } else if (node.kind === "C") {
    lines.push(`${NODE_KIND_LABELS.C}`);
  }

  if (node.temporary && !lines.some((l) => l.includes("未落库"))) {
    lines.push("临时插入 · 未落库 · 不可拖拽");
  }
  return lines;
}

function isAuditFocusGidNode(node: GraphNode, focus?: AuditFocus): boolean {
  if (!focus || node.kind === "E" || !node.gid) return false;
  const g = normalizeGid(node.gid);
  return (
    g === normalizeGid(focus.gidA) || g === normalizeGid(focus.gidB)
  );
}

function isAuditFocusEdge(
  edge: { source: string; target: string },
  nodeMap: Map<string, GraphNode>,
  focus?: AuditFocus,
): boolean {
  if (!focus) return false;
  const a = normalizeGid(focus.gidA);
  const b = normalizeGid(focus.gidB);
  const s = nodeMap.get(edge.source);
  const t = nodeMap.get(edge.target);
  if (!s?.gid || !t?.gid || s.kind === "E" || t.kind === "E") return false;
  const sg = normalizeGid(s.gid);
  const tg = normalizeGid(t.gid);
  return (sg === a && tg === b) || (sg === b && tg === a);
}

const LEGEND: { kind: keyof typeof NODE_COLORS; label: string }[] = (
  Object.keys(NODE_KIND_LABELS) as GidNodeKind[]
).map((kind) => ({
  kind,
  label: NODE_KIND_LABELS[kind],
}));

const WARMUP_FRAMES = 120;
const ALPHA_MIN = 0.48;
const TICKS_PER_FRAME = 2;
const DRAG_CLICK_THRESHOLD = 8;

type PointerGestureState = {
  nodeId: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  isSuspect: boolean;
  /** 仅 C/D：移动超过阈值后才进入拖拽 */
  dragging: boolean;
  origFx?: number;
  origFy?: number;
};

const GidGraphCanvas: FC<GidGraphCanvasProps> = ({
  data,
  loading,
  centerGid = "",
  bizMode = "apply",
  auditFocus,
  onSwitchGid,
  onSubmitSuspectReview,
}) => {
  const readOnly = bizMode === "audit";
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 560 });
  const canvasCenter = useMemo(
    () => ({ x: canvasSize.w / 2, y: canvasSize.h / 2 }),
    [canvasSize.w, canvasSize.h],
  );
  const centerRef = useRef(canvasCenter);
  centerRef.current = canvasCenter;

  const [liveNodes, setLiveNodes] = useState<GraphNode[]>([]);
  const [hoverTip, setHoverTip] = useState<SuspectHoverTip | null>(null);
  const hoverTipRef = useRef<SuspectHoverTip | null>(null);
  const frameRef = useRef(0);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<BoNetGraphData["edges"]>([]);
  const dragRef = useRef<PointerGestureState | null>(null);
  const pinnedRef = useRef<Set<string>>(new Set());

  const findSuspectGidAt = useCallback((svgX: number, svgY: number) => {
    let best: GraphNode | null = null;
    let bestDist = Infinity;
    for (const node of nodesRef.current) {
      if (!node.gid) continue;

      // 悬停到角色名时，回查其父 GID（C/D）的可疑原因
      if (node.kind === "E") {
        if (!node.parentGidNodeId) continue;
        const parent = nodesRef.current.find((n) => n.id === node.parentGidNodeId);
        if (!parent || (parent.kind !== "C" && parent.kind !== "D")) continue;
        const { hw, hh } = getENodeRect(node.label);
        if (
          svgX >= node.x - hw - 4 &&
          svgX <= node.x + hw + 4 &&
          svgY >= node.y - hh - 4 &&
          svgY <= node.y + hh + 4
        ) {
          const dist = Math.hypot(svgX - node.x, svgY - node.y);
          if (dist < bestDist) {
            best = parent;
            bestDist = dist;
          }
        }
        continue;
      }

      if (node.kind !== "C" && node.kind !== "D") continue;
      const hitR = NODE_RADIUS[node.kind] + 10;
      const dist = Math.hypot(svgX - node.x, svgY - node.y);
      if (dist <= hitR && dist < bestDist) {
        best = node;
        bestDist = dist;
      }
    }
    return best;
  }, []);

  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: clientX, y: clientY };
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return { x: clientX, y: clientY };
    }
    // 兼容 viewBox + width:100%：按实际渲染矩形换算到用户坐标
    const vb = svg.viewBox.baseVal;
    const vbW = vb.width || canvasSize.w;
    const vbH = vb.height || canvasSize.h;
    const scale = Math.min(rect.width / vbW, rect.height / vbH);
    const offsetX = (rect.width - vbW * scale) / 2;
    const offsetY = (rect.height - vbH * scale) / 2;
    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale,
    };
  }, [canvasSize.h, canvasSize.w]);

  const updateSuspectTip = useCallback(
    (clientX: number, clientY: number) => {
      if (dragRef.current?.dragging) {
        if (hoverTipRef.current) {
          hoverTipRef.current = null;
          setHoverTip(null);
        }
        return;
      }
      const { x, y } = clientToSvg(clientX, clientY);
      const node = findSuspectGidAt(x, y);
      if (!node?.gid) {
        if (hoverTipRef.current) {
          hoverTipRef.current = null;
          setHoverTip(null);
        }
        return;
      }
      const lines = getSuspectReasonLines(node);
      if (!lines.length) {
        if (hoverTipRef.current) {
          hoverTipRef.current = null;
          setHoverTip(null);
        }
        return;
      }
      const next: SuspectHoverTip = {
        nodeId: node.id,
        gid: normalizeGid(node.gid),
        lines,
        clientX,
        clientY,
      };
      const prev = hoverTipRef.current;
      // 同节点仅更新位置时做轻量比较，减少无意义渲染
      if (
        prev &&
        prev.nodeId === next.nodeId &&
        prev.lines.join("\n") === next.lines.join("\n") &&
        Math.abs(prev.clientX - next.clientX) < 2 &&
        Math.abs(prev.clientY - next.clientY) < 2
      ) {
        return;
      }
      hoverTipRef.current = next;
      setHoverTip(next);
    },
    [clientToSvg, findSuspectGidAt],
  );

  const clearSuspectTip = useCallback(() => {
    if (!hoverTipRef.current) return;
    hoverTipRef.current = null;
    setHoverTip(null);
  }, []);

  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      updateSuspectTip(e.clientX, e.clientY);
    };
    const onLeave = () => {
      clearSuspectTip();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [clearSuspectTip, updateSuspectTip]);

  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;

    const updateSize = () => {
      const w = Math.max(320, Math.floor(el.clientWidth) || 800);
      const h = Math.max(420, Math.min(680, Math.round(w * 0.62)));
      setCanvasSize({ w, h });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!data || loading) {
      setLiveNodes([]);
      setHoverTip(null);
      dragRef.current = null;
      pinnedRef.current = new Set();
      nodesRef.current = [];
      return;
    }

    const dx = canvasCenter.x - LAYOUT_ANCHOR_X;
    const dy = canvasCenter.y - LAYOUT_ANCHOR_Y;
    nodesRef.current = shiftGraphNodes(
      cloneSimulationNodes(data.nodes),
      dx,
      dy,
    );
    edgesRef.current = data.edges;
    frameRef.current = 0;

    let raf = 0;
    const loop = () => {
      const f = frameRef.current;
      const alpha =
        f < WARMUP_FRAMES
          ? 1 - (f / WARMUP_FRAMES) * (1 - ALPHA_MIN)
          : ALPHA_MIN;

      const simOpts = {
        pinnedNodeIds: pinnedRef.current,
        center: centerRef.current,
      };
      tickForceSimulation(nodesRef.current, edgesRef.current, alpha, simOpts);
      if (TICKS_PER_FRAME > 1) {
        tickForceSimulation(nodesRef.current, edgesRef.current, alpha, simOpts);
      }
      frameRef.current += 1;
      setLiveNodes(cloneSimulationNodes(nodesRef.current));
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [data, loading, canvasCenter.x, canvasCenter.y]);

  const nodeMap = useMemo(
    () => new Map(liveNodes.map((n) => [n.id, n])),
    [liveNodes],
  );

  const edges = data?.edges ?? [];

  const auditFocusPair = useMemo(() => {
    if (!auditFocus) return null;
    const wantA = normalizeGid(auditFocus.gidA);
    const wantB = normalizeGid(auditFocus.gidB);
    let nodeA: GraphNode | undefined;
    let nodeB: GraphNode | undefined;
    for (const node of liveNodes) {
      if (node.kind === "E" || !node.gid) continue;
      const g = normalizeGid(node.gid);
      if (g === wantA) nodeA = node;
      if (g === wantB) nodeB = node;
    }
    if (!nodeA || !nodeB) return null;
    return { nodeA, nodeB };
  }, [auditFocus, liveNodes]);

  function resolveNodeGid(node: GraphNode): string | undefined {
    if (node.gid) {
      return normalizeGid(node.gid);
    }
    return undefined;
  }

  function isDraggableSuspectNode(node: GraphNode): node is GraphNode & {
    kind: "D";
  } {
    // 临时插入未落库的节点不可拖拽，落库刷新后才可拖入中心族提交核实
    return node.kind === "D" && !node.temporary;
  }

  const handleNodeClick = useCallback(
    async (node: GraphNode) => {
      if (readOnly) return;

      const gid = resolveNodeGid(node);
      if (!gid || !onSwitchGid) return;
      if (gid === normalizeGid(centerGid)) {
        return;
      }
      const label =
        node.kind === "E"
          ? `${getNodeKindLabel("E")}「${node.label}」所属 GID ${gid}`
          : `${getNodeKindLabel(node.kind)} GID ${gid}`;
      const ok = await modalConfirm({
        title: "切换中心 GID",
        content: `是否将中心 GID 切换为：${label}`,
        okText: "切换",
      });
      if (ok) {
        onSwitchGid(gid);
      }
    },
    [centerGid, onSwitchGid, readOnly],
  );

  const finishDrag = useCallback(
    async (gesture: PointerGestureState) => {
      const node = nodesRef.current.find((n) => n.id === gesture.nodeId);
      if (!node || !isDraggableSuspectNode(node)) {
        dragRef.current = null;
        pinnedRef.current = new Set();
        return;
      }

      const gid = resolveNodeGid(node);
      const inCenter = isInCenterCluster(node.x, node.y, centerRef.current);

      if (inCenter && gid && onSubmitSuspectReview) {
        const ok = await onSubmitSuspectReview(gid, node.kind);
        if (!ok) {
          node.x = gesture.origFx!;
          node.y = gesture.origFy!;
          node.fx = gesture.origFx;
          node.fy = gesture.origFy;
        } else {
          delete node.fx;
          delete node.fy;
        }
      } else {
        node.x = gesture.origFx!;
        node.y = gesture.origFy!;
        node.fx = gesture.origFx;
        node.fy = gesture.origFy;
        if (inCenter && !gid) {
          message.warning("无法识别该节点 GID");
        } else if (inCenter && !onSubmitSuspectReview) {
          message.warning("无申请权限，无法提交核实");
        }
      }

      pinnedRef.current.delete(node.id);
      dragRef.current = null;
      setLiveNodes(cloneSimulationNodes(nodesRef.current));
    },
    [onSubmitSuspectReview],
  );

  const beginSuspectDrag = useCallback(
    (gesture: PointerGestureState, clientX: number, clientY: number) => {
      const node = nodesRef.current.find((n) => n.id === gesture.nodeId);
      if (
        !node ||
        gesture.origFx === undefined ||
        gesture.origFy === undefined
      ) {
        return;
      }

      gesture.dragging = true;
      pinnedRef.current.add(node.id);
      delete node.fx;
      delete node.fy;

      const { x, y } = clientToSvg(clientX, clientY);
      node.x = x;
      node.y = y;
      setLiveNodes(cloneSimulationNodes(nodesRef.current));
    },
    [clientToSvg],
  );

  const onPointerMoveWindow = useCallback(
    (e: PointerEvent) => {
      const gesture = dragRef.current;
      if (!gesture || e.pointerId !== gesture.pointerId) return;

      const dist = Math.hypot(
        e.clientX - gesture.startClientX,
        e.clientY - gesture.startClientY,
      );

      if (
        !gesture.dragging &&
        gesture.isSuspect &&
        dist > DRAG_CLICK_THRESHOLD
      ) {
        beginSuspectDrag(gesture, e.clientX, e.clientY);
      }

      if (!gesture.dragging) return;

      const { x, y } = clientToSvg(e.clientX, e.clientY);
      const node = nodesRef.current.find((n) => n.id === gesture.nodeId);
      if (!node) return;

      node.x = x;
      node.y = y;
      setLiveNodes(cloneSimulationNodes(nodesRef.current));
    },
    [beginSuspectDrag, clientToSvg],
  );

  const onPointerUpWindow = useCallback(
    (e: PointerEvent) => {
      const gesture = dragRef.current;
      if (!gesture || e.pointerId !== gesture.pointerId) return;

      window.removeEventListener("pointermove", onPointerMoveWindow);
      window.removeEventListener("pointerup", onPointerUpWindow);

      const node = nodesRef.current.find((n) => n.id === gesture.nodeId);

      if (!gesture.dragging) {
        dragRef.current = null;
        if (node) {
          void handleNodeClick(node);
        }
        return;
      }

      void finishDrag(gesture);
    },
    [finishDrag, handleNodeClick, onPointerMoveWindow],
  );

  const startNodePointer = useCallback(
    (node: GraphNode, e: React.PointerEvent) => {
      if (readOnly) return;

      const gid = resolveNodeGid(node);
      if (!gid) return;

      const draggable = isDraggableSuspectNode(node);
      if (draggable && (node.fx === undefined || node.fy === undefined)) return;

      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);

      const n = nodesRef.current.find((x) => x.id === node.id);
      if (!n) return;

      dragRef.current = {
        nodeId: node.id,
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        isSuspect: draggable,
        dragging: false,
        origFx: draggable ? n.fx : undefined,
        origFy: draggable ? n.fy : undefined,
      };

      window.addEventListener("pointermove", onPointerMoveWindow);
      window.addEventListener("pointerup", onPointerUpWindow);
    },
    [onPointerMoveWindow, onPointerUpWindow, readOnly],
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMoveWindow);
      window.removeEventListener("pointerup", onPointerUpWindow);
    };
  }, [onPointerMoveWindow, onPointerUpWindow]);

  return (
    <Box sx={{ position: "relative", overflow: "visible" }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
        {LEGEND.map((item) => (
          <Chip
            key={item.kind}
            size="small"
            label={item.label}
            sx={{
              bgcolor: NODE_COLORS[item.kind],
              color: "#fff",
              opacity: item.kind === "C" || item.kind === "D" ? 0.85 : 1,
            }}
          />
        ))}
      </Stack>

      <Box
        ref={canvasWrapRef}
        sx={{
          position: "relative",
          width: "100%",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "#fafafa",
          overflow: "hidden",
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height={canvasSize.h}
          viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
          preserveAspectRatio="xMidYMid meet"
          onPointerMove={(e) => updateSuspectTip(e.clientX, e.clientY)}
          onPointerLeave={clearSuspectTip}
        >
          <defs>
            <pattern
              id="bonet-grid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect
            width={canvasSize.w}
            height={canvasSize.h}
            fill="url(#bonet-grid)"
          />

          {!loading && data && liveNodes.length > 0 ? (
            <circle
              cx={canvasCenter.x}
              cy={canvasCenter.y}
              r={CENTER_CLUSTER_RADIUS}
              fill="none"
              stroke="#1976d2"
              strokeWidth={1.5}
              strokeDasharray="8 6"
              opacity={0.35}
              pointerEvents="none"
            />
          ) : null}

          {loading ? (
            <text
              x={canvasSize.w / 2}
              y={canvasSize.h / 2}
              textAnchor="middle"
              fill="#888"
              fontSize={14}
            >
              加载节点图…
            </text>
          ) : null}

          {!loading && data && liveNodes.length > 0 ? (
            <>
              <g className="bonet-nodes-body">
                {liveNodes.map((node) => {
                  if (node.kind === "E") {
                    const { hw, hh } = getENodeRect(node.label);
                    const dragging = pinnedRef.current.has(node.id);
                    return (
                      <g key={`body-${node.id}`} opacity={node.opacity}>
                        <rect
                          x={node.x - hw}
                          y={node.y - hh}
                          width={hw * 2}
                          height={hh * 2}
                          rx={5}
                          ry={5}
                          fill={NODE_COLORS.E}
                          fillOpacity={0.88}
                          stroke={dragging ? "#1565c0" : "#fff"}
                          strokeWidth={dragging ? 3 : 2}
                        />
                        <text
                          x={node.x}
                          y={node.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={E_NODE_TEXT_STYLE.fontSize}
                          fontWeight={E_NODE_TEXT_STYLE.fontWeight}
                          fontFamily={E_NODE_TEXT_STYLE.fontFamily}
                          fill="#fff"
                          pointerEvents="none"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  }

                  const r = NODE_RADIUS[node.kind];
                  const dragging = pinnedRef.current.has(node.id);
                  const focused = isAuditFocusGidNode(node, auditFocus);
                  return (
                    <g key={`body-${node.id}`} opacity={node.opacity}>
                      {focused ? (
                        <>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={r + 12}
                            fill="none"
                            stroke={AUDIT_FOCUS_COLOR}
                            strokeWidth={3}
                            strokeDasharray="6 4"
                            pointerEvents="none"
                          >
                            <animate
                              attributeName="stroke-dashoffset"
                              from="0"
                              to="-20"
                              dur="1.2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={r + 5}
                            fill="none"
                            stroke={AUDIT_FOCUS_COLOR}
                            strokeWidth={2.5}
                            pointerEvents="none"
                          />
                        </>
                      ) : null}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r}
                        fill={NODE_COLORS[node.kind]}
                        fillOpacity={node.temporary ? 0.55 : 0.82}
                        stroke={
                          focused
                            ? AUDIT_FOCUS_COLOR
                            : dragging
                              ? "#1565c0"
                              : node.temporary
                                ? "#ce93d8"
                                : "#fff"
                        }
                        strokeWidth={
                          focused ? 3 : dragging ? 3 : node.temporary ? 2.5 : 2
                        }
                        strokeDasharray={node.temporary ? "5 4" : undefined}
                        pointerEvents="none"
                      />
                    </g>
                  );
                })}
              </g>

              <g className="bonet-edges">
                {edges.map((edge) => {
                  if (isAuditFocusEdge(edge, nodeMap, auditFocus)) return null;
                  const s = nodeMap.get(edge.source);
                  const t = nodeMap.get(edge.target);
                  if (!s || !t) return null;
                  const { x1, y1, x2, y2 } = trimEdgeBetweenNodes(
                    s.x,
                    s.y,
                    t.x,
                    t.y,
                    getNodeBounds(s),
                    getNodeBounds(t),
                  );
                  return (
                    <line
                      key={edge.id}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={edge.dashed ? "#757575" : "#424242"}
                      strokeWidth={edge.dashed ? 2 : 2.5}
                      strokeDasharray={edge.dashed ? "8 5" : undefined}
                      strokeLinecap="round"
                      opacity={Math.min(s.opacity, t.opacity) * 0.95}
                    />
                  );
                })}
              </g>

              {auditFocusPair ? (
                <g className="bonet-audit-edges">
                  {(() => {
                    const { nodeA, nodeB } = auditFocusPair;
                    const { x1, y1, x2, y2 } = trimEdgeBetweenNodes(
                      nodeA.x,
                      nodeA.y,
                      nodeB.x,
                      nodeB.y,
                      getNodeBounds(nodeA),
                      getNodeBounds(nodeB),
                    );
                    return (
                      <line
                        key="audit-focus-line"
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={AUDIT_FOCUS_COLOR}
                        strokeWidth={4}
                        strokeDasharray="12 8"
                        strokeLinecap="round"
                        opacity={Math.min(nodeA.opacity, nodeB.opacity)}
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="0"
                          to="-40"
                          dur="0.8s"
                          repeatCount="indefinite"
                        />
                      </line>
                    );
                  })()}
                </g>
              ) : null}

              <g className="bonet-labels">
                {liveNodes
                  .filter((node) => node.kind !== "E")
                  .map((node) => {
                    const r = NODE_RADIUS[node.kind];
                    const shortLabel =
                      node.label.length > 10
                        ? `${node.label.slice(0, 9)}…`
                        : node.label;
                    return (
                      <text
                        key={`label-${node.id}`}
                        x={node.x}
                        y={node.y + r + 12}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#424242"
                        opacity={node.opacity}
                        pointerEvents="none"
                      >
                        {shortLabel}
                      </text>
                    );
                  })}
              </g>

              <g className="bonet-hit">
                {liveNodes.map((node) => {
                  const gid = resolveNodeGid(node);
                  if (!gid) return null;
                  const isCenter = gid === normalizeGid(centerGid);
                  const draggable = !readOnly && isDraggableSuspectNode(node);

                  if (node.kind === "E") {
                    const { hw, hh } = getENodeRect(node.label);
                    const tempBlocked = Boolean(node.temporary);
                    return (
                      <rect
                        key={`hit-${node.id}`}
                        x={node.x - hw - 4}
                        y={node.y - hh - 4}
                        width={(hw + 4) * 2}
                        height={(hh + 4) * 2}
                        fill="transparent"
                        style={{
                          cursor: readOnly || tempBlocked
                            ? tempBlocked
                              ? "not-allowed"
                              : "default"
                            : isCenter
                              ? "default"
                              : "pointer",
                          touchAction: "none",
                        }}
                        onPointerDown={
                          readOnly || tempBlocked
                            ? undefined
                            : (e) => startNodePointer(node, e)
                        }
                      />
                    );
                  }

                  const r = NODE_RADIUS[node.kind] + 6;
                  const cursor = readOnly
                    ? "default"
                    : draggable
                      ? "grab"
                      : node.temporary
                        ? "not-allowed"
                        : isCenter
                          ? "default"
                          : "pointer";

                  return (
                    <circle
                      key={`hit-${node.id}`}
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill="rgba(0,0,0,0.001)"
                      style={{
                        cursor,
                        touchAction: readOnly ? "auto" : "none",
                      }}
                      onPointerDown={
                        readOnly || node.temporary
                          ? undefined
                          : (e) => {
                              clearSuspectTip();
                              startNodePointer(node, e);
                            }
                      }
                    >
                      {getSuspectReasonLines(node).length ? (
                        <title>
                          {`${node.gid ?? node.label} · 可疑原因\n${getSuspectReasonLines(node).join("\n")}`}
                        </title>
                      ) : null}
                    </circle>
                  );
                })}
              </g>
            </>
          ) : null}

          {!loading && !data ? (
            <text
              x={canvasSize.w / 2}
              y={canvasSize.h / 2}
              textAnchor="middle"
              fill="#888"
              fontSize={14}
            >
              输入中心 GID 后查询
            </text>
          ) : null}
        </svg>
      </Box>

      {hoverTip ? (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            left: hoverTip.clientX + 14,
            top: hoverTip.clientY + 14,
            zIndex: 10000,
            maxWidth: 320,
            px: 1.25,
            py: 1,
            pointerEvents: "none",
            bgcolor: "rgba(33, 33, 33, 0.94)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, display: "block", mb: 0.25 }}
          >
            {hoverTip.gid} · 可疑原因
          </Typography>
          {hoverTip.lines.map((line, idx) => (
            <Typography
              key={`${idx}-${line}`}
              variant="caption"
              component="div"
              sx={{
                mt: 0.25,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.4,
              }}
            >
              {line}
            </Typography>
          ))}
        </Paper>
      ) : null}

      {/* Garfish / transform 祖先下 fixed 可能错位，同步挂一份到 body */}
      {hoverTip
        ? createPortal(
            <Paper
              elevation={8}
              sx={{
                position: "fixed",
                left: hoverTip.clientX + 14,
                top: hoverTip.clientY + 14,
                zIndex: 2147483000,
                maxWidth: 320,
                px: 1.25,
                py: 1,
                pointerEvents: "none",
                bgcolor: "rgba(33, 33, 33, 0.94)",
                color: "#fff",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, display: "block", mb: 0.25 }}
              >
                {hoverTip.gid} · 可疑原因
              </Typography>
              {hoverTip.lines.map((line, idx) => (
                <Typography
                  key={`p-${idx}-${line}`}
                  variant="caption"
                  component="div"
                  sx={{
                    mt: 0.25,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: 1.4,
                  }}
                >
                  {line}
                </Typography>
              ))}
            </Paper>,
            document.body,
          )
        : null}

      {data ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          中心 GID：{data.centerGid} · 节点 {data.nodes.length} · 边{" "}
          {data.edges.length}
          {readOnly
            ? " · 审核模式：请在上方操作栏通过或驳回"
            : ` · 点击切换中心 · 拖拽已落库「${NODE_KIND_LABELS.D}」至虚线圈内提交核实（临时节点不可拖）`}
        </Typography>
      ) : null}
    </Box>
  );
};

export default GidGraphCanvas;
