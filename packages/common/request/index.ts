import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getToken, setToken, clearToken, calcExpiresAt } from "./token";
import { refresherInit } from "./RefreshController";

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
const internalRequestInterceptor = (
  config: InternalAxiosRequestConfig<any>
) => {
  // 可在此添加 token 等

  // 尝试取 token 加到 header 中
  const token = getToken();

  console.log("seetoken", token);

  if (token) {
    config.headers.set(
      "Authorization",
      `${token.token_type} ${token.access_token}`
    );
  }

  return config;
};

/** 响应 */
const responseInterceptor = (response: AxiosResponse<any, any>) =>
  response.data;

const errorFn = (error: any) => Promise.reject(error);

internal.interceptors.request.use(internalRequestInterceptor, errorFn);
internal.interceptors.response.use(responseInterceptor, errorFn);

external.interceptors.response.use(responseInterceptor, errorFn);

// 封装一个带类型的请求方法
/**
 * 对于自己后台的request
 */
export function request<T = any>(
  url: string,
  config: AxiosRequestConfig
): Promise<T> {
  const env = location.hostname === "boboan.net" ? "pord" : "development";

  if (env === "development") {
    config.baseURL = "http://localhost:3000";
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
  config?: AxiosRequestConfig
): Promise<T> {
  return external(url, config);
}

export { getToken, setToken, clearToken, calcExpiresAt, refresherInit };
