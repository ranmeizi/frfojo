// 由订阅的 rx object 映射成 组件 state rx -> state
// import { } from 'rxdb'
import { debounce } from "@frfojo/common/utils/delay";
import { useEffect, useMemo, useState } from "react";
import { RxQuery } from "rxdb";

export function useRxQuery<
  T,
  QueryType extends "list" | "doc" = "doc",
  StateType = QueryType extends "list" ? T[] : T
>(rxQuery?: RxQuery, debounceTime?: number) {
  const [state, setState] = useState<StateType>();

  // 允许一些频繁的doc 操作 使用 debouce 一起合并更新
  const updateFn = useMemo(() => {
    const fn = (v: any) => {
      console.log("hey", v);
      if (v instanceof Array) {
        setState(v.map((item) => item.toJSON()) as any);
      } else {
        setState(v.toJSON());
      }
    };
    if (debounceTime) {
      return debounce(fn, debounceTime);
    } else {
      return fn;
    }
  }, []);

  useEffect(() => {
    if (!rxQuery) {
      return undefined;
    }

    const subscription = rxQuery.$.subscribe(updateFn);
    return () => {
      subscription.unsubscribe();
    };
  }, [rxQuery]);

  return state;
}
