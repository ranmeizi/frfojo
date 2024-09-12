import React, {
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
};

const defaultValue: AppConfig = {
  // 主题色
  cust_theme_primary: undefined,
  // mode
  theme_mode: "light",
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

  return <context.Provider value={config}>{children}</context.Provider>;
}
