import { Box, Button } from "@mui/material";
import createResizeElement from "@frfojo/components/element/createResizeElement";
import { useCallback } from "react";
import { throttle } from "@frfojo/common/utils/delay";
import * as AppConfigService from "@/db/services/AppConfig.service";
import { APP_CONFIG_STORAGE_KEY_MODE } from "@/utils/CONSTANTS";
import MenuLayout from "@frfojo/components/layout/Menu";

const ReDiv = createResizeElement("div");

//
export default function TestLayout() {
  const onResize = useCallback(
    throttle((el) => {
      console.log("external change", el.clientHeight, el.clientWidth);
    }, 50),
    []
  );
  const content = (
    <Box
      sx={(theme) => ({
        padding: theme.spacing(2),
      })}
    >
      content
      <ReDiv onResize={onResize}>
        <textarea name="" id=""></textarea>
        <Button
          onClick={() => {
            AppConfigService.services.setConfig(
              APP_CONFIG_STORAGE_KEY_MODE,
              "light"
            );
          }}
        >
          set light
        </Button>
        <Button
          onClick={() => {
            AppConfigService.services.setConfig(
              APP_CONFIG_STORAGE_KEY_MODE,
              "dark"
            );
          }}
        >
          set dark
        </Button>
      </ReDiv>
    </Box>
  );
  return <MenuLayout content={content} />;
}
