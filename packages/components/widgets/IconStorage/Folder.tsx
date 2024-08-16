/**
 * Folder 文件夹
 *
 * Folder 作为一个嵌套的
 */
import { FC, useContext } from "react";
import { styled } from "@mui/material";
import { StorageContext } from "./context";
import { Item } from "./Columns";

const Root = styled("div")<{ width: number }>(({ theme, width }) => ({
  height: width + "px",
  width: width + "px",
  borderRadius: "8px",
  background: "rgba(255,255,255,.4)",
  transition: "200ms",
  padding: "2px",
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  overflow: "hidden",

  "&:hover": {
    background: theme.palette.primary.main,
  },

  img: {
    height: "50%",
    width: "50%",
  },
}));

const Folder: FC<Item> = (props) => {
  const { items = [] } = props;
  const { width } = useContext(StorageContext);
  return (
    <Root width={width}>
      {items.map((item) => (
        <img src={item.src} />
      ))}
    </Root>
  );
};

export default Folder;
0;
