/* eslint-disable @typescript-eslint/no-unused-expressions */
import { FC, useEffect, useRef } from "react";
import { styled } from "@mui/material";
import Garfish, { interfaces } from "garfish";
import { useLocation } from "react-router-dom";
import { getPath } from "./utils";
import { createPopupBridge } from "@/utils/popupBridge";
import { useUserSelector } from "@/contexts/GlobalStates";

const Root = styled("div")(() => ({
  position: "relative",
  height: "100%",
  width: "100%",
}));

type BoboToolProps = {};

const BoboTool: FC<BoboToolProps> = () => {
  const Location = useLocation();
  const user = useUserSelector();
  const permissions = user.permissions || [];
  const permissionsKey = permissions.join("\0");

  const appRef = useRef<interfaces.App>();

  useEffect(() => {
    // 每次路由变化或权限变更时重新加载微前端
    void reloadApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Location.pathname, permissionsKey]);

  async function init() {
    const selector = "#garfish-subapp-bobotool-container";
    const rect = getRect(selector);

    const app = await Garfish.loadApp("sub-bobotool-app", {
      domGetter: selector,
      entry: getPath("8012"),
      sandbox: false,
      props: {
        width: rect?.width,
        height: rect?.height,
        popupBridge: createPopupBridge(),
        permissions,
        user: {
          ...(user.info || {}),
          permissions,
        },
      },
    });

    if (!app) {
      return;
    }

    app.mounted ? app.show() : await app.mount();
    appRef.current = app;
  }

  async function reloadApp() {
    // 卸载当前微前端应用
    if (appRef.current) {
      await appRef.current.unmount();
    }

    // 重新加载微前端应用
    await init();
  }
  return (
    <Root
      id="garfish-subapp-bobotool-container"
      className="garfish-container"
    ></Root>
  );
};

export default BoboTool;

function getRect(selector: string) {
  return document.querySelector(selector)?.getBoundingClientRect();
}
