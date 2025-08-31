import { useUserSelector } from "@/contexts/GlobalStates";
import { Logo, message, Modal } from "@frfojo/components";
import {
  alpha,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Popover,
  PopoverProps,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import ChangePasswordModalForm from "../ChangePasswordModalForm";
import { changePassword } from "@/services/base";

type UserPopupMenuProps = {
  statusMenuItem: React.ReactElement;
} & PopoverProps;

export default function UserPopupMenu({
  statusMenuItem,
  ...popoverProps
}: UserPopupMenuProps) {
  const navigate = useNavigate();

  const user = useUserSelector();

  const isLogin = !!user.info;

  function handleLogout() {
    Modal.confirm({
      title: "退出登陆",
      content: "确定要退出登陆吗?",
      okButtonProps: {
        color: "error",
      },
      async onOk() {
        user.clearUser();
        navigate("/login");
      },
    });
  }

  function handleLogin() {
    navigate("/login");
  }

  async function onChangePasswordSubmit(data: any) {
    const res = await changePassword(data);

    if (res.code === "000000") {
      message.success(res.msg);
      return true;
    } else {
      message.error(res.msg);
      return false;
    }
  }

  return (
    <Popover {...popoverProps}>
      {isLogin ? (
        <div>这里放用户卡片哦</div>
      ) : (
        <Box sx={{ padding: 2 }}>
          <Box textAlign="center">
            <Logo title="Boboan.net"></Logo>
          </Box>
          <Paper elevation={3}>
            <Box
              sx={(theme) => ({
                marginTop: 2,
                padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
                fontSize: "12px",
              })}
            >
              <Box>开发中...</Box>
              <Box>开发点什么呢...</Box>
              <Box>我也不知道...</Box>
              <Box>总之你可以注册一个...</Box>
            </Box>
          </Paper>
        </Box>
      )}
      {isLogin ? (
        <Paper elevation={3}>
          <Box
            sx={(theme) => ({
              padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
            })}
          >
            <Paper elevation={9} sx={{ width: "280px" }}>
              <List dense disablePadding>
                <ListItem disablePadding>
                  <ChangePasswordModalForm
                    onSubmit={onChangePasswordSubmit}
                    trigger={
                      <ListItemButton>
                        <ListItemText primary="修改密码" />
                      </ListItemButton>
                    }
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="编辑资料" />
                  </ListItemButton>
                </ListItem>
                {statusMenuItem}
              </List>
            </Paper>
          </Box>
        </Paper>
      ) : null}

      <Paper elevation={3} sx={{ paddingBottom: 2, paddingTop: 2 }}>
        <Box
          sx={(theme) => ({
            padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
          })}
        >
          <Paper elevation={9} sx={{ width: "280px" }}>
            <List dense disablePadding>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText primary="关于 Boboan.net" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText primary="强制更新" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                {isLogin ? (
                  <ListItemButton
                    onClick={handleLogout}
                    sx={(theme) => ({
                      background: alpha(
                        theme.palette.error[theme.palette.mode],
                        0.5
                      ),
                    })}
                  >
                    <ListItemText primary="退出登录" />
                  </ListItemButton>
                ) : (
                  <ListItemButton
                    onClick={handleLogin}
                    sx={(theme) => ({
                      background: alpha(
                        theme.palette.success[theme.palette.mode],
                        0.5
                      ),
                    })}
                  >
                    <ListItemText primary="去登录" />
                  </ListItemButton>
                )}
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Paper>
    </Popover>
  );
}
