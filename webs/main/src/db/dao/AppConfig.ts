/* eslint-disable prefer-const */
import { db } from "@/db";
import { Observable } from "rxjs";
import { RxDocument } from "rxdb";

type AllAppConfigKeys =
  | "cust_theme_primary"
  | "theme_mode"
  | "route_transition_direction";

let state: Record<
  AllAppConfigKeys,
  Observable<RxDocument<any>> | undefined
> = {
  // 主题色
  cust_theme_primary: undefined,
  // mode
  theme_mode: undefined,
  //
  route_transition_direction: undefined,
};

export const Observers = {
  // 获取 mode
  get_config(key: AllAppConfigKeys) {
    if (!state[key]) {
      state[key] = db.collections["appConfig"].findOne({
        selector: {
          key,
        },
      }).$;
    }
    return state[key];
  },
};

export const Mutation = {
  // 设置config
  set_config(key: AllAppConfigKeys, value: string) {
    db.collections["appConfig"].upsert({
      key: key,
      value: value,
    });
  },
};
