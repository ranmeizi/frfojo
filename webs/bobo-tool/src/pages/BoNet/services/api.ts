import { request } from "@frfojo/common/request";
import { DEFAULT_GID_BOUNDARY, normalizeGid } from "../constants";
import type {
  BoNetApplyListResult,
  ManualGidLink,
  ManualRuleSuspect,
  MomoPlayerGid,
  PlayerGraphData,
} from "../types";

type ApiRes<T> = { code: string; msg: string; data: T };

async function unwrap<T>(res: ApiRes<T>): Promise<T> {
  if (res.code !== "000000") {
    throw new Error(res.msg || "请求失败");
  }
  return res.data;
}

function normalizePlayerRecord(row: MomoPlayerGid): MomoPlayerGid {
  return { ...row, gid: normalizeGid(row.gid) };
}

function normalizeLink(link: ManualGidLink): ManualGidLink {
  return {
    ...link,
    gidA: normalizeGid(link.gidA),
    gidB: normalizeGid(link.gidB),
  };
}

function normalizePlayerGraph(data: PlayerGraphData): PlayerGraphData {
  const namesByGid: Record<string, MomoPlayerGid[]> = {};
  for (const [gid, rows] of Object.entries(data.namesByGid ?? {})) {
    namesByGid[normalizeGid(gid)] = rows.map(normalizePlayerRecord);
  }
  const ruleSuspects = (data.ruleSuspects ?? []).map((item) => ({
    gid: normalizeGid(item.gid),
    rules: item.rules.map((hit) => ({
      ...hit,
      sourceGid: normalizeGid(hit.sourceGid),
      suspectGid: normalizeGid(hit.suspectGid),
    })),
  }));
  return {
    ...data,
    centerGid: normalizeGid(data.centerGid),
    exactCluster: data.exactCluster.map(normalizePlayerRecord),
    confirmedLinks: data.confirmedLinks.map(normalizeLink),
    suspectLinks: data.suspectLinks.map(normalizeLink),
    ruleSuspects,
    nearbyGids: (data.nearbyGids ?? ruleSuspects.map((r) => r.gid)).map(
      normalizeGid,
    ),
    namesByGid,
  };
}

/** 根据角色名关键字搜索 GID 下拉列表 */
export async function queryUid(
  keyword: string,
  limit = 20,
): Promise<MomoPlayerGid[]> {
  const kw = keyword.trim();
  if (!kw) return [];
  const res = (await request("/momoro/queryUid", {
    method: "GET",
    params: { keyword: kw, limit },
  })) as ApiRes<MomoPlayerGid[]>;
  return (await unwrap(res)).map(normalizePlayerRecord);
}

/** 按中心 GID 查询关联图原始数据 */
export async function getPlayerGraphByGid(
  gid: string,
  boundary = DEFAULT_GID_BOUNDARY,
): Promise<PlayerGraphData> {
  const res = (await request("/momoro/getPlayerGraphByGid", {
    method: "GET",
    params: { gid: normalizeGid(gid), boundary },
  })) as ApiRes<PlayerGraphData>;
  return normalizePlayerGraph(await unwrap(res));
}

/** 查询待审核关联申请列表 */
export async function getBoNetApplyList(params?: {
  gid?: string;
  current?: number;
  pageSize?: number;
}): Promise<BoNetApplyListResult> {
  const res = (await request("/momoro/getBoNetApplyList", {
    method: "GET",
    params: params?.gid
      ? { ...params, gid: normalizeGid(params.gid) }
      : params,
  })) as ApiRes<BoNetApplyListResult>;
  const data = await unwrap(res);
  return { ...data, list: data.list.map(normalizeLink) };
}

/** 查询已审核（confirmed）关联列表 */
export async function getBoNetConfirmedList(params?: {
  gid?: string;
  current?: number;
  pageSize?: number;
}): Promise<BoNetApplyListResult> {
  const res = (await request("/momoro/getBoNetConfirmedList", {
    method: "GET",
    params: params?.gid
      ? { ...params, gid: normalizeGid(params.gid) }
      : params,
  })) as ApiRes<BoNetApplyListResult>;
  const data = await unwrap(res);
  return { ...data, list: data.list.map(normalizeLink) };
}

/** 删除已确认的 GID 关联关系 */
export async function boNetDeleteLink(body: {
  linkId: number;
}): Promise<void> {
  const res = (await request("/momoro/BoNetDelete", {
    method: "POST",
    data: {
      linkId: body.linkId,
    },
  })) as ApiRes<null>;
  await unwrap(res);
}

/** 提交人工怀疑关联（C 类） */
export async function boNetApply(body: {
  gidA: string;
  gidB: string;
}): Promise<ManualGidLink> {
  const res = (await request("/momoro/BoNetApply", {
    method: "POST",
    data: {
      gidA: normalizeGid(body.gidA),
      gidB: normalizeGid(body.gidB),
    },
  })) as ApiRes<ManualGidLink>;
  return normalizeLink(await unwrap(res));
}

/** 审核人工关联（通过或驳回） */
export async function boNetAudit(body: {
  linkId: number;
  action: "approve" | "reject";
  auditMemo?: string;
}): Promise<ManualGidLink | null> {
  const res = (await request("/momoro/BoNetAudit", {
    method: "POST",
    data: body,
  })) as ApiRes<ManualGidLink | null>;
  const data = await unwrap(res);
  return data ? normalizeLink(data) : null;
}

/** 手动写入 D 类规则疑似（ruleType=manual） */
export async function boNetRuleSuspectAdd(body: {
  sourceGid: string;
  suspectGid: string;
  memo: string;
  visible?: boolean;
}): Promise<ManualRuleSuspect> {
  const res = (await request("/momoro/BoNetRuleSuspectAdd", {
    method: "POST",
    data: {
      sourceGid: normalizeGid(body.sourceGid),
      suspectGid: normalizeGid(body.suspectGid),
      memo: body.memo,
      visible: body.visible,
    },
  })) as ApiRes<ManualRuleSuspect>;
  return await unwrap(res);
}

/** @deprecated 兼容旧调用，内部走 getBoNetApplyList */
export async function fetchManualLinksByGid(
  gid: string,
  type?: "confirmed" | "suspect",
): Promise<ManualGidLink[]> {
  const result = await getBoNetApplyList({ gid, pageSize: 100 });
  let links = result.list;
  if (type) {
    links = links.filter((l) => l.type === type);
  }
  return links;
}

/** @deprecated 兼容旧调用 */
export async function submitSuspectLink(
  gidA: string,
  gidB: string,
): Promise<ManualGidLink> {
  return boNetApply({ gidA, gidB });
}

/** @deprecated 兼容旧调用 */
export async function approveSuspectLink(
  linkId: number,
  auditMemo: string,
): Promise<boolean> {
  await boNetAudit({
    linkId,
    action: "approve",
    auditMemo,
  });
  return true;
}

/** @deprecated 兼容旧调用 */
export async function rejectSuspectLink(linkId: number): Promise<boolean> {
  await boNetAudit({
    linkId,
    action: "reject",
  });
  return true;
}

export { normalizeGid };
