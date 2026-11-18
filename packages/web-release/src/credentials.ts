/**
 * OSS 凭证：
 * - static：长期 AK/SK（本地 publish 常用），可附带 OSS_STS_TOKEN
 * - ecs：ECS 实例 RAM 角色 → 元数据服务拿 STS（服务器 pull/use 推荐）
 */

export type ResolvedCredentials = {
  accessKeyId: string;
  accessKeySecret: string;
  stsToken?: string;
};

export type CredentialSource =
  | { mode: "static"; accessKeyId: string; accessKeySecret: string; stsToken?: string }
  | { mode: "ecs"; roleName?: string };

const ECS_META = "http://10.10.10.10/latest";

type EcsMetaCred = {
  Code?: string;
  AccessKeyId: string;
  AccessKeySecret: string;
  SecurityToken: string;
  Expiration?: string;
};

async function ecsMetaHeaders(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${ECS_META}/api/token`, {
      method: "PUT",
      headers: { "X-aliyun-ecs-metadata-token-ttl-seconds": "21600" },
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const token = (await res.text()).trim();
      if (token) {
        return { "X-aliyun-ecs-metadata-token": token };
      }
    }
  } catch {
    // IMDSv1 回退
  }
  return {};
}

async function resolveEcsRoleName(
  preferred: string | undefined,
  headers: Record<string, string>
): Promise<string> {
  if (preferred?.trim()) return preferred.trim();

  const res = await fetch(`${ECS_META}/meta-data/ram/security-credentials/`, {
    headers,
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) {
    throw new Error(
      `无法列出 ECS 实例 RAM 角色 (HTTP ${res.status})。请确认实例已绑定角色，或设置 OSS_ECS_RAM_ROLE`
    );
  }
  const text = (await res.text()).trim();
  const role = text.split(/\r?\n/).map((s) => s.trim()).find(Boolean);
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
  const res = await fetch(
    `${ECS_META}/meta-data/ram/security-credentials/${encodeURIComponent(role)}`,
    { headers, signal: AbortSignal.timeout(5000) }
  );
  if (!res.ok) {
    throw new Error(
      `获取 ECS STS 失败 (HTTP ${res.status})，角色: ${role}`
    );
  }
  const data = (await res.json()) as EcsMetaCred;
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
