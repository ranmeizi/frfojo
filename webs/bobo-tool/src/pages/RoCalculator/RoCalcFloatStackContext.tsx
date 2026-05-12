import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";

export const FLOAT_STACK_KEYS = {
  itemInfo: "item-info",
  guildLeader: "guild-leader",
  holySanctity: "holy-sanctity",
  holyDomain: "holy-domain",
} as const;

type FloatDockSide = "left" | "right";

export type VerticalDockStackEntry = {
  id: string;
  /** 同侧内由上到下递增（0 为最上） */
  order: number;
  boundsSelector: string;
  anchorInset: number;
  /** 本窗底部与下一窗之间的间距；默认 12 */
  gapAfterPx?: number;
  getRootEl: () => HTMLElement | null;
  getPosition: () => { x: number; y: number };
  applyPosition: (p: { x: number; y: number }) => void;
  /** 与 FloatWindow 贴边一致：收起 `peekDock===auto` 时先用 `defaultSide`，避免初始 x≈0 时几何全判成左侧 */
  getStackColumnSide: () => FloatDockSide;
};

export const RO_CALC_FLOAT_DOCK_BASE_Y_PX = 96;
export const RO_CALC_FLOAT_DOCK_GAP_PX = 12;
const DOCK_MIN_W_PX = 56;

function dockedX(
  side: FloatDockSide,
  el: HTMLElement,
  bounds: Element,
  anchorInset: number,
): number {
  const parent =
    el.offsetParent instanceof HTMLElement ? el.offsetParent : bounds;
  const pb = parent.getBoundingClientRect();
  const bb = bounds.getBoundingClientRect();
  const w = Math.max(el.getBoundingClientRect().width, DOCK_MIN_W_PX);
  if (side === "left") {
    return bb.left + anchorInset - pb.left;
  }
  return bb.right - anchorInset - w - pb.left;
}

/**
 * 按 {@link VerticalDockStackEntry.getStackColumnSide} 分左/右两列（与浮窗贴边逻辑一致），各列内再按 `order` 自上而下排 `y`。
 */
export function relayoutVerticalDockStack(entries: Map<string, VerticalDockStackEntry>): void {
  const byBounds = new Map<string, VerticalDockStackEntry[]>();
  for (const e of entries.values()) {
    const list = byBounds.get(e.boundsSelector);
    if (list) list.push(e);
    else byBounds.set(e.boundsSelector, [e]);
  }

  for (const [boundsSel, group] of byBounds) {
    const bounds = document.querySelector(boundsSel);
    if (!(bounds instanceof Element)) continue;

    const left: VerticalDockStackEntry[] = [];
    const right: VerticalDockStackEntry[] = [];
    for (const e of group) {
      const el = e.getRootEl();
      if (!el) continue;
      const side = e.getStackColumnSide();
      (side === "left" ? left : right).push(e);
    }

    for (const lane of ["left", "right"] as const) {
      const list = (lane === "left" ? left : right).sort((a, b) =>
        a.order !== b.order ? a.order - b.order : a.id.localeCompare(b.id),
      );
      let y = RO_CALC_FLOAT_DOCK_BASE_Y_PX;
      for (const e of list) {
        const el = e.getRootEl();
        if (!el) continue;
        const nextX = dockedX(lane, el, bounds, e.anchorInset);
        const nextY = y;
        const cur = e.getPosition();
        if (Math.abs(cur.x - nextX) > 0.5 || Math.abs(cur.y - nextY) > 0.5) {
          e.applyPosition({ x: nextX, y: nextY });
        }
        const h = el.getBoundingClientRect().height;
        y += Math.max(h, DOCK_MIN_W_PX) + (e.gapAfterPx ?? RO_CALC_FLOAT_DOCK_GAP_PX);
      }
    }
  }
}

export type RoCalcFloatStackValue = {
  /** 当前鼠标悬停在其上的浮窗 key；null 表示无，各窗用各自默认 zIndex */
  raisedKey: string | null;
  raise: (key: string) => void;
  lower: (key: string) => void;
  /** 注册同 bounds 内竖直栈：按当前左/右贴边分列，`order` 控制同侧自上而下 */
  registerVerticalDockStack: (entry: VerticalDockStackEntry) => () => void;
  /** 下一帧重算竖直栈（换边后尺寸未变时也会更新同侧 `y`） */
  requestVerticalDockRelayout: () => void;
};

const FloatStackContext = createContext<RoCalcFloatStackValue | null>(null);

export function useRoCalcFloatStack(): RoCalcFloatStackValue | null {
  return useContext(FloatStackContext);
}

export const RoCalcFloatStackProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [raisedKey, setRaisedKey] = useState<string | null>(null);
  const verticalEntriesRef = useRef(new Map<string, VerticalDockStackEntry>());
  const relayoutRaf = useRef(0);

  const raise = useCallback((key: string) => {
    setRaisedKey(key);
  }, []);
  const lower = useCallback((key: string) => {
    setRaisedKey((cur) => (cur === key ? null : cur));
  }, []);

  const runRelayout = useCallback(() => {
    relayoutVerticalDockStack(verticalEntriesRef.current);
  }, []);

  const scheduleRelayout = useCallback(() => {
    cancelAnimationFrame(relayoutRaf.current);
    relayoutRaf.current = requestAnimationFrame(() => {
      runRelayout();
    });
  }, [runRelayout]);

  const registerVerticalDockStack = useCallback(
    (entry: VerticalDockStackEntry) => {
      verticalEntriesRef.current.set(entry.id, entry);
      runRelayout();
      queueMicrotask(runRelayout);

      const el = entry.getRootEl();
      const ro =
        el != null
          ? new ResizeObserver(() => {
              scheduleRelayout();
            })
          : null;
      if (el && ro) ro.observe(el);

      const onWin = () => scheduleRelayout();
      window.addEventListener("resize", onWin);

      return () => {
        window.removeEventListener("resize", onWin);
        ro?.disconnect();
        verticalEntriesRef.current.delete(entry.id);
        runRelayout();
      };
    },
    [runRelayout, scheduleRelayout],
  );

  const value = useMemo(
    () => ({
      raisedKey,
      raise,
      lower,
      registerVerticalDockStack,
      requestVerticalDockRelayout: scheduleRelayout,
    }),
    [raisedKey, raise, lower, registerVerticalDockStack, scheduleRelayout],
  );
  return (
    <FloatStackContext.Provider value={value}>{children}</FloatStackContext.Provider>
  );
};
