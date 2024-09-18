import { colors, ThemeOptions } from "@mui/material";
import { useMemo } from "react";
import AppDark from "./app/dark";
import AppLight from "./app/light";

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

interface ICreateTheme {
  mode: "dark" | "light";
  primary: keyof typeof colorObj;
}

export function useCreateTheme({ mode, primary }: ICreateTheme): ThemeOptions {
  const theme = useMemo<ThemeOptions>(() => {
    return {
      palette: {
        mode: mode,
        ...(primary ? { primary: colorObj[primary || "blue"] } : {}),
        app: mode === "dark" ? AppDark : AppLight,
      },
    };
  }, [primary, mode]);

  return theme;
}
