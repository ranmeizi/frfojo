import routes from "./routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { Box, createTheme, CssBaseline } from "@mui/material";
import { useAppTheme } from "./theme";

const router = createBrowserRouter(routes);

function App() {
  const theme = useAppTheme();

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <ThemeProvider theme={createTheme(theme)}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Box>
  );
}

export default App;
