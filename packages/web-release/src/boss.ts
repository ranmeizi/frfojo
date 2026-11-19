#!/usr/bin/env node
/**
 * boss CLI
 *
 *   pull     从 OSS 拉包到本地 .boss/（gitignore）
 *   -v       查看 .boss/ 里已拉取的包
 *   use      用本地包文件名解压，删除并覆盖 ./dist
 */
import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import { rm } from "node:fs/promises";
import {
  getBossProject,
  getOssConfig,
  getRepoRoot,
  loadEnv,
} from "./config.js";
import { MAX_RELEASE_VERSIONS, STAMP_RE } from "./constants.js";
import {
  downloadObject,
  listVersions,
  resolveVersion,
} from "./oss.js";
import { formatOssError } from "./errors.js";
import { extractArchive } from "./pack.js";
import { publishProject } from "./publish.js";
import { runRamTest } from "./ramTest.js";
import {
  ensureCacheDir,
  getCacheDir,
  getDistDir,
  listLocalPackages,
  resolveLocalPackage,
} from "./localCache.js";

function printUsage(): void {
  console.log(`用法（在 webs/<工程> 目录下执行）:
  pnpm boss -- publish [--skip-build]
  pnpm boss -- upload
  pnpm boss -- ram-test
  pnpm boss -- pull [--v <版本戳>]
  pnpm boss -- -v | pnpm boss -- versions
  pnpm boss -- use [<文件名|版本戳>] [--dir <dist目录>]

流程:
  pull       从 OSS 下载发布包 → 放到本地 .boss/（请 gitignore）
  -v         查看 .boss/ 里已有的本地包
  use        用本地包解压：删除 dist 后覆盖写入（默认 ./dist）
             例: boss use
                 boss use bobo-tool-20261118-185202.tar.gz
                 boss use --v 20261118-185202

  publish    build → 删 map → 上传 OSS（最多保留 ${MAX_RELEASE_VERSIONS} 版）
  upload     测试上传（长期 AK，不 build）
  ram-test   测试 ECS 实例 RAM 角色 STS 连通性（强制 ecs，读 OSS）

环境变量:
  BOSS_PROJECT / OSS_REGION / OSS_BUCKET
  本地: OSS_ACCESS_KEY_ID + OSS_ACCESS_KEY_SECRET
  ECS:  OSS_AUTH=ecs + OSS_ECS_RAM_ROLE
  可选: BOSS_CACHE_DIR=.boss  BOSS_DIR=./dist
`);
}

type Command =
  | "publish"
  | "upload"
  | "ram-test"
  | "versions"
  | "pull"
  | "use"
  | "help";

type BossArgs = {
  command: Command;
  version?: string;
  /** use 的位置参数：文件名或版本戳 */
  target?: string;
  dir?: string;
  project?: string;
  skipBuild?: boolean;
  keepArchive?: boolean;
  exitCode: number;
};

function parseArgs(argv: string[]): BossArgs {
  const args = argv.slice(2);
  let command: Command | "" = "";
  let version: string | undefined;
  let target: string | undefined;
  let dir: string | undefined;
  let project: string | undefined;
  let skipBuild = false;
  let keepArchive = false;
  let askedHelp = false;
  let askedVersions = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-h" || a === "--help") {
      askedHelp = true;
      continue;
    }
    if (a === "--skip-build") {
      skipBuild = true;
      continue;
    }
    if (a === "--keep-archive") {
      keepArchive = true;
      continue;
    }
    if (a === "-v" || a === "--v" || a === "--versions") {
      const next = args[i + 1];
      if (
        next &&
        !next.startsWith("-") &&
        (STAMP_RE.test(next) || next.endsWith(".tar.gz"))
      ) {
        version = next;
        i += 1;
      } else {
        askedVersions = true;
      }
      continue;
    }
    if (a === "--version") {
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        version = next;
        i += 1;
      } else {
        askedVersions = true;
      }
      continue;
    }
    if (a === "--dir") {
      dir = args[++i];
      if (!dir) throw new Error("--dir 需要目录参数");
      continue;
    }
    if (a === "--project") {
      project = args[++i];
      if (!project) throw new Error("--project 需要工程名");
      continue;
    }
    if (a === "--") continue;
    if (a.startsWith("-")) throw new Error(`未知参数: ${a}`);

    if (!command && (a === "versions" || a === "list" || a === "ls")) {
      command = "versions";
      continue;
    }
    if (
      !command &&
      (a === "publish" ||
        a === "upload" ||
        a === "ram-test" ||
        a === "ram" ||
        a === "pull" ||
        a === "use" ||
        a === "help")
    ) {
      command = a === "ram" ? "ram-test" : a;
      continue;
    }
    // use 的文件名 / 版本戳
    if (command === "use" && !target) {
      target = a;
      continue;
    }
    throw new Error(`多余或未知参数: ${a}`);
  }

  if (askedHelp || command === "help") {
    return { command: "help", exitCode: 0 };
  }

  if (askedVersions && !command) {
    return {
      command: "versions",
      version,
      target,
      dir,
      project,
      skipBuild,
      keepArchive,
      exitCode: 0,
    };
  }

  if (!command) {
    return { command: "help", exitCode: 1 };
  }

  return {
    command,
    version,
    target,
    dir,
    project,
    skipBuild,
    keepArchive,
    exitCode: 0,
  };
}

function formatSize(n?: number): string {
  if (n == null) return "-";
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / (1024 * 1024)).toFixed(2)}MB`;
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv);
  if (parsed.command === "help") {
    printUsage();
    process.exit(parsed.exitCode);
  }

  const cwd = process.cwd();
  const repoRoot = getRepoRoot();
  const hintProject = parsed.project;
  const projectDir = hintProject
    ? resolve(repoRoot, "webs", hintProject.replace(/^webs\//, ""))
    : undefined;

  loadEnv({ projectDir, cwd });

  if (parsed.command === "publish" || parsed.command === "upload") {
    await publishProject({
      cwd,
      skipBuild: parsed.skipBuild,
      testUpload: parsed.command === "upload",
      keepArchive: parsed.keepArchive,
      projectOverride: parsed.project,
    });
    return;
  }

  if (parsed.command === "ram-test") {
    await runRamTest({
      cwd,
      projectOverride: parsed.project,
    });
    return;
  }

  const projectName = getBossProject(parsed.project || basename(cwd));
  const cacheDir = getCacheDir(cwd);
  const distDir = getDistDir(cwd, parsed.dir);

  // -v / versions：只看本地 .boss/
  if (parsed.command === "versions") {
    const locals = await listLocalPackages(cacheDir, projectName);
    if (locals.length === 0) {
      console.log(`(空) 本地缓存 ${cacheDir}`);
      console.log(`先执行: pnpm boss -- pull`);
      return;
    }
    console.log(`本地 ${cacheDir} · ${locals.length} 个包\n`);
    console.log("版本戳              大小       文件名");
    console.log("─────────────────  ─────────  ────");
    for (const p of locals) {
      console.log(
        `${p.stamp}  ${formatSize(p.size).padStart(9)}  ${p.fileName}`
      );
    }
    console.log(`\n使用: pnpm boss -- use ${locals[0].fileName}`);
    return;
  }

  // pull：从 OSS 拉到 .boss/；本地已有同名文件则跳过下载
  if (parsed.command === "pull") {
    const oss = getOssConfig();
    await ensureCacheDir(cacheDir);
    const remote = await listVersions(oss, projectName);
    const selected = resolveVersion(remote, parsed.version);
    const archivePath = resolve(cacheDir, selected.fileName);

    console.log(`↓ pull ${projectName}@${selected.stamp}`);
    console.log(`  oss: ${selected.objectKey}`);
    console.log(`  → ${archivePath}`);

    if (existsSync(archivePath)) {
      console.log("  本地已存在同名包，跳过下载");
    } else {
      await downloadObject(oss, selected.objectKey, archivePath);
      console.log("  已下载");
    }

    console.log("\n✅ pull 完成");
    console.log(`查看: pnpm boss -- -v`);
    console.log(`启用: pnpm boss -- use ${selected.fileName}`);
    return;
  }

  // use：本地包 → 删 dist → 解压覆盖（不再访问 OSS）
  if (parsed.command === "use") {
    const requested = parsed.target || parsed.version;
    const local = await resolveLocalPackage(cacheDir, projectName, requested);

    console.log(`↓ use ${local.fileName}`);
    console.log(`  源: ${local.path}`);
    console.log(`  目标: ${distDir}（先删除再解压）`);

    await rm(distDir, { recursive: true, force: true });
    await extractArchive(local.path, distDir);
    console.log(`  已覆盖 ${distDir}`);
    console.log("\n✅ use 完成");
    return;
  }
}

main().catch((err) => {
  console.error("\n❌ OSS/执行失败:\n" + formatOssError(err));
  process.exit(1);
});
