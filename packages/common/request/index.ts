import axios, { AxiosRequestConfig } from "axios";

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
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

// 封装一个带类型的请求方法
export function request<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  return instance(url, config);
}

export default instance;
