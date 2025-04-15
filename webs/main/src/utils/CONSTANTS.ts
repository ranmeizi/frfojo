export const APP_CONFIG_STORAGE_KEY_PRIMARY = "cust_theme_primary"; // 自定义 primary 颜色
export const APP_CONFIG_STORAGE_KEY_MODE = "theme_mode"; // mode dark/light
export const APP_CONFIG_IS_FIRST = "is_first"; // 第一次使用 app ？

export const APP_CONFIG_PAGE_TRANSITION_DIRECTION =
  "route_transition_direction";

export const TAURI_CMD_OPEN_WINDOW = "open_window"; // tauri cmd 打开新窗口
export const TAURI_CMD_OPEN_BROWSER = "open_browser"; // tauri cmd 打开浏览器

export const isMobile =
  /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
