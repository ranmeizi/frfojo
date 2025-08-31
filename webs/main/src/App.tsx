import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AppConfigProvider } from "./contexts/AppConfig";
import { useAppTheme } from "./theme";
import routes from "./routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GlobalStatesProvider } from "./contexts/GlobalStates";
import { SnackbarProvider, useMethodPopup } from "@frfojo/components/popup";
import * as FlashTitle from "@/utils/flashTitle";

const router = createBrowserRouter(routes);

function App() {
  const theme = useAppTheme();

  const popup = useMethodPopup();

  FlashTitle.useVisibilityEvent();

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
