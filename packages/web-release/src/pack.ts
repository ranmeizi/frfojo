import { createWriteStream, existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { finished } from "node:stream/promises";
import { create as createTar, extract as extractTar } from "tar";
import { archiveFileName } from "./constants.js";
import { getRepoRoot } from "./config.js";

export async function packDist(
  distDir: string,
  archivePath: string
): Promise<void> {
  await mkdir(dirname(archivePath), { recursive: true });

  const stream = createTar(
    {
      gzip: true,
      cwd: distDir,
      portable: true,
    },
    ["."]
  );

  const out = createWriteStream(archivePath);
  stream.pipe(out);
  await finished(out);
}

export async function extractArchive(
  archivePath: string,
  destDir: string
): Promise<void> {
  await mkdir(destDir, { recursive: true });
  await extractTar({
    file: archivePath,
    cwd: destDir,
  });
}

/** 本地临时包路径：monorepo 内用 packages/.../.release，否则用系统临时目录 */
export function defaultArchivePath(project: string, stamp: string): string {
  const fileName = archiveFileName(project, stamp);
  const repoRoot = getRepoRoot();
  const inMonorepo = existsSync(resolve(repoRoot, "pnpm-workspace.yaml"));
  const base = inMonorepo
    ? resolve(repoRoot, "packages/web-release/.release")
    : resolve(tmpdir(), "boss-release");
  return resolve(base, fileName);
}
