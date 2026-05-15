import { sleep } from "@frfojo/common/utils/delay";

export type MutableRef<T> = { current: T };

export type FilePushTransportOptions = {
  fileHandle: FileSystemFileHandle;
  lastModifiedRef: MutableRef<number>;
  readGrid: (file: File) => Promise<number[][]>;
  pollIntervalMs?: number;
  ackTimeoutMs?: number;
};

export type FilePushHandleTransport = {
  /** 串行：先发 hook（可 async），再等 grid 文件变更作为回执 */
  pushMove(
    direction: number,
    postMergeNoSpawnBoard: number[][],
  ): Promise<number[][] | null>;
};

async function invokePushHandleHook(
  direction: number,
  postMergeNoSpawnBoard: number[][],
) {
  try {
    await window.ffj_onPushHandle?.(direction, postMergeNoSpawnBoard);
  } catch {
    // 外部脚本异常不阻断轮询
  }
}

/**
 * 以 grid.csv 的 lastModified 变化模拟「pushhandle 完成回执」。
 * 自动化侧应在 `window.ffj_onPushHandle` 里触发真实输入，使 Lua 写完新 grid。
 */
export function createFilePushHandleTransport(
  opts: FilePushTransportOptions,
): FilePushHandleTransport {
  const poll = opts.pollIntervalMs ?? 50;
  const timeout = opts.ackTimeoutMs ?? 120_000;
  let chain: Promise<unknown> = Promise.resolve();

  async function waitAckAfterPush(
    direction: number,
    postMergeNoSpawnBoard: number[][],
  ): Promise<number[][] | null> {
    const prev = opts.lastModifiedRef.current;
    await invokePushHandleHook(direction, postMergeNoSpawnBoard);
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      await sleep(poll);
      const file = await opts.fileHandle.getFile();
      if (file.lastModified !== prev) {
        opts.lastModifiedRef.current = file.lastModified;
        return opts.readGrid(file);
      }
    }
    return null;
  }

  return {
    pushMove(direction: number, postMergeNoSpawnBoard: number[][]) {
      const run = () => waitAckAfterPush(direction, postMergeNoSpawnBoard);
      const p = chain.then(run, run) as Promise<number[][] | null>;
      chain = p.then(
        () => undefined,
        () => undefined,
      );
      return p;
    },
  };
}
