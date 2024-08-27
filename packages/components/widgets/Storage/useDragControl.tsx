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
  }, [openId, value]);

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

      const overItem = overId ? itemMap.current[overId] : null;
      const activeItem =
        listLv2.find((item) => item.id === activeId) ||
        listLv1.find((item) => item.id === activeId)!;

      console.log(`dragover`, activeItem, overItem);

      // 或许应该过滤 overId 是 folder 的？
      if (activeItem.parentId && overItem && isFolder(overItem)) {
        return;
      }

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

        // 要判断移入 移出喽
        if (activeList === listLv1) {
          //移入
          overList.splice(overIndex, 0, {
            ...activeItem[0],
            parentId: overItem!.parentId,
          });
        } else {
          //移出
          overList.splice(overIndex, 0, {
            ...activeItem[0],
            parentId: undefined,
          });
        }

        setActiveList([...activeList]);
        setOverList([...overList]);

        reset(); // 重置高度
      }
    },
    [listLv1, listLv2]
  );

  const onDragMove = useCallback((event: DragMoveEvent) => {
    // 记录 hoverId
    const hoverEl = event.collisions?.find((item) => item?.data?.hovered);

    console.log("hoverEl", hoverEl);

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

  const onDragEnd = useCallback(
    (event: DragMoveEvent) => {
      const activeId = String(event.active.id);
      const overId = event.over?.id;

      reset();

      // 清空
      setActiveId(null);
      setHoverId(null);

      let hoverId =
        event.collisions?.find((item) => item?.data?.hovered)?.id || null;

      // 没有变化
      if (!overId) {
        return;
      }

      // 优先处理合并
      if (hoverId && tryCombine(activeId, String(hoverId))) {
        console.log("conbine", activeId, hoverId);
        return;
      }

      if (overId === activeId) {
        // 无效
        return;
      }
      // 排序
      console.log("sort", activeId, overId);
      sortItem(activeId, String(overId));
    },
    [listLv1, listLv2]
  );

  // 尝试处理合并
  function tryCombine(activeId: string, targetId: string): boolean {
    const activeItem = itemMap.current[activeId];
    const targetItem = itemMap.current[targetId];

    console.log("in combine", activeItem, targetItem);

    // 1. active 是文件夹绝对不能合并直接返回
    if (isFolder(activeItem)) {
      console.log("tryCombine 1");
      return false;
    }

    // 2. target 是文件夹 并且 active 本身不在 target 里
    if (isFolder(targetItem) && activeItem.parentId !== targetId) {
      console.log("tryCombine 2");
      // 没问题，此时 a 不是文件夹，t 是，使用 joinFolder
      // 但 joinFolder 需要判断 a 是在 顶层还是在文件夹中，这是不同的数据处理逻辑
      joinFolder(activeId, targetId);
      return true;
    }

    // 3. 判断 active 与 target 在一级吗？(此时是 2个都不是文件夹 都在 第一级)
    if (
      activeItem.parentId === targetItem.parentId &&
      activeItem.parentId === undefined
    ) {
      console.log("tryCombine 3");
      // 没问题 创建新文件夹
      createFolder(activeId, targetId);
      return true;
    }

    // 4. 此时 2 个都不是文件夹 并且他们都属于不同的文件夹，也不能合并了

    return false;
  }

  // 加入文件夹
  function joinFolder(activeId: string, targetId: string) {
    console.log(`joinFolder, activeId=${activeId} targetId=${targetId}`);
    const activeItem = itemMap.current[activeId];
    const targetItem = value.find((item) => item.id === targetId);

    if (!isFolder(targetItem!)) {
      // 不行 一定是你调用的有问题 joinFolder 对象是 target 一定是 folder，但在这里防御一下
      return;
    }

    if (activeItem.parentId) {
      // a 在文件夹里
      const folderItem = itemMap.current[activeItem.parentId];

      // 删除 active
      const list = folderItem.items!;
      list.splice(list.findIndex((item) => item.id === activeId));

      // 加入 target 的 items
      targetItem!.items!.push(activeItem);

      // 更新数据
      setListLv2([...value]);
      onChange([...value]);
    } else {
      // a 不再文件夹中

      // 删除 active
      value.splice(
        value.findIndex((item) => item.id === activeId),
        1
      );

      // 加入 target 的 items

      targetItem!.items!.push(activeItem);
      setListLv1([...value]);
      onChange([...value]);
    }
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

    // setOpenId(`folder_created_by_${targetId}`);
  }

  // 触发排序
  function sortItem(activeId: string, targetId: string) {
    const isTier2 = !value.find((item) => item.id === targetId);

    if (isTier2) {
      console.log("sort tier2");
      const target = itemMap.current[targetId];
      const folder = value.find((item) => item.id === target.parentId);

      const listRef = folder!.items!;

      const startIndex = listRef.findIndex((item) => item.id === activeId);
      const endIndex = listRef.findIndex((item) => item.id === targetId);

      listRef.splice(endIndex, 0, ...listRef.splice(startIndex, 1));

      onChange([...value]);
      setListLv2([...listRef]);
    } else {
      console.log("sort tier1");
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

// 判断一个item是不是文件夹
function isFolder(item: ItemData): boolean {
  return !!item.items && item.items.length > 0;
}
