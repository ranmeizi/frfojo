import { styled, Zoom } from "@mui/material";
import { FC, useContext } from "react";
import type { ItemData } from "./Columns";
import { context } from "./Columns";
import { green } from "@mui/material/colors";
import { motion, AnimatePresence, MotionProps } from "framer-motion";

export const transtion: MotionProps["transition"] = {
  duration: 0.2,
};

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

  ".active &": {
    opacity: 0.5,
    border: `4px dashed ${green["300"]}`,
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
    opacity: "0.8",

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
  const isActive = id === activeId;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ transform: "scale(0)" }}
        animate={{ transform: "scale(1)" }}
        exit={{ transform: "scale(0)" }}
        transition={transtion}
      >
        <Root
          width={width}
          className={`storage-item ${isHover ? "mimicry" : ""} ${
            isActive ? "active" : ""
          }`}
          data-id={id}
        >
          <img src={src} />
        </Root>
      </motion.div>
    </AnimatePresence>
  );
};

export default Item;
