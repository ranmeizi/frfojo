import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { resolveCwdProject, runPnpmBuild } from "./build.js";
import { removeSourceMaps } from "./cleanMaps.js";
import {
  MAX_RELEASE_VERSIONS,
  archiveObjectKey,
  projectDirPrefix,
  stampNow,
} from "./constants.js";
import { getBossProject, getOssConfig } from "./config.js";
import { defaultArchivePath, packDist } from "./pack.js";
import { pruneOldVersions, uploadArchive } from "./oss.js";

export type PublishOptions = {
  cwd: string;
  skipBuild?: boolean;
  /** 不删 .map、不裁剪旧版本，仅用于连通性测试 */
  testUpload?: boolean;
  keepArchive?: boolean;
  projectOverride?: string;
};

export async function publishProject(options: PublishOptions): Promise<void> {
  const cwd = options.cwd;
  const local = resolveCwdProject(cwd);
  const oss = getOssConfig();
  const project = getBossProject(options.projectOverride || local.dirName);
  const testUpload = Boolean(options.testUpload);
  const skipBuild = Boolean(options.skipBuild || testUpload);

  console.log(
    `\n📦 ${testUpload ? "upload(test)" : "publish"} ${local.packageName} → OSS ${projectDirPrefix(oss.prefix, project)}/`
  );
  console.log(`   cwd: ${cwd}`);
  console.log(`   bucket: ${oss.bucket}  region: ${oss.region}`);
  console.log(`   auth: ${oss.credentials.mode}`);
  if (!testUpload) console.log(`   版本上限: ${MAX_RELEASE_VERSIONS}`);

  if (!skipBuild) {
    console.log("\n① pnpm build …");
    await runPnpmBuild(cwd);
  } else {
    console.log(
      `\n① 跳过构建${testUpload ? "（upload 测试）" : "（--skip-build）"}`
    );
    if (!existsSync(local.distDir)) {
      throw new Error(`未找到产物目录: ${local.distDir}`);
    }
  }

  if (!testUpload) {
    console.log("\n② 删除 dist 中的 .map …");
    const removed = await removeSourceMaps(local.distDir);
    console.log(`   已删除 ${removed} 个 .map 文件`);
  } else {
    console.log("\n② 测试模式：保留 .map，不裁剪历史版本");
  }

  const stamp = stampNow();
  const archivePath = defaultArchivePath(project, stamp);
  const objectKey = archiveObjectKey(oss.prefix, project, stamp);

  console.log("\n③ 打包 dist → tar.gz …");
  await packDist(local.distDir, archivePath);
  console.log(`   ${archivePath}`);

  console.log("\n④ 上传至阿里云 OSS …");
  console.log(`   key: ${objectKey}`);
  try {
    const uploaded = await uploadArchive(oss, archivePath, objectKey);
    console.log(`   ${uploaded.ossUri}`);
  } catch (err) {
    // 让上层 formatOssError 打印；这里补一行上下文
    console.error(`   上传失败 objectKey=${objectKey}`);
    throw err;
  }

  if (!testUpload) {
    console.log(`\n⑤ 裁剪旧版本（最多 ${MAX_RELEASE_VERSIONS} 个）…`);
    const pruned = await pruneOldVersions(oss, project, MAX_RELEASE_VERSIONS);
    if (pruned.length === 0) console.log("   无需删除");
    else for (const key of pruned) console.log(`   删除 ${key}`);
  }

  if (!options.keepArchive) {
    await rm(archivePath, { force: true });
  }

  console.log(`\n✅ ${testUpload ? "upload" : "publish"} 完成\n`);
  console.log(`boss use --v ${stamp}`);
  console.log(`# 或最新版: boss use\n`);
}
