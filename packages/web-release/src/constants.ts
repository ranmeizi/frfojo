/** 每个工程在 OSS 上最多保留的发布包数量 */
export const MAX_RELEASE_VERSIONS = 10;

/** 版本时间戳：YYYYMMDD-HHmmss */
export const STAMP_RE = /^\d{8}-\d{6}$/;

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** OSS 工程目录：bobo-tool/ 或 web-releases/bobo-tool/ */
export function projectDirPrefix(ossPrefix: string, project: string): string {
  const p = ossPrefix.replace(/^\/+|\/+$/g, "");
  return p ? `${p}/${project}` : project;
}

export function archiveFileName(project: string, stamp: string): string {
  return `${project}-${stamp}.tar.gz`;
}

export function archiveObjectKey(
  ossPrefix: string,
  project: string,
  stamp: string
): string {
  return `${projectDirPrefix(ossPrefix, project)}/${archiveFileName(project, stamp)}`;
}

/** 从对象名解析版本戳；不匹配则返回 null */
export function parseArchiveObject(
  project: string,
  objectKey: string
): { stamp: string; fileName: string; objectKey: string } | null {
  const fileName = objectKey.split("/").pop() || objectKey;
  const re = new RegExp(
    `^${escapeRegExp(project)}-(\\d{8}-\\d{6})\\.tar\\.gz$`
  );
  const m = fileName.match(re);
  if (!m) return null;
  return { stamp: m[1], fileName, objectKey };
}

export function stampNow(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}
