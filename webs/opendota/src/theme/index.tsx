import { useMediaQuery } from "@mui/material";
import { useCreateTheme } from "@frfojo/common/theme";

export function useAppTheme() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return useCreateTheme({
    primary: "blue",
    mode: prefersDarkMode ? "dark" : "light",
  });
}
