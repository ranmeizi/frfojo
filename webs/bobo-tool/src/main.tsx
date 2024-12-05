import { createRoot } from "react-dom/client";
import App, { SubApp } from "./App.tsx";
import "./index.css";
import { AsyncProcess } from "@frfojo/common/utils/delay.ts";
import { reactBridge } from "@garfish/bridge-react-v18";
import { Box } from "@mui/material";

const process = new AsyncProcess();

// process.use(async (next: AsyncProcessFn) => {
//   await sleep(5000);
//   next();
// });

// 渲染 react
process.use(renderApp);
export const bootstrap = process.start();

function renderApp() {
  // garfish 环境中不渲染
  if (window.__GARFISH__) {
    return true;
  }

  createRoot(document.getElementById("root")!).render(<App />);
}

export const provider = reactBridge({
  el: "#root",
  rootComponent: SubApp,
  errorBoundary: () => <Box>有问题</Box>,
});
