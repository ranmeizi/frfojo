import { useMediaQuery } from "@mui/material";
import { useMemo } from "react";
import * as C from "@/utils/CONSTANTS";
import { useRxQuery } from "@/db/hook/useRxQuery";
import * as AppConfigService from "@/db/services/AppConfig.service";
import { AppConfigDocType } from "@/db/schema/AppConfig.schema";
import { useCreateTheme } from "@frfojo/common/theme";

export function useAppTheme() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // 主题色
  const primary = useRxQuery<AppConfigDocType>(
    useMemo(
      () => AppConfigService.querys.one(C.APP_CONFIG_STORAGE_KEY_PRIMARY),
      []
    )
  );

  // 模式
  const mode = useRxQuery<AppConfigDocType>(
    useMemo(
      () => AppConfigService.querys.one(C.APP_CONFIG_STORAGE_KEY_MODE),
      []
    )
  );

  const calcMode = useMemo(() => {
    if (mode) {
      return mode.value === "dark" ? "dark" : "light";
    }

    return prefersDarkMode ? "dark" : "light";
  }, [mode, prefersDarkMode]);

  return useCreateTheme({ primary: primary?.value || "", mode: calcMode });
}
