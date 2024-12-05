import { FC } from "react";
import { styled } from "@mui/material";
import MenuLayout from "@frfojo/components/layout/Menu";

const Root = styled("div")(({ theme }) => ({}));

type HomepageProps = {};

const Homepage: FC<HomepageProps> = (props) => {
  return (
    <MenuLayout sidebar={<div>sidebar</div>}>
      <Root>hi</Root>
    </MenuLayout>
  );
};

export default Homepage;
