import { ReactNode } from "react";
import { SuccessMessage } from "./Success";
import { WarningMessage } from "./Warning";
import { ErrorMessage } from "./Error";
import { InfoMessage } from "./Info";
import { getPopupBridge } from "../bridge";

export type MessageMethodOptions = {
  /** 自动关闭的延时，单位秒。设为 0 时不自动关闭 默认值 3 */
  duration?: number;
  /** 提示内容 */
  content?: ReactNode;
  /** 自定义图标 */
  icon?: ReactNode;
  /** 点击 message 时触发的回调函数 */
  onClick?: Function;
  /** 关闭时触发的回调函数 */
  onClose?: Function;
};

type EmitPayload = { task: Promise<unknown>; node: ReactNode };

function emitMessage(payload: EmitPayload) {
  window.__BOCOMP_POPUP_EVENT_BUS__.emit(
    window.__BOCOMP_POPUP_EVENT_BUS__.TYPES.MESSAGE,
    payload
  );
}

function normalizeOptions(options: MessageMethodOptions | string): MessageMethodOptions {
  if (typeof options === "string") return { content: options };
  return options;
}

function rawSuccess(options: MessageMethodOptions | string) {
  const opts = normalizeOptions(options);
  let node: ReactNode;
  const task = new Promise((resolve, reject) => {
    node = <SuccessMessage resolve={resolve} reject={reject} {...opts} />;
  });
  emitMessage({ task, node: node! });
  return task;
}

function rawWarning(options: MessageMethodOptions | string) {
  const opts = normalizeOptions(options);
  let node: ReactNode;
  const task = new Promise((resolve, reject) => {
    node = <WarningMessage resolve={resolve} reject={reject} {...opts} />;
  });
  emitMessage({ task, node: node! });
  return task;
}

function rawError(options: MessageMethodOptions | string) {
  const opts = normalizeOptions(options);
  let node: ReactNode;
  const task = new Promise((resolve, reject) => {
    node = <ErrorMessage resolve={resolve} reject={reject} {...opts} />;
  });
  emitMessage({ task, node: node! });
  return task;
}

function rawInfo(options: MessageMethodOptions | string) {
  const opts = normalizeOptions(options);
  let node: ReactNode;
  let close: () => void;
  const task = new Promise((resolve, reject) => {
    close = reject;
    node = <InfoMessage resolve={resolve} reject={reject} {...opts} />;
  });
  emitMessage({ task, node: node! });
  return { close: close! };
}

// 给主应用 bridge 用：直接走 eventBus，不再二次桥接，避免递归
export const rawMessageMethods = {
  success: rawSuccess,
  warning: rawWarning,
  error: rawError,
  info: rawInfo,
};

export const methods = {
  success(options: MessageMethodOptions | string) {
    const bridge = getPopupBridge();
    if (bridge?.message?.success) {
      return bridge.message.success(options);
    }
    return rawSuccess(options);
  },
  warning(options: MessageMethodOptions | string) {
    const bridge = getPopupBridge();
    if (bridge?.message?.warning) {
      return bridge.message.warning(options);
    }
    return rawWarning(options);
  },
  error(options: MessageMethodOptions | string) {
    const bridge = getPopupBridge();
    if (bridge?.message?.error) {
      return bridge.message.error(options);
    }
    return rawError(options);
  },
  info(options: MessageMethodOptions | string) {
    const bridge = getPopupBridge();
    if (bridge?.message?.info) {
      return bridge.message.info(options);
    }
    return rawInfo(options);
  },
};
