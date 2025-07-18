import { MessageMethodOptions } from "./methods";

export function useDefaultOptions(
  props: MessageMethodOptions
): Required<MessageMethodOptions> {
  return {
    content: props.content || "",
    duration: props.duration || 3,
    icon: props.icon || null,
    onClick: props.onClick || (() => {}),
    onClose: props.onClose || (() => {}),
  };
}
