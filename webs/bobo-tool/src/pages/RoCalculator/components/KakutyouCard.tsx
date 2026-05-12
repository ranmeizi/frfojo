import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Typography,
} from "@mui/material";
import { FC, useMemo } from "react";
import {
  KAKUTYOU_MODE_OPTIONS,
  computeKakutyouLines,
  kakutyouSubSelectLabel,
  kakutyouSubSelectMax,
} from "../engine/kakutyouPreview";
import type { CharacterBaseInput, CombatSnapshot } from "../engine/types";
import { roCalcPaperSx, roCalcSectionTitleSx } from "../roCalcDenseSx";

type KakutyouCardProps = {
  value: CharacterBaseInput;
  snapshot: CombatSnapshot;
  onChange: (next: CharacterBaseInput) => void;
};

const KakutyouCard: FC<KakutyouCardProps> = ({ value, snapshot, onChange }) => {
  const lines = useMemo(
    () => computeKakutyouLines(value, snapshot),
    [value, snapshot],
  );

  const subMax = kakutyouSubSelectMax(value.kakutyouMode, value.formJobId);
  const subLabel = kakutyouSubSelectLabel(value.kakutyouMode, value.formJobId);

  const patch = (partial: Partial<CharacterBaseInput>) => {
    onChange({ ...value, ...partial });
  };

  const onModeChange = (e: SelectChangeEvent<number>) => {
    const kakutyouMode = Number(e.target.value);
    let kakutyouSelNum = value.kakutyouSelNum;
    const m = kakutyouSubSelectMax(kakutyouMode, value.formJobId);
    if (m != null) kakutyouSelNum = Math.min(kakutyouSelNum, m);
    if (kakutyouMode === 4) kakutyouSelNum = Math.min(5, kakutyouSelNum);
    patch({ kakutyouMode, kakutyouSelNum });
  };

  return (
    <Paper variant="outlined" sx={roCalcPaperSx}>
      <Typography variant="subtitle2" sx={roCalcSectionTitleSx}>
        扩展函数（Kakutyou）
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 1, fontSize: "0.7rem", lineHeight: 1.35 }}
      >
        对照 refer `foot.js` `KakutyouKansuu`；6～9 等需完整 n_tok / n_A_zokusei 的项为占位说明。
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          alignItems: "flex-start",
        }}
      >
        <FormControl fullWidth size="small">
          <InputLabel>模式</InputLabel>
          <Select
            label="模式"
            value={value.kakutyouMode}
            onChange={onModeChange}
          >
            {KAKUTYOU_MODE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {subMax != null && subLabel ? (
          <FormControl fullWidth size="small">
            <InputLabel>{subLabel}</InputLabel>
            <Select
              label={subLabel}
              value={Math.min(subMax, value.kakutyouSelNum)}
              onChange={(e) =>
                patch({ kakutyouSelNum: Number(e.target.value) })
              }
            >
              {Array.from({ length: subMax + 1 }, (_, i) => (
                <MenuItem key={i} value={i}>
                  {i}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Box />
        )}
      </Box>
      {lines.length > 0 ? (
        <Box
          component="pre"
          sx={{
            mt: 1,
            mb: 0,
            p: 1,
            bgcolor: "action.hover",
            borderRadius: 0.5,
            fontSize: "0.72rem",
            lineHeight: 1.45,
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
          }}
        >
          {lines.join("\n")}
        </Box>
      ) : null}
    </Paper>
  );
};

export default KakutyouCard;
