import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Zoom,
} from "@mui/material";
import { FC, forwardRef, useCallback, useState } from "react";
import { ModalMethodOptions } from "../methods";
import { sleep } from "@frfojo/common/utils/delay";
import { TransitionProps } from "@mui/material/transitions";
import { useDefaultOptions } from "../useDefaultOptions";
import { PopupPromise } from "../../common";
import { AsyncButton } from "../../../button";

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
      {/**
       * MUI DialogContent 默认 flex:1 + overflowY:auto，会在内容区单独出滚动条；
       * 复杂内容用 DialogContentText（p）也不合法。改为块级容器 + 取消内容区独立滚动，
       * 超出时由外层 Paper 的 overflow 统一处理（整条弹窗一条滚动条，或内容不足时不出现）。
       */}
      <DialogContent
        sx={{
          width: options.width + "px",
          maxWidth: "100%",
          flex: "0 0 auto",
          overflowY: "visible",
        }}
      >
        <Box component="div">{options.content}</Box>
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
