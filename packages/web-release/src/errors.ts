/** 尽量展开 ali-oss / 网络错误，方便排查 */
export function formatOssError(err: unknown): string {
  if (err == null) return String(err);

  if (typeof err === "string") return err;

  const e = err as Record<string, unknown> & {
    message?: string;
    name?: string;
    code?: string;
    status?: number;
    statusCode?: number;
    requestId?: string;
    hostId?: string;
    region?: string;
    params?: unknown;
    stack?: string;
  };

  const lines: string[] = [];
  lines.push(e.message || String(err));

  const extras: Array<[string, unknown]> = [
    ["name", e.name],
    ["code", e.code],
    ["status", e.status ?? e.statusCode],
    ["requestId", e.requestId],
    ["hostId", e.hostId],
    ["region", e.region],
  ];

  for (const [k, v] of extras) {
    if (v != null && v !== "") lines.push(`  ${k}: ${v}`);
  }

  // ali-oss 有时把细节挂在 err.data / err.raw
  for (const key of ["data", "raw", "params", "info"] as const) {
    const v = e[key];
    if (v != null && v !== "") {
      try {
        lines.push(
          `  ${key}: ${typeof v === "string" ? v : JSON.stringify(v, null, 2)}`
        );
      } catch {
        lines.push(`  ${key}: ${String(v)}`);
      }
    }
  }

  if (e.stack) {
    lines.push("");
    lines.push(String(e.stack));
  }

  return lines.join("\n");
}
