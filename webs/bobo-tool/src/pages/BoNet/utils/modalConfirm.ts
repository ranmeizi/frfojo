import { Modal } from "@frfojo/components";

export type ModalConfirmOptions = {
  title: string;
  content: string;
  okText?: string;
  cancelText?: string;
  width?: number;
};

/**
 * 将 Modal.confirm 封装为 Promise，供业务层替代 window.confirm。
 * content 仅传字符串：子应用经 popupBridge 挂载到主应用时，不可传入 MUI/React 节点（会触发 Invalid hook call）。
 */
export function modalConfirm(opts: ModalConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    Modal.confirm({
      title: opts.title,
      content: opts.content,
      okText: opts.okText ?? "确认",
      cancelText: opts.cancelText ?? "取消",
      width: opts.width,
      maskClosable: false,
      onOk: async () => {
        resolve(true);
      },
      onCancel: async () => {
        resolve(false);
      },
    });
  });
}
