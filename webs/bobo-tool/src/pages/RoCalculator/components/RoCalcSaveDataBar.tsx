import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { type FC, useCallback, useMemo, useState } from "react";
import { useRoCalcCharacter } from "../RoCalcCharacterContext";
import CustomEquipmentModal from "./CustomEquipmentModal";
import {
  listSaveSlotSummaries,
  readSaveSlot,
  RO_CALC_SAVE_SLOT_COUNT,
  writeSaveSlot,
  clearSaveSlot,
} from "../engine/roCalcLocalSaves";
import { roCalcPaperSx, roCalcSectionTitleSx } from "../roCalcDenseSx";

function formatSavedAt(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type RoCalcSaveDataBarProps = {
  onAfterLoad?: (weaponPreviewId: number) => void;
};

const RoCalcSaveDataBar: FC<RoCalcSaveDataBarProps> = ({ onAfterLoad }) => {
  const { input, applyInput } = useRoCalcCharacter();
  const [slot, setSlot] = useState(0);
  const [customEquipOpen, setCustomEquipOpen] = useState(false);
  const [summaries, setSummaries] = useState(() => listSaveSlotSummaries());
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" }>(
    { open: false, msg: "", severity: "info" },
  );

  const refreshSummaries = useCallback(() => {
    setSummaries(listSaveSlotSummaries());
  }, []);

  const slotLabel = useMemo(() => {
    const s = summaries[slot];
    if (!s?.occupied) return `${slot + 1} · 空`;
    const t = formatSavedAt(s.savedAt);
    return t ? `${slot + 1} · ${t}` : `${slot + 1} · 已存`;
  }, [summaries, slot]);

  const showSnack = (msg: string, severity: "success" | "error" | "info" = "info") => {
    setSnack({ open: true, msg, severity });
  };

  const handleSave = () => {
    const ok = writeSaveSlot(slot, input);
    if (!ok) {
      showSnack("保存失败（可能超出浏览器存储配额或处于隐私模式）", "error");
      return;
    }
    refreshSummaries();
    showSnack(`已保存到槽位 ${slot + 1}`, "success");
  };

  const handleLoad = () => {
    const data = readSaveSlot(slot);
    if (!data) {
      showSnack(`槽位 ${slot + 1} 无有效存档`, "error");
      return;
    }
    applyInput(data);
    onAfterLoad?.(data.equipment.weaponCustomEquipId ? 0 : data.equipment.weaponId);
    refreshSummaries();
    showSnack(`已从槽位 ${slot + 1} 读取`, "success");
  };

  const handleClear = () => {
    if (!summaries[slot]?.occupied) {
      showSnack(`槽位 ${slot + 1} 本来就是空的`, "info");
      return;
    }
    if (!window.confirm(`确定清除槽位 ${slot + 1} 的存档？`)) return;
    clearSaveSlot(slot);
    refreshSummaries();
    showSnack(`已清除槽位 ${slot + 1}`, "success");
  };

  return (
    <>
      <Paper variant="outlined" sx={{ ...roCalcPaperSx, borderColor: "divider" }}>
        <Typography component="h2" variant="subtitle2" sx={roCalcSectionTitleSx}>
          存档（localStorage · {RO_CALC_SAVE_SLOT_COUNT} 槽，同 refer 多槽）
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={0.75}
          alignItems={{ xs: "stretch", sm: "center" }}
          flexWrap="wrap"
          useFlexGap
        >
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 200 } }}>
            <InputLabel id="ro-calc-save-slot-label">槽位</InputLabel>
            <Select
              labelId="ro-calc-save-slot-label"
              label="槽位"
              value={slot}
              onChange={(e) => setSlot(Number(e.target.value))}
            >
              {Array.from({ length: RO_CALC_SAVE_SLOT_COUNT }, (_, i) => {
                const s = summaries[i];
                const label =
                  !s?.occupied ? `${i + 1} · 空` : `${i + 1} · ${formatSavedAt(s.savedAt) || "已存"}`;
                return (
                  <MenuItem key={i} value={i}>
                    {label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Box sx={{ typography: "caption", color: "text.secondary", flex: { sm: "1 1 auto" }, minWidth: 0 }}>
            当前：{slotLabel}
          </Box>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <Button size="small" variant="contained" onClick={handleSave}>
              保存到槽位
            </Button>
            <Button size="small" variant="outlined" onClick={handleLoad}>
              读取
            </Button>
            <Button size="small" color="warning" variant="outlined" onClick={handleClear}>
              清除该槽
            </Button>
            <Button size="small" variant="outlined" color="secondary" onClick={() => setCustomEquipOpen(true)}>
              自定义装备
            </Button>
          </Stack>
        </Stack>
      </Paper>
      <CustomEquipmentModal open={customEquipOpen} onClose={() => setCustomEquipOpen(false)} />
      <Snackbar
        open={snack.open}
        autoHideDuration={3200}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RoCalcSaveDataBar;
