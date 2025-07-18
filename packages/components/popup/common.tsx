import { useForceUpdate } from "@frfojo/common/hooks";
import { ReactNode, useEffect, useRef } from "react";
import { EventBus } from "@frfojo/common/utils";

export type PopupPromise = {
  resolve: <T = any>(data?: T) => void;
  reject: () => void;
};

/**
 * 采用 use hook 挂载到 react tree 的方案
 * 用唯一的 Modal.method 对象往 modals Map 中追加 弹窗
 *
 * 这样的好处是，可以享受tree节点的 context 层级
 * 但是需要你手动初始化一下 const modal = useMethodModal() 将这个 modal 节点插入react树
 */
export function useMethodPopup() {
  // 每一个 method 弹窗 视为一个 promise 当他状态变化时，就是关闭，然后这个hook维护modal开启关闭
  const modalsMap = useRef(new Map<Promise<any>, ReactNode>());

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    function listener({ task, node }: { task: Promise<any>; node: ReactNode }) {
      console.log("listener", node);
      modalsMap.current.set(task, node);

      console.log("forceUpdate", forceUpdate);
      forceUpdate();

      task.finally(() => {
        // 删掉这个task
        modalsMap.current.delete(task);
        console.log("delete", modalsMap);
        forceUpdate();
      });
    }
    window.__BOCOMP_POPUP_EVENT_BUS__.on("message", listener);
    return () => {
      window.__BOCOMP_POPUP_EVENT_BUS__.un(
        window.__BOCOMP_POPUP_EVENT_BUS__.TYPES.MESSAGE,
        listener
      );
    };
  }, []);

  const modals = Array.from(
    modalsMap.current.entries().map(([task, node]) => node)
  );

  console.log(modals, modalsMap, "modals");

  return (
    <div style={{ height: 0, width: 0, position: "fixed", top: 0, left: 0 }}>
      {/* 动画节点 */}
      {modals.map((item) => item)}
    </div>
  );
}

window.__BOCOMP_POPUP_EVENT_BUS__ = new EventBus();
