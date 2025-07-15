# main 主应用壳子

## CustBridge

CustBridge 是开发时定义的一套 主应用 子应用 用来交互的一套方案，接口即回调函数，全部由主应用以 props 传入。

有可能是即时回调，这时子应用调用回调函数即可
也有可能是需要双向交互，这时子应用调用的回调函数应返回 Promise 这样方便子应用得知响应结果
如需多次双向交互，采用子应用callback 轮询的方式，子应用发起一个回调，callback返回 Promise结果，再决定需不需要继续轮询

```ts
interface CustBridge{
  /**
   * 去登陆
   * 
   * 登陆成功原样返回登陆接口的返回值
   * 但同时也要更新一下 props.token 或是 props.uinfo
   */
  login():Promise<unknown>
}
```