import { styled } from "@mui/material";
import { FC, useCallback, useMemo, useState } from "react";
import createResizeElement from "../../element/createResizeElement";
import { throttle } from "@frfojo/common";
import { StorageContext } from "./context";
import Icon from "./Icon";
import Folder from "./Folder";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { closestCenter, reset } from "./utils";

// resize div
const ReDiv = createResizeElement("div");

// styled div
const Root = styled(ReDiv)(({ theme }) => ({
  height: "100%",
  width: "100%",

  ".ffj-icon-storage-columns": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  ".drag-outer": {
    padding: "4px 0",
  },
}));

type StorageColumnsProps = {
  items: Item[];
  onChange?(newItems: Item[]): void; // 元素插入交换
  onDelete?(): void; // 删除元素
  renderIcon?(): void;
};

export type Item = {
  items?: Item[];
  id: string;
  src?: string;
};

/**
 * Columns 型，装 Icon 的容器
 * 1. 测一下自己的宽，告诉 Icon Folder 边长应该是多少
 * 2. dnd 允许拖拽
 */
const StorageColumns: FC<StorageColumnsProps> = (props) => {
  const { items, onChange } = props;
  const [width, setWidth] = useState(0);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const onResize = useCallback(
    throttle((el) => {
      const w = el.clientWidth > 96 ? 96 : el.clientWidth;
      setWidth(w - 2);
    }, 50),
    []
  );

  const sortItems = useMemo(() => {
    return items.map((item) => item.id);
  }, [items]);

  function renderTreeItem(item: Item): React.ReactNode {
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
          <Icon {...item} />
        </SortableItem>
      );
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over, collisions } = event;
    // 交换 items item
    const hoverEl = collisions?.find((item) => item?.data?.hovered);

    reset();

    // 这里代表 drop 了 放到对应的 children 里
    if (hoverEl) {
      const startIndex = items.findIndex(({ id }) => id === active.id);
      const targetIndex = items.findIndex(({ id }) => id === hoverEl.id);

      const newItems = [...items];

      if (
        newItems[targetIndex].items &&
        newItems[targetIndex].items.length > 0
      ) {
        // 往Folder中push
        newItems[targetIndex].items?.push(...newItems.splice(startIndex, 1));
      } else {
        // 创建一个新Folder
        newItems[targetIndex].items = [
          { ...newItems[targetIndex], items: undefined },
          ...newItems.splice(startIndex, 1),
        ];
        newItems[targetIndex].id = `folder_createby_${hoverEl.id}`;
      }

      onChange?.(newItems);
      return;
    }

    // 排序
    if (active.id !== over?.id) {
      const startIndex = items.findIndex(({ id }) => id === active.id);
      const endIndex = items.findIndex(({ id }) => id === over?.id);
      const newItems = arrayMove(items, startIndex, endIndex);
      onChange?.(newItems);
      return;
    }
  }

  return (
    <StorageContext.Provider value={{ width }}>
      <DndContext
        // sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortItems}
          strategy={verticalListSortingStrategy}
        >
          <Root onResize={onResize}>{items.map(renderTreeItem)}</Root>
        </SortableContext>
      </DndContext>
    </StorageContext.Provider>
  );
};

export default StorageColumns;
