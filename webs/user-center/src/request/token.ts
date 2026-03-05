const KEY = "__ffj_user_center_token__";

export function getStandaloneToken(): Types.UserCenterAuth.Token | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStandaloneToken(token: Types.UserCenterAuth.Token | null) {
  if (!token) {
    localStorage.removeItem(KEY);
    return;
  }
  localStorage.setItem(KEY, JSON.stringify(token));
}

