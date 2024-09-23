import React, { FC } from "react";
import {
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  styled,
  listClasses,
  buttonBaseClasses,
  popoverClasses,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  [`.${listClasses.root}`]: {
    paddingTop: 0,
    paddingBottom: 0,
    height: "100%",
    background: "transparent",
  },
  [`.${buttonBaseClasses.root}`]: {
    height: "100%",
  },
}));

type LogoCompProps = {};

const options = [
  "小布丁",
  "沙皇枣",
  "沙冰",
  "百乐宝",
  "绿舌头",
  "绿豆沙",
  "红豆沙",
];

const LogoComp: FC<LogoCompProps> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const open = Boolean(anchorEl);
  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setSelectedIndex(index);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
          <ListItemText
            primary={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", fontSize: "14px" }}>
                  先根冰棍儿吧:
                  <Typography color="primary" fontSize={14}>
                    {options[selectedIndex]}
                  </Typography>
                </Box>
                {open ? (
                  <CloseIcon sx={{ fontSize: 18 }} />
                ) : (
                  <KeyboardArrowDownIcon />
                )}
              </Box>
            }
          />
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
        {options.map((option, index) => (
          <MenuItem
            key={option}
            disabled={index === selectedIndex}
            selected={index === selectedIndex}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {option}
          </MenuItem>
        ))}

        <Divider />

        <MenuItem
          onClick={(event) => alert("啊?")}
          sx={(theme) => ({ color: theme.palette.error.main })}
        >
          不好吃,差评
        </MenuItem>
      </Menu>
    </Root>
  );
};

export default LogoComp;
