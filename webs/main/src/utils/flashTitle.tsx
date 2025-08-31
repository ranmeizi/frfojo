/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { useEffect } from "react";

const channel = new BroadcastChannel("boboan.net");

// 主页面脚本
const worker = new Worker("/keep-timer.js");

// 定时器保持活跃
worker.onmessage = (e) => {};

/**
 *
 * @param timeout 延迟timeout
 * @returns
 */
export async function sleep(timeout: number, callback?: Function) {
  return new Promise((resolve) => {
    const res = setTimeout(resolve, timeout);
    callback && callback(res);
  });
}

let originTitle = document.title;

let timer: number | null = null;

const doList: [Function, number][] = [];

let animating = false;

/**
 * 新消息动画
 * 最好输入中文
 */
export async function newMessage(content: string) {
  console.log("newMessage");
  animating = true;
  originTitle = document.title;
  doList.splice(0, doList.length);

  // 闪烁3次
  const frame1 = `【新消息】${originTitle}`;
  const frame2 = `【\u3000\u3000\u3000】${originTitle}`;

  doList.push([() => setTitle(frame1), 500]);
  doList.push([() => setTitle(frame2), 500]);
  doList.push([() => setTitle(frame1), 500]);
  doList.push([() => setTitle(frame2), 500]);
  doList.push([() => setTitle(frame1), 500]);
  doList.push([() => setTitle(frame2), 500]);

  // 播放消息内容走马灯

  // 总之先拼一个2倍长度的文字
  const scrollContent =
    "\u3000\u3000" + content.padEnd(3, "\u3000\u3000\u3000");
  const text = scrollContent.concat(scrollContent);
  const length = scrollContent.length;

  let time = 0;
  const maxTime = 5;

  let i = 0;

  while (true) {
    if (time > maxTime) {
      break;
    }

    const txt = `【${text.slice(i, i + 3)}】${originTitle}`;
    doList.push([() => setTitle(txt), 500]);
    i++;

    if (i >= length) {
      time++;
      i = 0;
    }
  }

  // 播放动画
  for (const [fn, timeout] of doList) {
    console.log("run", Math.round(Date.now() / 1000));
    await checkInterrupted();
    fn();
    await sleep(timeout, (t) => (timer = t));
  }
}

function setTitle(title: string) {
  document.title = title;
}

async function checkInterrupted() {
  if (!animating) {
    return Promise.reject("中断了贝贝");
  }
}

export function reset() {
  document.title = originTitle;
  animating = false;
  if (timer) {
    window.clearTimeout(timer);
  }
}

export function useVisibilityEvent() {
  console.log("heeeee");
  useEffect(() => {
    function onVisibilitychange(e) {
      console.log("onVisibilitychange", e);
      if (e.target.hidden) {
        onHidden();
      } else {
        onBack();
      }
    }
    document.addEventListener("visibilitychange", onVisibilitychange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilitychange);
    };
  }, []);
}

function onChannelMessage(event: any) {
  const content = event?.data?.content;

  newMessage(content).catch((e) => {
    console.log("newMessage catch:", e);
  });
}

export function sendNewMessage(message: string) {
  channel.postMessage({ content: message });
}

function onHidden() {
  console.log("hidden");
  // 标签页变为非活跃状态
  worker.postMessage({ type: "HIDDEN" }); // 切换到节流模式

  channel.addEventListener("message", onChannelMessage);
}
function onBack() {
  console.log("active");
  // 标签页变为活跃状态
  worker.postMessage({ type: "ACTIVE" }); // 恢复精确计时
  channel.removeEventListener("message", onChannelMessage);
  reset();
}
