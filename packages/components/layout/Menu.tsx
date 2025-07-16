import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { alpha, styled } from "@mui/material";
import { MotionProps } from "framer-motion";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

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
      transition: "0.2s",
      height: "100%",
      display: "flex",
      alignItems: "center",

      ".bar-icon": {
        width: "10px",
        opacity: 0,
        transition: "0.2s",
      },
    },

    "&.active .bar": {
      width: "10px",
      boxShadow: `0 0 2px 2px ${alpha(theme.palette.primary.main, 0.5)}`,
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

  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let observer = null;
    if (sidebar) {
      let el = document.querySelector(".ffj-layout-resize-handle");

      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes") {
            const v = (mutation.target as HTMLElement).getAttribute(
              mutation.attributeName!
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
