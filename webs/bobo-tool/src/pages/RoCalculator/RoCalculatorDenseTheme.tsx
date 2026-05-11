import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { type FC, type ReactNode, useMemo } from "react";

/**
 * 仅作用于 RO 计算器子树：略小于 MUI 默认 `size="small"` 的下拉、描边输入与勾选框，
 * 一屏可排更多控件；不影响站点的其它页面。
 */
const RoCalculatorDenseTheme: FC<{ children: ReactNode }> = ({ children }) => {
  const outer = useTheme();
  const dense = useMemo(
    () =>
      createTheme(outer, {
        components: {
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                fontSize: "0.8125rem",
                lineHeight: 1.35,
              },
              input: ({ ownerState }) =>
                ownerState.size === "small"
                  ? {
                      paddingTop: 5.5,
                      paddingBottom: 5.5,
                      paddingLeft: 10,
                      paddingRight: 10,
                    }
                  : undefined,
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: ({ ownerState }) =>
                ownerState.size === "small"
                  ? {
                      fontSize: "0.8125rem",
                      lineHeight: 1.2,
                    }
                  : undefined,
            },
          },
          MuiSelect: {
            styleOverrides: {
              icon: {
                fontSize: "1.15rem",
                right: 5,
              },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                fontSize: "0.8125rem",
                minHeight: 30,
                paddingTop: 3,
                paddingBottom: 3,
              },
            },
          },
          MuiCheckbox: {
            defaultProps: {
              size: "small",
            },
            styleOverrides: {
              root: {
                padding: 4,
                "& .MuiSvgIcon-root": {
                  fontSize: "1.05rem",
                },
              },
            },
          },
        },
      }),
    [outer],
  );
  return <ThemeProvider theme={dense}>{children}</ThemeProvider>;
};

export default RoCalculatorDenseTheme;
