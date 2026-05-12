import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
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
  useTheme,
} from "@mui/material";
import { type FC, useCallback, useLayoutEffect, useRef, useState } from "react";
import { useRoCalcCharacter } from "../RoCalcCharacterContext";
import { GUILD_COMMAND_CARD_TITLE } from "../engine/guildLeaderUi";
import type { CharacterBaseInput } from "../engine/types";
import GuildCommandPanel from "./GuildCommandPanel";
import {
  DRAGGABLE_OPACITY_FLOAT_HANDLE,
  DraggableOpacityFloat,
} from "./DraggableOpacityFloat";
import { FLOAT_STACK_KEYS } from "../RoCalcFloatStackContext";

const RO_CALC_SCROLL_ROOT_SELECTOR = ".ro-calc-scroll-root";

/** 与物品资料浮层底缘的间距（px） */
const BELOW_ITEM_GAP = 12;

function computeLayoutSide(boundsEl: Element, floatEl: Element): "left" | "right" {
  const rb = boundsEl.getBoundingClientRect();
  const eb = floatEl.getBoundingClientRect();
  const boundsMidX = rb.left + rb.width / 2;
  const floatMidX = eb.left + eb.width / 2;
  return floatMidX < boundsMidX ? "left" : "right";
}

/** MUI Slide：与 ItemInfoFloat 一致 */
function muiSlideDirection(layoutSide: "left" | "right"): "left" | "right" {
  return layoutSide === "left" ? "right" : "left";
}

const GuildLeaderSkillsFloat: FC = () => {
  const theme = useTheme();
  const { input, applyInput } = useRoCalcCharacter();
  const [dragPos, setDragPos] = useState({ x: 12, y: 380 });
  const [open, setOpen] = useState(true);
  /** Slide 完全收起后再显示小圆钮 */
  const [peekVisible, setPeekVisible] = useState(false);
  const [layoutSide, setLayoutSide] = useState<"left" | "right">("right");
  const layoutSideRef = useRef<"left" | "right">("right");
  const contentRef = useRef<HTMLDivElement>(null);
  const placedRef = useRef(false);

  const applyCharacter = (next: CharacterBaseInput) => {
    applyInput(next);
  };

  const updateLayoutSideFromLayout = useCallback(() => {
    const root = document.querySelector(RO_CALC_SCROLL_ROOT_SELECTOR);
    const el = contentRef.current;
    if (!root || !el) return;
    const side = computeLayoutSide(root, el);
    layoutSideRef.current = side;
    setLayoutSide(side);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateLayoutSideFromLayout();
  }, [open, updateLayoutSideFromLayout]);

  useLayoutEffect(() => {
    if (placedRef.current) return;
    const root = document.querySelector(RO_CALC_SCROLL_ROOT_SELECTOR);
    const itemEl = document.querySelector(".ro-calc-item-info-float");
    if (!root || !itemEl) return;
    const rr = root.getBoundingClientRect();
    const ir = itemEl.getBoundingClientRect();
    placedRef.current = true;
    setDragPos({
      x: Math.max(0, Math.round(ir.left - rr.left)),
      y: Math.round(ir.bottom - rr.top + BELOW_ITEM_GAP),
    });
  }, []);

  const handleSlideExited = () => {
    setPeekVisible(true);
  };

  const handleClose = () => {
    updateLayoutSideFromLayout();
    setOpen(false);
  };

  const handleOpen = () => {
    setPeekVisible(false);
    updateLayoutSideFromLayout();
    setOpen(true);
  };

  return (
    <DraggableOpacityFloat
      boundsSelector={RO_CALC_SCROLL_ROOT_SELECTOR}
      position={dragPos}
      zIndex={theme.zIndex.drawer + 1}
      stackKey={FLOAT_STACK_KEYS.guildLeader}
      onDragStop={(_, d) => setDragPos({ x: d.x, y: d.y })}
    >
      <Box ref={contentRef} sx={{ position: "relative", display: "flex", alignItems: "center" }}>
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
              maxHeight: "min(72vh, 420px)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              sx={{
                px: 1.5,
                py: 1,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "action.hover",
                gap: 0.5,
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
                <Typography variant="subtitle2" fontWeight={600}>
                  {GUILD_COMMAND_CARD_TITLE}
                </Typography>
              </Box>
              <Tooltip title="关闭">
                <IconButton
                  size="small"
                  aria-label={`关闭${GUILD_COMMAND_CARD_TITLE}`}
                  onClick={handleClose}
                  sx={{ mt: -0.25 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Box sx={{ p: 1.5, overflow: "auto", flex: 1, minHeight: 0 }}>
              <GuildCommandPanel value={input} onChange={applyCharacter} />
            </Box>
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
                      title={`展开${GUILD_COMMAND_CARD_TITLE}`}
                      placement={layoutSide === "left" ? "right" : "left"}
                    >
                      <IconButton
                        color="primary"
                        aria-label={`展开${GUILD_COMMAND_CARD_TITLE}`}
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
                        <GroupsIcon fontSize="small" />
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

export default GuildLeaderSkillsFloat;
