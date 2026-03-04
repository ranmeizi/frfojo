import type { PopupBridge } from "@frfojo/components/popup/bridge";
import { rawMessageMethods } from "@frfojo/components/popup/message";
import { rawModalMethods } from "@frfojo/components/popup/Modal";

export function createPopupBridge(): PopupBridge {
  return {
    message: {
      success: (options) => rawMessageMethods.success(options as any),
      warning: (options) => rawMessageMethods.warning(options as any),
      error: (options) => rawMessageMethods.error(options as any),
      info: (options) => rawMessageMethods.info(options as any),
    },
    modal: {
      confirm: (options) => rawModalMethods.confirm(options as any),
    },
  };
}

