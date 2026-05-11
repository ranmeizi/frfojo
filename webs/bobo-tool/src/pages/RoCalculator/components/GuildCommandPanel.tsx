import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { FC } from "react";
import { LEGACY_GUILD_COMMAND_SKILL_LABELS, guildCommandNumericRows } from "../engine/guildLeaderUi";
import type { CharacterBaseInput, GuildCommandState } from "../engine/types";

type GuildCommandPanelProps = {
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
};

const GuildCommandPanel: FC<GuildCommandPanelProps> = ({ value, onChange }) => {
  const gc = value.guildCommand;

  const patch = (partial: Partial<GuildCommandState>) => {
    onChange({ ...value, guildCommand: { ...value.guildCommand, ...partial } });
  };

  const battleLabel = LEGACY_GUILD_COMMAND_SKILL_LABELS[0] ?? "下达战斗命令";

  return (
    <Stack spacing={1.5}>
      <FormControlLabel
        control={
          <Checkbox
            checked={gc.battleOrder}
            onChange={(e) => patch({ battleOrder: e.target.checked })}
          />
        }
        label={battleLabel}
      />
      {guildCommandNumericRows().map(({ key, label }) => (
        <FormControl key={key} size="small" fullWidth>
          <InputLabel shrink>{label}</InputLabel>
          <Select
            label={label}
            value={Math.min(5, Math.max(0, gc[key]))}
            onChange={(e) => patch({ [key]: Number(e.target.value) } as Partial<GuildCommandState>)}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <MenuItem key={i} value={i}>
                {i}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
    </Stack>
  );
};

export default GuildCommandPanel;
