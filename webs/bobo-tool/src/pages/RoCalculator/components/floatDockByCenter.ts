/**
 * 浮窗根相对 bounds 的**水平几何中心**：中心在 bounds 竖直中线以左 → 收起贴 `left`，否则贴 `right`。
 * 与具体业务窗（物品/会长/圣音）无关，仅几何判定。
 */
export function computePeekDockByCenter(
  boundsEl: Element,
  floatRootEl: Element,
): "left" | "right" {
  const rb = boundsEl.getBoundingClientRect();
  const eb = floatRootEl.getBoundingClientRect();
  const midX = rb.left + rb.width / 2;
  const cx = eb.left + eb.width / 2;
  return cx < midX ? "left" : "right";
}

export function resolvePeekDockByCenter(
  boundsSelector: string,
  floatRootEl: Element | null,
): "left" | "right" {
  if (!floatRootEl) return "right";
  const b = document.querySelector(boundsSelector);
  if (!(b instanceof Element)) return "right";
  return computePeekDockByCenter(b, floatRootEl);
}
