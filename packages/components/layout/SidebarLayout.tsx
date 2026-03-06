import React, { PropsWithChildren, ReactNode } from "react";
import { Box, Divider, SxProps, Theme } from "@mui/material";

export type SidebarLayoutProps = PropsWithChildren<{
  header?: ReactNode;
  footer?: ReactNode;
  /**
   * 是否在 header 与 body 之间插入 Divider
   * 默认：header 存在时插入
   */
  divider?: boolean;
  /** Root 容器样式 */
  sx?: SxProps<Theme>;
  /** header 容器样式 */
  headerSx?: SxProps<Theme>;
  /** body（可滚动区域）样式 */
  bodySx?: SxProps<Theme>;
  /** footer 容器样式 */
  footerSx?: SxProps<Theme>;
}>;

export function SidebarLayout({
  header,
  footer,
  divider,
  sx,
  headerSx,
  bodySx,
  footerSx,
  children,
}: SidebarLayoutProps) {
  const showDivider = divider ?? Boolean(header);
  return (
    <Box
      sx={[
        {
          height: "100%",
          maxHeight: "100dvh",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {header ? <Box sx={headerSx}>{header}</Box> : null}
      {showDivider && header ? <Divider /> : null}
      <Box
        sx={[
          {
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
          },
          ...(Array.isArray(bodySx) ? bodySx : bodySx ? [bodySx] : []),
        ]}
      >
        {children}
      </Box>
      {footer ? <Box sx={footerSx}>{footer}</Box> : null}
    </Box>
  );
}

