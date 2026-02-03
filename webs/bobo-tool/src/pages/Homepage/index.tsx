import { FC } from "react";
import {
  alpha,
  Box,
  Container,
  Paper,
  styled,
  Typography,
} from "@mui/material";
import MenuCard from "./components/MenuCard";
import { LayoutMenu } from "@frfojo/components";

const IconMomoro = new URL("@/assets/momoro.jpeg", import.meta.url).href;
const IconAHKTesting = new URL("@/assets/testing.jpeg", import.meta.url).href;
const IconMomotu = new URL("@/assets/momotu.webp", import.meta.url).href;

const menus = [
  {
    title: "2048助手",
    desciption: "测试版",
    img: IconMomoro,
    path: "/ffj/2048",
  },
  {
    title: "AHK Testing",
    desciption: "测试",
    img: IconAHKTesting,
    path: "/ffj/ahk-testing",
  },
  {
    title: "MomoIngameNews",
    desciption: "MomoRo数据统计",
    img: IconMomotu,
    path: "/ffj/momo-ingamenews",
  },
];

const Root = styled("div")(({ theme }) => ({
  minHeight: "100%",
  background:
    theme.palette.mode === "dark"
      ? `linear-gradient(160deg, ${alpha(
          theme.palette.primary.main,
          0.06
        )} 0%, transparent 50%)`
      : `linear-gradient(160deg, ${alpha(
          theme.palette.primary.main,
          0.04
        )} 0%, transparent 45%)`,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  gap: theme.spacing(3),
  flexWrap: "wrap",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow:
    theme.palette.mode === "dark"
      ? `0 4px 24px ${alpha(theme.palette.common.black, 0.4)}`
      : `0 4px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
  border: `1px solid ${theme.palette.divider}`,
  background:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.6)
      : theme.palette.background.paper,
}));

type HomepageProps = Record<string, never>;

const Homepage: FC<HomepageProps> = () => {
  return (
    <LayoutMenu
      header={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            paddingLeft: 2,
            fontWeight: 600,
            fontSize: "1rem",
            color: "text.primary",
          }}
        >
          工具
        </Box>
      }
    >
      <Root>
        <Container maxWidth="lg" sx={{ py: 4, px: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "text.primary",
              }}
            >
              工具导航
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: "text.secondary" }}
            >
              选择下方工具开始使用
            </Typography>
          </Box>
          <StyledPaper elevation={0}>
            {menus.map((item) => (
              <MenuCard
                key={item.path}
                title={item.title}
                description={item.desciption}
                img={item.img}
                path={item.path}
              />
            ))}
          </StyledPaper>
        </Container>
      </Root>
    </LayoutMenu>
  );
};

export default Homepage;
