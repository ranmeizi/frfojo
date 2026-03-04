import { FC, ReactNode, useEffect, useState } from "react";
import {
  alpha,
  Box,
  Drawer,
  IconButton,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { MotionProps } from "framer-motion";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const HEADER_HEIGHT = 48;
const SIDEBAR_WIDTH = () => {
  return (235 / (window.innerWidth - 70)) * 100;
};

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

const Root = styled(PanelGroup)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  flex: 1,
  height: "100%",
  width: "100%",

  ".ffj-layout-menu__sidebar": {
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

  ".ffj-layout-resize-handle": {
    width: "1px",
    background: "rgba(44,44,44,.4)",
    position: "relative",
    display: "flex",
    justifyContent: "center",

    ".bar": {
      position: "absolute",
      width: "1px",
      background: "rgba(44,44,44,.4)",
      transition: "0.3s",
      height: "100%",
      display: "flex",
      alignItems: "center",
      transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",

      ".bar-icon": {
        width: "10px",
        opacity: 0,
        transition: "0.3s",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },

    "&.active .bar": {
      width: "10px",
      boxShadow: `0 0 2px 2px ${alpha(theme.palette.primary.main, 0.4)}`,
      background: alpha(theme.palette.primary.main, 0.2),
      borderRadius: "2px",

      ".bar-icon": {
        opacity: 1,
      },
    },

    // "&.dragging": {
    //   ".bar-icon": {
    //     color: theme.palette.primary,
    //   },
    // },
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

const MobileRoot = styled("div")(({ theme }) => ({
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  background: theme.palette.app?.app_paper_content,

  ".ffj-layout-menu__mobile-header": {
    height: HEADER_HEIGHT + "px",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.25)}`,
    background: alpha(theme.palette.common.black, 0.06),
  },

  ".ffj-layout-menu__mobile-header-content": {
    flex: 1,
    minWidth: 0,
    height: "100%",
    display: "flex",
    alignItems: "center",
  },

  ".ffj-layout-menu__mobile-view": {
    flex: 1,
    minHeight: 0,
    ...topShadow(),
  },

  ".ffj-layout-menu__mobile-drawer-paper": {
    width: 280,
    maxWidth: "85vw",
    background: theme.palette.app?.app_pager_menu,
    display: "flex",
    flexDirection: "column",
  },

  ".ffj-layout-menu__mobile-drawer-header": {
    height: HEADER_HEIGHT + "px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },

  ".ffj-layout-menu__mobile-drawer-body": {
    flex: 1,
    minHeight: 0,
    ...topShadow(),
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
  widthAutoSaveId?: string;
};

const MenuLayout: FC<MenuLayoutProps> = ({
  logo,
  header,
  sidebar,
  content,
  children,
  widthAutoSaveId,
}) => {
  if (children) {
    content = children;
  }

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    console.log("isMobile", isMobile);
    if (!isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    let observer = null;
    if (!isMobile && sidebar) {
      let el = document.querySelector(".ffj-layout-resize-handle");

      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes") {
            const v = (mutation.target as HTMLElement).getAttribute(
              mutation.attributeName!,
            );
            setHover(v === "hover");
          }
        });
      });

      observer.observe(el!, {
        attributes: true, // 监听属性变化
        attributeFilter: ["data-resize-handle-state"], // 可选，只监听指定属性
      });
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [sidebar]);

  if (isMobile) {
    return (
      <MobileRoot>
        {/* mobile top bar */}
        <div className="ffj-layout-menu__mobile-header" data-tauri-drag-region>
          {sidebar ? (
            <IconButton
              size="small"
              onClick={() => setDrawerOpen(true)}
              sx={{ color: alpha(theme.palette.text.primary, 0.8) }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          ) : null}

          <div
            className="ffj-layout-menu__mobile-header-content"
            data-tauri-drag-region
          >
            {header || logo}
          </div>
        </div>

        {/* content */}
        <div className="ffj-layout-menu__mobile-view">{content}</div>

        {/* sidebar drawer */}
        {sidebar ? (
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
              className: "ffj-layout-menu__mobile-drawer-paper" as any,
            }}
          >
            <div
              className="ffj-layout-menu__mobile-drawer-header"
              data-tauri-drag-region
            >
              <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                {logo}
              </Box>
              <IconButton
                size="small"
                onClick={() => setDrawerOpen(false)}
                sx={{ color: alpha(theme.palette.text.primary, 0.8) }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
            <div className="ffj-layout-menu__mobile-drawer-body">{sidebar}</div>
          </Drawer>
        ) : null}
      </MobileRoot>
    );
  }

  return (
    <Root autoSaveId={widthAutoSaveId} direction="horizontal">
      {sidebar ? (
        <>
          <Panel
            defaultSize={SIDEBAR_WIDTH()}
            minSize={SIDEBAR_WIDTH()}
            maxSize={SIDEBAR_WIDTH() * 2}
            className="ffj-layout-menu__sidebar"
          >
            {/* logo */}
            <div className="ffj-layout-menu__logo" data-tauri-drag-region>
              {logo}
            </div>
            {/* sidebar */}
            <div className="ffj-layout-menu__menu">{sidebar}</div>
          </Panel>
          <PanelResizeHandle
            className={`ffj-layout-resize-handle ${
              hover || dragging ? "active" : ""
            } ${dragging ? "dragging" : ""}`}
            onDragging={(isDragging) => {
              setDragging(isDragging);
            }}
          >
            <div className="bar">
              <DragIndicatorIcon
                className="bar-icon"
                color={dragging ? "primary" : "inherit"}
              />
            </div>
          </PanelResizeHandle>
        </>
      ) : null}

      <Panel className="ffj-layout-menu__content">
        {/* header */}
        <div className="ffj-layout-menu__header" data-tauri-drag-region>
          {header}
        </div>
        {/* content */}
        <div className="ffj-layout-menu__view">{content}</div>
      </Panel>
    </Root>
  );
};

export default MenuLayout;
