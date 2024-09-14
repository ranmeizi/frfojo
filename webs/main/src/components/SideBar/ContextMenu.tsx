import { FC, PropsWithChildren, useMemo, useRef, useState } from "react";
import { Divider, ListItem, Menu, MenuItem, styled } from "@mui/material";
import { MenuDocType } from "@/db/schema/Menu.schema";
import { useRxQuery } from "@/db/hook/useRxQuery";
import * as MenuService from "@/db/services/Menu.service";
import DeleteConfirm, { DeleteConfirmApi } from "./DeleteConfirm";

const Root = styled("div")(({ theme }) => ({}));

type ContextMenuProps = {};

const ContextMenu: FC<PropsWithChildren<ContextMenuProps>> = ({ children }) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    itemId: string;
  } | null>(null);

  const delDialog = useRef<DeleteConfirmApi>(null);

  // menu 数据
  const menu =
    useRxQuery<MenuDocType, "list">(
      useMemo(() => MenuService.querys.menu(), [])
    ) || [];

  const data = useMemo(() => {
    if (!contextMenu) {
      return undefined;
    }
    return menu.find((item) => item.id === contextMenu.itemId);
  }, [contextMenu]);

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    const root = e.currentTarget;

    function getItemIdFromElement(el: HTMLElement) {
      // 无了
      if (el === root) {
        return undefined;
      }

      // 找一找 我会在 Item/Folder 组件中 添加.storage-item 类 以及 data-id 作为数据索引
      if (el.classList.contains("storage-item") && el.dataset) {
        const id = el.dataset.id || "";
        if (menu.find((item) => item.id === id)) {
          return id;
        }
      }

      return getItemIdFromElement(el.parentElement!); // 一定有的
    }

    const id = getItemIdFromElement(e.target as any);

    if (id) {
      // 打开
      setContextMenu({
        mouseX: e.clientX + 24,
        mouseY: e.clientY - 6,
        itemId: id,
      });
    }
  };

  const handleDelete = () => {
    const d = { ...data! };
    // 二次确认
    delDialog.current?.open(d);

    handleClose();
  };

  const menuList = useMemo(() => {
    console.log("da", data);
    if (!data) {
      return null;
    }

    if (data.type === "folder") {
      return (
        <>
          <ListItem>Hi,我是文件夹</ListItem>
          <Divider />
          <MenuItem onClick={handleClose}>选项1</MenuItem>
          <MenuItem onClick={handleClose}>选项2</MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>还没想好</MenuItem>
          <MenuItem onClick={handleClose}>可以做什么</MenuItem>
          <Divider />
          <MenuItem
            onClick={handleDelete}
            sx={(theme) => ({ color: theme.palette.error.main })}
          >
            测试删除!
          </MenuItem>
        </>
      );
    }

    if (data.type === "item") {
      return (
        <>
          <ListItem>Hi,我是图标</ListItem>
          <Divider />
          <MenuItem onClick={handleClose}>选项1</MenuItem>
          <MenuItem onClick={handleClose}>选项2</MenuItem>
          <Divider />
          <MenuItem
            onClick={handleDelete}
            sx={(theme) => ({ color: theme.palette.error.main })}
          >
            删除
          </MenuItem>
        </>
      );
    }

    if (data.type === "item_sub-app") {
      return (
        <>
          <ListItem>Hi,我是子应用</ListItem>
          <Divider />
          <MenuItem onClick={handleClose}>选项1</MenuItem>
          <MenuItem onClick={handleClose}>选项2</MenuItem>
          <Divider />
          <MenuItem onClick={handleDelete}>删除</MenuItem>
        </>
      );
    }

    return null;
  }, [data]);

  return (
    <Root onContextMenu={handleContextMenu}>
      {children}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {menuList}
      </Menu>
      <DeleteConfirm ref={delDialog}></DeleteConfirm>
    </Root>
  );
};

export default ContextMenu;
