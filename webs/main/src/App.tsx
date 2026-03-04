import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AppConfigProvider } from "./contexts/AppConfig";
import { useAppTheme } from "./theme";
import routes from "./routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GlobalStatesProvider } from "./contexts/GlobalStates";
import { SnackbarProvider, useMethodPopup } from "@frfojo/components/popup";
import * as FlashTitle from "@/utils/flashTitle";
import { createPopupBridge } from "@/utils/popupBridge";
import { useEffect } from "react";

const router = createBrowserRouter(routes);

function App() {
  const theme = useAppTheme();

  const popup = useMethodPopup();

  FlashTitle.useVisibilityEvent();

  // 让 request 拦截器/组件库在主应用内始终能用 Modal（不再 fallback 到原生 confirm）
  (window as any).__BOCOMP_POPUP_BRIDGE__ = createPopupBridge();

  useEffect(() => {
    // 给非 React 层（request 拦截器等）提供 history/redirect 能力
    // replace=true 等价于 redirect，不会污染回退栈
    (window as any).__FFJ_NAVIGATE__ = (to: string, opts?: { replace?: boolean }) =>
      (router as any).navigate(to, opts);
  }, []);

  return (
    <ThemeProvider theme={createTheme(theme)}>
      <CssBaseline />

      {/* APP 配置项 */}
      <AppConfigProvider>
        {/* 全局状态 */}
        <GlobalStatesProvider>
          <SnackbarProvider preventDuplicate maxSnack={3}>
            {/* 路由 */}
            <RouterProvider router={router} />
            {/* api式调用弹出层 */}
            {popup}
          </SnackbarProvider>
        </GlobalStatesProvider>
      </AppConfigProvider>
    </ThemeProvider>
  );
}

export default App;
