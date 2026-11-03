import { FC } from "react";
import { Box, Container, Paper, Stack, styled, Typography } from "@mui/material";
import MenuCard from "./components/MenuCard";
import { LayoutMenu, useAccess } from "@frfojo/components";
import { PERM_BONET_TRIAL, hasPermission } from "../BoNet/constants";

const IconMomoro = new URL("@/assets/momoro.jpeg", import.meta.url).href;
// const IconAHKTesting = new URL("@/assets/testing.jpeg", import.meta.url).href;
const IconMomotu = new URL("@/assets/momotu.webp", import.meta.url).href;
const IconRoCalc = new URL("@/assets/ro_calc.jpeg", import.meta.url).href;
const IconArgos = new URL("@/assets/argos.jpeg", import.meta.url).href;
const IconFiledrop = new URL("@/assets/filedrop.png", import.meta.url).href;

type MenuItem = {
  title: string;
  desciption: string;
  img: string;
  path: string;
  require?: string;
};

type MenuGroup = {
  key: string;
  title: string;
  description?: string;
  items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    key: "ro",
    title: "仙境传说",
    description: "RO 相关助手与数据工具",
    items: [
      {
        title: "2048助手",
        desciption: "测试版",
        img: IconMomoro,
        path: "/ffj/2048",
      },
      {
        title: "MomoIngameNews",
        desciption: "MomoRo数据统计",
        img: IconMomotu,
        path: "/ffj/momo-ingamenews",
      },
      {
        title: "RO计算器",
        desciption: "仙境传说相关数值工具",
        img: IconRoCalc,
        path: "/ffj/ro-calculator",
      },
      {
        title: "BoNet",
        desciption: "GID 玩家关联节点图",
        img: IconArgos,
        path: "/ffj/bonet",
        require: PERM_BONET_TRIAL,
      },
    ],
  },
  {
    key: "utility",
    title: "通用工具",
    description: "日常实用小工具",
    items: [
      {
        title: "Filedrop",
        desciption: "文件快传",
        img: IconFiledrop,
        path: "/ffj/filedrop",
      },
    ],
  },
];

const Root = styled("div")(() => ({}));

const Homepage: FC = () => {
  const { permissions } = useAccess();

  function canAccess(require?: string) {
    if (!require) return true;
    return permissions.includes(require) || hasPermission(require);
  }

  return (
    <LayoutMenu
      header={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            paddingLeft: "16px",
          }}
        >
          工具
        </Box>
      }
    >
      <Root>
        <Container sx={{ pb: 4 }}>
          <Typography variant="h6" sx={{ margin: "24px 0 8px" }}>
            工具导航
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            按用途分组，点卡片进入对应工具
          </Typography>

          <Stack spacing={3}>
            {menuGroups.map((group) => (
              <Box key={group.key}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="baseline"
                  sx={{ mb: 1.5 }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    {group.title}
                  </Typography>
                  {group.description ? (
                    <Typography variant="caption" color="text.secondary">
                      {group.description}
                    </Typography>
                  ) : null}
                </Stack>
                <Paper
                  sx={{
                    padding: "20px 24px",
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {group.items.map((item) => (
                    <MenuCard
                      key={item.path}
                      title={item.title}
                      description={item.desciption}
                      img={item.img}
                      path={item.path}
                      disabled={!canAccess(item.require)}
                    />
                  ))}
                </Paper>
              </Box>
            ))}
          </Stack>
        </Container>
      </Root>
    </LayoutMenu>
  );
};

export default Homepage;
