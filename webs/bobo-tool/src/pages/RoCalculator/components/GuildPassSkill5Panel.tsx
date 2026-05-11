import { Checkbox, FormControlLabel, Stack } from "@mui/material";
import { FC } from "react";
import { guildLeaderSkillRows } from "../engine/guildLeaderUi";
import type { CharacterBaseInput, GuildLeaderSkillsState } from "../engine/types";

const ROWS = guildLeaderSkillRows();

type GuildPassSkill5PanelProps = {
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
};

const GuildPassSkill5Panel: FC<GuildPassSkill5PanelProps> = ({ value, onChange }) => {
  const g = value.guildLeader;

  const patch = (partial: Partial<GuildLeaderSkillsState>) => {
    onChange({ ...value, guildLeader: { ...value.guildLeader, ...partial } });
  };

  return (
    <Stack spacing={0.5}>
      {ROWS.map(({ key, label }) => (
        <FormControlLabel
          key={key}
          control={
            <Checkbox
              checked={Boolean(g[key])}
              onChange={(e) =>
                patch({ [key]: e.target.checked } as Partial<GuildLeaderSkillsState>)
              }
            />
          }
          label={label}
        />
      ))}
    </Stack>
  );
};

export default GuildPassSkill5Panel;
