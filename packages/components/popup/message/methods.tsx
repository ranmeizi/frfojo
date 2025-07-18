import { ReactNode } from "react";
import { SuccessMessage } from "./Success";
import { bus } from "../common";
import { WarningMessage } from "./Warning";
import { ErrorMessage } from "./Error";
import { InfoMessage } from "./Info";

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

export const methods = {
  success(options: MessageMethodOptions | string) {
    if (typeof options === "string") {
      const content = options;
      options = {
        content,
      };
    }

    let node;

    const task = new Promise((resolve, reject) => {
      node = <SuccessMessage resolve={resolve} reject={reject} {...options} />;
    });

    window.__BOCOMP_POPUP_EVENT_BUS__.emit(
      window.__BOCOMP_POPUP_EVENT_BUS__.TYPES.MESSAGE,
      {
        task,
        node,
      }
    );

    return task;
  },
  warning(options: MessageMethodOptions | string) {
    if (typeof options === "string") {
      const content = options;
      options = {
        content,
      };
    }

    let node;

    const task = new Promise((resolve, reject) => {
      node = <WarningMessage resolve={resolve} reject={reject} {...options} />;
    });

    window.__BOCOMP_POPUP_EVENT_BUS__.emit(
      window.__BOCOMP_POPUP_EVENT_BUS__.TYPES.MESSAGE,
      {
        task,
        node,
      }
    );

    return task;
  },
  error(options: MessageMethodOptions | string) {
    if (typeof options === "string") {
      const content = options;
      options = {
        content,
      };
    }

    let node;

    const task = new Promise((resolve, reject) => {
      node = <ErrorMessage resolve={resolve} reject={reject} {...options} />;
    });

    window.__BOCOMP_POPUP_EVENT_BUS__.emit(
      window.__BOCOMP_POPUP_EVENT_BUS__.TYPES.MESSAGE,
      {
        task,
        node,
      }
    );

    return task;
  },
  info(options: MessageMethodOptions | string) {
    if (typeof options === "string") {
      const content = options;
      options = {
        content,
      };
    }

    let node;

    const task = new Promise((resolve, reject) => {
      node = <InfoMessage resolve={resolve} reject={reject} {...options} />;
    });

    window.__BOCOMP_POPUP_EVENT_BUS__.emit(
      window.__BOCOMP_POPUP_EVENT_BUS__.TYPES.MESSAGE,
      {
        task,
        node,
      }
    );

    return task;
  },
};
