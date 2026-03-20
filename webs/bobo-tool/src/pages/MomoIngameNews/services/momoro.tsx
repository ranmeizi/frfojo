import { request } from "@frfojo/common/request";
import type { MomoDiscordMsg } from "../note";

// 推送 ingamenews
export function ingamenewsPush(params: MomoDiscordMsg[]) {
  return request("/momoro/ingamenews/push", { method: "POST", data: params });
}

export function getMvpDeathNote() {
  return request("/momoro/mvp/getCurrentStatus", { method: "GET" });
}

export function captureRequest() {
  return request("/momoro/captureRequest", { method: "GET" });
}

export function getRewardRank() {
  return request("/momoro/getRewardRank", { method: "GET" });
}

export function searchNews(params: {
  current: number;
  pageSize: number;
  search: string;
  type: string;
}) {
  return request("/momoro/rewards/list", { method: "GET", params });
}

export function rewardsStatistic(params: { search: string; type: "1" | "2" }) {
  return request("/momoro/reward/statistic", { method: "GET", params });
}

// 按 object/objectId + type 统计 subject 排行
export function getObjectSubjectRank(params: {
  object?: string;
  objectId?: string;
  type?: string; // "1" or "1,2"
  limit?: string; // 默认 50，最大 200
}) {
  return request("/momoro/reward/object-subject-rank", { method: "GET", params });
}

// 月度MVP击杀Top10
export function getMvpMonthlyTop10() {
  return request("/momoro/mvp/rank/monthly-top10", { method: "GET" });
}

// MVP击杀总榜及对象明细
export function getMvpSubjectObjectDetail() {
  return request("/momoro/mvp/rank/subject-object-detail", { method: "GET" });
}
