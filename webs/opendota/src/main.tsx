import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AsyncProcess, sleep } from "@frfojo/common/utils/delay.ts";
import { initialize as initializeStore, store } from "./redux/store.ts";
import { Provider } from "react-redux";
import TextLoading1 from "@frfojo/components/loading/classic/TextLoading1.tsx";
import { Box } from "@mui/material";
import Initializing from "./Initializing.tsx";

const root = createRoot(document.getElementById("root")!);

const process = new AsyncProcess();

// loading
process.use(renderLoading);

process.use(async (next: AsyncProcessFn) => {
  await sleep(5000);
  next();
});

// 初始化微应用
process.use(initializeStore);
// 渲染 react
process.use(renderApp);
process.start();

function renderApp() {
  root.unmount();
  createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}

function renderLoading(next: AsyncProcessFn) {
  root.render(<Initializing />);
  next();
}
