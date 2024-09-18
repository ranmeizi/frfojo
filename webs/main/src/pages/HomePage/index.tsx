import { FC } from "react";
import { styled } from "@mui/material";
import MenuLayout from "@frfojo/components/layout/Menu";

const Root = styled("div")(({ theme }) => ({}));

type HomePageProps = {};

const HomePage: FC<HomePageProps> = (props) => {
  return (
    <MenuLayout>
      <div>hello world</div>
    </MenuLayout>
  );
};

export default HomePage;
