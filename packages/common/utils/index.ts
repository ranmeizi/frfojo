import * as delay from "./delay";
import $EB, { EventBus } from "./EventBus";

export function loadScript(url: string) {
  const memo: Record<string, any> = {};
  if (url in memo) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => {
      resolve("");
      memo[url] = true;
    };
    script.onerror = reject;

    document.head.appendChild(script);
  });
}

export { delay, EventBus, $EB };
