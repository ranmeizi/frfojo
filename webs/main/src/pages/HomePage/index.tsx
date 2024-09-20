import { FC } from "react";
import { styled } from "@mui/material";
import { LayoutMenu } from "@frfojo/components/layout";

const Root = styled("div")(({ theme }) => ({}));

type HomePageProps = {};

const HomePage: FC<HomePageProps> = (props) => {
  return (
    <LayoutMenu>
      <div>hello world</div>
    </LayoutMenu>
  );
};

export default HomePage;
