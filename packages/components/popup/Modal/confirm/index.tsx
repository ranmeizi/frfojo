import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Zoom,
} from "@mui/material";
import { FC, forwardRef, useCallback, useState } from "react";
import { ModalMethodOptions, ModalPromise } from "../methods";
import { createRoot } from "react-dom/client";
import { sleep } from "@frfojo/common/utils/delay";
import AsyncButton from "../../../button/AsyncButton";
import { TransitionProps } from "@mui/material/transitions";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Zoom ref={ref} {...props} />;
});

export const ConfirmModal: FC<ModalMethodOptions & ModalPromise> = ({
  resolve,
  reject,
  ...props
}) => {
  const [open, setOpen] = useState(true);

  const title = props.title;
  const content = props.content;
  const width = props.width || 416;

  const okText = props.okText || "确认";
  const cancelText = props.cancelText || "取消";

  const onOk = props.onOk || (() => Promise.resolve());
  const onCancel = props.onCancel || (() => Promise.resolve());
  const okButtonProps = props.okButtonProps;

  const mask = props.mask === undefined ? true : props.mask;
  const maskClosable = props.maskClosable || false;
  const cancelButtonProps = props.cancelButtonProps;

  // 关闭函数
  const close = useCallback(async () => {
    setOpen(false);
    // 等待动画结束
    await sleep(300);
    resolve();
  }, []);

  // resolve 正常关闭 reject 不关闭
  const handleClick = (fn: () => Promise<any>) => async () => {
    try {
      await fn();
      await close();
    } catch (e) {
      console.log("has some error?", e);
    }
  };

  return (
    <Dialog
      open={open}
      slots={{
        transition: Transition,
      }}
      slotProps={{
        backdrop: mask ? {} : { invisible: true },
      }}
      onClose={(e, reason) => {
        if (reason === "backdropClick" && !maskClosable) {
          return;
        }
        close();
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ width: width + "px" }}>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <AsyncButton
          {...cancelButtonProps}
          loadingPosition="start"
          onClick={handleClick(onCancel)}
        >
          {cancelText}
        </AsyncButton>
        <AsyncButton
          {...okButtonProps}
          loadingPosition="start"
          onClick={handleClick(onOk)}
          autoFocus
        >
          {okText}
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
};
