import routes from "./routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { Box, createTheme, CssBaseline } from "@mui/material";
import { useAppTheme } from "./theme";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { useEffect, useState } from "react";
import Loading from "@frfojo/components/loading/Loading";
import { bootstrap } from "./main";

const router = createBrowserRouter(routes, {
  basename: window.__GARFISH__ ? "/m/sub/opendota" : "",
});

function App() {
  const theme = useAppTheme();

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Provider store={store}>
        <ThemeProvider theme={createTheme(theme)}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    </Box>
  );
}

/** 初始化守卫 */
const withInitGuard: HOC_Expand<any> = (Component) => (props) => {
  const [loading, setLoading] = useState(true);

  const subProps = props.props;

  useEffect(() => {
    // 启动 promise
    bootstrap.finally(() => setLoading(false));
  }, []);
  return loading ? (
    <Box
      sx={{
        height: subProps.height + "px",
        width: subProps.width + "px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Loading />
    </Box>
  ) : (
    <Component {...subProps}></Component>
  );
};

export const SubApp = withInitGuard(function () {
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

  return (
    // <Box sx={{ height: props.height + "px", width: props.width + "px" }}>
    <Box sx={{ height: height + "px", width: width + "px" }}>
      <Provider store={store}>
        <ThemeProvider theme={createTheme(theme)}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    </Box>
  );
});

export default App;
