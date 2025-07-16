import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AsyncProcess, sleep } from "@frfojo/common/utils/delay";
import { init as rxdbInit } from "./db";

const process = new AsyncProcess();

// 异步初始化 rxdb
process.use(rxdbInit);

// 测试 loading
process.use(async function (next: AsyncProcessFn) {
  await sleep(2000);
  await next();
});
// 渲染 react
process.use(renderApp);
process.start();

function renderApp() {
  createRoot(document.getElementById("root")!).render(
    // <StrictMode> // 很多库不支持 StrictMode,自己测自己写
    <App />
    // </StrictMode>
  );

  if (window.ffj_loaded) {
    // 结束loading
    window.ffj_loaded();
  }
}
