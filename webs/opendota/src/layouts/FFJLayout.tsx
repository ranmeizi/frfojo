import React, { FC } from "react";
import { Box } from "@mui/material";
import { LayoutMenu } from "@frfojo/components/layout";
import { Outlet } from "react-router-dom";
import RankItem, { getRankText } from "../components/Widgets/Rank";
import Item from "../components/Widgets/Item";
import Ability from "../components/Widgets/Ability";

type FFJLayoutProps = {};

const FFJLayout: FC<FFJLayoutProps> = (props) => {
  const sidebar = (
    <Box>
      <Box sx={{ width: "96px" }}>
        <RankItem rank_tier={72} />
        {getRankText(70)}
        <Item itemName="blink" />
        <Ability abilityName="pugna_life_drain" />
      </Box>
    </Box>
  );
  return (
    <LayoutMenu sidebar={sidebar}>
      <Outlet></Outlet>
    </LayoutMenu>
  );
};

export default FFJLayout;
