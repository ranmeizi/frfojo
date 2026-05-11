import { Box, Divider, Stack } from "@mui/material";
import { FC, useMemo } from "react";
import BuffSupportSkillsCard from "./components/BuffSupportSkillsCard";
import CharacterBasicsPanel from "./components/CharacterBasicsPanel";
import CombatStatsTable from "./components/CombatStatsTable";
import EquipmentPanel from "./components/EquipmentPanel";
import FoodConsumableCard from "./components/FoodConsumableCard";
import JobBonusSummary from "./components/JobBonusSummary";
import PassiveSkillsCard from "./components/PassiveSkillsCard";
import EnemyCombatCard from "./components/EnemyCombatCard";
import PerformanceDanceCard from "./components/PerformanceDanceCard";
import RoCalcSaveDataBar from "./components/RoCalcSaveDataBar";
import { useRoCalcCharacter } from "./RoCalcCharacterContext";
import { computeCombatSnapshot } from "./engine/computeSnapshot";

type RoCalculatorAppProps = {
  onPreviewItemId: (id: number) => void;
};

const RoCalculatorApp: FC<RoCalculatorAppProps> = ({ onPreviewItemId }) => {
  const { input, applyInput } = useRoCalcCharacter();

  const snapshot = useMemo(() => computeCombatSnapshot(input), [input]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        py: 0.75,
        px: { xs: 0.5, sm: 1 },
        gap: 0.75,
        maxWidth: { xs: "100%", lg: 1320 },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <RoCalcSaveDataBar onAfterLoad={onPreviewItemId} />
      {/* 上：角色与属性表并排；装备独占整行，避免窄列挤压 Autocomplete */}
      <Stack
        spacing={0.75}
        direction={{ xs: "column", md: "row" }}
        alignItems="stretch"
        sx={{ minHeight: { md: 0 } }}
      >
        <Stack
          spacing={0.75}
          sx={{
            flex: 1,
            minWidth: { xs: 0, md: 320 },
            width: "100%",
            minHeight: { md: 0 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CharacterBasicsPanel
            value={input}
            onChange={applyInput}
            remainingStatPoints={snapshot.remainingStatPoints}
          />
        </Stack>
        <Box
          sx={{
            flex: 1,
            minWidth: { xs: 0, md: 280 },
            width: { xs: "100%", md: "auto" },
            minHeight: { md: 0 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CombatStatsTable snapshot={snapshot} />
        </Box>
      </Stack>
      <JobBonusSummary bonus={snapshot.jobBoardBonus} />
      <Box sx={{ width: "100%" }}>
        <EquipmentPanel
          value={input}
          onChange={applyInput}
          onPreviewItemId={onPreviewItemId}
        />
      </Box>
      <PassiveSkillsCard value={input} onChange={applyInput} />
      <BuffSupportSkillsCard value={input} onChange={applyInput} />
      <Stack
        spacing={0.75}
        direction={{ xs: "column", md: "row" }}
        alignItems="stretch"
        sx={{ width: "100%", minWidth: 0 }}
      >
        <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
          <PerformanceDanceCard value={input} onChange={applyInput} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
          <FoodConsumableCard value={input} onChange={applyInput} />
        </Box>
      </Stack>
      <Divider sx={{ my: 0.25 }} />
      <EnemyCombatCard snapshot={snapshot} value={input} onChange={applyInput} />
    </Box>
  );
};

export default RoCalculatorApp;
