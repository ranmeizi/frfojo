import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getRuntimeMode } from "../runtime/mode";
import { getStandaloneToken, setStandaloneToken } from "./token";

// Garfish 模式：直接复用主工程 request（带签名/拦截/401403 跳主登录）
import { request as hostRequest, clearToken as hostClearToken } from "@frfojo/common/request";

function resolveBaseURL() {
  const env = location.hostname === "boboan.net" ? "pord" : "development";
  if (env === "development") return "https://boboan.net/api";
  return "https://boboan.net/api";
}

const standalone = axios.create({
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

standalone.interceptors.request.use((config) => {
  const tk = getStandaloneToken();
  if (tk?.access_token) {
    const tokenType = tk.token_type || "Bearer";
    config.headers = config.headers || {};
    (config.headers as any)["Authorization"] = `${tokenType} ${tk.access_token}`;
  }
  config.baseURL = resolveBaseURL();
  return config;
});

standalone.interceptors.response.use(
  (resp: AxiosResponse<any>) => resp.data,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // 独立运行：清 token 并跳到自己 login
      setStandaloneToken(null);
      const nav = (globalThis as any).__FFJ_NAVIGATE__ as
        | ((to: string, opts?: { replace?: boolean }) => void)
        | undefined;
      const redirect_uri = encodeURIComponent(location.href);
      const to = `/login?redirect_uri=${redirect_uri}`;
      if (nav) nav(to, { replace: true });
      else location.replace(`${location.origin}${to}`);
    }
    return Promise.reject(error);
  },
);

export function ucRequest<T = any>(
  url: string,
  config: AxiosRequestConfig,
): Promise<T> {
  if (getRuntimeMode() === "garfish") {
    return hostRequest<T>(url, config);
  }
  return standalone(url, config) as any;
}

export function ucClearAuth() {
  if (getRuntimeMode() === "garfish") {
    hostClearToken();
    return;
  }
  setStandaloneToken(null);
}

