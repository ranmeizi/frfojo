import React, { FC } from "react";
import {
  List,
  ListItemButton,
  Menu,
  MenuItem,
  styled,
  popoverClasses,
  listClasses,
  buttonBaseClasses,
  Divider,
} from "@mui/material";
import { Logo } from "@frfojo/components/widgets";
import userMemoSlice from "@/redux/slices/UserMemo";
import { useSelector } from "react-redux";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";

const Root = styled("div")(() => ({
  height: "100%",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  [`.${listClasses.root}`]: {
    paddingTop: 0,
    paddingBottom: 0,
    height: "100%",
    width: "100%",
    background: "transparent",
  },
  [`.${buttonBaseClasses.root}`]: {
    height: "100%",
  },
}));

type LogoMenuProps = {};

const LogoMenu: FC<LogoMenuProps> = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // 用户数据
  const userState = useSelector(userMemoSlice.selectors.root);

  const open = Boolean(anchorEl);
  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSetAccount = (event: React.MouseEvent<HTMLElement>) => {
    console.log(event);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  console.log("userState", userState, handleSetAccount);

  return (
    <Root>
      <List
        component="nav"
        aria-label="Device settings"
        sx={{ bgcolor: "background.paper" }}
      >
        <ListItemButton
          id="lock-button"
          aria-haspopup="listbox"
          aria-controls="lock-menu"
          aria-label="when device is locked"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClickListItem}
        >
          <Logo title="OpenDota" />
          {open ? (
            <CloseIcon sx={{ fontSize: 18 }} />
          ) : (
            <KeyboardArrowDownIcon />
          )}
        </ListItemButton>
      </List>
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "lock-button",
          role: "listbox",
        }}
        sx={{
          [`.${popoverClasses.paper}`]: {
            width: "230px",
          },
        }}
      >
        <InnerMenu onClose={handleClose} />
      </Menu>
    </Root>
  );
};

type InnerMenuProps = {
  onClose: () => void; // 关闭menu
};

function InnerMenu({ onClose }: InnerMenuProps) {
  const userState = useSelector(userMemoSlice.selectors.root);

  const hasAccount = userState.accountId;

  console.log(onClose);

  return (
    <>
      <MenuItem onClick={() => {}}>数据来源opdndota</MenuItem>
      <Divider />
      {hasAccount ? (
        <MenuItem onClick={() => {}}>Set AccountId</MenuItem>
      ) : (
        <MenuItem onClick={() => {}}>Change AccountId</MenuItem>
      )}
    </>
  );
}

export default LogoMenu;
