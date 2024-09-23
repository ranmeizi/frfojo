import { useEffect, useRef, useState } from "react";
import { ItemData } from "./Columns";
import {
  CollisionDetection,
  DndContextProps,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { useClosestCenter } from "./useClosestCenter";
import { useInvoker } from "@frfojo/common/hooks/useInvoker";

type UseDragControlParams = {
  value: ItemData[]; // 值
  onChange: (value: ItemData[]) => void; // 修改
};

export interface DragControl {
  flatTree: ItemData[];
  itemMap: React.MutableRefObject<Record<string, ItemData>>;
  activeId: string | null;
  hoverId: string | null;
  openId: string | null;
  setOpenId: (openId: string | null) => void;
  onDragStart: DndContextProps["onDragStart"];
  onDragMove: DndContextProps["onDragMove"];
  onDragOver: DndContextProps["onDragOver"];
  onDragEnd: DndContextProps["onDragEnd"];
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

  const [flatTree, setFlatTree] = useState<ItemData[]>([]);
  const itemMap = useRef<Record<string, ItemData>>({});

  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const { collisionDetection, reset } = useClosestCenter({ itemMap });

  // 数据初始化
  function updateItemMap(value: ItemData[]) {
    const map: Record<string, ItemData> = {};

    value.forEach((item) => (map[item.id] = item));

    setFlatTree([...value]);
    itemMap.current = map;
  }

  useEffect(() => {
    // 更新 ItemMap
    updateItemMap(value);
  }, [value]);

  // 判断一个item是不是文件夹
  function isFolder(id: string): boolean {
    return Object.values(itemMap.current).some((item) => item.parentId === id);
  }

  const onDragStart = useInvoker(
    () =>
      function (event: DragStartEvent) {
        const _activeId = event.active.id;

        // 记录 activeId
        setActiveId(_activeId.toString());

        // 移动正在打开的文件夹时,关闭文件夹
        if (openId && openId === _activeId) {
          setOpenId(null);
        }
      },
    [openId] // 这些值改变时,更新内部函数
  );

  const onDragOver = useInvoker(
    () =>
      function (event: DragOverEvent) {
        const _activeId = event.active.id;
        const activeItem = itemMap.current[_activeId];
        const _overId = event.over?.id;
        const overItem = _overId ? itemMap.current[_overId] : null;

        console.log("over", _activeId, _overId);

        // 是否要交换元素

        // 无效id
        if (_activeId === _overId) {
          return;
        }

        // 打开的文件夹不用交换
        if (_overId === openId) {
          return;
        }

        // 在同一个文件夹？
        if (activeItem.parentId === overItem?.parentId) {
          return;
        }
        // 重置高度
        reset();

        // 把 over 的 parentId 赋值给 active
        activeItem.parentId = overItem?.parentId;

        // 更新
        setFlatTree((v) => [...v]);
      },
    [openId]
  );

  const onDragMove = useInvoker(
    () =>
      function (event: DragMoveEvent) {
        const _hoverId = event.collisions?.find(
          (item) => item?.data?.hovered
        )?.id;
        const hoverItem = _hoverId ? itemMap.current[_hoverId] : null;
        const _activeId = event.active.id;

        // 判断是否可 hover(可合并动画)
        let canHover = true;

        if (!_hoverId) {
          canHover = false;
        } else if (hoverItem && hoverItem.parentId) {
          // hoverItem 在文件夹中，不可合并
          canHover = false;
        } else if (isFolder(_activeId.toString())) {
          // active 是一个文件夹，不可合并
          canHover = false;
        }

        setHoverId(canHover ? String(_hoverId) : null);
      },
    []
  );

  const onDragEnd = useInvoker(
    () =>
      function (event: DragEndEvent) {
        const _activeId = event.active.id;
        const _overId = event.over?.id;
        const _hoverId = event.collisions?.find(
          (item) => item?.data?.hovered
        )?.id;

        console.log(
          `end! active=${_activeId} over=${_overId} hover=${_hoverId}`
        );

        // 重置一些值
        reset();
        setActiveId(null);
        setHoverId(null);

        // 没有变化
        if (!_overId) {
          return;
        }

        // 优先处理合并
        if (_hoverId && tryCombine(_activeId.toString(), _hoverId.toString())) {
          console.log("conbine", _activeId, _hoverId);
          return;
        }

        // 排序时无效
        // if (_overId === _activeId) {
        //   return;
        // }

        console.log("sort", _activeId, _overId);
        sortItem(_activeId.toString(), _overId.toString());
      },
    [flatTree]
  );

  // 尝试处理合并
  function tryCombine(activeId: string, targetId: string): boolean {
    const activeItem = itemMap.current[activeId];
    const targetItem = itemMap.current[targetId];

    console.log("in combine", activeItem, targetItem);

    // 1. active 是文件夹绝对不能合并直接返回
    if (isFolder(activeId)) {
      console.log("tryCombine 1");
      return false;
    }

    // 2. target 是文件夹 并且 active 本身不在 target 里
    if (isFolder(targetId) && activeItem.parentId !== targetId) {
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

    if (!isFolder(targetId!)) {
      // 不行 一定是你调用的有问题 joinFolder 对象是 target 一定是 folder，但在这里防御一下
      return;
    }

    activeItem.parentId = targetId;

    // 更新数据
    updateTree();
  }

  // 创建文件夹
  function createFolder(activeId: string, targetId: string) {
    const targetItem = itemMap.current[targetId];
    const activeItem = itemMap.current[activeId];

    const newId = `folder_created_by_${targetId}`;
    const folder: ItemData = {
      id: newId,
      parentId: undefined,
      order: 0,
      type: "folder",
      src: "",
      tooltip: "",
    };

    targetItem.parentId = newId;
    activeItem.parentId = newId;

    // 用 floder 替换 target 在 flat 中的位置，并把 target 与 active 排列到 flattree 最后
    const targetIndex = flatTree.findIndex((item) => item.id === targetId);
    flatTree.splice(targetIndex, 1, folder);

    const activeIndex = flatTree.findIndex((item) => item.id === activeId);
    flatTree.splice(activeIndex, 1);

    flatTree.push(targetItem);
    flatTree.push(activeItem);

    // 更新数据
    updateTree();
  }

  // 触发排序
  function sortItem(activeId: string, targetId: string) {
    const startIndex = flatTree.findIndex((item) => item.id === activeId);
    const endIndex = flatTree.findIndex((item) => item.id === targetId);
    flatTree.splice(endIndex, 0, ...flatTree.splice(startIndex, 1));

    // 更新数据
    updateTree();
  }

  function updateTree() {
    // 先更新ui
    setFlatTree((v) => [...v]);

    const folderChildrenCount: Record<string, number> = {};

    flatTree.forEach((item) => {
      if (item.parentId) {
        if (folderChildrenCount[item.parentId]) {
          folderChildrenCount[item.parentId] += 1;
        } else {
          folderChildrenCount[item.parentId] = 1;
        }
      }
    });

    let res = [...flatTree];

    // 检查 长度为1的items
    const len1Index = flatTree.findIndex(
      (item) => folderChildrenCount[item.id] === 1
    );

    if (len1Index >= 0) {
      // 处理一下 res
      const len1Item = flatTree[len1Index];

      // 找到 len1Item 的唯一元素
      const childIndex = flatTree.findIndex(
        (item) => item.parentId === len1Item.id
      )!;
      // 给他放到外面
      const child = flatTree[childIndex];
      const cpchild = { ...child };
      cpchild.parentId = undefined;

      // 放到 len1Index 位置，并且移除 len1Item
      res.splice(len1Index, 1, cpchild);

      // 删除原来child
      res = res.filter((item) => item !== child);

      // 清空一下 openId
      setOpenId(null);
    }

    onChange(res);
  }

  return {
    flatTree,
    itemMap,
    activeId,
    hoverId,
    openId,
    setOpenId,
    onDragStart,
    onDragOver,
    onDragMove,
    onDragEnd,
    collisionDetection,
  };
}
