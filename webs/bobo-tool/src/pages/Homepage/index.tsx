import { FC } from "react";
import { Box, Container, Paper, styled, Typography } from "@mui/material";
import MenuLayout from "@frfojo/components/layout/Menu";
import MenuCard from "./components/MenuCard";
import { useNavigate } from "react-router-dom";

const IconMomoro = new URL("@/assets/momoro.jpeg", import.meta.url).href;

const menus = [
  {
    title: "2048助手",
    desciption: "测试版",
    img: IconMomoro,
    path: "/ffj/2048",
  },
];

const Root = styled("div")(({ theme }) => ({}));

type HomepageProps = {};

const Homepage: FC<HomepageProps> = (props) => {
  return (
    <MenuLayout
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
        <Container>
          <Typography variant="h6" sx={{ margin: "24px 0" }}>
            工具导航
          </Typography>
          <Paper
            sx={{
              padding: "24px",
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {menus.map((item) => (
              <MenuCard
                title={item.title}
                description={item.desciption}
                img={item.img}
                path={item.path}
              />
            ))}
          </Paper>
        </Container>
      </Root>
    </MenuLayout>
  );
};

export default Homepage;