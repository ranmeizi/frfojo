import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AsyncProcess, sleep } from "@frfojo/common/utils/delay.ts";

const process = new AsyncProcess();

// 初始化微应用
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
}
