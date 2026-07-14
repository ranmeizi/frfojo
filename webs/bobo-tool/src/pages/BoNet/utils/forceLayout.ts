import type { GraphEdge, GraphNode } from "../types";
import { getCollisionRadius } from "./nodeGeometry";

export const LAYOUT_ANCHOR_X = 400;
export const LAYOUT_ANCHOR_Y = 300;
/** @deprecated 使用动态画布中心；buildGraph 初始布局锚点见 LAYOUT_ANCHOR_* */
export const CENTER_X = LAYOUT_ANCHOR_X;
/** @deprecated 使用动态画布中心 */
export const CENTER_Y = LAYOUT_ANCHOR_Y;
/** 拖入此半径内视为进入中心族 */
export const CENTER_CLUSTER_RADIUS = 130;

export type ForceCenter = { x: number; y: number };

export type ForceSimOptions = {
  /** 拖拽中固定位置的节点 id */
  pinnedNodeIds?: ReadonlySet<string>;
  center?: ForceCenter;
};

const MOTION_SCALE = 2.4;
const movable = (n: GraphNode) => n.fx === undefined && n.fy === undefined;
const isGidNode = (n: GraphNode) => n.kind !== "E";
const REPULSE_CHARGE = 3200;
const GID_GID_REPULSE_MULT = 2.6;
const COLLISION_STRENGTH = 1.35;
const GID_CENTER_PULL = 0.28;
const E_OWN_PARENT_PULL = 0.075;
const GID_GID_SPRING = 0.55;
const GID_OWN_E_SPRING = 0.24;
const GID_OTHER_E_SPRING = 0.05;
const E_OWN_SPRING_MOVE_SCALE = 0.82;
const E_OTHER_SPRING_MOVE_SCALE = 0.3;

function resolveCenter(options?: ForceSimOptions): ForceCenter {
  return options?.center ?? { x: LAYOUT_ANCHOR_X, y: LAYOUT_ANCHOR_Y };
}

function isOwnEEdge(s: GraphNode, t: GraphNode): boolean {
  return (
    (s.kind === "E" && s.parentGidNodeId === t.id) ||
    (t.kind === "E" && t.parentGidNodeId === s.id)
  );
}

/** 单帧力导向 tick，原地修改 nodes */
export function tickForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  alpha: number,
  options?: ForceSimOptions,
) {
  const pinned = options?.pinnedNodeIds;
  const center = resolveCenter(options);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const motion = MOTION_SCALE * alpha;

  const canMove = (n: GraphNode) =>
    movable(n) && !(pinned && pinned.has(n.id));

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (!canMove(a) && !canMove(b)) continue;

      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.hypot(dx, dy);
      if (dist < 0.5) {
        const angle = ((i * 7 + j * 11) % 360) * (Math.PI / 180);
        dx = Math.cos(angle);
        dy = Math.sin(angle);
        dist = 1;
      }

      const ra = getCollisionRadius(a);
      const rb = getCollisionRadius(b);
      const minDist = ra + rb;

      let force = (REPULSE_CHARGE * motion) / (dist * dist);
      if (isGidNode(a) && isGidNode(b)) {
        force *= GID_GID_REPULSE_MULT;
      }
      if (dist < minDist) {
        const bump = isGidNode(a) && isGidNode(b) ? 10 : 8;
        force += ((minDist - dist) / dist) * COLLISION_STRENGTH * motion * bump;
      }

      dx = (dx / dist) * force;
      dy = (dy / dist) * force;

      if (canMove(a)) {
        a.x -= dx;
        a.y -= dy;
      }
      if (canMove(b)) {
        b.x += dx;
        b.y += dy;
      }
    }
  }

  for (const edge of edges) {
    const s = nodeById.get(edge.source);
    const tg = nodeById.get(edge.target);
    if (!s || !tg) continue;

    let dx = tg.x - s.x;
    let dy = tg.y - s.y;
    const dist = Math.hypot(dx, dy) || 1;

    const rS = getCollisionRadius(s);
    const rT = getCollisionRadius(tg);
    const ownE = isOwnEEdge(s, tg);
    const target = ownE
      ? rS + rT + 4
      : s.kind === "E" || tg.kind === "E"
        ? rS + rT + 8
        : edge.dashed
          ? 150
          : 108;

    const bothGid = isGidNode(s) && isGidNode(tg);
    const springK =
      (ownE
        ? GID_OWN_E_SPRING
        : bothGid
          ? GID_GID_SPRING
          : GID_OTHER_E_SPRING) * motion;
    const force = ((dist - target) / dist) * springK;
    dx *= force;
    dy *= force;

    if (canMove(s)) {
      const scale = isGidNode(s)
        ? 1
        : ownE
          ? E_OWN_SPRING_MOVE_SCALE
          : E_OTHER_SPRING_MOVE_SCALE;
      s.x += dx * scale;
      s.y += dy * scale;
    }
    if (canMove(tg)) {
      const scale = isGidNode(tg)
        ? 1
        : ownE
          ? E_OWN_SPRING_MOVE_SCALE
          : E_OTHER_SPRING_MOVE_SCALE;
      tg.x -= dx * scale;
      tg.y -= dy * scale;
    }
  }

  for (const n of nodes) {
    if (!canMove(n)) continue;
    if (isGidNode(n)) {
      if (n.kind === "A" || n.kind === "B" || n.kind === "C") {
        n.x += (center.x - n.x) * GID_CENTER_PULL * motion;
        n.y += (center.y - n.y) * GID_CENTER_PULL * motion;
      }
    } else if (n.kind === "E" && n.parentGidNodeId) {
      const parent = nodeById.get(n.parentGidNodeId);
      if (parent) {
        n.x += (parent.x - n.x) * E_OWN_PARENT_PULL * motion;
        n.y += (parent.y - n.y) * E_OWN_PARENT_PULL * motion;
      }
    }
  }

  for (const n of nodes) {
    if (pinned?.has(n.id)) continue;
    if (n.fx !== undefined) n.x = n.fx;
    if (n.fy !== undefined) n.y = n.fy;
  }
}

export function cloneSimulationNodes(nodes: GraphNode[]): GraphNode[] {
  return nodes.map((n) => ({ ...n }));
}

export function isInCenterCluster(
  x: number,
  y: number,
  center: ForceCenter = { x: LAYOUT_ANCHOR_X, y: LAYOUT_ANCHOR_Y },
): boolean {
  return Math.hypot(x - center.x, y - center.y) <= CENTER_CLUSTER_RADIUS;
}

/** 将 buildGraph 锚点布局平移到画布中心 */
export function shiftGraphNodes(
  nodes: GraphNode[],
  dx: number,
  dy: number,
): GraphNode[] {
  return nodes.map((n) => ({
    ...n,
    x: n.x + dx,
    y: n.y + dy,
    ...(n.fx !== undefined ? { fx: n.fx + dx } : {}),
    ...(n.fy !== undefined ? { fy: n.fy + dy } : {}),
  }));
}
