import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Ranking from "./views/ranking";
import Search from "./views/search";
import Group from "./views/group";
import { LayoutMenu } from "@frfojo/components";
import Spawning from "./views/spawning";

export default function MomoIngameNews() {
  const [active, setActive] = useState(0);

  const view = useMemo(() => {
    switch (active) {
      case 0:
        return <Search />;
      case 1:
        return <Ranking />;
      case 2:
        return <Group />;
      case 3:
        return <Spawning />;
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
      <ListItem disablePadding>
        <ListItemButton selected={active === 3} onClick={() => setActive(3)}>
          <ListItemText primary="MVP存活状态" />
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
