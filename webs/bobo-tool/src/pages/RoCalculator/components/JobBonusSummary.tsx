import { Paper, Typography } from "@mui/material";
import { FC } from "react";
import type { SixStats } from "../engine/types";
import { roCalcPaperSx } from "../roCalcDenseSx";

type JobBonusSummaryProps = { bonus: SixStats };

const JobBonusSummary: FC<JobBonusSummaryProps> = ({ bonus }) => {
  const text = `STR+${bonus.str} AGI+${bonus.agi} VIT+${bonus.vit} INT+${bonus.int} DEX+${bonus.dex} LUK+${bonus.luk}`;
  return (
    <Paper variant="outlined" sx={roCalcPaperSx}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
        Job 面板（JobLV）
      </Typography>
      <Typography variant="body2" sx={{ fontSize: "0.8125rem", lineHeight: 1.35 }}>
        {text}
      </Typography>
    </Paper>
  );
};

export default JobBonusSummary;
