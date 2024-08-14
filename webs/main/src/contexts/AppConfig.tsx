import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";
import * as DaoAppConfig from "@/db/dao/AppConfig";

type AppConfig = {
  cust_theme_primary?: string;
  theme_mode: "dark" | "light";
  route_transition_direction: "right" | "left" | "top" | "bottom";
};

const defaultValue: AppConfig = {
  // 主题色
  cust_theme_primary: undefined,
  // mode
  theme_mode: "light",
  //
  route_transition_direction: "right",
};

type UnSubscribeFn = () => void;

export const context = createContext(defaultValue);

const keys = Object.keys(defaultValue);

// 监听
function obState(key: keyof typeof defaultValue, cb: any): UnSubscribeFn {
  const bs = DaoAppConfig.Observers.get_config(key)?.subscribe((v) => {
    cb((config: any) => ({ ...config, [key]: v && v.get("value") }));
  });
  return () => bs?.unsubscribe();
}

export function AppConfigProvider({ children }: PropsWithChildren) {
  const [config, setConfig] = useState(defaultValue);

  useEffect(() => {
    // 监听
    const subs = keys.map((k) =>
      obState(k as keyof typeof defaultValue, setConfig)
    );
    // 移除监听
    return () => subs.forEach((f) => f());
  }, []);

  return <context.Provider value={config}>{children}</context.Provider>;
}
