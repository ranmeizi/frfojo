import { FC } from "react";
import { styled } from "@mui/material";

const Root = styled("div")(() => ({}));

type PlayerCardProps = {};

const PlayerCard: FC<PlayerCardProps> = () => {
  return <Root>Component PlayerCard</Root>;
};

export default PlayerCard;
