import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AppConfigProvider } from "./contexts/AppConfig";
import { useAppTheme } from "./theme";
import routes from "./routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GlobalStatesProvider } from "./contexts/GlobalStates";

const router = createBrowserRouter(routes);

function App() {
  const theme = useAppTheme();

  return (
    <ThemeProvider theme={createTheme(theme)}>
      <CssBaseline />
      <AppConfigProvider>
        <GlobalStatesProvider>
          <RouterProvider router={router} />
        </GlobalStatesProvider>
      </AppConfigProvider>
    </ThemeProvider>
  );
}

export default App;
