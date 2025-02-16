import { FC } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  Typography,
} from "@mui/material";

const Root = styled("div")(({ theme }) => ({}));

type MenuProps = {
  value: number;
  onChange: (val: number) => void;
};

const Menu: FC<MenuProps> = ({ value, onChange }) => {
  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    onChange(index);
  };
  return (
    <Root>
      <nav aria-label="main mailbox folders">
        <List>
          <ListItemText sx={{ marginLeft: "4px" }} secondary="使用" />
          <ListItem disablePadding>
            <ListItemButton
              selected={0 === value}
              onClick={(event) => handleListItemClick(event, 0)}
            >
              <ListItemText primary="开始合成大波利" />
            </ListItemButton>
          </ListItem>
        </List>
      </nav>
      <Divider />
      <nav aria-label="secondary mailbox folders">
        <List>
          <ListItemText sx={{ marginLeft: "4px" }} secondary="说明" />
          <ListItem disablePadding>
            <ListItemButton
              selected={1 === value}
              onClick={(event) => handleListItemClick(event, 1)}
            >
              <ListItemText primary="生命体方式" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={2 === value}
              onClick={(event) => handleListItemClick(event, 2)}
            >
              <ListItemText primary="AHK全自动" />
            </ListItemButton>
          </ListItem>
          {/* <ListItem disablePadding disabled>
            <ListItemButton
              selected={2 === value}
              onClick={(event) => handleListItemClick(event, 2)}
            >
              <ListItemText primary="ocr方式" />
            </ListItemButton>
          </ListItem> */}
          {/* <ListItem disablePadding>
            <ListItemButton
              selected={3 === value}
              onClick={(event) => handleListItemClick(event, 3)}
            >
              <ListItemText primary="开发者" />
            </ListItemButton>
          </ListItem> */}
        </List>
      </nav>
    </Root>
  );
};

export default Menu;
