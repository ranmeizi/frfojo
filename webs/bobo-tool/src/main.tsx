import { createRoot } from "react-dom/client";
import App, { SubApp } from "./App.tsx";
import "./index.css";
import { AsyncProcess } from "@frfojo/common/utils/delay";
import { reactBridge } from "@garfish/bridge-react-v18";
import { Box } from "@mui/material";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://3df0a0e1f153d9a4650509311cf860fa@o4512451653009408.ingest.us.sentry.io/4512451802693632",
  integrations: [Sentry.browserTracingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
});

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
