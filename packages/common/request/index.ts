import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getToken, setToken, clearToken, calcExpiresAt } from "./token";
import { refresherInit } from "./RefreshController";
import { RequestQueue } from "./RequestQueue";
import * as Signature from "./sign";

const internal = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const external = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/** 加token */
const internalRequestInterceptor = async (
  config: InternalAxiosRequestConfig<any>,
) => {
  // 可在此添加 token 等

  // 尝试取 token 加到 header 中
  const token = getToken();

  console.log("seetoken", token);

  if (token) {
    config.headers.set(
      "Authorization",
      `${token.token_type} ${token.access_token}`,
    );
  }

  // 签名
  await Signature.beforeRequest(config);

  return config;
};

/** 响应 */
const responseInterceptor = (response: AxiosResponse<any, any>) =>
  response.data;

let authDialogLock = false;
let lastAuthDialogAt = 0;

function getPopupBridge(): any {
  const g = globalThis as any;
  return (
    g.__BOCOMP_POPUP_BRIDGE__ ||
    g.__GARFISH__?.props?.popupBridge ||
    g.__GARFISH__?.props?.props?.popupBridge
  );
}

function gotoLogin() {
  const currentPageEncode = encodeURIComponent(location.href);
  const to = `/login?redirect_uri=${currentPageEncode}`;
  const nav = (globalThis as any).__FFJ_NAVIGATE__ as
    | ((to: string, opts?: { replace?: boolean }) => void)
    | undefined;
  if (nav) {
    nav(to, { replace: true });
    return;
  }
  // 兜底（理论上主应用会注入 __FFJ_NAVIGATE__）
  location.replace(`${location.origin}${to}`);
}

async function confirmByBridge(opts: {
  title: string;
  content: string;
  okText: string;
  cancelText: string;
}): Promise<boolean> {
  const bridge = getPopupBridge();
  const confirm = bridge?.modal?.confirm;
  if (!confirm) return false;

  // 约定：ok -> resolve(close)；cancel/关闭 -> reject
  return new Promise<boolean>((resolve) => {
    try {
      confirm({
        title: opts.title,
        content: opts.content,
        okText: opts.okText,
        cancelText: opts.cancelText,
        onOk: async () => {
          resolve(true);
        },
        onCancel: async () => {
          resolve(false);
        },
      });
    } catch {
      resolve(false);
    }
  });
}

async function handleAuthStatus(status: number) {
  const now = Date.now();
  if (authDialogLock) return;
  // 防抖：短时间内的多次 401/403 只弹一次
  if (now - lastAuthDialogAt < 1200) return;
  lastAuthDialogAt = now;
  authDialogLock = true;

  try {
    if (status === 401) {
      const ok = await confirmByBridge({
        title: "需要登录",
        content: "登录已失效或未登录，是否前往登录页？",
        okText: "去登录",
        cancelText: "取消",
      });
      if (ok) {
        clearToken();
        gotoLogin();
      }
    } else if (status === 403) {
      const ok = await confirmByBridge({
        title: "没有权限",
        content: "当前账号没有权限访问该资源，是否切换账号重新登录？",
        okText: "切换账号",
        cancelText: "取消",
      });
      if (ok) {
        clearToken();
        gotoLogin();
      }
    }
  } finally {
    authDialogLock = false;
  }
}

const errorFn = async (error: any) => {
  const status = error?.response?.status;
  const cfg = error?.config as any;
  // 可按需跳过（例如登录接口本身、或某些 silent 请求）
  if (cfg?.__skipAuthDialog) return Promise.reject(error);
  if (status === 401 || status === 403) {
    // 不阻塞原始错误链路
    handleAuthStatus(status).catch(() => {});
  }
  return Promise.reject(error);
};

internal.interceptors.request.use(internalRequestInterceptor, errorFn);
internal.interceptors.response.use(responseInterceptor, errorFn);

external.interceptors.response.use(responseInterceptor, errorFn);

// 封装一个带类型的请求方法
/**
 * 对于自己后台的request
 */
export function request<T = any>(
  url: string,
  config: AxiosRequestConfig,
): Promise<T> {
  const env = location.hostname === "boboan.net" ? "pord" : "development";

  if (env === "development") {
    config.baseURL = "https://boboan.net/api";
    // config.baseURL = "http://127.0.0.1:3000";
  } else {
    config.baseURL = "https://boboan.net/api";
  }

  return internal(url, config);
}

/**
 * 对于外部的request
 */
export function requestPublic<T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  return external(url, config);
}

export {
  getToken,
  setToken,
  clearToken,
  calcExpiresAt,
  refresherInit,
  RequestQueue,
};
