import { FC, PropsWithChildren, useContext, useMemo } from "react";
import { styled } from "@mui/material";
import type { ItemData } from "./Columns";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import Item, { transtion } from "./Item";
import FolderIcon from "@mui/icons-material/Folder";
import { green } from "@mui/material/colors";
import { motion, AnimatePresence } from "framer-motion";
import { context } from "./Context";

const Root = styled("div")<{ open: boolean; width: number }>(
  ({ theme, open, width }) => ({
    width: width + "px",
    borderRadius: "8px",
    background: "rgba(255,255,255,.4)",
    transition: "200ms",
    cursor: "pointer",
    overflow: open ? "initial" : "hidden",
    boxSizing: "border-box",

    "&.can-combine": {
      opacity: "0.8",
      transform: open ? "" : "scale(1.1)",
    },

    ".active &": {
      opacity: 0.5,

      ".ffj-folder-collapse__header": {
        border: `5px dashed ${green["300"]}`,
      },
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
      width: "100%",
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
  })
);

type FolderProps = {
  onChange?: (items: ItemData[]) => void; // 改变
  renderWrapper?(item: ItemData, dom: React.ReactNode): React.ReactNode;
} & ItemData;

const Folder: FC<PropsWithChildren<FolderProps>> = (props) => {
  const { id, renderWrapper } = props;

  const { width, openId, setOpenId, flatTree, hoverId } = useContext(context);

  const isOpen = id === openId;

  const isHover = id === hoverId;

  const items = useMemo(
    () => flatTree.filter((item) => item.parentId === openId),
    [flatTree, openId]
  );

  const sortItems = useMemo(() => {
    return items.map((item) => item.id);
  }, [items]);

  const header = (
    <>
      {flatTree
        .filter((item) => item.parentId === id)
        .map((item) => (
          <img src={item.src} />
        ))}
    </>
  );

  return (
    <Root
      className={`storage-item ffj-folder-collapse ${
        isHover && !isOpen ? "can-combine" : ""
      }`}
      open={isOpen}
      width={width}
      data-id={id}
    >
      {/* header */}
      <div
        className={`ffj-folder-collapse__header`}
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
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ height: 0 }}
            animate={{
              height: width * items.length + 8 * items.length,
            }}
            exit={{ height: 0 }}
            transition={transtion}
          >
            <SortableContext
              id="folder"
              items={sortItems}
              strategy={verticalListSortingStrategy}
            >
              <div className="ffj-folder-collapse__body">
                <div className="ffj-folder-collapse__body-inner">
                  {items.map((item) => (
                    <SortableItem
                      key={item.id}
                      id={item.id}
                      className="drag-outer"
                    >
                      {renderWrapper ? (
                        renderWrapper(item, <Item {...item} />)
                      ) : (
                        <Item {...item} />
                      )}
                    </SortableItem>
                  ))}
                </div>
              </div>
            </SortableContext>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Root>
  );
};

export default Folder;
