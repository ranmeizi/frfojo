import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ItemData } from "./Columns";
import {
  CollisionDetection,
  DndContextProps,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { useClosestCenter } from "./useClosestCenter";

type UseDragControlParams = {
  value: ItemData[]; // 值
  onChange: (value: ItemData[]) => void; // 修改
};

export interface DragControl {
  listLv1: ItemData[];
  listLv2: ItemData[];
  activeId: string | null;
  hoverId: string | null;
  openId: string | null;
  setOpenId: (openId: string | null) => void;
  onDragStart: DndContextProps["onDragStart"];
  onDragMove: DndContextProps["onDragMove"];
  onDragOver: DndContextProps["onDragOver"];
  onDragEnd: DndContextProps["onDragEnd"];
  itemMap: React.MutableRefObject<Record<string, ItemData>>;
  collisionDetection: CollisionDetection;
}

/**
 * 数据的操作在这里进行，组件保留最简单的样式与结构，不做过多的计算
 *
 * 重要条件  所以能做更多的优化
 *
 * 1. 仓库里的数据虽然是树,但文件夹不能再次合并为文件夹,所以深度只有2层
 * 2. Folder 是手风琴，只能打开1个
 * 3. 只有 Folder 打开时,他才是一个 SortableContext，或者说他才可以跨层级操作数据
 *
 * 1+2+3 ，可以很放心的将数据维护成2个数组 level1List 和 level2List
 * lv1 是 Columns 组件中的 第一级 sortable
 * lv2 是 Folder 组件中的 第二级 sortable
 *
 * 拖拽
 * dragStart
 * dragMove
 * dragOver
 * dragEnd [*]  在 dragEnd 时,计算最终的树，并且 onChange 修改外层的数据
 *
 * 并且对于value的修改，归纳为以下几个操作
 * 1. 排序
 * 2. 合并成文件夹
 * 3. 加入文件夹
 * 4. 1元素的文件夹自动销毁
 */

export function useDragControl({
  value,
  onChange,
}: UseDragControlParams): DragControl {
  // 临时数据
  const [listLv1, setListLv1] = useState<ItemData[]>([]);
  const [listLv2, setListLv2] = useState<ItemData[]>([]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const [openId, setOpenId] = useState<string | null>(null);

  const itemMap = useRef<Record<string, ItemData>>({});

  const { collisionDetection, reset } = useClosestCenter({ itemMap });

  // 更新list1
  function updateList1ByValue(newValue: ItemData[]) {
    setListLv1(newValue);
  }

  // 更新list2
  function updateList2ByValue(id: string | null) {
    if (!id) {
      setListLv2([]);
    } else {
      const items = itemMap.current[id].items || [];
      setListLv2(items);
    }
  }

  // 更新map
  function updateItemMap(items: ItemData[]) {
    const map: Record<string, ItemData> = {};
    function eachItem(node: ItemData, parentId?: string) {
      map[node.id] = { ...node };
      map[node.id].parentId = parentId;
      node.items && node.items.forEach((item) => eachItem(item, node.id));
    }

    items.forEach((item) => eachItem(item, undefined));

    itemMap.current = map;
  }

  useEffect(() => {
    // 更新 ItemMap
    updateItemMap(value);

    // 计算lv1
    updateList1ByValue(value);
  }, [value]);

  useEffect(() => {
    // 计算lv2
    updateList2ByValue(openId);
  }, [openId]);

  const onDragStart = useCallback((event: DragStartEvent) => {
    const activeId = event.active.id;
    // 记录 activeId
    setActiveId(activeId ? String(activeId) : null);
    // 关闭所有 folder
    const active = itemMap.current[activeId];

    // 根节点的文件夹移动，关闭一下，但其实不关闭也可以，但目前的检测算法用正方形移动比较舒服
    if (!active.parentId && active.items && active.items.length > 0) {
      setOpenId(null);
    }
  }, []);

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      // 判断 lv1 lv2 交换元素吗？
      const activeId = event.active.id;
      const overId = event.over?.id;

      if (activeId === overId) {
        return;
      }

      const [activeList, setActiveList] =
        listLv2.findIndex((item) => item.id === activeId) >= 0
          ? [listLv2, setListLv2]
          : [listLv1, setListLv1];

      const [overList, setOverList] =
        listLv2.findIndex((item) => item.id === overId) >= 0
          ? [listLv2, setListLv2]
          : [listLv1, setListLv1];

      const inSameArr = activeList === overList;

      if (!inSameArr) {
        // active 从 activeList 移出 加入 overlist
        const activeIndex = activeList.findIndex(
          (item) => item.id === activeId
        );
        const overIndex = overList.findIndex((item) => item.id === overId);

        const activeItem = activeList.splice(activeIndex, 1);

        overList.splice(overIndex, 0, ...activeItem);

        setActiveList([...activeList]);
        setOverList([...overList]);
      }
    },
    [listLv1, listLv2]
  );

  const onDragMove = useCallback((event: DragMoveEvent) => {
    // 记录 hoverId
    const hoverEl = event.collisions?.find((item) => item?.data?.hovered);
    // 不允许合并文件夹
    const activeId = event.active.id;
    const activeItem = itemMap.current[activeId];

    let canHover = true;
    if (!hoverEl?.id) {
      canHover = false;
    }
    // 文件夹不允许合并
    if (activeItem.items && activeItem.items.length > 0) {
      canHover = false;
    }

    // hoverItem 在文件夹里不允许合并
    if (hoverEl?.id && itemMap.current[hoverEl.id].parentId) {
      canHover = false;
    }

    setHoverId(canHover ? String(hoverEl!.id) : null);
  }, []);

  const onDragEnd = useCallback((event: DragMoveEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id;

    reset();

    // 清空
    setActiveId(null);
    setHoverId(null);

    const hoverCollisionEl = event.collisions?.find(
      (item) => item?.data?.hovered
    );

    const hoverId = hoverCollisionEl ? String(hoverCollisionEl.id) : null;

    // 没有变化
    if (!overId) {
      return;
    }

    const activeItem = itemMap.current[activeId];
    const isActiveFolder = activeItem.items && activeItem.items.length > 0;

    // 不允许合并文件夹
    if (hoverId && !isActiveFolder) {
      if (hoverId === activeId) {
        // 无效
        return;
      }

      const hoverItem = itemMap.current[hoverId];
      const isHoverFolder = hoverItem.items && hoverItem.items.length > 0;
      if (isHoverFolder) {
        joinFolder(activeId, hoverId);
      } else {
        // 只能在第一级合并
        if (value.find((item) => item.id === hoverId)) {
          // 合并？
          createFolder(activeId, hoverId);
        }
      }
    } else {
      if (overId === activeId) {
        // 无效
        return;
      }
      // 排序
      sortItem(activeId, String(overId));
    }
  }, []);

  // 加入文件夹
  function joinFolder(activeId: string, targetId: string) {
    const active = itemMap.current[activeId];
    const target = value.find((item) => item.id === targetId);

    if (!target || !target.items || target.items.length === 0) {
      // 不处理
      return;
    }

    // 删除 active
    value.splice(value.findIndex((item) => item.id === activeId));

    // 加入 target 的 items

    target.items.push(active);

    onChange([...value]);
  }

  // 创建文件夹
  function createFolder(activeId: string, targetId: string) {
    const targetIndex = value.findIndex((item) => item.id === targetId);
    const target = value[targetIndex];
    const active = value.find((item) => item.id === activeId)!;
    const folder: ItemData = {
      id: `folder_created_by_${targetId}`,
      src: "",
      items: [target, active],
    };
    value.splice(targetIndex, 1, folder);

    value = value.filter((item) => item.id !== activeId);

    onChange([...value]);
    setListLv1([...value]);
  }

  // 触发排序
  function sortItem(activeId: string, targetId: string) {
    const isTier2 = !value.find((item) => item.id === targetId);

    if (isTier2) {
      const target = itemMap.current[targetId];
      const folder = value.find((item) => item.id === target.parentId);

      const listRef = folder!.items!;

      const startIndex = listRef.findIndex((item) => item.id === activeId);
      const endIndex = listRef.findIndex((item) => item.id === targetId);

      listRef.splice(endIndex, 0, ...listRef.splice(startIndex, 1));

      onChange([...value]);
      setListLv2([...value]);
    } else {
      const startIndex = value.findIndex((item) => item.id === activeId);
      const endIndex = value.findIndex((item) => item.id === targetId);

      value.splice(endIndex, 0, ...value.splice(startIndex, 1));

      onChange([...value]);
      setListLv1([...value]);
    }
  }

  return {
    listLv1,
    listLv2,
    activeId,
    hoverId,
    openId,
    setOpenId,
    onDragStart,
    onDragOver,
    onDragMove,
    onDragEnd,
    itemMap,
    collisionDetection,
  };
}
