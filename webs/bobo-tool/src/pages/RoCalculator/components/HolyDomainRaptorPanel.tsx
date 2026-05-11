import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { FC } from "react";
import type { CharacterBaseInput, HolySupportState } from "../engine/types";

const ELEMENT_OPTIONS = [
  { v: 0, label: "火元素领域" },
  { v: 1, label: "水元素领域" },
  { v: 2, label: "风元素领域" },
];

const SL_SYSTEM_OPTIONS = [
  { v: 0, label: "无" },
  { v: 1, label: "ALL+3" },
  { v: 2, label: "ALL+5" },
];

type HolyDomainRaptorPanelProps = {
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
};

const HolyDomainRaptorPanel: FC<HolyDomainRaptorPanelProps> = ({ value, onChange }) => {
  const h = value.holySupport;

  const patch = (partial: Partial<HolySupportState>) => {
    onChange({ ...value, holySupport: { ...value.holySupport, ...partial } });
  };

  return (
    <Stack spacing={1.5}>
      <FormControl size="small" fullWidth>
        <InputLabel shrink>属性领域</InputLabel>
        <Select
          label="属性领域"
          value={h.elementField}
          onChange={(e) => patch({ elementField: Number(e.target.value) })}
        >
          {ELEMENT_OPTIONS.map((o) => (
            <MenuItem key={o.v} value={o.v}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel shrink>虐杀者系统 Lv</InputLabel>
        <Select
          label="虐杀者系统 Lv"
          value={h.slaughterLevel}
          onChange={(e) => patch({ slaughterLevel: Number(e.target.value) })}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <MenuItem key={i} value={i}>
              {i}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel shrink>虐杀者加成</InputLabel>
        <Select
          label="虐杀者加成"
          value={h.slaughterSystem}
          onChange={(e) => patch({ slaughterSystem: Number(e.target.value) })}
        >
          {SL_SYSTEM_OPTIONS.map((o) => (
            <MenuItem key={o.v} value={o.v}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel shrink>虎蜥人卡片(心神)</InputLabel>
        <Select
          label="虎蜥人卡片(心神)"
          value={h.raptorMind}
          onChange={(e) => patch({ raptorMind: Number(e.target.value) })}
        >
          {[0, 1, 2].map((i) => (
            <MenuItem key={i} value={i}>
              {i}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export default HolyDomainRaptorPanel;
