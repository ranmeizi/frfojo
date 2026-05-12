import { Box, type SxProps, type Theme, useTheme } from "@mui/material";
import { type MutableRefObject, type ReactNode, useRef, useState } from "react";
import Draggable, {
  type DraggableData,
  type DraggableEvent,
} from "react-draggable";
import { useRoCalcFloatStack } from "../RoCalcFloatStackContext";

/** 加在可拖动标题（或收起态外圈）上；勿放在需点击的 IconButton 上 */
export const DRAGGABLE_OPACITY_FLOAT_HANDLE = "draggable-opacity-float__handle";

export type HorizontalAnchor = "none" | "left" | "right";

export type DraggableOpacityFloatProps = {
  /** 限制拖动范围的容器，CSS selector（须为当前浮窗的祖先元素） */
  boundsSelector: string;
  /** 受控位移（相对左上角锚点 + transform） */
  position: { x: number; y: number };
  onDragStop?: (e: DraggableEvent, data: DraggableData) => void;
  /** 收起后贴左/贴右时：根节点 `left` 或 `right` 留白（px） */
  horizontalAnchor?: HorizontalAnchor;
  anchorInset?: number;
  /** 测量浮窗根节点（getBoundingClientRect） */
  floatRootRef?: MutableRefObject<HTMLDivElement | null>;
  /** 鼠标移出后的不透明度，默认 0.2 */
  dimmedOpacity?: number;
  zIndex?: number;
  /** 参与同层 z-index 竞争：悬停时抬高本窗、压低其它带 stackKey 的窗 */
  stackKey?: string;
  children: ReactNode;
  rootSx?: SxProps<Theme>;
  /** 加在拖动根节点上，便于其它浮层测量相对位置 */
  rootClassName?: string;
};

/**
 * 通用浮层：在 boundsSelector 容器内拖动；悬停 opacity=1，移开过渡到 dimmedOpacity。
 * 使用 react-draggable，仅当鼠标落在带 {@link DRAGGABLE_OPACITY_FLOAT_HANDLE} 的区域时可拖（标题栏等）。
 */
export function DraggableOpacityFloat({
  boundsSelector,
  position,
  onDragStop,
  horizontalAnchor = "none",
  anchorInset = 20,
  floatRootRef: floatRootRefProp,
  dimmedOpacity = 0.5,
  zIndex: zIndexProp,
  stackKey,
  children,
  rootSx,
  rootClassName,
}: DraggableOpacityFloatProps) {
  const theme = useTheme();
  const floatStack = useRoCalcFloatStack();
  const nodeRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const baseZ = zIndexProp ?? theme.zIndex.drawer + 2;
  /** 收起贴边（horizontalAnchor）时抬到接近 modal，避免与其它同层浮层或底栏叠压 */
  let effectiveZ =
    horizontalAnchor !== "none" ? Math.max(baseZ, theme.zIndex.modal - 2) : baseZ;

  if (stackKey && floatStack?.raisedKey != null) {
    if (floatStack.raisedKey === stackKey) {
      effectiveZ = Math.max(effectiveZ, theme.zIndex.modal + 10);
    } else {
      effectiveZ = Math.min(effectiveZ, theme.zIndex.drawer);
    }
  }

  const setRootRef = (el: HTMLDivElement | null) => {
    const nr = nodeRef as MutableRefObject<HTMLDivElement | null>;
    nr.current = el;
    if (floatRootRefProp) floatRootRefProp.current = el;
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle={`.${DRAGGABLE_OPACITY_FLOAT_HANDLE}`}
      bounds={boundsSelector}
      position={position}
      onStop={onDragStop}
      cancel=".MuiIconButton-root, button, a, input, textarea, select, [role='slider']"
    >
      <Box
        ref={setRootRef}
        className={rootClassName}
        sx={{
          position: "absolute",
          top: 0,
          /** 根不接收点击，避免收起后残留占位挡住下层滚动区 */
          pointerEvents: "none",
          width: "max-content",
          maxWidth: "min(calc(100% - 16px), 320px)",
          ...(horizontalAnchor === "left"
            ? { left: anchorInset, right: "auto" }
            : horizontalAnchor === "right"
              ? { right: anchorInset, left: "auto" }
              : { left: 0, right: "auto" }),
          zIndex: effectiveZ,
          opacity: hovered ? 1 : dimmedOpacity,
          transition: theme.transitions.create("opacity", { duration: 200 }),
          ...rootSx,
        }}
      >
        <Box
          onMouseEnter={() => {
            setHovered(true);
            if (stackKey) floatStack?.raise(stackKey);
          }}
          onMouseLeave={() => {
            setHovered(false);
            if (stackKey) floatStack?.lower(stackKey);
          }}
          sx={{
            pointerEvents: "auto",
            width: "max-content",
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
          {children}
        </Box>
      </Box>
    </Draggable>
  );
}
