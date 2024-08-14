import { colors, ThemeOptions, useMediaQuery } from "@mui/material";
import * as DaoAppConfig from "@/db/dao/AppConfig";
import { useRxState } from "@/db/hook/useRxState";
import { useMemo } from "react";
import * as C from "@/utils/CONSTANTS";

const colorObj = {
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
  const primary = useRxState(
    DaoAppConfig.Observers.get_config(C.APP_CONFIG_STORAGE_KEY_PRIMARY)
  ) as unknown as { value: keyof typeof colorObj };
  const mode = useRxState(
    DaoAppConfig.Observers.get_config(C.APP_CONFIG_STORAGE_KEY_MODE)
  );

  const theme = useMemo<ThemeOptions>(() => {
    return {
      palette: {
        mode: mode ? mode.value : prefersDarkMode ? "dark" : "light",
        ...(primary ? { primary: colorObj[primary?.value || "blue"] } : {}),
      },
    };
  }, [primary, mode, prefersDarkMode]);
  return theme;
}
