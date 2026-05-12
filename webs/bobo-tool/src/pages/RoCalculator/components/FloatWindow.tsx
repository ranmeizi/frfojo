import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Fade,
  IconButton,
  Paper,
  Slide,
  Stack,
  Tooltip,
  Typography,
  Zoom,
  type SxProps,
  type Theme,
  useTheme,
} from "@mui/material";
import {
  type MutableRefObject,
  forwardRef,
  type ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Draggable, { type DraggableData, type DraggableEvent } from "react-draggable";
import { useRoCalcFloatStack } from "../RoCalcFloatStackContext";
import { computePeekDockByCenter } from "./floatDockByCenter";
import { usePeekExpandClick } from "./usePeekExpandClick";

/** 加在可拖拽区域：收起态外圈、展开态标题条（勿放在需独立点击的按钮上） */
export const FLOAT_WINDOW_DRAG_HANDLE = "float-window__drag";

const OPEN_CANCEL =
  ".MuiIconButton-root, button, a, input, textarea, select, [role='slider']";
const PEEK_CANCEL = "a, input, textarea, select, [role='slider']";

/** 收起仅小圆钮时：须给相对定位父级非零宽高，否则仅有 absolute 子元素时宽度为 0，`right:0` 无法贴边 */
const PEEK_CLUSTER_MIN_PX = 56;

function muiSlideDirection(layoutSide: "left" | "right"): "left" | "right" {
  return layoutSide === "left" ? "right" : "left";
}

export type FloatWindowPosition = { x: number; y: number };

/** 初始平移：`x` 可省略（水平用 {@link FloatWindowProps.defaultSide} / `peekDock` 在收起时算出） */
export type FloatWindowDefaultPosition = {
  x?: number;
  y?: number;
};

/** 收起态水平贴边：`left` / `right` 强制；`auto` 按几何中心相对 bounds 判定 */
export type FloatWindowPeekDock = "left" | "right" | "auto";

export type FloatWindowHandle = {
  getPosition: () => FloatWindowPosition;
  setPosition: (p: FloatWindowPosition) => void;
};

export type FloatWindowProps = {
  /** 定位与贴边参照，须建立定位上下文（一般为 `position: relative`） */
  boundsSelector: string;
  /** `Slide` 的 `container`；默认与 bounds 相同 */
  slideContainerSelector?: string;
  children: ReactNode;
  title: ReactNode;
  collapseIcon: ReactNode;
  collapseAriaLabel: string;
  collapseTooltip?: string;
  closeAriaLabel?: string;
  /** 非受控：初始是否展开 */
  defaultOpen?: boolean;
  /** 受控展开 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * 初始平移（相对 offsetParent）。可只写 `y`；不写 `x` 时水平由 `defaultSide`（及收起时的 `peekDock`）决定。
   * 若显式传入 `x` 或 `y`（之一即可），首屏不会被自动贴边/展开对齐立刻覆盖；拖曳松手或收起/展开切换后仍会按原逻辑贴边与对齐。
   */
  defaultPosition?: FloatWindowDefaultPosition;
  /**
   * 默认水平在 bounds 左侧或右侧（不必写 `defaultPosition.x`）。
   * 仅当 `peekDock === "auto"` 时参与贴边：首屏/收起后未在收起态拖移过则贴该侧；收起态拖移超过约 3px 再松手则改按几何中心贴边并保持（展开再收起不会回到默认侧，除非再拖回或改 `peekDock`）。
   */
  defaultSide?: "left" | "right";
  /**
   * 收起态水平贴边：`left` / `right` 强制靠该侧；`auto`（默认）按浮层相对 bounds 的几何中心判定。
   * 展开态松手后的水平贴边仍按几何中心判定（不受此项约束）。
   */
  peekDock?: FloatWindowPeekDock;
  anchorInset?: number;
  cardSx?: SxProps<Theme>;
  zIndex?: number;
  stackKey?: string;
  rootClassName?: string;
  dimmedOpacity?: number;
  floatRootRef?: MutableRefObject<HTMLDivElement | null>;
  /** 展开卡片估算宽度，用于首次展开时水平对齐（px） */
  cardWidthEstimate?: number;
  headerActions?: ReactNode;
  /** 卡片正文区域 `Box` 的 sx（默认 `p: 1, pt: 0.75`） */
  contentSx?: SxProps<Theme>;
  /**
   * 即将展开前同步调用（在收起钮切到展开动画之前）。
   * 用于依赖其它浮层几何的布局（如纵向叠放）。
   */
  onBeforeExpand?: (ctx: {
    getPosition: () => FloatWindowPosition;
    setPosition: (p: FloatWindowPosition) => void;
  }) => void;
  /**
   * 与同一 `boundsSelector` 内、**当前栈列**（与贴边一致：收起 `peekDock===auto` 时先用 `defaultSide`，拖过再按几何中心；展开按几何中心）同侧的其它窗按 `verticalStackOrder` 自上而下错峰。
   * 须同时设置 {@link stackKey}；竖直 `y` 由栈分配，展开时仅夹紧 `y` 而不改用 DOM 的 rawY 覆盖栈算好的值。
   */
  verticalStackOrder?: number;
  /** 本窗底缘与下一窗的间距（px），默认 12 */
  verticalStackGapPx?: number;
};

/**
 * 通用可贴边浮窗：收起为 IconButton，展开为卡片；拖拽把手在收起外圈与标题条；
 * 松手后按几何中心在 bounds 内水平贴左/右，竖直方向夹紧；展开/收起/贴边位移使用 MUI 动画。
 */
export const FloatWindow = forwardRef<FloatWindowHandle, FloatWindowProps>(function FloatWindow(
  {
    boundsSelector,
    slideContainerSelector,
    children,
    title,
    collapseIcon,
    collapseAriaLabel,
    collapseTooltip,
    closeAriaLabel = "关闭",
    defaultOpen = false,
    open: openProp,
    onOpenChange,
    defaultPosition,
    defaultSide,
    peekDock = "auto",
    anchorInset = 20,
    cardSx,
    zIndex: zIndexProp,
    stackKey,
    rootClassName,
    dimmedOpacity = 0.5,
    floatRootRef: floatRootRefProp,
    cardWidthEstimate = 300,
    headerActions,
    contentSx,
    onBeforeExpand,
    verticalStackOrder,
    verticalStackGapPx,
  }: FloatWindowProps,
  ref,
) {
  const theme = useTheme();
  const floatStack = useRoCalcFloatStack();
  const nodeRef = useRef<HTMLDivElement>(null);

  const isControlled = openProp !== undefined;
  const initiallyOpen = openProp ?? defaultOpen;
  /** 仅首屏：用于决定是否跳过「会覆盖 default 位置」的自动 layout */
  const initiallyCollapsed = !initiallyOpen;
  const userGaveDefaultCoords =
    defaultPosition?.x !== undefined || defaultPosition?.y !== undefined;
  const strictLayoutDoublePass = import.meta.env.DEV ? 2 : 1;

  const [openInner, setOpenInner] = useState(defaultOpen);
  const open = isControlled ? Boolean(openProp) : openInner;

  const setOpen = useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
      if (!isControlled) setOpenInner(next);
    },
    [isControlled, onOpenChange],
  );

  const [peekVisible, setPeekVisible] = useState(() => !initiallyOpen);
  const [peekLayoutSide, setPeekLayoutSide] = useState<"left" | "right">(() => {
    const resolved: FloatWindowPeekDock =
      peekDock !== "auto" ? peekDock : defaultSide != null ? defaultSide : "auto";
    return resolved === "auto" ? "right" : resolved;
  });
  const [dragPos, setDragPos] = useState<FloatWindowPosition>(() => ({
    x: defaultPosition?.x ?? 0,
    y: defaultPosition?.y ?? 96,
  }));
  const dragPosRef = useRef(dragPos);
  dragPosRef.current = dragPos;
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  /** 收起态首屏 layout：跳过若干次 `snapFloatToBounds`（DEV 两次以抵消 Strict Mode） */
  const skipInitialCollapsedSnapRemaining = useRef(
    initiallyCollapsed && userGaveDefaultCoords ? strictLayoutDoublePass : 0,
  );
  /** 展开态首屏且挂载时已展开：跳过若干次 `alignExpanded`（同上） */
  const skipInitialExpandedAlignRemaining = useRef(
    initiallyOpen && userGaveDefaultCoords ? strictLayoutDoublePass : 0,
  );

  useImperativeHandle(
    ref,
    () => ({
      getPosition: () => dragPosRef.current,
      setPosition: (p: FloatWindowPosition) => {
        dragPosRef.current = p;
        setDragPos(p);
      },
    }),
    [],
  );

  const setRootRef = (el: HTMLDivElement | null) => {
    (nodeRef as MutableRefObject<HTMLDivElement | null>).current = el;
    if (floatRootRefProp) floatRootRefProp.current = el;
  };

  const slideContainer = useCallback((): HTMLElement | null => {
    const sel = slideContainerSelector ?? boundsSelector;
    return (document.querySelector(sel) as HTMLElement | null) ?? document.body;
  }, [slideContainerSelector, boundsSelector]);

  const openRef = useRef(open);
  const peekVisibleRef = useRef(peekVisible);
  openRef.current = open;
  peekVisibleRef.current = peekVisible;

  /** 关闭卡片后、Slide 尚未 `onExited` 前：`open` 可能仍为 true，用此标记按收起态解析贴边与栈列 */
  const closingToPeekRef = useRef(false);

  /** 收起态在 `peekDock===auto` 时：未拖过则用 `defaultSide`；拖过再松手则按几何中心贴边并保持（关卡片不重置） */
  const userStoppedCollapsedDragRef = useRef(false);
  const dragStartPosRef = useRef<FloatWindowPosition>({ x: 0, y: 0 });

  const getStackColumnSide = useCallback((): "left" | "right" => {
    const el = nodeRef.current;
    const bounds = document.querySelector(boundsSelector);
    if (!(bounds instanceof Element) || !el) {
      return defaultSide ?? "right";
    }
    const peekCollapsed =
      closingToPeekRef.current || (peekVisibleRef.current && !openRef.current);
    const handleEl = el.querySelector(`.${FLOAT_WINDOW_DRAG_HANDLE}`);
    const dockEl =
      peekCollapsed && handleEl instanceof HTMLElement ? handleEl : el;
    if (!peekCollapsed) {
      return computePeekDockByCenter(bounds, dockEl);
    }
    if (peekDock !== "auto") {
      return peekDock;
    }
    if (!userStoppedCollapsedDragRef.current && defaultSide != null) {
      return defaultSide;
    }
    return computePeekDockByCenter(bounds, dockEl);
  }, [boundsSelector, peekDock, defaultSide]);

  const syncPeekSideFromDom = useCallback(() => {
    setPeekLayoutSide(getStackColumnSide());
  }, [getStackColumnSide]);

  /** 水平贴边 + 竖直夹紧；收起态用固定宽度，避免量到错误盒宽导致「空一卡」 */
  const snapFloatToBounds = useCallback(() => {
    const el = nodeRef.current;
    const bounds = document.querySelector(boundsSelector);
    if (!(bounds instanceof Element) || !el) return;

    const peekCollapsed =
      closingToPeekRef.current || (peekVisibleRef.current && !openRef.current);
    const fb = el.getBoundingClientRect();
    const snapW = peekCollapsed ? PEEK_CLUSTER_MIN_PX : fb.width;
    const snapH = peekCollapsed ? PEEK_CLUSTER_MIN_PX : fb.height;

    const handleEl = el.querySelector(`.${FLOAT_WINDOW_DRAG_HANDLE}`);
    const dockEl =
      peekCollapsed && handleEl instanceof HTMLElement ? handleEl : el;

    const bb = bounds.getBoundingClientRect();
    const side: "left" | "right" = (() => {
      if (!peekCollapsed) {
        return computePeekDockByCenter(bounds, dockEl);
      }
      if (peekDock !== "auto") {
        return peekDock;
      }
      if (!userStoppedCollapsedDragRef.current && defaultSide != null) {
        return defaultSide;
      }
      return computePeekDockByCenter(bounds, dockEl);
    })();
    setPeekLayoutSide(side);

    const targetLeftDoc =
      side === "left" ? bb.left + anchorInset : bb.right - anchorInset - snapW;
    const targetTopDoc = Math.min(
      Math.max(fb.top, bb.top + anchorInset),
      bb.bottom - anchorInset - snapH,
    );

    const parent =
      el.offsetParent instanceof HTMLElement ? el.offsetParent : (bounds as HTMLElement);
    const pb = parent.getBoundingClientRect();
    setDragPos({
      x: targetLeftDoc - pb.left,
      y: targetTopDoc - pb.top,
    });
    if (verticalStackOrder !== undefined && floatStack) {
      queueMicrotask(() => {
        floatStack.requestVerticalDockRelayout();
      });
    }
  }, [boundsSelector, anchorInset, peekDock, defaultSide, verticalStackOrder, floatStack]);

  useLayoutEffect(() => {
    if (!peekVisible || open) return;
    if (skipInitialCollapsedSnapRemaining.current > 0) {
      skipInitialCollapsedSnapRemaining.current -= 1;
      return;
    }
    snapFloatToBounds();
  }, [peekVisible, open, snapFloatToBounds]);

  useLayoutEffect(() => {
    if (stackKey == null || verticalStackOrder === undefined || !floatStack) return;
    return floatStack.registerVerticalDockStack({
      id: stackKey,
      order: verticalStackOrder,
      boundsSelector,
      anchorInset,
      gapAfterPx: verticalStackGapPx,
      getRootEl: () => nodeRef.current,
      getPosition: () => dragPosRef.current,
      getStackColumnSide,
      applyPosition: (p) => {
        dragPosRef.current = { ...dragPosRef.current, ...p };
        setDragPos((prev) => ({ ...prev, ...p }));
      },
    });
  }, [
    verticalStackOrder,
    verticalStackGapPx,
    stackKey,
    boundsSelector,
    anchorInset,
    floatStack,
    getStackColumnSide,
  ]);

  useEffect(() => {
    if (!isControlled) return;
    if (openProp) {
      setPeekVisible(false);
    }
    /** 收起态勿在此把 peekVisible 置 true，须等 Slide onExited（handleSlideExited），否则 Slide 被卸掉无法过渡且与条件渲染冲突 */
  }, [isControlled, openProp]);

  const onDrag = useCallback((_e: DraggableEvent, d: DraggableData) => {
    setDragPos({ x: d.x, y: d.y });
  }, []);

  const onStart = useCallback(() => {
    dragStartPosRef.current = { ...dragPosRef.current };
    setDragging(true);
  }, []);

  const onStop = useCallback(() => {
    const peekCollapsed =
      closingToPeekRef.current || (peekVisibleRef.current && !openRef.current);
    if (peekCollapsed) {
      const p = dragPosRef.current;
      const d0 = dragStartPosRef.current;
      if (Math.abs(p.x - d0.x) > 3 || Math.abs(p.y - d0.y) > 3) {
        userStoppedCollapsedDragRef.current = true;
      }
    }
    setDragging(false);
    snapFloatToBounds();
    if (verticalStackOrder !== undefined && floatStack) {
      queueMicrotask(() => {
        floatStack.requestVerticalDockRelayout();
      });
    }
  }, [snapFloatToBounds, verticalStackOrder, floatStack]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    if (skipInitialExpandedAlignRemaining.current > 0) {
      skipInitialExpandedAlignRemaining.current -= 1;
      return;
    }

    const alignExpanded = () => {
      const el = nodeRef.current;
      const bounds = document.querySelector(boundsSelector);
      if (!(bounds instanceof Element) || !el) return;

      const nb = el.getBoundingClientRect();
      const bb = bounds.getBoundingClientRect();
      const parent =
        el.offsetParent instanceof HTMLElement ? el.offsetParent : (bounds as HTMLElement);
      const pb = parent.getBoundingClientRect();

      const w = nb.width || cardWidthEstimate;
      const h = nb.height || 120;
      const layoutSide =
        verticalStackOrder !== undefined ? getStackColumnSide() : peekLayoutSide;
      if (verticalStackOrder !== undefined) {
        setPeekLayoutSide((prev) => (prev === layoutSide ? prev : layoutSide));
      }
      const nextX =
        layoutSide === "left"
          ? bb.left + anchorInset - pb.left
          : bb.right - anchorInset - w - pb.left;
      const maxY = bb.bottom - anchorInset - h - pb.top;
      const minY = bb.top + anchorInset - pb.top;
      const rawY = nb.top - pb.top;
      const nextY =
        verticalStackOrder !== undefined
          ? Math.min(Math.max(dragPosRef.current.y, minY), maxY)
          : Math.min(Math.max(rawY, minY), maxY);

      setDragPos((p) => {
        if (Math.abs(p.x - nextX) < 0.5 && Math.abs(p.y - nextY) < 0.5) return p;
        return { x: nextX, y: nextY };
      });
    };

    alignExpanded();
    let innerRaf = 0;
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(alignExpanded);
    });
    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
    };
  }, [open, boundsSelector, anchorInset, peekLayoutSide, cardWidthEstimate, verticalStackOrder, getStackColumnSide]);

  const handleOpen = useCallback(() => {
    closingToPeekRef.current = false;
    const getPosition = () => dragPosRef.current;
    const setPosition = (p: FloatWindowPosition) => {
      dragPosRef.current = p;
      setDragPos(p);
    };
    onBeforeExpand?.({ getPosition, setPosition });
    setPeekVisible(false);
    setOpen(true);
  }, [onBeforeExpand, setOpen]);

  const handleClose = useCallback(() => {
    closingToPeekRef.current = true;
    syncPeekSideFromDom();
    setOpen(false);
  }, [setOpen, syncPeekSideFromDom]);

  const handleSlideExited = useCallback(() => {
    closingToPeekRef.current = false;
    setPeekVisible(true);
  }, []);

  const peekIconDragMode = Boolean(peekVisible && !open);
  const { peekPointerDown, peekClick } = usePeekExpandClick(peekIconDragMode, handleOpen);

  const baseZ = zIndexProp ?? theme.zIndex.drawer + 2;
  let effectiveZ = baseZ;
  if (stackKey && floatStack?.raisedKey != null) {
    if (floatStack.raisedKey === stackKey) {
      effectiveZ = Math.max(effectiveZ, theme.zIndex.modal + 10);
    } else {
      effectiveZ = Math.min(effectiveZ, theme.zIndex.drawer);
    }
  }

  const opacityTransition = theme.transitions.create("opacity", { duration: 200 });
  const transformTransition = dragging
    ? "none"
    : theme.transitions.create("transform", {
        duration: theme.transitions.duration.short,
        easing: theme.transitions.easing.easeInOut,
      });
  const rootTransition =
    dragging ? opacityTransition : [opacityTransition, transformTransition].join(", ");

  return (
    <Draggable
      nodeRef={nodeRef}
      handle={`.${FLOAT_WINDOW_DRAG_HANDLE}`}
      bounds={boundsSelector}
      position={dragPos}
      onDrag={onDrag}
      onStart={onStart}
      onStop={onStop}
      cancel={peekIconDragMode ? PEEK_CANCEL : OPEN_CANCEL}
    >
      <Box
        ref={setRootRef}
        className={rootClassName}
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          ...(peekVisible && !open
            ? {
                width: PEEK_CLUSTER_MIN_PX,
                maxWidth: PEEK_CLUSTER_MIN_PX,
                minWidth: PEEK_CLUSTER_MIN_PX,
              }
            : {
                width: "max-content",
                maxWidth: "min(calc(100% - 16px), 320px)",
              }),
          zIndex: effectiveZ,
          opacity: hovered ? 1 : dimmedOpacity,
          /** react-draggable 写在本节点上的 transform 与 MUI 时长/曲线 */
          transition: rootTransition,
          pointerEvents: "none",
        }}
      >
        <Box
          className="float-window__inner"
          onMouseEnter={() => {
            setHovered(true);
            if (stackKey) floatStack?.raise(stackKey);
          }}
          onMouseLeave={() => {
            setHovered(false);
            if (stackKey) floatStack?.lower(stackKey);
          }}
          sx={{
            pointerEvents: "auto",
            width: "max-content",
            maxWidth: "100%",
            minWidth: peekVisible && !open ? PEEK_CLUSTER_MIN_PX : 0,
            minHeight: peekVisible && !open ? PEEK_CLUSTER_MIN_PX : 0,
            position: "relative",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          {/*
           * 收起并显示小圆钮后不要挂载 Slide：`in=false` 的 exited 阶段子节点仍为 `visibility:hidden`，
           * Paper ~300px 会撑开 flex 父级，贴边 snap 会按卡片宽度算，右侧会空出一卡宽。
           * 仅在「展开中 / 收起动画中」（open 或尚未恢复 peek）保留 Slide。
           */}
          {!(peekVisible && !open) ? (
            <Slide
              direction={muiSlideDirection(peekLayoutSide)}
              in={open}
              timeout={theme.transitions.duration.enteringScreen}
              mountOnEnter
              unmountOnExit
              onExited={handleSlideExited}
              container={slideContainer}
            >
              <Paper
                elevation={6}
                sx={{
                  width: { xs: "min(calc(100vw - 24px), 300px)", sm: 300 },
                  maxHeight: "min(85vh, 560px)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderRadius: 2,
                  ...cardSx,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 1.25,
                    py: 0.65,
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "action.hover",
                    gap: 0.5,
                    minHeight: 38,
                  }}
                >
                  <Box
                    className={`${FLOAT_WINDOW_DRAG_HANDLE}`}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      cursor: "grab",
                      "&:active": { cursor: "grabbing" },
                      pr: 0.5,
                    }}
                  >
                    {typeof title === "string" ? (
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        component="span"
                        sx={{ fontSize: "0.8125rem" }}
                      >
                        {title}
                      </Typography>
                    ) : (
                      title
                    )}
                  </Box>
                  {headerActions}
                  <Tooltip title={closeAriaLabel}>
                    <IconButton
                      size="small"
                      aria-label={closeAriaLabel}
                      onClick={handleClose}
                      sx={{ mt: -0.25 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Box
                  sx={{
                    p: 1,
                    pt: 0.75,
                    overflow: "auto",
                    flex: 1,
                    minHeight: 0,
                    ...contentSx,
                  }}
                >
                  {children}
                </Box>
              </Paper>
            </Slide>
          ) : null}

          {peekVisible && !open ? (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                ...(peekLayoutSide === "left"
                  ? { left: 0, right: "auto" }
                  : { right: 0, left: "auto" }),
              }}
            >
              <Fade in timeout={theme.transitions.duration.shorter}>
                <Box>
                  <Zoom
                    in
                    timeout={theme.transitions.duration.standard}
                    style={{
                      transformOrigin:
                        peekLayoutSide === "right" ? "right center" : "left center",
                    }}
                  >
                    <Box
                      className={FLOAT_WINDOW_DRAG_HANDLE}
                      sx={{
                        p: 0.5,
                        cursor: "grab",
                        transformOrigin:
                          peekLayoutSide === "right" ? "right center" : "left center",
                        "&:active": { cursor: "grabbing" },
                      }}
                    >
                      <Tooltip
                        title={collapseTooltip ?? "展开"}
                        placement={peekLayoutSide === "left" ? "right" : "left"}
                      >
                        <IconButton
                          color="primary"
                          aria-label={collapseAriaLabel}
                          onPointerDown={peekPointerDown}
                          onClick={peekClick}
                          sx={{
                            width: 44,
                            height: 44,
                            boxShadow: 3,
                            bgcolor: "background.paper",
                            border: 1,
                            borderColor: "divider",
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          {collapseIcon}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Zoom>
                </Box>
              </Fade>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Draggable>
  );
});
FloatWindow.displayName = "FloatWindow";
