import { MenuDocType } from "@/db/schema/Menu.schema";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { forwardRef, useImperativeHandle, useState } from "react";
import * as MenuService from "@/db/services/Menu.service";

type DeleteConfirmProps = {};

export type DeleteConfirmApi = {
  open(data: MenuDocType): void;
};

const DeleteConfirm = forwardRef<DeleteConfirmApi, DeleteConfirmProps>(
  (props, ref) => {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<MenuDocType>();

    useImperativeHandle(ref, () => ({
      open(data: MenuDocType) {
        setData(data);
        setOpen(true);
      },
    }));

    const handleClose = () => {
      setOpen(false);
    };

    const handleDelete = async () => {
      await MenuService.services.deleteMenuById(data!.id);
      setOpen(false);
    };

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"删除"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`确认要删除【${data?.id}】吗?删除之后可就删除了哦!`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleDelete} autoFocus color="error">
            确认
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export default DeleteConfirm;
