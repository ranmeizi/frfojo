import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AppConfigProvider } from "./contexts/AppConfig";
import { useCreateTheme } from "./theme";
import routes from "./routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter(routes);

function App() {
  const theme = useCreateTheme();

  return (
    <ThemeProvider theme={createTheme(theme)}>
      <CssBaseline />
      <AppConfigProvider>
        <RouterProvider router={router} />
      </AppConfigProvider>
    </ThemeProvider>
  );
}

export default App;
