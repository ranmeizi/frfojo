import { InternalAxiosRequestConfig } from "axios";
import * as CryptoJS from "crypto-js";

/**
 * 计算签名（使用 crypto-js，兼容非 https 环境）
 */
export async function calculateSignature(
  signString: string,
  appSecret: string,
): Promise<string> {
  return CryptoJS.HmacSHA256(signString, appSecret)
    .toString(CryptoJS.enc.Hex)
    .toLowerCase();
}

function normalizeValue(value: any): string {
  // 1. 处理 null/undefined
  if (value === null || value === undefined) {
    return "";
  }

  // 2. 处理布尔值
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  // 3. 处理数字
  if (typeof value === "number") {
    // 去除末尾无用的0，如 10.00 -> 10, 10.10 -> 10.1
    return parseFloat(value.toString()).toString();
  }

  // 4. 处理字符串
  if (typeof value === "string") {
    // 移除首尾空格
    return value.trim();
  }

  // 5. 处理数组
  if (Array.isArray(value)) {
    // 深度规范化每个元素
    const normalized = value
      .map((item) => normalizeValue(item))
      .filter((item) => item !== ""); // 移除空值

    // 排序确保一致性
    normalized.sort();

    // 转换为字符串 [value1,value2]
    return `[${normalized.join(",")}]`;
  }

  // 6. 处理对象
  if (value && typeof value === "object") {
    // 按key排序
    const sortedKeys = Object.keys(value).sort();

    // 构建 key:normalizedValue 对
    const pairs = sortedKeys
      .map((key) => {
        const normalized = normalizeValue(value[key]);
        return normalized !== "" ? `${key}:${normalized}` : null;
      })
      .filter((pair) => pair !== null); // 移除空值

    // 转换为字符串 {key1:value1,key2:value2}
    return `{${pairs.join(",")}}`;
  }

  // 7. 其他类型忽略（如文件）
  return "";
}

// 客户端签名
export async function beforeRequest(config: InternalAxiosRequestConfig<any>) {
  const timestamp = Date.now();
  const nonce = Math.floor(Math.random() * 1000000000);
  const contentType =
    config.headers["content-type"] || config.headers["Content-Type"];

  console.log("beforeRequest", contentType, config);

  if (config.method?.toLocaleUpperCase() === "GET") {
    const sign = normalizeValue({
      ...(config.params || {}),
      timestamp,
      nonce,
    });

    config.headers.set(
      "x-signature",
      await calculateSignature(sign, "function"),
    );
  } else if (
    config.method?.toLocaleUpperCase() === "POST" &&
    contentType.indexOf("application/json") !== -1
  ) {
    const sign = normalizeValue({
      ...(config.data || {}),
      timestamp,
      nonce,
    });

    config.headers.set(
      "x-signature",
      await calculateSignature(sign, "function"),
    );
  } else if (
    config.method?.toLocaleUpperCase() === "POST" &&
    contentType.indexOf("application/x-www-form-urlencoded") !== -1
  ) {
    const sign = normalizeValue({
      ...(config.data || {}),
      file: undefined,
      files: undefined,
      timestamp,
      nonce,
    });
    config.headers.set(
      "x-signature",
      await calculateSignature(sign, "function"),
    );
  } else if (
    config.method?.toLocaleUpperCase() === "POST" &&
    contentType.indexOf("multipart/form-data") !== -1
  ) {
    const sign = normalizeValue({
      ...(config.data || {}),
      file: undefined,
      files: undefined,
      timestamp,
      nonce,
    });
    config.headers.set(
      "x-signature",
      await calculateSignature(sign, "function"),
    );
  }

  config.headers.set("x-timestamp", timestamp);
  config.headers.set("x-nonce", nonce);
}
