import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { type FC, useMemo } from "react";
import {
  ATTACK_KIND_LABELS,
  BATTLE_RESULT_ROW_LABELS,
  IJYOU_ROW_LABELS,
  IJYOU_SLOT_SPECS,
  KYOUKA_ELEMENT_OPTIONS,
  KYOUKA_ROW_LABELS,
  KYOUKA_SLOT_SPECS,
  MONSTER_SORT_OPTIONS,
} from "../engine/enemyCombatUi";
import {
  monsterOptionList,
  parseMonsterRow,
  sortedMonsterOptionList,
  type ParsedMonster,
} from "../engine/monsterCatalog";
import { MONSTER_OBJ } from "../engine/monster.generated";
import type { CharacterBaseInput, CombatSnapshot, EnemyCombatState } from "../engine/types";
import {
  roCalcFormControlDenseSx,
  roCalcPaperSx,
  roCalcSectionTitleSx,
  roCalcTableDenseSx,
} from "../roCalcDenseSx";

type EnemyCombatCardProps = {
  snapshot: CombatSnapshot;
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
  /** 为 true 时隐藏 nm037 表头「魔物」Autocomplete 行（由 Drawer 顶栏等外部提供） */
  hideMonsterSelectRow?: boolean;
  /** 为 true 时不包 Paper/标题（嵌入 Drawer 等容器） */
  embedded?: boolean;
};

const headerCellSx = {
  bgcolor: "action.hover",
  fontWeight: 600,
  borderColor: "divider",
} as const;

function patchEnemy(value: CharacterBaseInput, partial: Partial<EnemyCombatState>): CharacterBaseInput {
  return {
    ...value,
    enemyCombat: { ...value.enemyCombat, ...partial },
  };
}

function patchAbnormal(value: CharacterBaseInput, slot: number, v: number): CharacterBaseInput {
  const next = [...value.enemyCombat.abnormal];
  next[slot] = v;
  return patchEnemy(value, { abnormal: next });
}

function patchDefender(value: CharacterBaseInput, slot: number, v: number): CharacterBaseInput {
  const next = [...value.enemyCombat.defender];
  next[slot] = v;
  return patchEnemy(value, { defender: next });
}

const EnemyCombatCard: FC<EnemyCombatCardProps> = ({
  snapshot: snap,
  value,
  onChange,
  hideMonsterSelectRow = false,
  embedded = false,
}) => {
  const ec = value.enemyCombat;
  const options = useMemo(
    () => sortedMonsterOptionList(ec.monsterSort),
    [ec.monsterSort],
  );
  const flatOptions = useMemo(() => monsterOptionList(), []);

  const parsed = useMemo(
    () => parseMonsterRow(MONSTER_OBJ[ec.monsterIndex]) ?? parseMonsterRow(MONSTER_OBJ[0]),
    [ec.monsterIndex],
  );

  const currentOption = useMemo(
    () => flatOptions.find((o) => o.index === ec.monsterIndex) ?? flatOptions[0],
    [flatOptions, ec.monsterIndex],
  );

  const monsterRows = (m: ParsedMonster) => [
    { la: "HP", va: String(m.hp), lb: "BaseExp", vb: String(m.baseExp) },
    {
      la: "ATK",
      va: `${m.minAtk}～${m.maxAtk}`,
      lb: "JobExp",
      vb: String(m.jobExp),
    },
    { la: "DEF", va: String(m.def), lb: "种族", vb: m.raceLabel },
    { la: "MDEF", va: String(m.mdef), lb: "属性", vb: m.elementLabel },
    { la: "必要HIT", va: String(m.hit), lb: "体型", vb: m.sizeLabel },
    { la: "95%回避FLEE", va: String(m.flee), lb: "", vb: "" },
  ];

  const body = (
    <Stack spacing={1}>
        {/* 攻击方式 */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderColor: "divider", borderRadius: 1 }}
        >
          <Table size="small" sx={roCalcTableDenseSx}>
            <TableBody>
              <TableRow>
                <TableCell colSpan={2} sx={headerCellSx}>
                  攻击方式：
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ width: "38%", fontWeight: 500 }}>目标类型</TableCell>
                <TableCell align="right">
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>种类</InputLabel>
                    <Select
                      label="种类"
                      value={ec.attackKind}
                      onChange={(e) =>
                        onChange(patchEnemy(value, { attackKind: Number(e.target.value) }))
                      }
                    >
                      {ATTACK_KIND_LABELS.map((label, i) => (
                        <MenuItem key={label} value={i}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} sx={{ color: "text.secondary", fontSize: "0.68rem", py: 0.5 }}>
                  主动技能与伤害联动后，此处将显示对应计算项。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* nm037 魔物 + B_* 四列表格 */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderColor: "divider", borderRadius: 1 }}
        >
          <Table size="small" sx={roCalcTableDenseSx}>
            <TableBody>
              {!hideMonsterSelectRow ? (
                <TableRow>
                  <TableCell colSpan={4} sx={headerCellSx}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                      <Typography
                        component="span"
                        variant="caption"
                        fontWeight={600}
                        sx={{ fontSize: "0.75rem" }}
                      >
                        魔物：
                      </Typography>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Autocomplete
                          size="small"
                          options={options}
                          getOptionLabel={(o) => o.label}
                          isOptionEqualToValue={(a, b) => a.index === b.index}
                          value={currentOption}
                          onChange={(_, v) => {
                            if (v) onChange(patchEnemy(value, { monsterIndex: v.index }));
                          }}
                          renderInput={(params) => (
                            <TextField {...params} placeholder="搜索" label="选择魔物" />
                          )}
                          ListboxProps={{ style: { maxHeight: 280 } }}
                        />
                      </Box>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : null}
              {parsed
                ? monsterRows(parsed).map((r) => (
                    <TableRow key={r.la + r.lb}>
                      <TableCell sx={{ fontWeight: 500, width: "22%" }}>{r.la}</TableCell>
                      <TableCell align="right" sx={{ width: "28%" }}>
                        {r.va}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, width: "22%" }}>{r.lb}</TableCell>
                      <TableCell align="right" sx={{ width: "28%" }}>
                        {r.vb}
                      </TableCell>
                    </TableRow>
                  ))
                : null}
              <TableRow>
                <TableCell colSpan={2} sx={{ fontWeight: 500 }}>
                  排序
                </TableCell>
                <TableCell colSpan={2} align="right">
                  <FormControl size="small" fullWidth sx={{ maxWidth: 360 }}>
                    <InputLabel>ENEMY_SORT</InputLabel>
                    <Select
                      label="ENEMY_SORT"
                      value={ec.monsterSort}
                      onChange={(e) =>
                        onChange(patchEnemy(value, { monsterSort: Number(e.target.value) }))
                      }
                    >
                      {MONSTER_SORT_OPTIONS.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} sx={{ color: "text.secondary", fontSize: "0.6875rem", py: 0.25 }}>
                  我方 HIT {snap.hit} / 我方 FLEE {snap.flee}（供与魔物必要 HIT / 95%回避 FLEE 对照）
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* nm050 魔物异常状态 */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderColor: "divider", borderRadius: 1 }}
        >
          <Table size="small" sx={roCalcTableDenseSx}>
            <TableBody>
              <TableRow>
                <TableCell colSpan={2} sx={headerCellSx}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={ec.abnormalPanelOpen}
                        onChange={(e) =>
                          onChange(patchEnemy(value, { abnormalPanelOpen: e.target.checked }))
                        }
                      />
                    }
                    label={
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.75rem" }}>
                        魔物异常状态
                      </Typography>
                    }
                  />
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    显示
                  </Typography>
                </TableCell>
              </TableRow>
              {ec.abnormalPanelOpen
                ? IJYOU_SLOT_SPECS.map((spec, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 500, verticalAlign: "middle" }}>
                        {IJYOU_ROW_LABELS[i] ?? `—${i}`}
                      </TableCell>
                      <TableCell align="right">
                        {spec.kind === "checkbox" ? (
                          <Checkbox
                            checked={ec.abnormal[i] !== 0}
                            onChange={(e) =>
                              onChange(patchAbnormal(value, i, e.target.checked ? 1 : 0))
                            }
                          />
                        ) : (
                          <FormControl size="small" sx={{ minWidth: 88 }}>
                            <InputLabel shrink>Lv</InputLabel>
                            <Select
                              label="Lv"
                              notched
                              value={ec.abnormal[i] ?? 0}
                              onChange={(e) =>
                                onChange(patchAbnormal(value, i, Number(e.target.value)))
                              }
                            >
                              {Array.from({ length: (spec.max ?? 0) + 1 }, (_, v) => (
                                <MenuItem key={v} value={v}>
                                  {v}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </TableContainer>

        {/* nm083 防御方状态强化 */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderColor: "divider", borderRadius: 1 }}
        >
          <Table size="small" sx={roCalcTableDenseSx}>
            <TableBody>
              <TableRow>
                <TableCell colSpan={2} sx={headerCellSx}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={ec.defenderPanelOpen}
                        onChange={(e) =>
                          onChange(patchEnemy(value, { defenderPanelOpen: e.target.checked }))
                        }
                      />
                    }
                    label={
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.75rem" }}>
                        防御方状态强化
                      </Typography>
                    }
                  />
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    显示
                  </Typography>
                </TableCell>
              </TableRow>
              {ec.defenderPanelOpen
                ? KYOUKA_SLOT_SPECS.map((spec, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 500, verticalAlign: "middle" }}>
                        {KYOUKA_ROW_LABELS[i] ?? `—${i}`}
                      </TableCell>
                      <TableCell align="right">
                        {spec.kind === "checkbox" ? (
                          <Checkbox
                            checked={ec.defender[i] !== 0}
                            onChange={(e) =>
                              onChange(patchDefender(value, i, e.target.checked ? 1 : 0))
                            }
                          />
                        ) : spec.kind === "element" ? (
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel shrink>属性</InputLabel>
                            <Select
                              label="属性"
                              notched
                              value={ec.defender[i] ?? 0}
                              onChange={(e) =>
                                onChange(patchDefender(value, i, Number(e.target.value)))
                              }
                            >
                              {KYOUKA_ELEMENT_OPTIONS.map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                  {o.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <FormControl size="small" sx={{ minWidth: 88 }}>
                            <InputLabel shrink>Lv</InputLabel>
                            <Select
                              label="Lv"
                              notched
                              value={ec.defender[i] ?? 0}
                              onChange={(e) =>
                                onChange(patchDefender(value, i, Number(e.target.value)))
                              }
                            >
                              {Array.from(
                                { length: (spec.kind === "select10" ? 10 : 5) + 1 },
                                (_, v) => (
                                  <MenuItem key={v} value={v}>
                                    {v}
                                  </MenuItem>
                                ),
                              )}
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </TableContainer>

        {/* nm052 战斗结果 */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderColor: "divider", borderRadius: 1 }}
        >
          <Table size="small" sx={roCalcTableDenseSx}>
            <TableBody>
              <TableRow>
                <TableCell colSpan={2} sx={headerCellSx}>
                  战斗结果
                </TableCell>
              </TableRow>
              {BATTLE_RESULT_ROW_LABELS.map((label) => (
                <TableRow key={label}>
                  <TableCell sx={{ fontWeight: 500 }}>{label}</TableCell>
                  <TableCell align="right" sx={{ color: "text.secondary" }}>
                    —
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} sx={{ color: "text.secondary", fontSize: 12 }}>
                  伤害等结果将随武器、技能与目标设置扩展显示。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
  );

  if (embedded) {
    return (
      <Box
        sx={{
          ...roCalcFormControlDenseSx,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {body}
      </Box>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        ...roCalcPaperSx,
        ...roCalcFormControlDenseSx,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="subtitle2" sx={roCalcSectionTitleSx}>
        对敌
      </Typography>
      {body}
    </Paper>
  );
};

export default EnemyCombatCard;
