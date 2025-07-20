/* eslint-disable @typescript-eslint/triple-slash-reference */

// 调色盘
/// <reference path="../../../packages/common/mui.d.ts" />

type AsyncProcessFn = (next?: () => void) => Promise<void>;

interface Window {
  ffj_loaded(): void;

  __BOCOMP_POPUP_EVENT_BUS__: any;
}
