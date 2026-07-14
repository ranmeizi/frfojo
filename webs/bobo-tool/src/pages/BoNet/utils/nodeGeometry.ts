import type { GraphNode } from "../types";
import { NODE_RADIUS } from "../constants";

export type CircleBounds = { shape: "circle"; r: number };
export type RectBounds = { shape: "rect"; hw: number; hh: number };
export type NodeBounds = CircleBounds | RectBounds;

const E_FONT_SIZE = 11;
const E_FONT_WEIGHT = 500;
const E_FONT_FAMILY =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const E_PAD_X = 8;
const E_PAD_Y = 6;
const E_MIN_HW = 18;

let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!measureCtx) {
    const canvas = document.createElement("canvas");
    measureCtx = canvas.getContext("2d");
  }
  return measureCtx;
}

/** 与 SVG <text> 使用相同字号/字重，测量玩家名实际像素宽度 */
export function measureENodeTextWidth(label: string): number {
  const ctx = getMeasureCtx();
  if (ctx) {
    ctx.font = `${E_FONT_WEIGHT} ${E_FONT_SIZE}px ${E_FONT_FAMILY}`;
    return ctx.measureText(label).width;
  }
  // 无 DOM 时的保守估计（中文按全宽、ASCII 按半宽）
  let width = 0;
  for (const ch of label) {
    width += ch.charCodeAt(0) > 255 ? E_FONT_SIZE : E_FONT_SIZE * 0.58;
  }
  return width;
}

/** E 类矩形半宽半高（中心为锚点），宽度随内部文字长度变化 */
export function getENodeRect(label: string): { hw: number; hh: number } {
  const textWidth = measureENodeTextWidth(label);
  const hw = Math.max(E_MIN_HW, (textWidth + E_PAD_X * 2) / 2);
  const hh = (E_FONT_SIZE + E_PAD_Y * 2) / 2;
  return { hw, hh };
}

export function getNodeBounds(node: GraphNode): NodeBounds {
  if (node.kind === "E") {
    const { hw, hh } = getENodeRect(node.label);
    return { shape: "rect", hw, hh };
  }
  return { shape: "circle", r: NODE_RADIUS[node.kind] };
}

/** 沿方向从中心到形状边界的距离 */
export function reachAlongRay(bounds: NodeBounds, ux: number, uy: number): number {
  if (bounds.shape === "circle") {
    return bounds.r;
  }
  const { hw, hh } = bounds;
  let t = Infinity;
  if (Math.abs(ux) > 1e-6) {
    t = Math.min(t, hw / Math.abs(ux));
  }
  if (Math.abs(uy) > 1e-6) {
    t = Math.min(t, hh / Math.abs(uy));
  }
  return Number.isFinite(t) ? t : Math.max(hw, hh);
}

export function trimEdgeBetweenNodes(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  sourceBounds: NodeBounds,
  targetBounds: NodeBounds,
) {
  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const rS = reachAlongRay(sourceBounds, ux, uy);
  const rT = reachAlongRay(targetBounds, -ux, -uy);
  return {
    x1: sx + ux * rS,
    y1: sy + uy * rS,
    x2: tx - ux * rT,
    y2: ty - uy * rT,
  };
}

/** 力导向：节点占位半径（含标签留白） */
export function getCollisionRadius(node: GraphNode): number {
  const bounds = getNodeBounds(node);
  if (bounds.shape === "circle") {
    // 圆 + 下方 GID 文字区域
    return bounds.r + 18;
  }
  return Math.max(bounds.hw, bounds.hh) + 12;
}

export const E_NODE_TEXT_STYLE = {
  fontSize: E_FONT_SIZE,
  fontWeight: E_FONT_WEIGHT,
  fontFamily: E_FONT_FAMILY,
} as const;
