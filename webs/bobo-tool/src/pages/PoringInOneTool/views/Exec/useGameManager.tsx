/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { loadScript } from "@frfojo/common/utils";
import { GameManager } from "./libs/game_manager";
//@ts-ignore
const modelUrl = new URL("/model.bin", import.meta.url).href;
//@ts-ignore
const convnetjsUrl = new URL("/convnet-min.js", import.meta.url).href;

export function useGameManager() {
  const net = useRef<any>();
  const manager = useRef<any>();

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    // 加载脚本
    await loadScript(convnetjsUrl);
    // 初始化网络
    net.current = await init_net();
    // 初始化 manager
    manager.current = new GameManager(4);

    manager.current.net = net.current;
  }

  function xhr_fetch(url): Promise<ArrayBuffer> {
    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    const updateProgress = function (oEvent) {
      const per = (100 * oEvent.loaded) / 25484016;

      setProgress(per);
    };

    oReq.addEventListener("progress", updateProgress, false);

    oReq.send(null);

    return new Promise((resolve, reject) => {
      oReq.onload = function () {
        const arrayBuffer = oReq.response; // Note: not oReq.responseText
        resolve(arrayBuffer);
      };

      oReq.onerror = reject;
    });
  }

  async function init_net() {
    // convnetjs 初始化
    const layer_defs = [];
    layer_defs.push({ type: "input", out_sx: 4, out_sy: 4, out_depth: 16 });
    const net_params = [256, 2400, 1600, 800, 400, 400, 200, 200, 100, 100, 4];
    for (let i = 1; i < net_params.length - 1; i++) {
      layer_defs.push({
        type: "fc",
        num_neurons: net_params[i],
        activation: "relu",
      });
    }
    layer_defs.push({ type: "fc", num_neurons: 4 });

    // create a net out of it
    const net = new window.convnetjs.Net();
    net.makeLayers(layer_defs);

    // 加载模型
    const arrayBuffer = await xhr_fetch(modelUrl);

    const floatArray = new Float32Array(arrayBuffer);

    let ptr = 0 | 0;
    for (let i = 1; i < net_params.length; i++) {
      const l = i * 2 - 1;
      for (let x = 0; x < net_params[i - 1]; x++) {
        for (let y = 0; y < net_params[i]; y++) {
          net.layers[l].filters[y].w[x] = floatArray[ptr];
          ptr++;
        }
      }
      for (let y = 0; y < net_params[i]; y++) {
        net.layers[l].biases.w[y] = floatArray[ptr];
        ptr++;
      }
    }

    return net;
  }

  return { manager, progress };
}
