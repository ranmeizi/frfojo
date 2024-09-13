import { FC } from "react";
import { styled, Container } from "@mui/material";

const Root = styled("div")(({ theme }) => ({}));

type HomePageProps = {};

const HomePage: FC<HomePageProps> = (props) => {
  return (
    <Root>
      <Container></Container>
    </Root>
  );
};

export default HomePage;
