import { styled } from "@mui/material";
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

  ".ffj-layout-app": {
    paddingLeft: "70px",
    display: "flex",
    height: "100%",
    width: "100%",
  },

  ".ffj-layout-app__sidebar": {
    background: theme.palette.app?.app_paper_sidebar,
    height: "100%",
    width: "70px",
    paddingTop: (window as any).__TAURI__ ? "30px" : 0,
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 1000,
  },

  ".ffj-layout-app__content": {
    background: theme.palette.app?.app_paper_content,
    width: "100%",
    height: "100%",
    display: "flex",
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
