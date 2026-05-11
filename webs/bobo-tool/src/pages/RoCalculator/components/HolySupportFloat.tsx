import CloseIcon from "@mui/icons-material/Close";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import LandscapeIcon from "@mui/icons-material/Landscape";
import {
  Box,
  Divider,
  Fade,
  IconButton,
  Paper,
  Slide,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  Zoom,
} from "@mui/material";
import { type FC, type ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react";
import { useRoCalcCharacter } from "../RoCalcCharacterContext";
import {
  HOLY_DOMAIN_RAPTOR_FLOAT_TITLE,
  HOLY_SUPPORT_FLOAT_TITLE,
} from "../engine/holySupportUi";
import type { CharacterBaseInput } from "../engine/types";
import GuildPassSkill5Panel from "./GuildPassSkill5Panel";
import HolyDomainRaptorPanel from "./HolyDomainRaptorPanel";
import HolySanctityCorePanel from "./HolySanctityCorePanel";
import {
  DRAGGABLE_OPACITY_FLOAT_HANDLE,
  DraggableOpacityFloat,
  type HorizontalAnchor,
} from "./DraggableOpacityFloat";

const RO_CALC_SCROLL_ROOT_SELECTOR = ".ro-calc-scroll-root";
const PANEL_WIDTH_PX = 300;
const EDGE_INSET = 12;
const PEEK_ANCHOR_INSET = 20;
const INITIAL_TOP = 88;
const STACK_GAP = 6;

/** 浮窗中心相对滚动根：偏左半区 / 偏右半区 */
function computeLayoutSide(boundsEl: Element, floatEl: Element): "left" | "right" {
  const rb = boundsEl.getBoundingClientRect();
  const eb = floatEl.getBoundingClientRect();
  const boundsMidX = rb.left + rb.width / 2;
  const floatMidX = eb.left + eb.width / 2;
  return floatMidX < boundsMidX ? "left" : "right";
}

function muiSlideDirection(layoutSide: "left" | "right"): "left" | "right" {
  return layoutSide === "left" ? "right" : "left";
}

function rightAlignedX(): number {
  const root = document.querySelector(RO_CALC_SCROLL_ROOT_SELECTOR);
  if (!root) return 0;
  return Math.max(
    EDGE_INSET,
    Math.round(root.getBoundingClientRect().width - PANEL_WIDTH_PX - EDGE_INSET),
  );
}

type HolySideFloatProps = {
  title: string;
  rootClassName: string;
  zIndex: number;
  onDragStop: (x: number, y: number) => void;
  dragPos: { x: number; y: number };
  setDragPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  dockAnchor: HorizontalAnchor;
  setDockAnchor: React.Dispatch<React.SetStateAction<HorizontalAnchor>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  peekVisible: boolean;
  setPeekVisible: React.Dispatch<React.SetStateAction<boolean>>;
  peekIcon: ReactNode;
  children: ReactNode;
  /** 收起态贴边与滑入方向：默认按窗体中线自动；圣音支援等需固定靠右时设为 `right` */
  peekDockSide?: "auto" | "left" | "right";
};

const HolySideFloat: FC<HolySideFloatProps> = ({
  title,
  rootClassName,
  zIndex,
  onDragStop,
  dragPos,
  setDragPos,
  dockAnchor,
  setDockAnchor,
  open,
  setOpen,
  peekVisible,
  setPeekVisible,
  peekIcon,
  children,
  peekDockSide = "auto",
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const floatRootRef = useRef<HTMLDivElement>(null);
  const layoutSideRef = useRef<"left" | "right">("right");
  const [layoutSide, setLayoutSide] = useState<"left" | "right">("right");

  const updateLayoutSide = useCallback(() => {
    if (peekDockSide === "left" || peekDockSide === "right") {
      layoutSideRef.current = peekDockSide;
      setLayoutSide(peekDockSide);
      return;
    }
    const root = document.querySelector(RO_CALC_SCROLL_ROOT_SELECTOR);
    const el = contentRef.current;
    if (!root || !el) return;
    const side = computeLayoutSide(root, el);
    layoutSideRef.current = side;
    setLayoutSide(side);
  }, [peekDockSide]);

  useLayoutEffect(() => {
    if (!open) return;
    updateLayoutSide();
  }, [open, title, updateLayoutSide]);

  const handleClose = () => {
    updateLayoutSide();
    setOpen(false);
  };

  const handleOpen = () => {
    setPeekVisible(false);
    updateLayoutSide();
    const root = document.querySelector(RO_CALC_SCROLL_ROOT_SELECTOR);
    const node = floatRootRef.current;
    if (root && node) {
      const rb = root.getBoundingClientRect();
      const nb = node.getBoundingClientRect();
      const anch = layoutSideRef.current;
      const nextX =
        anch === "left"
          ? PEEK_ANCHOR_INSET
          : Math.max(0, rb.right - PEEK_ANCHOR_INSET - nb.width - rb.left);
      setDragPos((p) => ({ x: nextX, y: p.y }));
    }
    setDockAnchor("none");
    setOpen(true);
  };

  const handleSlideExited = () => {
    const dock =
      peekDockSide === "left" || peekDockSide === "right" ? peekDockSide : layoutSideRef.current;
    setDockAnchor(dock);
    setDragPos((p) => ({ x: 0, y: p.y }));
    setPeekVisible(true);
  };

  return (
    <DraggableOpacityFloat
      boundsSelector={RO_CALC_SCROLL_ROOT_SELECTOR}
      position={dragPos}
      horizontalAnchor={dockAnchor}
      anchorInset={PEEK_ANCHOR_INSET}
      floatRootRef={floatRootRef}
      zIndex={zIndex}
      rootClassName={rootClassName}
      onDragStop={(_, d) => {
        if (dockAnchor !== "none") {
          setDragPos({ x: 0, y: d.y });
        } else {
          onDragStop(d.x, d.y);
        }
      }}
    >
      <Box ref={contentRef} sx={{ position: "relative", display: "flex", alignItems: "flex-start" }}>
        <Slide
          direction={muiSlideDirection(layoutSide)}
          in={open}
          timeout={280}
          mountOnEnter
          unmountOnExit
          onExited={handleSlideExited}
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
                className={DRAGGABLE_OPACITY_FLOAT_HANDLE}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  cursor: "grab",
                  "&:active": { cursor: "grabbing" },
                  pr: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight={600} component="span" sx={{ fontSize: "0.8125rem" }}>
                  {title}
                </Typography>
              </Box>
              <Tooltip title="关闭">
                <IconButton
                  size="small"
                  aria-label={`关闭${title}`}
                  onClick={handleClose}
                  sx={{ mt: -0.25 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Box sx={{ p: 1, pt: 0.75, overflow: "auto", flex: 1, minHeight: 0 }}>{children}</Box>
          </Paper>
        </Slide>

        {peekVisible && !open ? (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              ...(layoutSide === "left"
                ? { left: 0, right: "auto" }
                : { right: 0, left: "auto" }),
            }}
          >
            <Fade in timeout={200}>
              <Box>
                <Zoom in timeout={280}>
                  <Box
                    className={DRAGGABLE_OPACITY_FLOAT_HANDLE}
                    sx={{
                      p: 0.5,
                      cursor: "grab",
                      "&:active": { cursor: "grabbing" },
                    }}
                  >
                    <Tooltip
                      title={`展开${title}`}
                      placement={layoutSide === "left" ? "right" : "left"}
                    >
                      <IconButton
                        color="primary"
                        aria-label={`展开${title}`}
                        onClick={handleOpen}
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
                        {peekIcon}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Zoom>
              </Box>
            </Fade>
          </Box>
        ) : null}
      </Box>
    </DraggableOpacityFloat>
  );
};

const HolySupportFloat: FC = () => {
  const theme = useTheme();
  const { input, applyInput } = useRoCalcCharacter();

  const applyCharacter = (next: CharacterBaseInput) => {
    applyInput(next);
  };

  const [posTop, setPosTop] = useState(() => ({ x: rightAlignedX(), y: INITIAL_TOP }));
  const [posBot, setPosBot] = useState(() => ({
    x: rightAlignedX(),
    y: INITIAL_TOP + 360,
  }));
  const [dockTop, setDockTop] = useState<HorizontalAnchor>("none");
  const [dockBot, setDockBot] = useState<HorizontalAnchor>("none");
  const [openTop, setOpenTop] = useState(true);
  const [openBot, setOpenBot] = useState(true);
  const [peekTop, setPeekTop] = useState(false);
  const [peekBot, setPeekBot] = useState(false);
  const [stackYBot, setStackYBot] = useState(INITIAL_TOP + 380);
  const dockTopRef = useRef(dockTop);
  const dockBotRef = useRef(dockBot);
  dockTopRef.current = dockTop;
  dockBotRef.current = dockBot;

  useLayoutEffect(() => {
    const syncX = () => {
      const x = rightAlignedX();
      setPosTop((p) => (dockTopRef.current === "none" ? { x, y: p.y } : p));
      setPosBot((p) => (dockBotRef.current === "none" ? { x, y: p.y } : p));
    };
    syncX();
    window.addEventListener("resize", syncX);
    const root = document.querySelector(RO_CALC_SCROLL_ROOT_SELECTOR);
    const ro =
      root && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => syncX())
        : null;
    if (root && ro) ro.observe(root);
    return () => {
      window.removeEventListener("resize", syncX);
      ro?.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const topEl = document.querySelector(".ro-calc-holy-sanctity-float");
    if (!topEl) return;

    const measure = () => {
      const h = topEl.getBoundingClientRect().height;
      if (h >= 20) setStackYBot(INITIAL_TOP + h + STACK_GAP);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(topEl);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (dockBot !== "none") return;
    const x = rightAlignedX();
    setPosBot((p) => ({ x, y: stackYBot }));
  }, [stackYBot, dockBot]);

  const zBase = theme.zIndex.drawer + 2;

  return (
    <>
      <HolySideFloat
        title={HOLY_SUPPORT_FLOAT_TITLE}
        rootClassName="ro-calc-holy-sanctity-float"
        zIndex={zBase}
        peekDockSide="right"
        dragPos={posTop}
        setDragPos={setPosTop}
        dockAnchor={dockTop}
        setDockAnchor={setDockTop}
        open={openTop}
        setOpen={setOpenTop}
        peekVisible={peekTop}
        setPeekVisible={setPeekTop}
        peekIcon={<GraphicEqIcon fontSize="small" />}
        onDragStop={(x, y) => setPosTop({ x, y })}
      >
        <GuildPassSkill5Panel value={input} onChange={applyCharacter} />
      </HolySideFloat>

      <HolySideFloat
        title={HOLY_DOMAIN_RAPTOR_FLOAT_TITLE}
        rootClassName="ro-calc-holy-domain-float"
        zIndex={zBase + 1}
        peekDockSide="right"
        dragPos={posBot}
        setDragPos={setPosBot}
        dockAnchor={dockBot}
        setDockAnchor={setDockBot}
        open={openBot}
        setOpen={setOpenBot}
        peekVisible={peekBot}
        setPeekVisible={setPeekBot}
        peekIcon={<LandscapeIcon fontSize="small" />}
        onDragStop={(x, y) => setPosBot({ x, y })}
      >
        <Stack spacing={0} divider={<Divider sx={{ my: 0.75 }} />}>
          <HolyDomainRaptorPanel value={input} onChange={applyCharacter} />
          <HolySanctityCorePanel value={input} onChange={applyCharacter} />
        </Stack>
      </HolySideFloat>
    </>
  );
};

export default HolySupportFloat;
