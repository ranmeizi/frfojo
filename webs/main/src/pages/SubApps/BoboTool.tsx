/* eslint-disable @typescript-eslint/no-unused-expressions */
import { FC, useEffect } from "react";
import { styled } from "@mui/material";
import Garfish from "garfish";

const Root = styled("div")(() => ({
  position: "relative",
  height: "100%",
  width: "100%",
}));

type BoboToolProps = {};

const BoboTool: FC<BoboToolProps> = () => {
  useEffect(() => {
    init();
  }, []);

  async function init() {
    const selector = "#garfish-subapp-bobotool-container";
    const rect = getRect(selector);

    const app = await Garfish.loadApp("sub-bobotool-app", {
      domGetter: selector,
      entry: `http://${location.hostname}:8012`,
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
