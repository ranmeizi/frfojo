import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { FC, useMemo } from "react";
import type { CharacterBaseInput } from "../engine/types";
import { JOB_PASSIVE_SKILL_IDS } from "../engine/skillBoard.generated";
import { passiveSlotMaxLevel, skillName } from "../engine/skillBoard";
import { roCalcPaperSx, roCalcSectionTitleSx } from "../roCalcDenseSx";

function passiveLevelsAllMax(skillIds: number[]): number[] {
  return skillIds.map((id) => passiveSlotMaxLevel(id));
}

const ENERGY_COAT_OPTIONS = [
  { v: 0, label: "0" },
  { v: 1, label: "减伤 6%" },
  { v: 2, label: "减伤 12%" },
  { v: 3, label: "减伤 18%" },
  { v: 4, label: "减伤 24%" },
  { v: 5, label: "减伤 30%" },
];

const CAVALRY_OPTIONS = [
  { v: 0, label: "没骑鸟" },
  { v: 1, label: "修练 0" },
  { v: 2, label: "修练 1" },
  { v: 3, label: "修练 2" },
  { v: 4, label: "修练 3" },
  { v: 5, label: "修练 4" },
  { v: 6, label: "修练 5" },
];

type PassiveSkillsCardProps = {
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
};

const PassiveLevelSelect: FC<{
  skillId: number;
  value: number;
  onChange: (n: number) => void;
}> = ({ skillId, value, onChange }) => {
  if (skillId === 58) {
    return (
      <FormControl size="small" sx={{ minWidth: 140, maxWidth: 200 }}>
        <InputLabel shrink>档位</InputLabel>
        <Select
          label="档位"
          value={Math.min(5, Math.max(0, value))}
          onChange={(e) => onChange(Number(e.target.value))}
        >
          {ENERGY_COAT_OPTIONS.map((o) => (
            <MenuItem key={o.v} value={o.v}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
  if (skillId === 78) {
    return (
      <FormControl size="small" sx={{ minWidth: 140, maxWidth: 200 }}>
        <InputLabel shrink>档位</InputLabel>
        <Select
          label="档位"
          value={Math.min(6, Math.max(0, value))}
          onChange={(e) => onChange(Number(e.target.value))}
        >
          {CAVALRY_OPTIONS.map((o) => (
            <MenuItem key={o.v} value={o.v}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
  const max = passiveSlotMaxLevel(skillId);
  const opts = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <FormControl size="small" sx={{ minWidth: 88, maxWidth: 120 }}>
      <InputLabel shrink>Lv</InputLabel>
      <Select
        label="Lv"
        value={Math.min(max, Math.max(0, value))}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {opts.map((lv) => (
          <MenuItem key={lv} value={lv}>
            {lv}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const PassiveSkillsCard: FC<PassiveSkillsCardProps> = ({ value, onChange }) => {
  const skillIds = useMemo(
    () => JOB_PASSIVE_SKILL_IDS[value.formJobId] ?? [],
    [value.formJobId],
  );

  const patchSlot = (index: number, level: number) => {
    const next = [...value.passiveSkillLevels];
    next[index] = level;
    onChange({ ...value, passiveSkillLevels: next });
  };

  const selectAllPassive = () => {
    if (skillIds.length === 0) return;
    onChange({
      ...value,
      passiveSkillLevels: passiveLevelsAllMax(skillIds),
    });
  };

  const resetPassive = () => {
    if (skillIds.length === 0) return;
    onChange({
      ...value,
      passiveSkillLevels: skillIds.map(() => 0),
    });
  };

  return (
    <Paper variant="outlined" sx={{ ...roCalcPaperSx, width: "100%", boxSizing: "border-box" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
        sx={{ mb: 0.5 }}
      >
        <Typography variant="subtitle2" sx={roCalcSectionTitleSx}>
          被动技能 / 持续性技能
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            disabled={skillIds.length === 0}
            onClick={selectAllPassive}
          >
            全选
          </Button>
          <Button
            size="small"
            variant="outlined"
            disabled={skillIds.length === 0}
            onClick={resetPassive}
          >
            重置
          </Button>
        </Stack>
      </Stack>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 1, fontSize: "0.7rem", lineHeight: 1.35 }}
      >
        JobSkillPassOBJ；换职业槽位与等级会重对齐。
      </Typography>

      {skillIds.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          当前职业无被动技能表，或尚未配置。
        </Typography>
      ) : (
        <Stack spacing={0.75}>
          {skillIds.map((skillId, i) => (
            <Box
              key={`${value.formJobId}-${skillId}-${i}`}
              sx={{
                display: "grid",
                gap: 1,
                alignItems: "center",
                gridTemplateColumns: { xs: "1fr", sm: "minmax(0,1fr) auto" },
              }}
            >
              <Typography
                variant="body2"
                sx={{ wordBreak: "break-word", fontSize: "0.8125rem", lineHeight: 1.3 }}
              >
                {skillName(skillId)}
              </Typography>
              <PassiveLevelSelect
                skillId={skillId}
                value={value.passiveSkillLevels[i] ?? 0}
                onChange={(n) => patchSlot(i, n)}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default PassiveSkillsCard;
