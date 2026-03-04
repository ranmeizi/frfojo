import { methods, MessageMethodOptions, rawMessageMethods } from "./methods";
import { SnackbarProvider } from "notistack";

export const message = {
  ...methods,
};

export { SnackbarProvider };

export { rawMessageMethods };
