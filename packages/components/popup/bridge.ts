import type { MessageMethodOptions } from "./message/methods";
import type { ModalMethodOptions } from "./Modal/methods";

export type PopupBridge = {
  message?: {
    success?: (options: MessageMethodOptions | string) => Promise<unknown>;
    warning?: (options: MessageMethodOptions | string) => Promise<unknown>;
    error?: (options: MessageMethodOptions | string) => Promise<unknown>;
    info?: (
      options: MessageMethodOptions | string
    ) => {
      close: () => void;
    };
  };
  modal?: {
    confirm?: (
      options: ModalMethodOptions
    ) => {
      close: () => void;
    };
  };
};

export function getPopupBridge(): PopupBridge | undefined {
  const w = globalThis as any;
  // 子应用可以在启动时把 bridge 挂到全局
  if (w.__BOCOMP_POPUP_BRIDGE__) return w.__BOCOMP_POPUP_BRIDGE__ as PopupBridge;
  // Garfish 有时会把 props 挂在 __GARFISH__.props 上
  if (w.__GARFISH__?.props?.popupBridge) return w.__GARFISH__.props.popupBridge as PopupBridge;
  // 兼容某些包装：props.props
  if (w.__GARFISH__?.props?.props?.popupBridge) return w.__GARFISH__.props.props.popupBridge as PopupBridge;
  return undefined;
}

