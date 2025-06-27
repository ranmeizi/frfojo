import {
  AppBar,
  Box,
  createTheme,
  CssBaseline,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  styled,
  Tab,
  Tabs,
  ThemeProvider,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MoreIcon from "@mui/icons-material/MoreVert";
import { useEffect, useMemo, useState } from "react";
import Ranking from "./views/ranking";
import Search from "./views/search";
import Group from "./views/group";
import { LayoutMenu } from "@frfojo/components/layout";

const StyledFab = styled(Fab)({
  position: "absolute",
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: "0 auto",
});

export default function MomoIngameNews() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const [active, setActive] = useState(0);

  const view = useMemo(() => {
    switch (active) {
      case 0:
        return <Search />;
      case 1:
        return <Ranking />;
      case 2:
        return <Group />;
      default:
        return "empty";
    }
  }, [active]);

  function getSerch() {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");

    if (type === "search") {
      setActive(0);
    } else if (type === "ranking") {
      setActive(1);
    }
  }

  useEffect(() => {
    getSerch();
  }, []);

  const sidebar = (
    <List>
      <ListItem disablePadding>
        <ListItemButton selected={active === 0} onClick={() => setActive(0)}>
          <ListItemText primary="数据查询" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton selected={active === 1} onClick={() => setActive(1)}>
          <ListItemText primary="掉落排名" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton selected={active === 2} onClick={() => setActive(2)}>
          <ListItemText primary="掉落统计" />
        </ListItemButton>
      </ListItem>
    </List>
  );

  return (
    <LayoutMenu
      sidebar={sidebar}
      logo={
        <Box display="flex" alignItems="center">
          <Typography
            variant="h6"
            gutterBottom
            component="div"
            sx={{ p: 0, m: 0, ml: 2, fontSize: 16 }}
          >
            IngameNews 小助手
          </Typography>
        </Box>
      }
    >
      <Box sx={{ height: "100%", overflowY: "auto" }}>
        <Box sx={{ padding: 2, pb: "64px" }}>{view}</Box>
      </Box>
    </LayoutMenu>
  );
}
