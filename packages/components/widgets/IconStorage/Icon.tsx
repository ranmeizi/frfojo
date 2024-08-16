import { styled } from "@mui/material";
import { StorageContext } from "./context";
import { FC, useContext } from "react";
import { Item } from "./Columns";

const Root = styled("div")<{ width: number; background?: string }>(
  ({ theme, width, background }) => ({
    height: width + "px",
    width: width + "px",
    borderRadius: "8px",
    transition: "200ms",
    background: background || "rgba(66,66,66,.5)",
    overflow: "hidden",

    "&:hover": {
      background: theme.palette.primary.main,
    },

    ".active &": {
      opacity: 0.5,
    },

    img: {
      height: "100%",
      width: "100%",
      transition: "200ms",
    },

    ".mimicry &": {
      background: "rgba(255,255,255,.4)",
      padding: "2px",

      img: {
        height: "50%",
        width: "50%",
      },
    },
  })
);

/**
 * Icon
 *
 * Icon 作为一个 Dragable 元素，他可以在 Columns里随意交换位置
 *
 * Icon 也处理合并 Combining, 合并后，这个节点转换成 Folder
 *
 * Icon 拖动但还未合并时，做一个假动画，他并不是真正的转换为 Folder，而是长得和 Folder 差不多
 */
const Icon: FC<Item> = (props) => {
  const { id, src, background, active } = props;
  const { width } = useContext(StorageContext);

  return (
    <Root width={width}>
      <img src={src} />
    </Root>
  );
};

export default Icon;
