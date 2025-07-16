/* eslint-disable @typescript-eslint/no-unused-expressions */
import { FC, useEffect, useRef } from "react";
import { styled } from "@mui/material";
import Garfish, { interfaces } from "garfish";
import { useLocation } from "react-router-dom";
import { getPath } from "./utils";

const Root = styled("div")(() => ({
  position: "relative",
  height: "100%",
  width: "100%",
}));

type OpendotaProps = {};

const Opendota: FC<OpendotaProps> = () => {
  const Location = useLocation();

  const appRef = useRef<interfaces.App>();

  useEffect(() => {
    // 每次路由变化时重新加载微前端
    reloadApp();
  }, [Location]);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const selector = "#garfish-subapp-opendota-container";
    const rect = getRect(selector);

    const app = await Garfish.loadApp("sub-opendota-app", {
      domGetter: selector,
      entry: getPath("8011"),
      sandbox: false,
      props: {
        width: rect?.width,
        height: rect?.height,
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
      id="garfish-subapp-opendota-container"
      className="garfish-container"
    ></Root>
  );
};

export default Opendota;

function getRect(selector: string) {
  return document.querySelector(selector)?.getBoundingClientRect();
}
