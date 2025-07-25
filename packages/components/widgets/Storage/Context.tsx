import { createContext } from "react";
import { DragControl } from "./useDragControl";

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
