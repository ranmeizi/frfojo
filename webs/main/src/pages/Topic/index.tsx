import { FC } from "react";
import { styled } from "@mui/material";
import MenuLayout from "@frfojo/components/layout/Menu";

type TopicProps = {};

const Topic: FC<TopicProps> = (props) => {
  const logo = <div></div>;
  const sidebar = <div></div>;
  const header = <div></div>;
  const content = <div></div>;
  return (
    <MenuLayout
      logo={logo}
      sidebar={sidebar}
      header={header}
      content={content}
    />
  );
};

export default Topic;
