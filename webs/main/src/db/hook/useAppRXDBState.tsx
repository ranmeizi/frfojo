import { useMemo } from "react";
import { AppConfigDocType } from "../schema/AppConfig.schema";
import { useRxQuery } from "./useRxQuery";
import * as AppConfigService from "../services/AppConfig.service";

export function useAppRxDBState<T = any>(
  key: AppConfigService.AllAppConfigKeys
) {
  // 主题色
  const value = useRxQuery<AppConfigDocType>(
    useMemo(() => AppConfigService.querys.one(key), [])
  );

  function setValue(value: T) {
    AppConfigService.services.setConfig(key, value);
  }

  const val: T = useMemo(() => {
    return value?.value as unknown as T;
  }, [value?.value]);

  return [val, setValue] as const;
}
