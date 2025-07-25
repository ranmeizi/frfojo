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
import { ModalMethodOptions } from "../methods";
import { sleep } from "@frfojo/common/utils/delay";
import AsyncButton from "../../../button/AsyncButton";
import { TransitionProps } from "@mui/material/transitions";
import { useDefaultOptions } from "../useDefaultOptions";
import { PopupPromise } from "../../common";

// 过渡动画
const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Zoom ref={ref} {...props} />;
});

// 确认弹窗
export const ConfirmModal: FC<ModalMethodOptions & PopupPromise> = ({
  resolve,
  reject,
  ...props
}) => {
  const [open, setOpen] = useState(true);

  const options = useDefaultOptions(props);

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
        backdrop: options.mask ? {} : { invisible: true },
      }}
      onClose={(e, reason) => {
        if (reason === "backdropClick" && !options.maskClosable) {
          return;
        }
        close();
      }}
    >
      <DialogTitle>{options.title}</DialogTitle>
      <DialogContent sx={{ width: options.width + "px" }}>
        <DialogContentText>{options.content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <AsyncButton
          {...options.cancelButtonProps}
          loadingPosition="start"
          onClick={handleClick(options.onCancel)}
        >
          {options.cancelText}
        </AsyncButton>
        <AsyncButton
          {...options.okButtonProps}
          loadingPosition="start"
          onClick={handleClick(options.onOk)}
          autoFocus
        >
          {options.okText}
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
};
