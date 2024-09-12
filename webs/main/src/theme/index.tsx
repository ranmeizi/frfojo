import { colors, ThemeOptions, useMediaQuery } from "@mui/material";
import { useMemo } from "react";
import * as C from "@/utils/CONSTANTS";
import { useRxQuery } from "@/db/hook/useRxQuery";
import * as AppConfigService from "@/db/services/AppConfig.service";
import { AppConfigDocType } from "@/db/schema/AppConfig.schema";

const colorObj: Record<string, any> = {
  amber: colors["amber"],
  blue: colors["blue"],
  blueGrey: colors["blueGrey"],
  brown: colors["brown"],
  cyan: colors["cyan"],
  deepOrange: colors["deepOrange"],
  deepPurple: colors["deepPurple"],
  green: colors["green"],
  grey: colors["grey"],
  indigo: colors["indigo"],
  lightBlue: colors["lightBlue"],
  lightGreen: colors["lightGreen"],
  lime: colors["lime"],
  orange: colors["orange"],
  pink: colors["pink"],
  purple: colors["purple"],
  red: colors["red"],
  teal: colors["teal"],
  yellow: colors["yellow"],
};

export function useCreateTheme(): ThemeOptions {
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

  const theme = useMemo<ThemeOptions>(() => {
    return {
      palette: {
        mode: calcMode,
        ...(primary ? { primary: colorObj[primary.value || "blue"] } : {}),
      },
    };
  }, [primary, calcMode]);

  return theme;
}
