import { FC } from "react";
import { LayoutMenu } from "@frfojo/components/layout";

type HomePageProps = {};

const HomePage: FC<HomePageProps> = () => {
  return (
    <LayoutMenu>
      <div>hello world</div>
    </LayoutMenu>
  );
};

export default HomePage;
