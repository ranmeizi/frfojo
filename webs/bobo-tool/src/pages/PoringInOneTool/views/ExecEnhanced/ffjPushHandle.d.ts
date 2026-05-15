export {};

declare global {
  interface Window {
    /**
     * 控制单元：收到模型方向 + 前端「合并后、无随机块」棋盘后执行真实 push / 写盘等。
     * 第二个参数由 ExecEnhanced 主循环传入；可为 async。
     */
    ffj_onPushHandle?: (
      direction: number,
      predictedBoard: number[][],
    ) => void | Promise<void>;
  }
}
