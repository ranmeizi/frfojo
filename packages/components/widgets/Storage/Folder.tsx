import { FC, PropsWithChildren, useContext, useMemo } from "react";
import { styled } from "@mui/material";
import { context } from "./Columns";
import type { ItemData } from "./Columns";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import Item from "./Item";
import FolderIcon from "@mui/icons-material/Folder";

const Root = styled("div")<{ open: boolean; width: number; length: number }>(
  ({ theme, open, width, length }) => ({
    width: width + "px",
    borderRadius: "8px",
    background: "rgba(255,255,255,.4)",
    transition: "200ms",
    cursor: "pointer",
    overflow: open ? "initial" : "hidden",

    "&:hover": {
      background: open ? "rgba(255,255,255,.4)" : theme.palette.primary.main,
    },

    ".active &": {
      opacity: 0.5,
      cursor: "grabbing",
    },

    ".folder-thumbnail": {
      padding: "4px",
      display: "flex",
      flexWrap: "wrap",

      img: {
        height: "50%",
        width: "50%",
      },
    },

    ".ffj-folder-collapse__header": {
      height: width + "px",
      overflow: "hidden",
      ".MuiSvgIcon-root": {
        padding: "4px",
        height: "100%",
        width: "100%",
        color: theme.palette.primary.main,
      },
      ".header-item": {
        height: width + "px",
        width: width + "px",
      },
      ".header-scroll": {
        width: width + "px",
        height: 2 * width + "px",
        transition: "200ms",
        transform: open ? `translateY(0px)` : `translateY(${-width}px)`,
      },
    },
    ".ffj-folder-collapse__body": {
      transition: "200ms",
      height: open ? width * length + 8 * length - 4 + "px" : "0px",
    },
  })
);

type FolderProps = {
  onChange?: (items: ItemData[]) => void; // 改变
} & ItemData;

const Folder: FC<PropsWithChildren<FolderProps>> = (props) => {
  const { id, items = [] } = props;

  const { width, openId, setOpenId, listLv2 } = useContext(context);

  const isOpen = id === openId;

  const header = (
    <>
      {items.map((item) => (
        <img src={item.src} />
      ))}
    </>
  );

  const sortItems = useMemo(() => {
    return items.map((item) => item.id);
  }, [listLv2]);

  console.log("嘿", listLv2);

  return (
    <Root
      className="ffj-folder-collapse"
      open={id === openId}
      width={width}
      length={listLv2.length}
    >
      {/* header */}
      <div
        className="ffj-folder-collapse__header"
        onClick={() => {
          setOpenId(isOpen ? null : id);
        }}
      >
        <div className="header-scroll">
          <div className="header-item folder-icon">
            <FolderIcon />
          </div>
          <div className="header-item folder-thumbnail">{header}</div>
        </div>
      </div>
      {/* body */}
      <SortableContext
        id="folder"
        items={sortItems}
        strategy={verticalListSortingStrategy}
      >
        <div className="ffj-folder-collapse__body">
          {listLv2.map((item) => (
            <SortableItem key={item.id} id={item.id} className="drag-outer">
              <Item {...item} />
            </SortableItem>
          ))}
        </div>
      </SortableContext>
      {/* </DndContext> */}
    </Root>
  );
};

export default Folder;
