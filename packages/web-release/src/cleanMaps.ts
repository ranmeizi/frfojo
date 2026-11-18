import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";

/** 递归删除目录下所有 .map 文件，返回删除数量 */
export async function removeSourceMaps(dir: string): Promise<number> {
  let removed = 0;

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".map")) {
        await unlink(full);
        removed += 1;
      }
    }
  }

  await walk(dir);
  return removed;
}
