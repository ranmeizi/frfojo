import ReplayIcon from "@mui/icons-material/Replay";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { FC, useMemo } from "react";
import type { CharacterBaseInput, SixStats } from "../engine/types";
import { JOB_NAMES, WEAPON_TYPE_NAMES } from "../engine/jobConstants";
import {
  clampWeaponType,
  maxJobLevel,
  resolveCombatJob,
  weaponTypesForJob,
} from "../engine/jobResolve";
import { BOW_ARROW_ROWS } from "../engine/bowArrowTable";
import { BULLET_AMMO_ROWS, GRENADE_AMMO_ROWS } from "../engine/gunAmmoTable";
import { roCalcPaperSx, roCalcSectionTitleSx } from "../roCalcDenseSx";

type CharacterBasicsPanelProps = {
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
  remainingStatPoints: number;
  /** 运算用六维合计；与手填素质之差在输入框后以颜色标出 */
  effectiveSixStats?: SixStats;
};

const STAT_KEYS: { key: keyof SixStats; label: string }[] = [
  { key: "str", label: "STR" },
  { key: "agi", label: "AGI" },
  { key: "vit", label: "VIT" },
  { key: "int", label: "INT" },
  { key: "dex", label: "DEX" },
  { key: "luk", label: "LUK" },
];

const SPEED_POT = [
  { v: 0, label: "无" },
  { v: 1, label: "集中药水" },
  { v: 2, label: "觉醒药水" },
  { v: 3, label: "菠色克药水" },
];

const STATS_ALL_ONE: SixStats = {
  str: 1,
  agi: 1,
  vit: 1,
  int: 1,
  dex: 1,
  luk: 1,
};

const CharacterBasicsPanel: FC<CharacterBasicsPanelProps> = ({
  value,
  onChange,
  remainingStatPoints,
  effectiveSixStats,
}) => {
  const { effectiveJobId } = resolveCombatJob(value.formJobId);
  const jMax = maxJobLevel(effectiveJobId);
  const weaponOptions = useMemo(
    () => weaponTypesForJob(effectiveJobId),
    [effectiveJobId],
  );

  const rangedAmmoOptions = useMemo(() => {
    const wt = value.weaponType;
    if (wt === 10) {
      return BOW_ARROW_ROWS.map((row, idx) => ({
        idx,
        label: `${row.label}（ATK ${row.atk}）`,
      }));
    }
    if (wt >= 17 && wt <= 20) {
      return BULLET_AMMO_ROWS.map((row, idx) => ({
        idx,
        label: `${row.label}（ATK ${row.atk}）`,
      }));
    }
    if (wt === 21) {
      return GRENADE_AMMO_ROWS.map((row, idx) => ({
        idx,
        label: `${row.label}（ATK ${row.atk}）`,
      }));
    }
    return null;
  }, [value.weaponType]);

  const patch = (partial: Partial<CharacterBaseInput>) => {
    onChange({ ...value, ...partial });
  };

  const patchStat = (key: keyof SixStats, n: number) => {
    onChange({
      ...value,
      stats: { ...value.stats, [key]: n },
    });
  };

  const onJobChange = (e: SelectChangeEvent<number>) => {
    const formJobId = Number(e.target.value);
    const { effectiveJobId: ej } = resolveCombatJob(formJobId);
    const maxJ = maxJobLevel(ej);
    const jobLv = Math.min(value.jobLv, maxJ);
    const wt = clampWeaponType(ej, value.weaponType);
    onChange({ ...value, formJobId, jobLv, weaponType: wt });
  };

  const resetAllStatsToOne = () => {
    onChange({ ...value, stats: { ...STATS_ALL_ONE } });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        flex: { xs: "none", md: 1 },
        minHeight: { xs: "auto", md: 0 },
        width: "100%",
      }}
    >
      <Paper variant="outlined" sx={{ ...roCalcPaperSx, flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={roCalcSectionTitleSx}>
          角色基础
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 1,
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          <FormControl
            fullWidth
            size="small"
            sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1", md: "1 / -1" } }}
          >
            <InputLabel>职业</InputLabel>
            <Select
              label="职业"
              value={value.formJobId}
              onChange={onJobChange}
            >
              {JOB_NAMES.map((name, id) => (
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Base LV"
            type="number"
            size="small"
            fullWidth
            inputProps={{ min: 1, max: 99 }}
            value={value.baseLv}
            onChange={(e) =>
              patch({ baseLv: Math.min(99, Math.max(1, Number(e.target.value) || 1)) })
            }
          />
          <TextField
            label="Job LV"
            type="number"
            size="small"
            fullWidth
            inputProps={{ min: 1, max: jMax }}
            value={value.jobLv}
            onChange={(e) =>
              patch({
                jobLv: Math.min(jMax, Math.max(1, Number(e.target.value) || 1)),
              })
            }
            helperText={`上限 ${jMax}`}
          />
          <FormControlLabel
            sx={{
              gridColumn: { xs: "1 / -1", sm: "1 / -1", md: "auto" },
              alignSelf: "center",
              m: 0,
              ml: { md: -0.5 },
            }}
            control={
              <Checkbox
                size="small"
                checked={value.baby}
                onChange={(_, c) => patch({ baby: c })}
              />
            }
            label={
              <Typography component="span" variant="body2" sx={{ fontSize: "0.75rem", lineHeight: 1.3 }}>
                幼儿玩家 (MaxHP/SP×0.7)
              </Typography>
            }
          />

          <FormControl fullWidth size="small">
            <InputLabel>武器类型</InputLabel>
            <Select
              label="武器类型"
              value={value.weaponType}
              onChange={(e) =>
                patch({ weaponType: Number(e.target.value) })
              }
            >
              {weaponOptions.map((wt) => (
                <MenuItem key={wt} value={wt}>
                  {WEAPON_TYPE_NAMES[wt] ?? wt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {rangedAmmoOptions ? (
            <FormControl
              fullWidth
              size="small"
              sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1", md: "1 / -1" } }}
            >
              <InputLabel>远程弹药（普攻预览）</InputLabel>
              <Select
                label="远程弹药（普攻预览）"
                value={value.bowArrowIndex}
                onChange={(e) =>
                  patch({ bowArrowIndex: Number(e.target.value) })
                }
              >
                {rangedAmmoOptions.map((o) => (
                  <MenuItem key={o.idx} value={o.idx}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          <FormControl fullWidth size="small">
            <InputLabel>攻速药水</InputLabel>
            <Select
              label="攻速药水"
              value={value.speedPot}
              onChange={(e) =>
                patch({ speedPot: Number(e.target.value) })
              }
            >
              {SPEED_POT.map((s) => (
                <MenuItem key={s.v} value={s.v}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          ...roCalcPaperSx,
          display: "flex",
          flexDirection: "column",
          flex: { xs: "none", md: 1 },
          minHeight: { xs: "auto", md: 0 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
            mb: 0.5,
          }}
        >
          <Typography variant="subtitle2" sx={roCalcSectionTitleSx}>
            六维
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ReplayIcon fontSize="small" />}
            onClick={resetAllStatsToOne}
          >
            全部重置为 1
          </Button>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 0.5, fontSize: "0.7rem", lineHeight: 1.35 }}
        >
          每项最小 1；旁图标可单键重置。
          {effectiveSixStats ? " 彩色数字为相对手填素质的六维加成合计。" : ""}
        </Typography>
        <Stack spacing={0.75} sx={{ width: "100%" }}>
          {STAT_KEYS.map(({ key, label }) => {
            const bonus =
              effectiveSixStats != null
                ? effectiveSixStats[key] - value.stats[key]
                : 0;
            const bonusText =
              bonus === 0 ? "" : bonus > 0 ? `+${bonus}` : String(bonus);
            return (
            <TextField
              key={key}
              label={label}
              type="number"
              size="small"
              fullWidth
              placeholder="1"
              inputProps={{ min: 1, max: 99 }}
              value={value.stats[key]}
              onChange={(e) =>
                patchStat(
                  key,
                  Math.min(99, Math.max(1, Number(e.target.value) || 1)),
                )
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    position="end"
                    sx={{ gap: 0.5, flexWrap: "nowrap", maxWidth: "55%" }}
                  >
                    {bonusText ? (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          lineHeight: 1,
                          color: bonus > 0 ? "success.main" : "error.main",
                          flexShrink: 0,
                        }}
                      >
                        {bonusText}
                      </Typography>
                    ) : null}
                    <Tooltip title="此项重置为 1">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label={`${label} 重置为 1`}
                        onClick={(e) => {
                          e.preventDefault();
                          patchStat(key, 1);
                        }}
                      >
                        <ReplayIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            );
          })}
        </Stack>
        <Typography
          variant="caption"
          sx={{ mt: "auto", pt: 1, fontSize: "0.75rem" }}
          color={remainingStatPoints < 0 ? "error" : "text.secondary"}
        >
          剩余点数：{remainingStatPoints}
          {remainingStatPoints < 0 ? "（已超过可分配点数）" : ""}
        </Typography>
      </Paper>
    </Box>
  );
};

export default CharacterBasicsPanel;
