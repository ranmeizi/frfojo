import { existsSync } from "node:fs";
import { mkdir, readdir, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { parseArchiveObject, STAMP_RE } from "./constants.js";

export type LocalPackage = {
  stamp: string;
  fileName: string;
  path: string;
  size?: number;
  mtime?: Date;
};

/** 本地缓存目录，默认工程下 .boss/（应 gitignore） */
export function getCacheDir(cwd: string): string {
  const raw = process.env.BOSS_CACHE_DIR?.trim();
  return resolve(cwd, raw || ".boss");
}

export function getDistDir(cwd: string, override?: string): string {
  return resolve(override || process.env.BOSS_DIR?.trim() || resolve(cwd, "dist"));
}

export async function ensureCacheDir(cacheDir: string): Promise<void> {
  await mkdir(cacheDir, { recursive: true });
}

export async function listLocalPackages(
  cacheDir: string,
  project: string
): Promise<LocalPackage[]> {
  if (!existsSync(cacheDir)) return [];

  const names = await readdir(cacheDir);
  const out: LocalPackage[] = [];

  for (const name of names) {
    const parsed = parseArchiveObject(project, name);
    if (!parsed) continue;
    const path = resolve(cacheDir, name);
    const st = await stat(path);
    if (!st.isFile()) continue;
    out.push({
      stamp: parsed.stamp,
      fileName: parsed.fileName,
      path,
      size: st.size,
      mtime: st.mtime,
    });
  }

  out.sort((a, b) => (a.stamp < b.stamp ? 1 : a.stamp > b.stamp ? -1 : 0));
  return out;
}

/** 按 stamp / 文件名 / 路径解析本地包；不传则取最新 */
export async function resolveLocalPackage(
  cacheDir: string,
  project: string,
  requested?: string
): Promise<LocalPackage> {
  const locals = await listLocalPackages(cacheDir, project);
  if (locals.length === 0) {
    throw new Error(
      `本地缓存为空: ${cacheDir}\n请先: boss pull 或 boss pull --v <版本戳>`
    );
  }

  if (!requested) return locals[0];

  const base = basename(requested);
  const hit = locals.find(
    (p) =>
      p.stamp === requested ||
      p.fileName === requested ||
      p.fileName === base ||
      p.fileName === `${requested}.tar.gz` ||
      (STAMP_RE.test(requested) && p.stamp === requested)
  );

  if (!hit) {
    throw new Error(
      `本地找不到 "${requested}"。可用:\n` +
        locals.map((p) => `  ${p.fileName}`).join("\n")
    );
  }
  return hit;
}
