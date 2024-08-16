import { colors, styled, Box } from "@mui/material";
import React, { PropsWithChildren } from "react";

type AppLayoutProps = {
  sidebar: React.ReactNode;
};

const StyledRoot = styled("div")(({ theme }) => ({
  height: "100vh",
  width: "100vw",
  display: "flex",
  background: colors.grey["900"],
  paddingLeft: "70px",

  ".ffj-layout-app__sidebar": {
    background: theme.palette.background.paper,
    height: "100%",
    width: "70px",
    paddingTop: (window as any).__TAURI__ ? "30px" : 0,
    position: "fixed",
    left: 0,
    top: 0,
  },
}));

export function LayoutApp({
  sidebar,
  children,
}: PropsWithChildren<AppLayoutProps>) {
  return (
    <StyledRoot className="ffj-layout-app">
      {/* 左边栏 */}
      <div className="ffj-layout-app__sidebar" data-tauri-drag-region="">
        {sidebar}
      </div>
      {/* 右边 */}
      <div className="ffj-layout-app__content">{children}</div>
    </StyledRoot>
  );
}
