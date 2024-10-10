import { FC, useMemo } from "react";
import { Box, styled } from "@mui/material";

/**
 * 英雄技能
 */

const prefix =
  "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/";

function getUrl(name: string) {
  return `${prefix}${name}.png`;
}

const Root = styled("div")(() => ({
  width: "100%",
  paddingTop: "100%",
  boxSizing: "border-box",
  position: "relative",

  ".ability-img": {
    height: "100%",
    width: "100%",
    position: "absolute",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    top: 0,
    left: 0,
  },
}));

type AbilityProps = {
  abilityName?: string;
  abilityId?: string;
};

const Ability: FC<AbilityProps> = ({ abilityId, abilityName }) => {
  // 有name 用name ，没有name 使用 id 去找name

  const name = useMemo(() => {
    if (abilityName) {
      return abilityName;
    }

    if (abilityId) {
      // 找
      return undefined;
    }

    return undefined;
  }, []);

  const src = name ? getUrl(name) : "";

  return (
    <Root>
      <Box className="ability-img" sx={{ background: `url(${src})` }} />
    </Root>
  );
};

export default Ability;
