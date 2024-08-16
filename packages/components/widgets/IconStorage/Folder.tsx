/**
 * Folder 文件夹
 *
 * Folder 作为一个嵌套的
 */
import { FC, useContext } from "react";
import { styled } from "@mui/material";
import { StorageContext } from "./context";
import { Item } from "./Columns";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

const Root = styled("div")<{ width: number }>(({ theme, width }) => ({
  height: width + "px",
  width: width + "px",
  borderRadius: "8px",
  background: "rgba(255,255,255,.4)",
  transition: "200ms",
  padding: "2px",
  cursor: "pointer",

  "&:hover": {
    background: theme.palette.primary.main,
  },

  ".active &": {
    opacity: 0.5,
    cursor: "grabbing",
  },

  ".ffj-folder-scroll": {
    height: "100%",
    width: "100%",
    overflow: "hidden",
  },

  ".ffj-folder-content": {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
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
      <div className="ffj-folder-scroll">
        <div className="ffj-folder-content">
          {items.map((item) => (
            <img src={item.src} />
          ))}
        </div>
      </div>
    </Root>
  );
};

export default Folder;
