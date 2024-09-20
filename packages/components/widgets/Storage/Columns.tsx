import { createContext, FC, useCallback, useMemo, useState } from "react";
import { styled } from "@mui/material";
import { useDragControl, DragControl } from "./useDragControl";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import createResizeElement from "../../element/createResizeElement";
import Item from "./Item";
import Folder from "./Folder";
import { throttle } from "@frfojo/common";

// resize div
const ReDiv = createResizeElement("div");

// styled div
const Root = styled(ReDiv)(({ theme }) => ({
  maxHeight: "100%",
  width: "100%",

  ".drag-outer": {
    // padding: "4px 0",
    paddingTop: "8px",
  },

  ".my-drag-overlay .storage-item": {
    cursor: "grabbing",
  },
}));

type ColumnsProps = {
  value: ItemData[];
  onChange(value: ItemData[]): void;
  renderWrapper?(item: ItemData, dom: React.ReactNode): React.ReactNode;
};

// 元素
export type ItemData = {
  id: string;
  parentId?: string;
  order?: number;
  type: "item" | "folder" | "item_sub-app";
  src?: string;
  path?: string;
  tooltip?: string;
};

export const context = createContext<
  Omit<
    DragControl,
    | "onDragStart"
    | "onDragOver"
    | "onDragMove"
    | "onDragEnd"
    | "itemMap"
    | "collisionDetection"
  > & {
    width: number;
  }
>({
  flatTree: [],
  activeId: null,
  hoverId: null,
  width: 0,
  openId: null,
  setOpenId: () => {},
});

/**
 *
 * @param props
 * @returns
 */
const Columns: FC<ColumnsProps> = ({ value, onChange, renderWrapper }) => {
  const [width, setWidth] = useState(0);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 5,
      },
    })
  );

  const {
    flatTree,
    activeId,
    hoverId,
    onDragEnd,
    onDragMove,
    onDragOver,
    onDragStart,
    itemMap,
    openId,
    setOpenId,
    collisionDetection,
  } = useDragControl({ value, onChange });

  const items = useMemo(
    () => flatTree.filter((item) => !item.parentId),
    [flatTree]
  );

  const sortItems = items.map((item) => item.id);

  // 列表宽度
  const onResize = useCallback(
    throttle((el) => {
      const w = el.clientWidth > 96 ? 96 : el.clientWidth;
      setWidth(w - 2);
    }, 50),
    []
  );

  // 判断一个item是不是文件夹
  function isFolder(id: string): boolean {
    return Object.values(itemMap.current).some((item) => item.parentId === id);
  }

  function renderTreeItem(item: ItemData): React.ReactNode {
    if (isFolder(item.id)) {
      return (
        <SortableItem key={item.id} id={item.id} className="drag-outer">
          {renderWrapper ? (
            renderWrapper(
              item,
              <Folder {...item} renderWrapper={renderWrapper} />
            )
          ) : (
            <Folder {...item} renderWrapper={renderWrapper} />
          )}
        </SortableItem>
      );
    } else {
      return (
        <SortableItem key={item.id} id={item.id} className="drag-outer">
          {renderWrapper ? (
            renderWrapper(item, <Item {...item} />)
          ) : (
            <Item {...item} />
          )}
        </SortableItem>
      );
    }
  }

  return (
    <context.Provider
      value={{
        width,
        flatTree,
        activeId,
        hoverId,
        openId,
        setOpenId,
      }}
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        collisionDetection={collisionDetection}
      >
        <Root onResize={onResize}>
          <SortableContext
            id="columns"
            items={sortItems}
            strategy={verticalListSortingStrategy}
          >
            {items.map(renderTreeItem)}
          </SortableContext>
          <DragOverlay className="my-drag-overlay">
            {activeId ? renderTreeItem(itemMap.current[activeId]) : null}
          </DragOverlay>
        </Root>
      </DndContext>
    </context.Provider>
  );
};

export default Columns;
