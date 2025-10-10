import { sleep } from "../utils/delay";

/**
 * 这个队列就是拖慢一下客户端对于 http 的发送频率
 *
 *
 */

const INTERVAL = 1000 * 5; // 5秒

type QueueItem = [() => Promise<any>, { resolve: any; reject: any }];

export class RequestQueue {
  private _task: any = null;
  private _queue: QueueItem[] = [];
  private _interval = INTERVAL;

  constructor(interval: number = INTERVAL) {
    this._interval = interval;
  }

  get IDLE(): boolean {
    return this._queue.length === 0;
  }

  private pickOneTask() {
    const task = this._queue.shift();

    console.log(
      "【RequestQueue】选出了一个task,task=",
      task,
      "queue:",
      this._queue
    );

    if (task) {
      const [fn, { resolve, reject }] = task;

      this._task = task;

      console.log("【RequestQueue】，do", "ts:", Date.now());

      fn()
        .then(resolve)
        .catch(reject)
        .finally(async () => {
          // 等一下
          await sleep(this._interval);
          // 清空
          this._task = null;
          // 任务结束(触发一下下一个)
          this.pickOneTask();
        });
    }
  }

  push<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      console.log("【RequestQueue】push了一个task", "queue:", this._queue);
      this._queue.push([fn, { resolve, reject }]);

      if (!this._task) {
        // push 任务(触发一下下一个)
        this.pickOneTask();
      }
    });
  }

  // 清除未开始的任务
  clear() {
    this._queue = [];
  }
}
