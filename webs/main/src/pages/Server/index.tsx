import { FC } from "react";
import LogoComp from "./Logo";
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import Header from "./Header";
import { LayoutMenu } from "@frfojo/components";
import ServerContent from "./Content";

const Server: FC = () => {
  const params = useParams<{ serverId: string; topic?: string }>();

  const logo = <LogoComp />;
  const sidebar = <Sidebar serverId={params.serverId} topic={params.topic} />;
  const header = <Header />;
  const content = <ServerContent />;
  return (
    <LayoutMenu
      logo={logo}
      sidebar={sidebar}
      header={header}
      content={content}
    />
  );
};

export default Server;
