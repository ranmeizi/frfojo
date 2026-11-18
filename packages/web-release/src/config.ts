import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import type { CredentialSource } from "./credentials.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 包所在仓库根（开发态）；npm 全局安装时不一定是 monorepo。
 * dist/ 在 packages/web-release/dist → 上两级为仓库根。
 */
export function getRepoRoot(): string {
  return resolve(__dirname, "../../..");
}

export function isMonorepoRoot(root = getRepoRoot()): boolean {
  return existsSync(resolve(root, "pnpm-workspace.yaml"));
}

/**
 * 加载 .env。优先级（后者覆盖前者）：
 * monorepo 根 / 包内 .env → 指定工程 .env → cwd .env
 */
export function loadEnv(options?: {
  projectDir?: string;
  cwd?: string;
}): void {
  const cwd = options?.cwd ?? process.cwd();
  const candidates: string[] = [];

  if (isMonorepoRoot()) {
    const root = getRepoRoot();
    candidates.push(resolve(root, ".env"));
    candidates.push(resolve(root, "packages/web-release/.env"));
  }

  if (options?.projectDir) {
    candidates.push(resolve(options.projectDir, ".env"));
  }
  candidates.push(resolve(cwd, ".env"));

  for (const file of candidates) {
    if (existsSync(file)) {
      loadDotenv({ path: file, override: true });
    }
  }
}

export type OssConfig = {
  region: string;
  bucket: string;
  endpoint?: string;
  prefix: string;
  publicBaseUrl?: string;
  /** STS 自动刷新间隔（ms），默认 5 分钟 */
  refreshStsInterval: number;
  credentials: CredentialSource;
};

function resolveAuthMode(): "static" | "ecs" {
  const explicit = process.env.OSS_AUTH?.trim().toLowerCase();
  if (explicit === "ecs" || explicit === "sts" || explicit === "ram") {
    return "ecs";
  }
  if (explicit === "static" || explicit === "ak") {
    return "static";
  }
  // 未显式指定：有 ECS 角色名 → ecs；否则 static
  if (process.env.OSS_ECS_RAM_ROLE?.trim()) return "ecs";
  return "static";
}

export function getOssConfig(): OssConfig {
  const region = process.env.OSS_REGION?.trim();
  const bucket = process.env.OSS_BUCKET?.trim();
  const mode = resolveAuthMode();

  const missingBase = [
    !region && "OSS_REGION",
    !bucket && "OSS_BUCKET",
  ].filter(Boolean);

  if (missingBase.length > 0) {
    throw new Error(
      `缺少 OSS 环境变量: ${missingBase.join(", ")}。请写在工程目录 .env`
    );
  }

  let credentials: CredentialSource;
  if (mode === "ecs") {
    credentials = {
      mode: "ecs",
      roleName: process.env.OSS_ECS_RAM_ROLE?.trim() || undefined,
    };
  } else {
    const accessKeyId = process.env.OSS_ACCESS_KEY_ID?.trim();
    const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET?.trim();
    const missingAk = [
      !accessKeyId && "OSS_ACCESS_KEY_ID",
      !accessKeySecret && "OSS_ACCESS_KEY_SECRET",
    ].filter(Boolean);
    if (missingAk.length > 0) {
      throw new Error(
        `缺少 OSS 环境变量: ${missingAk.join(", ")}。` +
          `本地 publish 用 AK；ECS 上 pull/use 请设 OSS_AUTH=ecs（或 OSS_ECS_RAM_ROLE）走 STS`
      );
    }
    credentials = {
      mode: "static",
      accessKeyId: accessKeyId!,
      accessKeySecret: accessKeySecret!,
      stsToken:
        process.env.OSS_STS_TOKEN?.trim() ||
        process.env.OSS_SECURITY_TOKEN?.trim() ||
        undefined,
    };
  }

  const refreshRaw = process.env.OSS_REFRESH_STS_INTERVAL?.trim();
  const refreshStsInterval = refreshRaw
    ? Number(refreshRaw)
    : 5 * 60 * 1000;

  return {
    region: region!,
    bucket: bucket!,
    endpoint: process.env.OSS_ENDPOINT?.trim() || undefined,
    prefix: (process.env.OSS_PREFIX?.trim() || "").replace(/^\/+|\/+$/g, ""),
    publicBaseUrl: process.env.OSS_PUBLIC_BASE_URL?.trim().replace(/\/+$/, ""),
    refreshStsInterval:
      Number.isFinite(refreshStsInterval) && refreshStsInterval > 0
        ? refreshStsInterval
        : 5 * 60 * 1000,
    credentials,
  };
}

/** 工程名：BOSS_PROJECT > 参数 fallback */
export function getBossProject(fallback?: string): string {
  const name =
    process.env.BOSS_PROJECT?.trim() ||
    process.env.WEB_RELEASE_PROJECT?.trim() ||
    fallback?.trim() ||
    "";
  if (!name) {
    throw new Error(
      "缺少项目名：请在 .env 设置 BOSS_PROJECT，或通过 --project 传入"
    );
  }
  return name.replace(/^webs\//, "").replace(/\/$/, "");
}
