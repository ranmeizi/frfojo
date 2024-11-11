/* eslint-disable @typescript-eslint/no-unused-expressions */
import { FC, useEffect } from "react";
import { styled } from "@mui/material";
import Garfish from "garfish";

const Root = styled("div")(({ theme }) => ({
  position: "relative",
  height: "100%",
  width: "100%",
}));

type OpendotaProps = {};

const Opendota: FC<OpendotaProps> = (props) => {
  useEffect(() => {
    init();
  }, []);

  async function init() {
    const selector = "#garfish-subapp-opendota-container";
    const rect = getRect(selector);

    const app = await Garfish.loadApp("sub-opendota-app", {
      domGetter: selector,
      entry: `http://${location.hostname}:5181`,
      sandbox: false,
      props: {
        width: rect?.width,
        height: rect?.height,
      },
    });

    if (!app) {
      return;
    }

    console.log("hey dodo", app);

    app.mounted ? app.show() : await app.mount();
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
