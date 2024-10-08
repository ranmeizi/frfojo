// 处理异步流程
export class AsyncProcess {
    process: any[] = [];

    use(fn: any) {
        this.process.push(() => fn(this.next));
    }

    next = async () => {
        try {
            const action = this.process.shift();
            action && (await action());
        } catch (e) {
            console.log(e);
        }
    };

    async start() {
        await this.next();
    }
}

type anyFn = (...args: any[]) => any;

export function throttle(fn: anyFn, delay: number) {
  let prevTime = 0;
  return function (this: unknown, ...args: any[]) {
    const now = new Date().getTime();
    if (now - prevTime > delay) {
      fn.apply(this, args);
      prevTime = now;
    }
  };
}

export function debounce(fn: anyFn, delay: number) {
  let timer: any = null;
  return function (this: unknown, ...args: any[]) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, delay);
  };
}

export function debounceCancelAble(fn: anyFn, delay: number) {
  let timer: any = null;
  return function (this: unknown, ...args: any[]): () => void {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  };
}

/**
 *
 * @param timeout 延迟timeout
 * @returns
 */
export async function sleep(timeout: number) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
