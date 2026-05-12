import { useCallback, useEffect, useRef } from "react";

/** 超过该位移（px）视为拖拽，释放后的 click 不触发展开 */
const MOVE_PX = 8;

/**
 * 收起态小圆钮同时用于拖拽与点击展开时：若指针移动超过阈值则视为拖拽，忽略随后的 click 展开。
 */
export function usePeekExpandClick(enabled: boolean, onExpand: () => void) {
  const onExpandRef = useRef(onExpand);
  useEffect(() => {
    onExpandRef.current = onExpand;
  }, [onExpand]);

  const movedRef = useRef(false);

  const peekPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const pid = e.pointerId;
      movedRef.current = false;

      const move = (ev: PointerEvent) => {
        if (ev.pointerId !== pid) return;
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > MOVE_PX) {
          movedRef.current = true;
        }
      };

      const up = (ev: PointerEvent) => {
        if (ev.pointerId !== pid) return;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
      };

      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerup", up, { capture: true });
      window.addEventListener("pointercancel", up, { capture: true });
    },
    [enabled],
  );

  const peekClick = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) {
        onExpandRef.current();
        return;
      }
      if (movedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        movedRef.current = false;
        return;
      }
      onExpandRef.current();
    },
    [enabled],
  );

  return { peekPointerDown, peekClick };
}
