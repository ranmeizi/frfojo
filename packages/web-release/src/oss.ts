import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { finished } from "node:stream/promises";
import type { OssConfig } from "./config.js";
import {
  MAX_RELEASE_VERSIONS,
  parseArchiveObject,
  projectDirPrefix,
} from "./constants.js";
import {
  fetchEcsStsCredentials,
  resolveCredentials,
} from "./credentials.js";

export type ReleaseVersion = {
  stamp: string;
  fileName: string;
  objectKey: string;
  lastModified?: Date;
  size?: number;
};

/** 大包上传默认 10 分钟超时；可用 OSS_TIMEOUT_MS 覆盖 */
function clientTimeoutMs(): number {
  const raw = process.env.OSS_TIMEOUT_MS?.trim();
  const n = raw ? Number(raw) : 10 * 60 * 1000;
  return Number.isFinite(n) && n > 0 ? n : 10 * 60 * 1000;
}

async function createClient(config: OssConfig) {
  const { default: OSS } = await import("ali-oss");
  const creds = await resolveCredentials(config.credentials);
  const timeout = clientTimeoutMs();

  const base = {
    region: config.region,
    accessKeyId: creds.accessKeyId,
    accessKeySecret: creds.accessKeySecret,
    bucket: config.bucket,
    timeout,
    ...(config.endpoint ? { endpoint: config.endpoint } : {}),
    ...(creds.stsToken ? { stsToken: creds.stsToken } : {}),
  };

  // ECS / 显式 STS：挂上自动刷新，避免长时间任务 token 过期
  if (config.credentials.mode === "ecs") {
    const roleName = config.credentials.roleName;
    return new OSS({
      ...base,
      refreshSTSToken: async () => {
        const next = await fetchEcsStsCredentials(roleName);
        return {
          accessKeyId: next.accessKeyId,
          accessKeySecret: next.accessKeySecret,
          stsToken: next.stsToken!,
        };
      },
      refreshSTSTokenInterval: config.refreshStsInterval,
    });
  }

  if (creds.stsToken) {
    return new OSS({
      ...base,
      stsToken: creds.stsToken,
    });
  }

  return new OSS(base);
}

export function buildDownloadUrl(
  config: OssConfig,
  objectKey: string
): string {
  if (config.publicBaseUrl) {
    return `${config.publicBaseUrl}/${objectKey}`;
  }
  const host =
    config.endpoint?.replace(/^https?:\/\//, "") ||
    `${config.bucket}.${config.region}.aliyuncs.com`;
  return `https://${host}/${objectKey}`;
}

/** 列出工程目录下的发布包，按版本戳新→旧排序 */
export async function listVersions(
  config: OssConfig,
  project: string
): Promise<ReleaseVersion[]> {
  const client = await createClient(config);
  const prefix = `${projectDirPrefix(config.prefix, project)}/`;
  const versions: ReleaseVersion[] = [];
  let marker: string | undefined;

  do {
    const res = (await client.list(
      {
        prefix,
        marker,
        "max-keys": 100,
      },
      {}
    )) as {
      objects?: Array<{
        name: string;
        lastModified?: string;
        size?: number;
      }>;
      nextMarker?: string;
      isTruncated?: boolean;
    };

    for (const obj of res.objects ?? []) {
      const parsed = parseArchiveObject(project, obj.name);
      if (!parsed) continue;
      versions.push({
        ...parsed,
        lastModified: obj.lastModified
          ? new Date(obj.lastModified)
          : undefined,
        size: obj.size,
      });
    }

    marker = res.isTruncated ? res.nextMarker : undefined;
  } while (marker);

  versions.sort((a, b) => (a.stamp < b.stamp ? 1 : a.stamp > b.stamp ? -1 : 0));
  return versions;
}

export async function uploadArchive(
  config: OssConfig,
  archivePath: string,
  objectKey: string
): Promise<{ objectKey: string; ossUri: string; downloadUrl: string }> {
  const client = await createClient(config);
  // 分片上传：大 tar.gz 不易超时
  const result = await client.multipartUpload(objectKey, archivePath, {
    timeout: clientTimeoutMs(),
    partSize: 2 * 1024 * 1024,
    parallel: 3,
    headers: {
      "Content-Type": "application/gzip",
    },
  });

  const name =
    (result as { name?: string }).name ||
    (result as { res?: { requestUrls?: string[] } }).res?.requestUrls?.[0] ||
    objectKey;

  if (!name) {
    throw new Error("OSS 上传失败：未返回 object name");
  }

  return {
    objectKey,
    ossUri: `oss://${config.bucket}/${objectKey}`,
    downloadUrl: buildDownloadUrl(config, objectKey),
  };
}

/**
 * 保留最新 maxKeep 个版本，删除更旧的。
 * @returns 被删除的 objectKey 列表
 */
export async function pruneOldVersions(
  config: OssConfig,
  project: string,
  maxKeep: number = MAX_RELEASE_VERSIONS
): Promise<string[]> {
  const versions = await listVersions(config, project);
  if (versions.length <= maxKeep) return [];

  const toDelete = versions.slice(maxKeep);
  const client = await createClient(config);
  const deleted: string[] = [];

  for (const v of toDelete) {
    await client.delete(v.objectKey);
    deleted.push(v.objectKey);
  }

  return deleted;
}

export async function downloadObject(
  config: OssConfig,
  objectKey: string,
  destPath: string
): Promise<void> {
  const client = await createClient(config);
  await mkdir(dirname(destPath), { recursive: true });
  const result = await client.getStream(objectKey);
  const out = createWriteStream(destPath);
  result.stream.pipe(out);
  await finished(out);
}

export function resolveVersion(
  versions: ReleaseVersion[],
  requested?: string
): ReleaseVersion {
  if (versions.length === 0) {
    throw new Error("OSS 上没有任何发布版本");
  }
  if (!requested) return versions[0];

  const hit = versions.find(
    (v) =>
      v.stamp === requested ||
      v.fileName === requested ||
      v.fileName === `${requested}.tar.gz`
  );
  if (!hit) {
    throw new Error(
      `找不到版本 "${requested}"。可用: ${versions.map((v) => v.stamp).join(", ")}`
    );
  }
  return hit;
}
