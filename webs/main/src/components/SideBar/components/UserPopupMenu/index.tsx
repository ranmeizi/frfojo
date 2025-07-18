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

type UserPopupMenuProps = {
  statusMenuItem: React.ReactElement;
} & PopoverProps;

export default function UserPopupMenu({
  statusMenuItem,
  ...popoverProps
}: UserPopupMenuProps) {
  return (
    <Popover {...popoverProps}>
      <Paper elevation={3}>
        <Box
          sx={(theme) => ({
            padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
          })}
        >
          <Paper elevation={9} sx={{ width: "280px" }}>
            <List dense disablePadding>
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

      <Paper elevation={3}>
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
                <ListItemButton
                  sx={(theme) => ({
                    background: alpha(
                      theme.palette.error[theme.palette.mode],
                      0.5
                    ),
                  })}
                >
                  <ListItemText primary="退出登陆" />
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Paper>
    </Popover>
  );
}
