import { FC } from "react";
import { LayoutMenu } from "@frfojo/components/layout";
import LogoComp from "./Logo";
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";

const Topic: FC = () => {
  const params = useParams<{ topicId: string }>();

  console.log("params", params);

  const logo = <LogoComp />;
  const sidebar = <Sidebar topicId={params.topicId} />;
  const header = <div></div>;
  const content = <div></div>;
  return (
    <LayoutMenu
      logo={logo}
      sidebar={sidebar}
      header={header}
      content={content}
    />
  );
};

export default Topic;
