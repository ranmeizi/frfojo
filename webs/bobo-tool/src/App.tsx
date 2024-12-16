import routes from "./routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { Box, createTheme, CssBaseline } from "@mui/material";
import { useAppTheme } from "./theme";
import { useEffect, useState } from "react";
console.log("sseeee,", window.__GARFISH__);
const router = createBrowserRouter(routes, {
  basename: window.__GARFISH__ ? "/m/sub/bobo-tool" : "",
});

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

export const SubApp = function () {
  const theme = useAppTheme();
  const [height, setHeight] = useState(window.innerHeight);
  const [width, setWidth] = useState(window.innerWidth - 70);

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

  console.log("hihihi theme", theme);

  return (
    <Box sx={{ height: height + "px", width: width + "px" }}>
      <ThemeProvider theme={createTheme(theme)}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Box>
  );
};

export default App;
