import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import type { FC } from "react";
import type { CharacterBaseInput, PlayerManualEditsState } from "../engine/types";
import { roCalcPaperSx } from "../roCalcDenseSx";
import { PlayerManualEditsFormBody } from "./PlayerManualEditsFormBody";

type AdditionalManualEditsCardProps = {
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
};

const HEADER_BG = "#446666";

function patchM(
  value: CharacterBaseInput,
  onChange: (next: CharacterBaseInput) => void,
  partial: Partial<PlayerManualEditsState>,
) {
  onChange({
    ...value,
    playerManualEdits: { ...value.playerManualEdits, ...partial },
  });
}

const AdditionalManualEditsCard: FC<AdditionalManualEditsCardProps> = ({ value, onChange }) => {
  const m = value.playerManualEdits;

  return (
    <Paper variant="outlined" sx={{ ...roCalcPaperSx, width: "100%", boxSizing: "border-box" }}>
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ bgcolor: "transparent", "&:before": { display: "none" } }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "common.white" }} />}
          sx={{
            px: 1.25,
            py: 0.75,
            minHeight: 0,
            bgcolor: HEADER_BG,
            "& .MuiAccordionSummary-content": { my: 0.5, alignItems: "center", gap: 1 },
          }}
        >
          <Typography variant="subtitle2" sx={{ color: "common.white", fontWeight: 700 }}>
            附加附魔与手动修正（玩家）
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", ml: "auto" }}>
            点击展开 / 收起
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1, py: 1.25 }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, textAlign: "center" }}>
            <strong>此处数值仅经完整存档槽位保存；</strong>与原版 Full Save 行为对齐时请用保存条写入。
          </Typography>
          <PlayerManualEditsFormBody m={m} onPatch={(p) => patchM(value, onChange, p)} showFormulaFootnote />
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default AdditionalManualEditsCard;
