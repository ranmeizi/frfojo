import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import { Box, Fade, IconButton, Paper, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { FC, useLayoutEffect, useRef, useState } from "react";
import { useRoCalcCharacter } from "../RoCalcCharacterContext";
import { GUILD_COMMAND_CARD_TITLE } from "../engine/guildLeaderUi";
import type { CharacterBaseInput } from "../engine/types";
import GuildCommandPanel from "./GuildCommandPanel";
import {
  DRAGGABLE_OPACITY_FLOAT_HANDLE,
  DraggableOpacityFloat,
} from "./DraggableOpacityFloat";

const RO_CALC_SCROLL_ROOT_SELECTOR = ".ro-calc-scroll-root";

/** 与物品资料浮层底缘的间距（px） */
const BELOW_ITEM_GAP = 12;

const GuildLeaderSkillsFloat: FC = () => {
  const theme = useTheme();
  const { input, applyInput } = useRoCalcCharacter();
  const [dragPos, setDragPos] = useState({ x: 12, y: 380 });
  const [open, setOpen] = useState(true);
  const [peekVisible, setPeekVisible] = useState(false);
  const placedRef = useRef(false);

  const applyCharacter = (next: CharacterBaseInput) => {
    applyInput(next);
  };

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

  const handleClose = () => {
    setOpen(false);
    setPeekVisible(true);
  };

  const handleOpen = () => {
    setPeekVisible(false);
    setOpen(true);
  };

  return (
    <DraggableOpacityFloat
      boundsSelector={RO_CALC_SCROLL_ROOT_SELECTOR}
      position={dragPos}
      zIndex={theme.zIndex.drawer + 1}
      onDragStop={(_, d) => setDragPos({ x: d.x, y: d.y })}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {open ? (
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
        ) : null}

        {!open && peekVisible ? (
          <Fade in timeout={200}>
            <Box>
              <Box
                className={DRAGGABLE_OPACITY_FLOAT_HANDLE}
                sx={{
                  cursor: "grab",
                  "&:active": { cursor: "grabbing" },
                }}
              >
                <Tooltip title={`展开${GUILD_COMMAND_CARD_TITLE}`} placement="right">
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
            </Box>
          </Fade>
        ) : null}
      </Box>
    </DraggableOpacityFloat>
  );
};

export default GuildLeaderSkillsFloat;
