import { Box, Paper, Typography } from "@mui/material";
import type { FC, ReactNode } from "react";
import type { CombatSnapshot } from "../engine/types";
import { roCalcPaperSx, roCalcSectionTitleSx } from "../roCalcDenseSx";

type CombatStatsTableProps = {
  snapshot: CombatSnapshot;
};

/** 装备 DEF/MDEF 数字：深黄偏褐 */
const EQUIP_DEF_MDEF_COLOR = "#a67c00";

const cellSx = {
  minWidth: 0,
  px: 0.75,
  py: 0.5,
  borderRadius: 0.5,
  bgcolor: "action.hover",
} as const;

function renderValueNode(value: ReactNode): ReactNode {
  if (typeof value === "string" || typeof value === "number") {
    return (
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem", lineHeight: 1.35 }}>
        {value}
      </Typography>
    );
  }
  return value;
}

const StatCell: FC<{
  label: string;
  value: ReactNode;
  sub?: string;
}> = ({ label, value, sub }) => (
  <Box sx={cellSx}>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: "block", fontSize: "0.65rem", lineHeight: 1.2 }}
    >
      {label}
    </Typography>
    <Box sx={{ wordBreak: "break-all" }}>{renderValueNode(value)}</Box>
    {sub ? (
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.62rem" }}>
        {sub}
      </Typography>
    ) : null}
  </Box>
);

function equipPlusStatRow(equip: number, stat: number): ReactNode {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "baseline",
        flexWrap: "wrap",
        gap: 0.35,
        fontSize: "0.8rem",
        fontWeight: 600,
        lineHeight: 1.35,
      }}
    >
      <Box component="span" sx={{ color: EQUIP_DEF_MDEF_COLOR, fontWeight: 700 }}>
        {equip}
      </Box>
      <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
        +
      </Box>
      <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
        {stat}
      </Box>
    </Box>
  );
}

const CombatStatsTable: FC<CombatStatsTableProps> = ({ snapshot }) => {
  /** 衍生属性「ATK」：refer `foot.js` 437–444，`floor((素质段+武器平铺+精炼) * w/100)`，w 见 `atkPanelPercentWApprox` */
  const atkSum =
    snapshot.atkStatusPortion +
    snapshot.atkWeaponLineFlat +
    snapshot.weaponRefineBonus;
  const wPanel = Math.max(0, snapshot.atkPanelPercentWApprox);
  const atkDisplay = String(Math.floor((atkSum * wPanel) / 100));
  let atkVarianceSub: string | undefined;
  if (snapshot.weaponRefineVarianceMax > 0) {
    atkVarianceSub = `精炼波动 +${snapshot.weaponRefineVarianceMin}～+${snapshot.weaponRefineVarianceMax}`;
    if (wPanel !== 100) atkVarianceSub += `；乘子 w=${wPanel}`;
  } else if (wPanel !== 100) {
    atkVarianceSub = `乘子 w=${wPanel}（含手动 %ATK）`;
  }

  const matkStr = `${snapshot.matkMin}～${snapshot.matkMax}`;

  const grid2 = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 0.75,
  } as const;

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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 0.25 }}>
        <StatCell label="HP" value={String(snapshot.maxHp)} />
        <StatCell label="SP" value={String(snapshot.maxSp)} />
        <Box sx={grid2}>
          <StatCell label="ATK" value={atkDisplay} sub={atkVarianceSub} />
          <StatCell
            label="DEF"
            value={equipPlusStatRow(snapshot.hardDef, snapshot.defVitStatDisplay)}
          />
        </Box>
        <Box sx={grid2}>
          <StatCell label="MATK" value={matkStr} />
          <StatCell
            label="MDEF"
            value={equipPlusStatRow(snapshot.mdef, snapshot.mdefIntStatDisplay)}
          />
        </Box>
        <Box sx={grid2}>
          <StatCell label="HIT" value={String(snapshot.hit)} />
          <StatCell label="FLEE" value={String(snapshot.flee)} />
        </Box>
        <Box sx={grid2}>
          <StatCell label="Critical" value={`${snapshot.crit}%`} />
          <StatCell label="ASPD" value={String(snapshot.aspd)} />
        </Box>
        <StatCell label="P.Dodge" value={String(snapshot.perfectDodge)} />
      </Box>
    </Paper>
  );
};

export default CombatStatsTable;
