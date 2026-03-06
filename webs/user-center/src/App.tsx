import { ConfigProvider, theme } from "antd";
import "antd/dist/reset.css";
import { useEffect, useMemo, useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { getRuntimeMode } from "./runtime/mode";
import { getStandaloneToken } from "./request/token";
import { getHostAuthBridge } from "./auth/hostBridge";
import { createTheme, ThemeProvider } from "@mui/material/styles";

type ThemeMode = "dark" | "light";

function getInitialThemeMode(propsMode?: ThemeMode): ThemeMode {
  const w = window as any;
  return (
    propsMode ||
    (w.__FFJ_THEME_MODE__ as ThemeMode) ||
    (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
      ? "dark"
      : "light")
  );
}

function useThemeMode(propsMode?: ThemeMode) {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialThemeMode(propsMode));

  useEffect(() => {
    if (propsMode && propsMode !== mode) setMode(propsMode);
  }, [propsMode]);

  useEffect(() => {
    function onMode(e: any) {
      const next = e?.detail?.mode as ThemeMode | undefined;
      if (next && next !== mode) setMode(next);
    }
    window.addEventListener("ffj:themeMode", onMode as any);
    return () => window.removeEventListener("ffj:themeMode", onMode as any);
  }, [mode]);

  return mode;
}

function AppShell({ themeMode }: { themeMode?: ThemeMode }) {
  const mode = useThemeMode(themeMode);

  const antdTheme = useMemo(() => {
    return {
      algorithm: mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token:
        mode === "dark"
          ? {
              colorBgBase: "#0b0f19",
              colorBgLayout: "#0b0f19",
              colorBgContainer: "#111827",
              colorTextBase: "rgba(255,255,255,0.88)",
            }
          : {
              colorBgBase: "#ffffff",
              colorBgLayout: "#f6f7fb",
              colorBgContainer: "#ffffff",
            },
    } as const;
  }, [mode]);

  const muiTheme = useMemo(() => {
    const base = createTheme({
      palette: {
        mode,
        background:
          mode === "dark"
            ? { default: "#0b0f19", paper: "#111827" }
            : { default: "#f6f7fb", paper: "#ffffff" },
      },
    });
    // 给 LayoutMenu 的自定义 palette.app 提供运行时值（类型上用 any 绕过）
    (base.palette as any).app = {
      app_pager_menu: mode === "dark" ? "#0f172a" : "#ffffff",
      app_paper_content: mode === "dark" ? "#0b0f19" : "#f6f7fb",
    };
    return base;
  }, [mode]);

  const router = useMemo(
    () =>
      createBrowserRouter(
        [
          {
            path: "/login",
            lazy: async () => ({
              Component: (await import("./pages/auth/login/index")).default,
            }),
          },
          {
            path: "/",
            lazy: async () => ({
              Component: (await import("./layouts/MainLayout")).default,
            }),
            children: [
              { index: true, element: <Navigate to="/users" replace /> },
              {
                path: "users",
                lazy: async () => ({
                  Component: (await import("./pages/rbac/users/index")).default,
                }),
              },
              {
                path: "roles",
                lazy: async () => ({
                  Component: (await import("./pages/rbac/roles/index")).default,
                }),
              },
              {
                path: "permissions",
                lazy: async () => ({
                  Component: (await import("./pages/rbac/permissions/index")).default,
                }),
              },
            ],
          },
        ],
        { basename: (window as any).__GARFISH__ ? "/m/sub/user-center" : "" }
      ),
    []
  );

  useEffect(() => {
    // standalone 场景：让 request 拦截等非 React 层可以导航到 /login
    (globalThis as any).__FFJ_NAVIGATE__ = (to: string, opts?: { replace?: boolean }) =>
      (router as any).navigate(to, opts);
  }, [router]);

  const authValue = useMemo(() => {
    const mode = getRuntimeMode();
    const host = getHostAuthBridge();
    const hostToken = host?.getToken?.() || null;
    const hostUser = host?.getUser?.() || null;
    const token = mode === "garfish" ? hostToken : getStandaloneToken();
    const permissions =
      (mode === "garfish" ? hostUser?.permissions : undefined) || [];

    return {
      mode,
      token,
      user: hostUser,
      permissions,
      gotoLogin: (redirectUri?: string) => {
        const uri = redirectUri || location.href;
        if (mode === "garfish") {
          host?.gotoHostLogin?.(uri);
          return;
        }
        const redirect_uri = encodeURIComponent(uri);
        const to = `/login?redirect_uri=${redirect_uri}`;
        const nav = (globalThis as any).__FFJ_NAVIGATE__ as
          | ((to: string, opts?: { replace?: boolean }) => void)
          | undefined;
        if (nav) nav(to, { replace: true });
        else location.replace(`${location.origin}${to}`);
      },
    };
  }, []);

  return (
    <AuthProvider value={authValue as any}>
      <ThemeProvider theme={muiTheme}>
        <ConfigProvider key={mode} theme={antdTheme}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default function App() {
  return <AppShell />;
}

export function SubApp(props: any) {
  const subProps = props?.props ?? props;
  // 供组件库/拦截器读取（与其他子应用一致）
  (window as any).__BOCOMP_POPUP_BRIDGE__ = subProps?.popupBridge;
  // 主应用注入的鉴权桥接（token/user/gotoLogin）
  (window as any).__FFJ_AUTH_BRIDGE__ = subProps?.authBridge;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <AppShell themeMode={subProps?.themeMode} />
    </div>
  );
}
