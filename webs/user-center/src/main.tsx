import { createRoot } from "react-dom/client";
import App, { SubApp } from "./App";
import "./index.css";
import { reactBridge } from "@garfish/bridge-react-v18";

function renderApp() {
  // garfish 环境中不渲染（由 provider 接管）
  if ((window as any).__GARFISH__) {
    return true;
  }
  createRoot(document.getElementById("root")!).render(<App />);
}

renderApp();

export const provider = reactBridge({
  el: "#root",
  rootComponent: SubApp,
});
