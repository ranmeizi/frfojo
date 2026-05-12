import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { FC } from "react";
import { SANCTITY_CORE_OPTIONS } from "../engine/sanctityCoreSix";
import type { CharacterBaseInput, HolySupportState } from "../engine/types";

type HolySanctityCorePanelProps = {
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
};

const HolySanctityCorePanel: FC<HolySanctityCorePanelProps> = ({ value, onChange }) => {
  const h = value.holySupport;

  const patch = (partial: Partial<HolySupportState>) => {
    onChange({ ...value, holySupport: { ...value.holySupport, ...partial } });
  };

  return (
    <Stack spacing={1.5}>
      <FormControl size="small" fullWidth>
        <InputLabel shrink>圣域核心 A_HSE</InputLabel>
        <Select
          label="圣域核心 A_HSE"
          value={h.sanctityCoreCode}
          onChange={(e) => patch({ sanctityCoreCode: Number(e.target.value) })}
          MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
        >
          {SANCTITY_CORE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel shrink>领域支援</InputLabel>
        <Select
          label="领域支援"
          value={h.domainSupport}
          onChange={(e) => patch({ domainSupport: Number(e.target.value) })}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <MenuItem key={i} value={i}>
              {i}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel shrink>挑衅支援</InputLabel>
        <Select
          label="挑衅支援"
          value={h.provokeSupport}
          onChange={(e) => patch({ provokeSupport: Number(e.target.value) })}
        >
          {Array.from({ length: 11 }, (_, i) => (
            <MenuItem key={i} value={i}>
              {i}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={h.holyBodyBless}
              onChange={(e) => patch({ holyBodyBless: e.target.checked })}
            />
          }
          label="圣体降福"
        />
      </Box>
    </Stack>
  );
};

export default HolySanctityCorePanel;
