import { Box, Divider, Button } from "@mui/material";
import createResizeElement from "@frfojo/components/element/createResizeElement";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { throttle } from "@frfojo/common/utils/delay";
import * as AppConfigService from "@/db/services/AppConfig.service";
import { APP_CONFIG_STORAGE_KEY_MODE } from "@/utils/CONSTANTS";

const ReDiv = createResizeElement("div");

//
export default function TestLayout() {
  const onResize = useCallback(
    throttle((el) => {
      console.log("external change", el.clientHeight, el.clientWidth);
    }, 50),
    []
  );

  return (
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
}
