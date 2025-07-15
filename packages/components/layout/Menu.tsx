import { FC, ReactNode } from "react";
import { styled } from "@mui/material";
import { MotionProps } from "framer-motion";

const HEADER_HEIGHT = 48;
const SIDEBAR_WIDTH = 235;

function topShadow(): {
  "&::after": React.CSSProperties;
  position: "relative";
  overflow: "auto";
} {
  return {
    position: "relative",
    overflow: "auto",
    "&::after": {
      position: "absolute",
      left: 0,
      top: 0,
      height: 0,
      width: "100%",
      content: '""',
      boxShadow: "0px 0px 5px 1px #000",
    },
  };
}

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  flex: 1,
  height: "100%",
  width: "100%",

  ".ffj-layout-menu__sidebar": {
    width: SIDEBAR_WIDTH + "px",
    display: "flex",
    flexDirection: "column",
    background: theme.palette.app?.app_pager_menu,

    ".ffj-layout-menu__logo": {
      height: HEADER_HEIGHT + "px",
      display: "flex",
      alignItems: "center",
      // borderBottom: `1px solid ${theme.palette.divider}`,
    },
    ".ffj-layout-menu__menu": {
      flex: 1,
      ...topShadow(),
    },
  },

  ".ffj-layout-menu__content": {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: theme.palette.app?.app_paper_content,

    ".ffj-layout-menu__header": {
      height: HEADER_HEIGHT + "px",
      display: "flex",
      alignItems: "center",
      // borderBottom: `1px solid ${theme.palette.divider}`,
    },
    ".ffj-layout-menu__view": {
      height: `calc(100% - ${HEADER_HEIGHT}px)`,
      maxHeight: `calc(100% - ${HEADER_HEIGHT}px)`,
      overflowY: "auto",
      ...topShadow(),
    },
  },
}));

export const transition: MotionProps["transition"] = {
  duration: 0.3,
};

type MenuLayoutProps = {
  logo?: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  content?: ReactNode;
  children?: ReactNode;
};

const MenuLayout: FC<MenuLayoutProps> = ({
  logo,
  header,
  sidebar,
  content,
  children,
}) => {
  if (children) {
    content = children;
  }

  return (
    <Root>
      {sidebar ? (
        <div className="ffj-layout-menu__sidebar">
          {/* logo */}
          <div className="ffj-layout-menu__logo" data-tauri-drag-region>
            {logo}
          </div>
          {/* sidebar */}
          <div className="ffj-layout-menu__menu">{sidebar}</div>
        </div>
      ) : null}

      <div className="ffj-layout-menu__content">
        {/* header */}
        <div className="ffj-layout-menu__header" data-tauri-drag-region>
          {header}
        </div>
        {/* content */}
        <div className="ffj-layout-menu__view">{content}</div>
      </div>
    </Root>
  );
};

export default MenuLayout;
