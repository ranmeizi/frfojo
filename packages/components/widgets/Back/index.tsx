import { FC } from "react";
import { IconButton, IconButtonProps, styled, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type BackProps = {
  tooltip?: string;
} & IconButtonProps;

const Back: FC<BackProps> = ({ tooltip, ...props }) => {
  return (
    <Tooltip title={tooltip}>
      <IconButton {...props}>
        <ArrowBackIcon />
      </IconButton>
    </Tooltip>
  );
};

export default Back;
