import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Modal,
  Zoom,
} from "@mui/material";
import { TransitionProps } from "notistack";
import {
  cloneElement,
  forwardRef,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { ModalProps } from "../../popup";
import { useDefaultOptions } from "../../popup/Modal/useDefaultOptions";
import BoForm from "../BoForm";

type ModalFormProps = {
  /** 用于触发 Modal 打开的 dom，一般是 button */
  trigger?: ReactNode;
  /** 是否打开 */
  open?: boolean;
  /** visible 改变时触发 */
  onOpenChange?: (open: boolean) => void;
  /** 弹框的标题 */
  title?: string;
  /** 弹框的宽度 */
  width?: number;
  /** 提交数据时触发，如果返回一个 true。会关掉抽屉，如果配置了 destroyOnClose 还会重置表单。 */
  onSubmit?: (values: any) => Promise<boolean>;
  /**
   * Modal 的 props
   */
  modalProps?: ModalProps;
};

// 过渡动画
const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Zoom ref={ref} {...props} />;
});

export function ModalForm({
  modalProps = {},
  children,
  ...props
}: PropsWithChildren<ModalFormProps>) {
  const [open, setOpen] = useState(false);

  const options = useDefaultOptions({
    ...(modalProps || {}),
    title: props.title,
    okText: modalProps.okText || "提交",
  });

  useEffect(() => {
    if (typeof props.open === "boolean") {
      setOpen(props.open);
    }
  }, [props.open]);

  const dialog = (
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
      {open ? (
        <BoForm
          onSubmit={async (values) => {
            const res = (await props?.onSubmit?.(values)) || true;
            setOpen(false);
            return res;
          }}
        >
          {({ state }) => (
            <>
              <DialogContent
                sx={{ width: props.width || options.width + "px" }}
              >
                <DialogContentText>{children}</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  {...options.cancelButtonProps}
                  loadingPosition="start"
                  onClick={() => setOpen(false)}
                  disabled={state.loading}
                >
                  {options.cancelText}
                </Button>
                <Button
                  {...options.okButtonProps}
                  loadingPosition="start"
                  loading={state.loading}
                  autoFocus
                  type="submit"
                >
                  {options.okText}
                </Button>
              </DialogActions>
            </>
          )}
        </BoForm>
      ) : null}
    </Dialog>
  );

  return props.trigger ? (
    <>
      {cloneElement(props.trigger, {
        onClick: () => {
          setOpen(true);
        },
      })}
      {dialog}
    </>
  ) : (
    dialog
  );
}
