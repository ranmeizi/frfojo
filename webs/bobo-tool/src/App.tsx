import routes from "./routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { Box, createTheme, CssBaseline } from "@mui/material";
import { useAppTheme } from "./theme";
import { useEffect, useState } from "react";
import { SnackbarProvider, useMethodPopup } from "@frfojo/components/popup";
import { AccessProvider } from "@frfojo/components";

const router = createBrowserRouter(routes, {
  basename: window.__GARFISH__ ? "/m/sub/bobo-tool" : "",
});

function App() {
  const theme = useAppTheme();
  const popup = useMethodPopup();

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <ThemeProvider theme={createTheme(theme)}>
        <CssBaseline />
        <SnackbarProvider preventDuplicate maxSnack={3}>
          <RouterProvider router={router} />
          {popup}
        </SnackbarProvider>
      </ThemeProvider>
    </Box>
  );
}

/** 将主应用经 Garfish 下发的鉴权信息挂到 window，供业务页同步读取 */
function syncHostAuthProps(raw: unknown): string[] {
  const bag =
    (raw as { props?: Record<string, unknown> } | null)?.props ??
    (raw as Record<string, unknown> | null) ??
    {};
  const user = bag.user as { permissions?: string[] } | undefined;
  const permissions = Array.isArray(bag.permissions)
    ? (bag.permissions as string[])
    : Array.isArray(user?.permissions)
      ? user.permissions
      : [];

  const win = window as Window & {
    __BOCOMP_POPUP_BRIDGE__?: unknown;
    __FFJ_PERMISSIONS__?: string[];
    __FFJ_USER__?: Record<string, unknown> & { permissions?: string[] };
  };
  win.__BOCOMP_POPUP_BRIDGE__ = bag.popupBridge;
  win.__FFJ_PERMISSIONS__ = permissions;
  if (user && typeof user === "object") {
    win.__FFJ_USER__ = { ...user, permissions };
  }
  return permissions;
}

export const SubApp = function (props: {
  props?: Record<string, unknown>;
  [key: string]: unknown;
}) {
  const theme = useAppTheme();
  const [height, setHeight] = useState(window.innerHeight);
  const [width, setWidth] = useState(window.innerWidth - 70);
  const [permissions, setPermissions] = useState<string[]>(() =>
    syncHostAuthProps(props),
  );

  useEffect(() => {
    // Garfish 注入的 props 在 rootComponent 入参；须显式挂到 window，页面里才能读到
    setPermissions(syncHostAuthProps(props));
  }, [props]);

  useEffect(() => {
    function onResize() {
      const el = document.querySelector(".garfish-container");
      setHeight(el?.clientHeight || 0);
      setWidth(el?.clientWidth || 0);
    }

    onResize();

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <Box sx={{ height: height + "px", width: width + "px" }}>
      <ThemeProvider theme={createTheme(theme)}>
        <CssBaseline />
        <AccessProvider permissions={permissions}>
          <RouterProvider router={router} />
        </AccessProvider>
      </ThemeProvider>
    </Box>
  );
};

export default App;
