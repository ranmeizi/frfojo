import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Ranking from "./views/ranking";
import Search from "./views/search";
import Group from "./views/group";
import { LayoutMenu, message, useAccess } from "@frfojo/components";
import Spawning from "./views/spawning";
import StatObjectSubjectRank from "./views/statObjectSubjectRank";
import MvpMonthlyTop10 from "./views/mvpMonthlyTop10";
import MvpSubjectObjectDetail from "./views/mvpSubjectObjectDetail";
import { PERM_MOMORO_ENTRY, hasPermission } from "../BoNet/constants";

export default function MomoIngameNews() {
  const navigate = useNavigate();
  const { permissions } = useAccess();
  const canEntry =
    permissions.includes(PERM_MOMORO_ENTRY) || hasPermission(PERM_MOMORO_ENTRY);
  const [active, setActive] = useState(3);

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
      case 4:
        return <StatObjectSubjectRank />;
      case 5:
        return <MvpMonthlyTop10 />;
      case 6:
        return <MvpSubjectObjectDetail />;
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

  useEffect(() => {
    if (canEntry) return;
    message.warning("为止，禁止进入");
    navigate("/ffj/homepage", { replace: true });
  }, [canEntry, navigate]);

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
      <ListItem disablePadding>
        <ListItemButton selected={active === 4} onClick={() => setActive(4)}>
          <ListItemText primary="对象-主体排行" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton selected={active === 5} onClick={() => setActive(5)}>
          <ListItemText primary="月度MVP Top10" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton selected={active === 6} onClick={() => setActive(6)}>
          <ListItemText primary="MVP总榜明细" />
        </ListItemButton>
      </ListItem>
    </List>
  );

  if (!canEntry) {
    return null;
  }

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
