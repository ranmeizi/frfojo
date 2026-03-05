/* eslint-disable @typescript-eslint/no-unused-expressions */
import { FC, useEffect, useRef } from "react";
import { styled } from "@mui/material";
import Garfish, { interfaces } from "garfish";
import { useLocation } from "react-router-dom";
import { getPath } from "./utils";
import { createPopupBridge } from "@/utils/popupBridge";
import { context as AppConfigContext } from "@/contexts/AppConfig";
import { useContext } from "react";
import { getToken } from "@frfojo/common/request";
import { useUserSelector } from "@/contexts/GlobalStates";

const Root = styled("div")(() => ({
  position: "relative",
  height: "100%",
  width: "100%",
}));

type UserCenterProps = {};

const UserCenter: FC<UserCenterProps> = () => {
  const Location = useLocation();
  const appRef = useRef<interfaces.App>();
  const appConfig = useContext(AppConfigContext);
  const user = useUserSelector();

  useEffect(() => {
    reloadApp();
  }, [Location]);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const selector = "#garfish-subapp-usercenter-container";
    const rect = getRect(selector);

    const app = await Garfish.loadApp("sub-user-center-app", {
      domGetter: selector,
      entry: getPath("8013"),
      sandbox: false,
      props: {
        width: rect?.width,
        height: rect?.height,
        popupBridge: createPopupBridge(),
        themeMode: appConfig.theme_mode,
        authBridge: {
          getToken: () => getToken(),
          getUser: () => ({
            ...(user.info || {}),
            permissions: user.permissions || [],
          }),
          gotoHostLogin: (redirectUri?: string) => {
            const uri = redirectUri || location.href;
            const redirect_uri = encodeURIComponent(uri);
            const to = `/login?redirect_uri=${redirect_uri}`;
            const nav = (globalThis as any).__FFJ_NAVIGATE__ as
              | ((to: string, opts?: { replace?: boolean }) => void)
              | undefined;
            if (nav) nav(to, { replace: true });
            else location.replace(`${location.origin}${to}`);
          },
        },
      },
    });

    if (!app) return;

    app.mounted ? app.show() : await app.mount();
    appRef.current = app;
  }

  async function reloadApp() {
    if (appRef.current) {
      await appRef.current.unmount();
    }
    await init();
  }

  return (
    <Root
      id="garfish-subapp-usercenter-container"
      className="garfish-container"
    ></Root>
  );
};

export default UserCenter;

function getRect(selector: string) {
  return document.querySelector(selector)?.getBoundingClientRect();
}

