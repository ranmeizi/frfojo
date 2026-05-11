import { Box, Stack } from "@mui/material";
import { type FC, useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Back, LayoutMenu } from "@frfojo/components";
import GuildLeaderSkillsFloat from "./components/GuildLeaderSkillsFloat";
import HolySupportFloat from "./components/HolySupportFloat";
import ItemInfoFloat from "./components/ItemInfoFloat";
import {
  defaultCharacterBaseInput,
  defaultEquipment,
  sanitizeCharacterInput,
} from "./engine/sanitizeCharacter";
import type { CharacterBaseInput } from "./engine/types";
import { RoCalcCharacterProvider } from "./RoCalcCharacterContext";
import RoCalculatorDenseTheme from "./RoCalculatorDenseTheme";
import RoCalculatorApp from "./RoCalculatorApp";
import EnemyCombatDrawer from "./components/EnemyCombatDrawer";
import { computeCombatSnapshot } from "./engine/computeSnapshot";

const RoCalculator: FC = () => {
  const navigate = useNavigate();
  const [previewItemId, setPreviewItemId] = useState(() => defaultEquipment().weaponId);
  const [characterInput, setCharacterInput] = useState<CharacterBaseInput>(() =>
    sanitizeCharacterInput(defaultCharacterBaseInput()),
  );
  const applyCharacterInput = useCallback((next: CharacterBaseInput) => {
    setCharacterInput(sanitizeCharacterInput(next));
  }, []);

  const calcRootRef = useRef<HTMLDivElement>(null);
  const snapshot = useMemo(
    () => computeCombatSnapshot(characterInput),
    [characterInput],
  );

  const header = (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ pl: 1, pr: 1 }}>
      <Back tooltip="返回" onClick={() => navigate(-1)} />
      <Box>RO 计算器</Box>
    </Stack>
  );

  return (
    <LayoutMenu header={header}>
      <RoCalcCharacterProvider
        value={{ input: characterInput, applyInput: applyCharacterInput }}
      >
        <RoCalculatorDenseTheme>
        <Box
          ref={calcRootRef}
          className="ro-calc-container"
          sx={{
            position: "relative",
            flex: 1,
            width: "100%",
            minHeight: 0,
            maxHeight: "calc(100dvh - 48px)",
            height: "calc(100dvh - 48px)",
            overflow: "hidden",
          }}
        >
          <Box
            className="ro-calc-float-layer"
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              pointerEvents: "none",
              overflow: "hidden",
            }}
          >
            <ItemInfoFloat itemId={previewItemId} />
            <GuildLeaderSkillsFloat />
            <HolySupportFloat />
          </Box>
          <Box
            className="ro-calc-scroll-root"
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            <Box
              className="ro-calc-scroll-content"
              sx={{
                width: "100%",
                flexShrink: 0,
                boxSizing: "border-box",
              }}
            >
              <RoCalculatorApp onPreviewItemId={setPreviewItemId} />
            </Box>
          </Box>
          <EnemyCombatDrawer
            containerRef={calcRootRef}
            snapshot={snapshot}
            value={characterInput}
            onChange={applyCharacterInput}
          />
        </Box>
        </RoCalculatorDenseTheme>
      </RoCalcCharacterProvider>
    </LayoutMenu>
  );
};

export default RoCalculator;
