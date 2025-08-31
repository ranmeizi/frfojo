import { FC, useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  styled,
} from "@mui/material";
import StatusBadge, { EnumStatus } from "./components/StatusBadge";
import UserPopupMenu from "./components/UserPopupMenu";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useGlobalStates } from "@/contexts/GlobalStates";

const Root = styled(Box)(() => ({}));

type UserSettingProps = {};

const UserSetting: FC<UserSettingProps> = () => {
  const [status, setStatus] = useState(EnumStatus.OFFLINE);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const { user } = useGlobalStates();

  const [statusAnchorEl, setStatusAnchorEl] =
    useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
  };

  const onStatusChange = (status: EnumStatus) => () => {
    setStatus(status);
    handleStatusClose();
  };

  const statusMenuItem = (
    <ListItem disablePadding>
      <ListItemButton onClick={(e) => handleStatusClick(e as any)}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <ListItemText primary="在线" />
          <KeyboardArrowRightIcon />
        </Box>
      </ListItemButton>
      <Menu
        anchorEl={statusAnchorEl}
        open={!!statusAnchorEl}
        onClose={handleStatusClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        slotProps={{ list: { dense: true, disablePadding: true } }}
      >
        <MenuItem
          selected={EnumStatus.ONLINE === status}
          onClick={onStatusChange(EnumStatus.ONLINE)}
        >
          在线
        </MenuItem>
        <MenuItem
          selected={EnumStatus.BUSY === status}
          onClick={onStatusChange(EnumStatus.BUSY)}
        >
          繁忙
        </MenuItem>
        <MenuItem
          selected={EnumStatus.DO_NOT_DISTURB === status}
          onClick={onStatusChange(EnumStatus.DO_NOT_DISTURB)}
        >
          免打扰
        </MenuItem>
        <MenuItem
          selected={EnumStatus.OFFLINE === status}
          onClick={onStatusChange(EnumStatus.OFFLINE)}
        >
          离线
        </MenuItem>
      </Menu>
    </ListItem>
  );

  return (
    <Root>
      <IconButton onClick={handleClick}>
        <StatusBadge
          type={status}
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
        >
          <Avatar alt="Ranmz" src={user?.info?.picture} />
        </StatusBadge>
      </IconButton>

      <UserPopupMenu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        statusMenuItem={statusMenuItem}
      />
    </Root>
  );
};

export default UserSetting;
