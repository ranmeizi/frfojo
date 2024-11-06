import { FC } from "react";
import { styled } from "@mui/material";

const Root = styled("div")(({ theme }) => ({}));

type PlayerCardProps = {};

const PlayerCard: FC<PlayerCardProps> = (props) => {
  return <Root>Component PlayerCard</Root>;
};

export default PlayerCard;
