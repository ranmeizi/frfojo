// 由订阅的 rx object 映射成 组件 state rx -> state
// import { } from 'rxdb'
import { useEffect, useState } from "react";
import { RxQuery } from "rxdb";

export function useRxQuery<
  T,
  QueryType extends "list" | "doc" = "doc",
  StateType = QueryType extends "list" ? T[] : T
>(rxQuery?: RxQuery) {
  const [state, setState] = useState<StateType>();

  useEffect(() => {
    if (!rxQuery) {
      return undefined;
    }
    const subscription = rxQuery.$.subscribe((v) => {
      console.log("hey", v);
      if (v instanceof Array) {
        setState(v.map((item) => item.toJSON()) as any);
      } else {
        setState(v.toJSON());
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [rxQuery]);

  return state;
}
