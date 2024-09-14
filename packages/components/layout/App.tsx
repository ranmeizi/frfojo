import { colors, styled, Box } from "@mui/material";
import React, { PropsWithChildren } from "react";

type AppLayoutProps = {
  header?: React.ReactNode;
  sidebar: React.ReactNode;
};

const StyledRoot = styled("div")(({ theme }) => ({
  height: "100vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  background: colors.grey["900"],

  ".ffj-layout-app": {
    paddingLeft: "70px",
    display: "flex",
  },

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
  header,
  children,
}: PropsWithChildren<AppLayoutProps>) {
  return (
    <StyledRoot>
      {/* 头部 */}
      {header}
      <div className="ffj-layout-app">
        {/* 左边栏 */}
        <div className="ffj-layout-app__sidebar" data-tauri-drag-region>
          {sidebar}
        </div>
        {/* 右边 */}
        <div className="ffj-layout-app__content">{children}</div>
      </div>
    </StyledRoot>
  );
}
