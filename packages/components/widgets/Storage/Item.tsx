import { styled } from "@mui/material";
import { FC, useContext } from "react";
import type { ItemData } from "./Columns";
import { context } from "./Columns";

const Root = styled("div")<{
  width: number;
  background?: string;
}>(({ theme, width, background }) => ({
  height: width + "px",
  width: width + "px",
  borderRadius: "8px",
  transition: "200ms",
  background: background || "rgba(66,66,66,.5)",
  overflow: "hidden",
  cursor: "pointer",

  "&:hover": {
    background: theme.palette.primary.main,
  },

  ".active &": {
    opacity: 0.5,
    cursor: "grabbing",
  },

  img: {
    height: "100%",
    width: "100%",
    transition: "200ms",
  },

  "&.mimicry": {
    background: "rgba(255,255,255,.4)",
    padding: "2px",
    transform: "scale(1.1)",

    img: {
      height: "50%",
      width: "50%",
    },
  },
}));

const Item: FC<ItemData> = (props) => {
  const { id, src } = props;
  const { width, hoverId, activeId } = useContext(context);

  const isHover = id === hoverId;

  return (
    <Root width={width} className={isHover ? "mimicry" : ""}>
      <img src={src} />
    </Root>
  );
};

export default Item;
