import { sleep } from "@frfojo/common/utils/delay";

/** 与前端解析一致：每行逗号分隔，\r\n 结尾 */
export function gridToCsvText(grid: number[][]): string {
  return grid.map((row) => row.join(",")).join("\r\n") + "\r\n";
}

function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

/** 在随机空位生成 2（90%）或 4（10%），与常见 2048 一致 */
export function addRandomSpawn2Or4(grid: number[][]): number[][] {
  const b = cloneGrid(grid);
  const empties: { y: number; x: number }[] = [];
  for (let y = 0; y < b.length; y++) {
    for (let x = 0; x < (b[y]?.length ?? 0); x++) {
      if (b[y][x] === 0) {
        empties.push({ y, x });
      }
    }
  }
  if (empties.length === 0) {
    return b;
  }
  const pick = empties[Math.floor(Math.random() * empties.length)];
  b[pick.y][pick.x] = Math.random() < 0.9 ? 2 : 4;
  return b;
}

export async function writeGridCsvToFileHandle(
  fileHandle: FileSystemFileHandle,
  grid: number[][],
): Promise<void> {
  const text = gridToCsvText(grid);
  const writable = await fileHandle.createWritable();
  await writable.write(text);
  await writable.close();
}

export type MockControlUnitOptions = {
  /** 模拟处理耗时上界（ms），默认 500，实际为 [0, maxDelayMs) 均匀随机 */
  maxDelayMs?: number;
};

/**
 * 测试挡板：在随机延迟（默认 &lt;500ms）内把「合并后、无随机块」的棋盘写入 grid.csv，
 * 再于随机空位写入 2 或 4，触发 lastModified 供前端当作 pushhandle 回执。
 */
export async function runMockControlUnitPush(
  _direction: number,
  predictedBoard: number[][],
  fileHandle: FileSystemFileHandle,
  options?: MockControlUnitOptions,
): Promise<void> {
  const maxDelay = options?.maxDelayMs ?? 500;
  const delayMs = Math.random() * maxDelay;
  await sleep(delayMs);
  const withSpawn = addRandomSpawn2Or4(predictedBoard);
  await writeGridCsvToFileHandle(fileHandle, withSpawn);
}
