import { Snackbar } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { MessageMethodOptions } from "./methods";
import { useDefaultOptions } from "./useDefaultOptions";
import { PopupPromise } from "../common";
import { sleep } from "@frfojo/common/utils/delay";

const SuccessMessage: FC<MessageMethodOptions & PopupPromise> = function ({
  resolve,
  reject,
  ...props
}) {
  const { enqueueSnackbar } = useSnackbar();

  const options = useDefaultOptions(props);

  useEffect(() => {
    enqueueSnackbar(options.content, {
      variant: "success",
      autoHideDuration: options.duration * 1000,
      anchorOrigin: { vertical: "top", horizontal: "center" },
      onClose: async () => {
        options?.onClose();
        await sleep(300);
        resolve();
      },
    });
  }, []);

  return null;
};

export { SuccessMessage };
