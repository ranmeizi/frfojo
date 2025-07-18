import { ButtonProps } from "@mui/material";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ConfirmModal } from "./confirm";
import { useForceUpdate } from "@frfojo/common/hooks";
import { bus } from "../common";

export type ModalMethodOptions = {
  /** 标题 */
  title?: ReactNode;
  /** 内容 */
  content?: ReactNode;
  /** 是否展示遮罩  默认值 true */
  mask?: boolean;
  /** 点击蒙层是否允许关闭  默认值 false */
  maskClosable?: boolean;
  /** 宽度  默认值 416 */
  width?: number;
  /**
   * 点击确定回调，参数为关闭函数，若返回 promise 时 resolve 为正常关闭, reject 为不关闭
   */
  onOk?: () => Promise<void>;
  /**
   * 点击取消回调，参数为关闭函数，若返回 promise 时 resolve 为正常关闭, reject 为不关闭
   */
  onCancel?: () => Promise<void>;
  /** 确认按钮文字 */
  okText?: string;
  /** ok 按钮 props */
  okButtonProps?: ButtonProps;
  /** 设置 Modal.confirm 取消按钮文字 */
  cancelText?: string;
  /** cancel 按钮 props */
  cancelButtonProps?: ButtonProps;
};

export const methods = {
  confirm(options: ModalMethodOptions) {
    let node;
    let close;
    const task = new Promise((resolve, reject) => {
      close = reject;
      node = (
        <ConfirmModal
          key={options.content}
          resolve={resolve}
          reject={reject}
          {...options}
        />
      );
    });

    window.__BOCOMP_POPUP_EVENT_BUS__.emit(
      window.__BOCOMP_POPUP_EVENT_BUS__.TYPES.MESSAGE,
      {
        task,
        node,
      }
    );

    return { close };
  },
};
