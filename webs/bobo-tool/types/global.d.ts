/* eslint-disable @typescript-eslint/triple-slash-reference */

// 调色盘
/// <reference path="../../../packages/common/mui.d.ts" />

type AsyncProcessFn = (next?: () => void) => Promise<void>;

declare module "redux-persist-indexeddb-storage" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bb: any;
  export default bb;
}
