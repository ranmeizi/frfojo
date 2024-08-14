// 由订阅的 rx object 映射成 组件 state rx -> state
// import { } from 'rxdb'
import { useEffect, useState } from "react";
import { RxDocument } from "rxdb";
import { Observable } from "rxjs";

// readonly
export function useRxState<T>(
  implObservable?: Observable<RxDocument<T>>
) {
  const [state, setState] = useState<T>();

  useEffect(() => {
    if (!implObservable) {
      return undefined;
    }
    const subscription = implObservable.subscribe((v) => {
      setState(v);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [implObservable]);

  return state;
}
