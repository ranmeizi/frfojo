import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FC } from "react";
import type { CombatSnapshot } from "../engine/types";
import { roCalcPaperSx, roCalcSectionTitleSx, roCalcTableDenseSx } from "../roCalcDenseSx";

type CombatStatsTableProps = {
  snapshot: CombatSnapshot;
};

const CombatStatsTable: FC<CombatStatsTableProps> = ({ snapshot }) => {
  const t = snapshot.totalStats;
  const effectiveSix = `STR ${t.str} · AGI ${t.agi} · VIT ${t.vit} · INT ${t.int} · DEX ${t.dex} · LUK ${t.luk}`;

  const weaponVar =
    snapshot.weaponRefineVarianceMax > 0
      ? `（波动 +${snapshot.weaponRefineVarianceMin}～+${snapshot.weaponRefineVarianceMax}）`
      : "";

  const weaponFlat = snapshot.weaponAtkSupportFlat;
  const weaponCard = snapshot.weaponAtkCardFlat;
  const weaponExtras = [weaponFlat, weaponCard].filter((n) => n !== 0);
  const weaponValue =
    weaponExtras.length > 0
      ? `${snapshot.weaponAtkBase} + ${snapshot.weaponRefineBonus} + ${weaponExtras.join(" + ")} ${weaponVar}`.trim()
      : `${snapshot.weaponAtkBase} + ${snapshot.weaponRefineBonus} ${weaponVar}`.trim();

  const rows: { label: string; value: string; hint?: string }[] = [
    { label: "MaxHP", value: String(snapshot.maxHp) },
    { label: "MaxSP", value: String(snapshot.maxSp) },
    {
      label: "武器 Lv",
      value: String(snapshot.weaponLevel),
      hint: "来自 ItemOBJ[4]",
    },
    {
      label: "武器 ATK",
      value: weaponValue,
      hint: [
        "基础 + 精炼 + 食品等平铺 + 卡片 code17；高精炼随机段见括号",
        snapshot.guildLeaderAtk100 ? "工会 ATK+100% 作用于伤害倍率（非白字）" : "",
      ]
        .filter(Boolean)
        .join("；"),
    },
    {
      label: "DEF",
      value: String(snapshot.hardDef),
      hint: "防具与精炼 DEF；战鼓震天等与原版一致的固定 DEF 已计入",
    },
    {
      label: "MDEF",
      value: String(snapshot.mdef),
      hint: "卡片 code19 平铺；防具 ItemOBJ MDEF 待接入",
    },
    { label: "HIT", value: String(snapshot.hit) },
    { label: "FLEE", value: String(snapshot.flee) },
    { label: "完全回避", value: String(snapshot.perfectDodge) },
    {
      label: "暴击率",
      value: `${snapshot.crit}%`,
      hint: "未计目标种族与卡片",
    },
    {
      label: "MATK",
      value:
        snapshot.matkMin === snapshot.matkMax
          ? String(snapshot.matkMin)
          : `${snapshot.matkMin}～${snapshot.matkMax}`,
    },
    { label: "ASPD", value: String(snapshot.aspd) },
    { label: "HP 回复", value: String(snapshot.hpr) },
    { label: "SP 回复", value: String(snapshot.spr) },
  ];

  return (
    <Paper
      variant="outlined"
      sx={{
        ...roCalcPaperSx,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="subtitle2" sx={roCalcSectionTitleSx}>
        衍生属性
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.5, fontSize: "0.7rem", lineHeight: 1.35 }}
      >
        运算用六维：{effectiveSix}
      </Typography>
      <Table size="small" sx={roCalcTableDenseSx}>
        <TableHead>
          <TableRow>
            <TableCell>项目</TableCell>
            <TableCell align="right">数值</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.label}>
              <TableCell>
                {r.label}
                {r.hint ? (
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontSize: "0.68rem", lineHeight: 1.3 }}
                  >
                    {r.hint}
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell align="right">{r.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default CombatStatsTable;
