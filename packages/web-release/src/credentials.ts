/**
 * OSS 凭证：
 * - static：长期 AK/SK（本地 publish 常用），可附带 OSS_STS_TOKEN
 * - ecs：ECS 实例 RAM 角色 → 元数据服务拿 STS（服务器 pull/use 推荐）
 *
 * 注意：元数据必须直连 10.10.10.10，不能走 HTTP_PROXY（用 node:http，不用 fetch）。
 */

import http from "node:http";

export type ResolvedCredentials = {
  accessKeyId: string;
  accessKeySecret: string;
  stsToken?: string;
  /** ECS RAM 角色名（仅 ecs 模式） */
  roleName?: string;
  /** STS 过期时间（ISO，仅 ecs 模式） */
  expiration?: string;
};

export type CredentialSource =
  | { mode: "static"; accessKeyId: string; accessKeySecret: string; stsToken?: string }
  | { mode: "ecs"; roleName?: string };

const ECS_META_HOST = "10.10.10.10";
const META_TIMEOUT_MS = 10_000;

type EcsMetaCred = {
  Code?: string;
  AccessKeyId: string;
  AccessKeySecret: string;
  SecurityToken: string;
  Expiration?: string;
};

type MetaResponse = {
  status: number;
  body: string;
};

function metaTimeoutHint(step: string): Error {
  return new Error(
    `${step} 超时：连不上 ECS 元数据 http://${ECS_META_HOST}/\n` +
      `常见原因：http_proxy 把元数据请求代理走了。\n` +
      `请先测: curl --noproxy '*' -s -m 3 http://${ECS_META_HOST}/latest/meta-data/instance-id\n` +
      `并把 ${ECS_META_HOST} 加入 no_proxy；实例需绑定 RAM 角色。`
  );
}

/** 直连元数据，显式绕过代理 */
function metaRequest(
  path: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    timeoutMs?: number;
  }
): Promise<MetaResponse> {
  const timeoutMs = options?.timeoutMs ?? META_TIMEOUT_MS;
  const method = options?.method ?? "GET";
  const headers = options?.headers ?? {};

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        protocol: "http:",
        hostname: ECS_META_HOST,
        port: 80,
        path: `/latest${path}`,
        method,
        headers,
        timeout: timeoutMs,
        // 不设置 agent 走全局代理；确保直连
        agent: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on("end", () => {
          resolve({
            status: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(metaTimeoutHint(`请求 ${path}`));
    });
    req.on("error", (err) => {
      if ((err as { code?: string }).code === "ETIMEDOUT") {
        reject(metaTimeoutHint(`请求 ${path}`));
        return;
      }
      reject(err);
    });
    req.end();
  });
}

async function ecsMetaHeaders(): Promise<Record<string, string>> {
  try {
    const res = await metaRequest("/api/token", {
      method: "PUT",
      headers: { "X-aliyun-ecs-metadata-token-ttl-seconds": "21600" },
      timeoutMs: 5000,
    });
    if (res.status >= 200 && res.status < 300) {
      const token = res.body.trim();
      if (token) {
        return { "X-aliyun-ecs-metadata-token": token };
      }
    }
  } catch {
    // IMDSv1 回退
  }
  return {};
}

/** 探测元数据是否可达（给 ram-test 用） */
export async function probeEcsMetadata(): Promise<{
  reachable: boolean;
  imdsToken: boolean;
  roles: string[];
  detail: string;
}> {
  let imdsToken = false;
  let headers: Record<string, string> = {};
  try {
    headers = await ecsMetaHeaders();
    imdsToken = Boolean(headers["X-aliyun-ecs-metadata-token"]);
  } catch {
    // continue
  }

  try {
    const res = await metaRequest("/meta-data/ram/security-credentials/", {
      headers,
    });
    if (res.status < 200 || res.status >= 300) {
      return {
        reachable: true,
        imdsToken,
        roles: [],
        detail: `元数据可达，但列角色失败 HTTP ${res.status}（实例可能未绑 RAM 角色）`,
      };
    }
    const roles = res.body
      .trim()
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      reachable: true,
      imdsToken,
      roles,
      detail: roles.length
        ? `发现角色: ${roles.join(", ")}`
        : "元数据可达，但未返回任何 RAM 角色（请先绑定实例角色）",
    };
  } catch (err) {
    return {
      reachable: false,
      imdsToken,
      roles: [],
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function resolveEcsRoleName(
  preferred: string | undefined,
  headers: Record<string, string>
): Promise<string> {
  if (preferred?.trim()) return preferred.trim();

  const res = await metaRequest("/meta-data/ram/security-credentials/", {
    headers,
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(
      `无法列出 ECS 实例 RAM 角色 (HTTP ${res.status})。请确认实例已绑定角色，或设置 OSS_ECS_RAM_ROLE`
    );
  }
  const role = res.body
    .trim()
    .split(/\r?\n/)
    .map((s) => s.trim())
    .find(Boolean);
  if (!role) {
    throw new Error("ECS 元数据未返回 RAM 角色名，请设置 OSS_ECS_RAM_ROLE");
  }
  return role;
}

/** 从 ECS 元数据拉取 STS 临时凭证 */
export async function fetchEcsStsCredentials(
  roleName?: string
): Promise<ResolvedCredentials> {
  const headers = await ecsMetaHeaders();
  const role = await resolveEcsRoleName(roleName, headers);
  const res = await metaRequest(
    `/meta-data/ram/security-credentials/${encodeURIComponent(role)}`,
    { headers }
  );
  if (res.status < 200 || res.status >= 300) {
    throw new Error(
      `获取 ECS STS 失败 (HTTP ${res.status})，角色: ${role}`
    );
  }
  const data = JSON.parse(res.body) as EcsMetaCred;
  if (data.Code && data.Code !== "Success") {
    throw new Error(`ECS STS 返回异常 Code=${data.Code}，角色: ${role}`);
  }
  if (!data.AccessKeyId || !data.AccessKeySecret || !data.SecurityToken) {
    throw new Error(`ECS STS 响应缺少字段，角色: ${role}`);
  }
  return {
    accessKeyId: data.AccessKeyId,
    accessKeySecret: data.AccessKeySecret,
    stsToken: data.SecurityToken,
    roleName: role,
    expiration: data.Expiration,
  };
}

export async function resolveCredentials(
  source: CredentialSource
): Promise<ResolvedCredentials> {
  if (source.mode === "ecs") {
    return fetchEcsStsCredentials(source.roleName);
  }
  return {
    accessKeyId: source.accessKeyId,
    accessKeySecret: source.accessKeySecret,
    stsToken: source.stsToken,
  };
}
