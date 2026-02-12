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
