import { ModalMethodOptions } from "./methods";

export function useDefaultOptions(
  props: ModalMethodOptions
): Required<ModalMethodOptions> {
  return {
    title: props.title || "",
    content: props.content || "",
    width: props.width || 416,

    okText: props.okText || "确认",
    cancelText: props.cancelText || "取消",
    onOk: props.onOk || (() => Promise.resolve()),
    onCancel: props.onCancel || (() => Promise.resolve()),
    okButtonProps: props.okButtonProps || {},
    cancelButtonProps: props.cancelButtonProps || {},

    mask: props.mask === undefined ? true : props.mask,
    maskClosable: props.maskClosable || false,
  };
}
