/** RO 计算器页面偏紧凑布局：多模块共用，避免各处 magic number 漂移 */
export const roCalcPaperSx = { p: { xs: 0.75, sm: 1 } } as const;

/** 区块标题：比 subtitle1 更省高 */
export const roCalcSectionTitleSx = {
  mb: 0.35,
  fontSize: "0.75rem",
  lineHeight: 1.25,
  fontWeight: 600,
} as const;

/** 勾选行略收紧垂直间距 */
export const roCalcFormControlDenseSx = {
  "& .MuiFormControlLabel-root": { my: -0.35 },
} as const;

export const roCalcTableDenseSx = {
  "& .MuiTableCell-root": {
    py: 0.35,
    px: 0.75,
    fontSize: "0.8125rem",
    lineHeight: 1.25,
    borderColor: "divider",
  },
  "& .MuiTableCell-head": { py: 0.4, fontWeight: 600 },
} as const;
