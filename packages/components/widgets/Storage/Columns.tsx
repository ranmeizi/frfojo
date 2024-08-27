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
  height: "100%",
  width: "100%",

  ".drag-outer": {
    padding: "4px 0",
  },
}));

type ColumnsProps = {
  value: ItemData[];
  onChange(value: ItemData[]): void;
};

// 元素
export type ItemData<T = any> = {
  id: string;
  parentId?: string;
  src: string; // cover src
  onClick?: any;
  data?: T; // 附带的data
  items?: ItemData<T>[];
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
  listLv1: [],
  listLv2: [],
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
const Columns: FC<ColumnsProps> = ({ value, onChange }) => {
  const [width, setWidth] = useState(0);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 600,
        tolerance: 5,
      },
    })
  );

  const {
    listLv1,
    listLv2,
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

  const items = useMemo(() => listLv1.map((item) => item.id), [listLv1]);

  // 列表宽度
  const onResize = useCallback(
    throttle((el) => {
      const w = el.clientWidth > 96 ? 96 : el.clientWidth;
      setWidth(w - 2);
    }, 50),
    []
  );

  function renderTreeItem(item: ItemData): React.ReactNode {
    const isFolder = item.items && item.items.length > 0;
    if (isFolder) {
      return (
        <SortableItem key={item.id} id={item.id} className="drag-outer">
          <Folder {...item} />
        </SortableItem>
      );
    } else {
      return (
        <SortableItem key={item.id} id={item.id} className="drag-outer">
          <Item {...item} />
        </SortableItem>
      );
    }
  }

  return (
    <context.Provider
      value={{
        width,
        listLv1,
        listLv2,
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
            items={items}
            strategy={verticalListSortingStrategy}
          >
            {listLv1.map(renderTreeItem)}
          </SortableContext>
          <DragOverlay>
            {activeId ? renderTreeItem(itemMap.current[activeId]) : null}
          </DragOverlay>
        </Root>
      </DndContext>
    </context.Provider>
  );
};

export default Columns;
