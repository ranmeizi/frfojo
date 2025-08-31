let timer;
let currentInterval = 100;

self.onmessage = function (e) {
  const { type } = e.data;

  if (type === "ACTIVE") {
    clearInterval(timer);
  } else if (type === "HIDDEN") {
    timer = setInterval(() => {
      self.postMessage("tick");
    }, currentInterval);
  }

  // 可以添加其他控制命令
};
