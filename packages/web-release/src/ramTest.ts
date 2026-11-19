import { basename } from "node:path";
import { getBossProject, getOssConfig } from "./config.js";
import { projectDirPrefix } from "./constants.js";
import {
  fetchEcsStsCredentials,
  probeEcsMetadata,
} from "./credentials.js";
import { listVersions } from "./oss.js";

/**
 * 强制用 ECS 实例 RAM 角色（STS）测连通性：
 * 0) 探测 10.10.10.10 元数据
 * 1) 取临时凭证
 * 2) 用 STS 列 OSS 工程目录
 */
export async function runRamTest(options?: {
  cwd?: string;
  projectOverride?: string;
}): Promise<void> {
  const cwd = options?.cwd ?? process.cwd();
  const project = getBossProject(
    options?.projectOverride || basename(cwd)
  );
  const oss = getOssConfig({ forceAuth: "ecs" });

  console.log("\n🔐 ram-test（强制 OSS_AUTH=ecs / 实例 RAM 角色）");
  console.log(`   project: ${project}`);
  console.log(`   bucket:  ${oss.bucket}`);
  console.log(`   region:  ${oss.region}`);
  console.log(
    `   role:    ${oss.credentials.mode === "ecs" ? oss.credentials.roleName || "(自动探测)" : "-"}`
  );
  console.log(`   prefix:  ${projectDirPrefix(oss.prefix, project)}/`);

  console.log("\n① 探测 ECS 元数据 http://10.10.10.10/ …");
  const probe = await probeEcsMetadata();
  console.log(`   reachable: ${probe.reachable}`);
  console.log(`   IMDSv2:    ${probe.imdsToken ? "token ok" : "fallback/无"}`);
  console.log(`   ${probe.detail}`);
  if (!probe.reachable) {
    throw new Error(probe.detail);
  }
  if (probe.roles.length === 0 && oss.credentials.mode === "ecs" && !oss.credentials.roleName) {
    throw new Error(
      "未发现实例 RAM 角色。请在 ECS 控制台绑定角色，或在 .env 设置 OSS_ECS_RAM_ROLE"
    );
  }

  console.log("\n② 获取 STS …");
  const roleHint =
    oss.credentials.mode === "ecs" ? oss.credentials.roleName : undefined;
  const sts = await fetchEcsStsCredentials(roleHint);
  console.log(`   role:       ${sts.roleName}`);
  console.log(`   accessKey:  ${sts.accessKeyId.slice(0, 8)}…`);
  console.log(`   expiration: ${sts.expiration || "-"}`);
  console.log(`   stsToken:   ${sts.stsToken ? "有" : "无"}`);

  console.log("\n③ 用 STS 列出 OSS 发布包 …");
  const versions = await listVersions(oss, project);
  if (versions.length === 0) {
    console.log("   (空) 目录可读，但还没有发布包");
  } else {
    console.log(`   可读，共 ${versions.length} 个版本；最新: ${versions[0].stamp}`);
    for (const v of versions.slice(0, 3)) {
      console.log(`   - ${v.fileName}`);
    }
    if (versions.length > 3) console.log(`   … 另有 ${versions.length - 3} 个`);
  }

  console.log("\n✅ ram-test 通过（STS + OSS 读权限正常）\n");
}
