import GroupsIcon from "@mui/icons-material/Groups";
import { Typography, useTheme } from "@mui/material";
import { type FC } from "react";
import { useRoCalcCharacter } from "../RoCalcCharacterContext";
import { GUILD_COMMAND_CARD_TITLE } from "../engine/guildLeaderUi";
import type { CharacterBaseInput } from "../engine/types";
import GuildCommandPanel from "./GuildCommandPanel";
import { FloatWindow } from "./FloatWindow";
import { FLOAT_STACK_KEYS } from "../RoCalcFloatStackContext";

const RO_CALC_DRAG_BOUNDS_SELECTOR = ".ro-calc-container";

const GuildLeaderSkillsFloat: FC = () => {
  const theme = useTheme();
  const { input, applyInput } = useRoCalcCharacter();

  const applyCharacter = (next: CharacterBaseInput) => {
    applyInput(next);
  };

  return (
    <FloatWindow
      boundsSelector={RO_CALC_DRAG_BOUNDS_SELECTOR}
      defaultSide="left"
      defaultPosition={{ y: 600 }}
      zIndex={theme.zIndex.drawer + 1}
      stackKey={FLOAT_STACK_KEYS.guildLeader}
      verticalStackOrder={1}
      rootClassName="ro-calc-guild-leader-float"
      title={
        <Typography variant="subtitle2" fontWeight={600}>
          {GUILD_COMMAND_CARD_TITLE}
        </Typography>
      }
      collapseIcon={<GroupsIcon fontSize="small" />}
      collapseAriaLabel={`展开${GUILD_COMMAND_CARD_TITLE}`}
      collapseTooltip={`展开${GUILD_COMMAND_CARD_TITLE}`}
      cardSx={{
        maxHeight: "min(72vh, 420px)",
      }}
      contentSx={{ p: 1.5 }}
    >
      <GuildCommandPanel value={input} onChange={applyCharacter} />
    </FloatWindow>
  );
};

export default GuildLeaderSkillsFloat;
