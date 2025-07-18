import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AppConfigProvider } from "./contexts/AppConfig";
import { useAppTheme } from "./theme";
import routes from "./routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GlobalStatesProvider } from "./contexts/GlobalStates";
import { useMethodPopup } from "@frfojo/components/popup";

const router = createBrowserRouter(routes);

function App() {
  const theme = useAppTheme();

  const popup = useMethodPopup();

  return (
    <ThemeProvider theme={createTheme(theme)}>
      <CssBaseline />
      {/* APP 配置项 */}
      <AppConfigProvider>
        {/* 全局状态 */}
        <GlobalStatesProvider>
          {/* 路由 */}
          <RouterProvider router={router} />
          {/* api式调用弹出层 */}
          {popup}
        </GlobalStatesProvider>
      </AppConfigProvider>
    </ThemeProvider>
  );
}

export default App;
