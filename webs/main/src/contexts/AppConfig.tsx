import {
  PropsWithChildren,
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRxQuery } from "@/db/hook/useRxQuery";
import * as AppConfigService from "@/db/services/AppConfig.service";
import { AppConfigDocType } from "@/db/schema/AppConfig.schema";

type AppConfig = {
  cust_theme_primary?: string;
  theme_mode: "dark" | "light";
  cacheVersion: number;
};

const defaultValue: AppConfig = {
  // 主题色
  cust_theme_primary: undefined,
  // mode
  theme_mode: "light",
  // 前端缓存资源版本号
  cacheVersion: 0,
};

export const context = createContext(defaultValue);

export function AppConfigProvider({ children }: PropsWithChildren) {
  const [config, setConfig] = useState(defaultValue);

  const configList =
    useRxQuery<AppConfigDocType, "list">(
      useMemo(() => AppConfigService.querys.all(), [])
    ) || [];

  useEffect(() => {
    const upd: any = {};
    // 更新 config
    for (const { key, value } of configList) {
      if (config[key as keyof AppConfig] !== value) {
        // 需要更新
        upd[key] = value;
      }
    }

    setConfig((v) => ({
      ...v,
      ...upd,
    }));
  }, [configList]);

  useEffect(() => {
    // 让子应用/非 React 层能感知主应用 themeMode（antd 暗黑模式等）
    const mode = config.theme_mode || "light";
    (window as any).__FFJ_THEME_MODE__ = mode;
    window.dispatchEvent(
      new CustomEvent("ffj:themeMode", { detail: { mode } }),
    );
  }, [config.theme_mode]);

  return <context.Provider value={config}>{children}</context.Provider>;
}
