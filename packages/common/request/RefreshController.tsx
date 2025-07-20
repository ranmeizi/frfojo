import { throttle } from "../utils/delay";
import {
  calcExpiresAt,
  clearToken,
  getToken,
  setToken,
  TokenStorageType,
} from "./token";

interface IRefreshController {
  /** 前置时间 默认 180 秒 */
  leadtime?: number;
  /* 获取 token 过期时间 */
  getExpireAt: () => number;
  /* 刷新 token 函数 */
  refreshFn: (..._: any) => Promise<any>;
}

let leadtime = 60 * 3 * 1000;
let refreshing = false;

function init(depend: IRefreshController) {
  const getExpireAt = depend.getExpireAt;
  const refreshFn = () => {
    if (refreshing) {
      return;
    }
    refreshing = true;
    depend.refreshFn().finally(() => {
      refreshing = false;
    });
  };
  if (depend.leadtime) {
    leadtime = depend.leadtime;
  }

  // 刷新
  const try_refresh = throttle(() => {
    if (Date.now() > getExpireAt!() - leadtime) {
      refreshFn();
    }
  }, 10000);

  // 用户点击操作
  document.body.addEventListener("click", try_refresh);

  // 页签切换
  document.addEventListener("visibilitychange", try_refresh);
}

export async function refreshTokenHandler() {
  const { refresh_token, access_token } = getToken() || {};

  if (!refresh_token || !access_token) {
    // 没有token就不需要
    return;
  }

  const res = await fetch("/auth/refresh", {
    body: JSON.stringify({ refresh_token }),
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  }).then((resp) => resp.json());
  if (res.code === "000000") {
    const newToken: TokenStorageType = calcExpiresAt({
      access_token: res.data.accessToken,
      expires_in: res.data.expiresIn,
      refresh_token,
      token_type: res.data.tokenType,
    });

    setToken(newToken);
  } else {
    // 清空token
    clearToken();
    // 本页
    const currentPageEncode = encodeURIComponent(location.href);

    // 跳转登陆页
    location.replace(
      `${location.protocol}//${location.hostname}:${location.port}/login?redirect_uri=${currentPageEncode}`
    );
  }
}

export const refresherInit = () =>
  init({
    getExpireAt: () => getToken()?.expires_at || 0,
    refreshFn: refreshTokenHandler,
  });
