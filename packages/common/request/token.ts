const TOKEN_STORAGE_KEY = "__@frfojo/common__request__token__";

export type TokenStorageType = {
  access_token: string; // token
  expires_in: number; // 过期时间
  expires_at: number; // 过期时间戳
  refresh_token: string; // 刷新token
  token_type: string; // type
};

/**
 * 获取 token
 */
export function getToken(): TokenStorageType | null {
  try {
    const tokenStorage: TokenStorageType = JSON.parse(
      localStorage.getItem(TOKEN_STORAGE_KEY) as string
    );

    console.log("tokenStorage", tokenStorage);
    return tokenStorage;
  } catch {
    return null;
  }
}

/** 计算过期时间 */
export function calcExpiresAt<T extends { expires_in: number }>(
  tokenSlice: T
): T & { expires_at: number } {
  return {
    ...tokenSlice,
    expires_at: tokenSlice.expires_in + Math.floor(Date.now() / 1000),
  };
}

/**
 * 存 token
 */
export function setToken(token: TokenStorageType) {
  const tokenString = JSON.stringify(token);
  localStorage.setItem(TOKEN_STORAGE_KEY, tokenString);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}
