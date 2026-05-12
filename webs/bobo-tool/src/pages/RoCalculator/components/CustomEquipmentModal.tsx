import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import type { CustomEquipmentRecord } from "../engine/types";
import { CUSTOM_EQUIP_KIND_OPTIONS } from "../engine/customEquipmentKindOptions";
import { defaultPlayerManualEdits, sanitizePlayerManualEdits } from "../engine/playerManualEdits";
import { useRoCalcCustomEquipment } from "../RoCalcCustomEquipmentContext";
import { PlayerManualEditsFormBody } from "./PlayerManualEditsFormBody";

type CustomEquipmentModalProps = {
  open: boolean;
  onClose: () => void;
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `ce_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
}

const CustomEquipmentModal: FC<CustomEquipmentModalProps> = ({ open, onClose }) => {
  const { upsert } = useRoCalcCustomEquipment();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState(1);
  const [bonuses, setBonuses] = useState(defaultPlayerManualEdits);

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setKind(1);
    setBonuses(defaultPlayerManualEdits());
  }, [open]);

  const kindLabel = useMemo(
    () => CUSTOM_EQUIP_KIND_OPTIONS.find((o) => o.kind === kind)?.label ?? String(kind),
    [kind],
  );

  const handleSave = useCallback(() => {
    const rec: CustomEquipmentRecord = {
      id: newId(),
      kind,
      name: name.trim() || "未命名装备",
      description: description.trim(),
      bonuses: sanitizePlayerManualEdits(bonuses),
    };
    const ok = upsert(rec);
    if (ok) {
      onClose();
    } else {
      window.alert("写入失败（可能超出浏览器存储配额）");
    }
  }, [bonuses, description, kind, name, onClose, upsert]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>自定义装备</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.25}>
          <Typography variant="caption" color="text.secondary">
            保存后写入本机 localStorage；存档槽保存角色时会把当前穿的自定义装备一并写入存档，读取时合并回全局库以便分享。
          </Typography>
          <TextField
            label="装备名称"
            size="small"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ maxLength: 120 }}
          />
          <TextField
            label="装备描述"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            inputProps={{ maxLength: 2000 }}
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="ce-kind-label">装备分类（Item kind）</InputLabel>
            <Select
              labelId="ce-kind-label"
              label="装备分类（Item kind）"
              value={kind}
              onChange={(e: SelectChangeEvent<number>) => setKind(Number(e.target.value))}
            >
              {CUSTOM_EQUIP_KIND_OPTIONS.map((o) => (
                <MenuItem key={o.kind} value={o.kind}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary">
            当前分类：{kindLabel} — 仅在装备面板对应下拉中出现。
          </Typography>
          <Box sx={{ pt: 0.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
              加成（与「附加附魔与手动修正」相同）
            </Typography>
            <PlayerManualEditsFormBody
              m={bonuses}
              onPatch={(p) => setBonuses((prev) => sanitizePlayerManualEdits({ ...prev, ...p }))}
              showFormulaFootnote={false}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose}>取消</Button>
        <Button variant="contained" onClick={handleSave}>
          确认保存到库
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomEquipmentModal;
