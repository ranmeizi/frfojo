import { ButtonProps } from "@mui/material";
import { ReactNode } from "react";
import { EventBus } from "@frfojo/common/utils";
import { methods, ModalMethodOptions } from "./methods";
import { ConfirmModal } from "./confirm";

export const ModalExpand = {
  __$eb: new EventBus(),
  ...methods,
};

export const Modal = Object.assign(function () {}, ModalExpand);
