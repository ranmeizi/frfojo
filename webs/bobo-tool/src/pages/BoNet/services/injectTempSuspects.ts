import { normalizeGid, opacityForKind } from "../constants";
import { LAYOUT_ANCHOR_X, LAYOUT_ANCHOR_Y } from "../utils/forceLayout";
import type {
  BoNetGraphData,
  GraphEdge,
  GraphNode,
  TempSuspectInjection,
} from "../types";

function gidNodeId(gid: string) {
  return `gid:${gid}`;
}

function nameNodeId(gid: string, name: string) {
  return `name:${gid}:${name}`;
}

/**
 * 将临时可疑 GID（及角色名）并入当前图，作为未落库的 D 类节点。
 * 已存在于图中的 GID 跳过。
 */
export function injectTempSuspects(
  graph: BoNetGraphData,
  temps: TempSuspectInjection[],
): BoNetGraphData {
  if (!temps.length) return graph;

  const centerGid = normalizeGid(graph.centerGid);
  const existingGids = new Set(
    graph.nodes
      .filter((n) => n.kind !== "E" && n.gid)
      .map((n) => normalizeGid(n.gid!)),
  );

  const toAdd = temps.filter((t) => {
    const gid = normalizeGid(t.gid);
    return gid !== centerGid && !existingGids.has(gid);
  });
  if (!toAdd.length) return graph;

  const nodes: GraphNode[] = graph.nodes.map((n) => ({ ...n }));
  const edges: GraphEdge[] = [...graph.edges];
  const cx = LAYOUT_ANCHOR_X;
  const cy = LAYOUT_ANCHOR_Y;
  const ringR = 220;

  const ringCount =
    nodes.filter((n) => n.kind === "C" || n.kind === "D").length + toAdd.length;

  let insertIdx = nodes.filter((n) => n.kind === "C" || n.kind === "D").length;

  for (const item of toAdd) {
    const gid = normalizeGid(item.gid);
    const angle =
      (insertIdx / Math.max(ringCount, 1)) * Math.PI * 2 - Math.PI / 2;
    insertIdx += 1;
    const x = cx + Math.cos(angle) * ringR;
    const y = cy + Math.sin(angle) * ringR;
    const parentId = gidNodeId(gid);

    nodes.push({
      id: parentId,
      kind: "D",
      label: gid,
      gid,
      ruleHints: [`临时对照 · 来自 ${normalizeGid(item.fromCenterGid)} · 未落库`],
      temporary: true,
      x,
      y,
      fx: x,
      fy: y,
      opacity: opacityForKind("D"),
    });
    edges.push({
      id: `link-temp-d-${gid}`,
      source: gidNodeId(centerGid),
      target: parentId,
      dashed: true,
    });

    item.names.forEach((p, idx) => {
      const nameAngle =
        (idx / Math.max(item.names.length, 1)) * Math.PI * 2 + Math.PI / 6;
      const dist = 78 + idx * 16;
      const id = nameNodeId(gid, p.name);
      nodes.push({
        id,
        kind: "E",
        label: p.name,
        gid,
        parentGidNodeId: parentId,
        temporary: true,
        x: x + Math.cos(nameAngle) * dist,
        y: y + Math.sin(nameAngle) * dist,
        opacity: opacityForKind("D"),
      });
      edges.push({
        id: `e-${id}`,
        source: parentId,
        target: id,
      });
    });
  }

  return {
    centerGid,
    nodes,
    edges,
  };
}
