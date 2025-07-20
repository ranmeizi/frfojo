import axios, { AxiosRequestConfig } from "axios";
import { getToken, setToken, clearToken, calcExpiresAt } from "./token";
import { refresherInit } from "./RefreshController";

const instance = axios.create({
  baseURL: "https://boboan.net/api", // 根据实际情况修改
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 可在此添加 token 等

    // 尝试取 token 加到 header 中
    const token = getToken();

    if (token) {
      config.headers.set(
        "Authorization",
        `${token.token_type} ${token.access_token}`
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error);
  }
);

// 封装一个带类型的请求方法
export function request<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  return instance(url, config);
}

export default instance;
export { getToken, setToken, clearToken, calcExpiresAt, refresherInit };
