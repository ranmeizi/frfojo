import { FC, useEffect } from "react";
import { LayoutMenu } from "@frfojo/components/layout";
import LogoComp from "./Logo";
import Sidebar from "./Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import { isMobile } from "@/utils/CONSTANTS";

const Server: FC = () => {
  const params = useParams<{ serverId: string; topic?: string }>();

  const navigate = useNavigate();

  useEffect(() => {
    if (!params?.topic) {
      redirect();
    }
  }, [params?.serverId]);

  function redirect() {
    navigate(`/m/server/${params.serverId}/1-1`);
  }

  const logo = <LogoComp />;
  const sidebar = <Sidebar serverId={params.serverId} topic={params.topic} />;
  const header = <Header />;
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

const MobileClient: FC = () => {
  const params = useParams<{ serverId: string; topic?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!params?.topic) {
      redirect();
    }
  }, [params?.serverId]);

  function redirect() {
    navigate(`/m/server/${params.serverId}/1-1`);
  }
  const logo = <LogoComp />;
  const sidebar = <Sidebar serverId={params.serverId} topic={params.topic} />;

  return <LayoutMenu header={logo} content={sidebar}></LayoutMenu>;
};

const Component = isMobile ? MobileClient : Server;

export default Component;
