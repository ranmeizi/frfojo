import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import LandscapeIcon from "@mui/icons-material/Landscape";
import { Divider, Stack, Typography, useTheme } from "@mui/material";
import { type FC, useLayoutEffect, useRef, useState } from "react";
import { useRoCalcCharacter } from "../RoCalcCharacterContext";
import {
  HOLY_DOMAIN_RAPTOR_FLOAT_TITLE,
  HOLY_SUPPORT_FLOAT_TITLE,
} from "../engine/holySupportUi";
import type { CharacterBaseInput } from "../engine/types";
import GuildPassSkill5Panel from "./GuildPassSkill5Panel";
import HolyDomainRaptorPanel from "./HolyDomainRaptorPanel";
import HolySanctityCorePanel from "./HolySanctityCorePanel";
import { FloatWindow, type FloatWindowHandle } from "./FloatWindow";
import { FLOAT_STACK_KEYS } from "../RoCalcFloatStackContext";

const RO_CALC_SCROLL_ROOT_SELECTOR = ".ro-calc-scroll-root";
const RO_CALC_DRAG_BOUNDS_SELECTOR = ".ro-calc-container";
const PANEL_WIDTH_PX = 300;
const EDGE_INSET = 12;
const INITIAL_TOP = 96;
const BOTH_OPEN_X_STAGGER_PX = 16;

function rightAlignedX(): number {
  const root = document.querySelector(RO_CALC_SCROLL_ROOT_SELECTOR);
  if (!root) return 0;
  return Math.max(
    EDGE_INSET,
    Math.round(
      root.getBoundingClientRect().width - PANEL_WIDTH_PX - EDGE_INSET,
    ),
  );
}

const HolySupportFloat: FC = () => {
  const theme = useTheme();
  const { input, applyInput } = useRoCalcCharacter();

  const applyCharacter = (next: CharacterBaseInput) => {
    applyInput(next);
  };

  const topRef = useRef<FloatWindowHandle>(null);
  const botRef = useRef<FloatWindowHandle>(null);
  const openTopRef = useRef(false);
  const openBotRef = useRef(false);

  const [openTop, setOpenTop] = useState(false);
  const [openBot, setOpenBot] = useState(false);
  openTopRef.current = openTop;
  openBotRef.current = openBot;

  useLayoutEffect(() => {
    if (!openTop || !openBot) return;
    const cur = botRef.current?.getPosition();
    if (!cur) return;
    const x = Math.max(EDGE_INSET, rightAlignedX() - BOTH_OPEN_X_STAGGER_PX);
    botRef.current?.setPosition({ x, y: cur.y });
  }, [openTop, openBot]);

  useLayoutEffect(() => {
    const onResize = () => {
      if (openTopRef.current) {
        const t = topRef.current?.getPosition();
        if (t) topRef.current?.setPosition({ x: rightAlignedX(), y: t.y });
      }
      if (openBotRef.current) {
        const b = botRef.current?.getPosition();
        if (b) {
          const x =
            openTopRef.current && openBotRef.current
              ? Math.max(EDGE_INSET, rightAlignedX() - BOTH_OPEN_X_STAGGER_PX)
              : rightAlignedX();
          botRef.current?.setPosition({ x, y: b.y });
        }
      }
    };
    window.addEventListener("resize", onResize);
    const root = document.querySelector(RO_CALC_SCROLL_ROOT_SELECTOR);
    const ro = root ? new ResizeObserver(onResize) : null;
    if (root && ro) ro.observe(root);
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, []);

  const zBase = theme.zIndex.drawer + 2;

  return (
    <>
      <FloatWindow
        ref={topRef}
        boundsSelector={RO_CALC_DRAG_BOUNDS_SELECTOR}
        defaultSide="right"
        defaultPosition={{ y: INITIAL_TOP }}
        zIndex={zBase}
        stackKey={FLOAT_STACK_KEYS.holySanctity}
        verticalStackOrder={0}
        rootClassName="ro-calc-holy-sanctity-float"
        open={openTop}
        onOpenChange={setOpenTop}
        title={
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ fontSize: "0.8125rem" }}
          >
            {HOLY_SUPPORT_FLOAT_TITLE}
          </Typography>
        }
        collapseIcon={<GraphicEqIcon fontSize="small" />}
        collapseAriaLabel={`展开${HOLY_SUPPORT_FLOAT_TITLE}`}
        collapseTooltip={`展开${HOLY_SUPPORT_FLOAT_TITLE}`}
        cardSx={{ maxHeight: "min(85vh, 560px)" }}
      >
        <GuildPassSkill5Panel value={input} onChange={applyCharacter} />
      </FloatWindow>

      <FloatWindow
        ref={botRef}
        boundsSelector={RO_CALC_DRAG_BOUNDS_SELECTOR}
        defaultSide="right"
        defaultPosition={{ y: 600 }}
        zIndex={zBase + 1}
        stackKey={FLOAT_STACK_KEYS.holyDomain}
        verticalStackOrder={1}
        rootClassName="ro-calc-holy-domain-float"
        open={openBot}
        onOpenChange={setOpenBot}
        title={
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ fontSize: "0.8125rem" }}
          >
            {HOLY_DOMAIN_RAPTOR_FLOAT_TITLE}
          </Typography>
        }
        collapseIcon={<LandscapeIcon fontSize="small" />}
        collapseAriaLabel={`展开${HOLY_DOMAIN_RAPTOR_FLOAT_TITLE}`}
        collapseTooltip={`展开${HOLY_DOMAIN_RAPTOR_FLOAT_TITLE}`}
        cardSx={{ maxHeight: "min(85vh, 560px)" }}
      >
        <Stack spacing={0} divider={<Divider sx={{ my: 0.75 }} />}>
          <HolyDomainRaptorPanel value={input} onChange={applyCharacter} />
          <HolySanctityCorePanel value={input} onChange={applyCharacter} />
        </Stack>
      </FloatWindow>
    </>
  );
};

export default HolySupportFloat;
