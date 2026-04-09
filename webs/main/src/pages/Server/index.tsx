import { FC } from "react";
import { Box } from "@mui/material";
import LogoComp from "./Logo";
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import Header from "./Header";
import { LayoutMenu } from "@frfojo/components";
import ServerContent from "./Content";

const Server: FC = () => {
  const params = useParams<{ serverId: string; topic?: string }>();

  const logo = <LogoComp />;
  /** 与原先直接渲染 Sidebar 一致：占满侧栏 flex 区域，避免裸 nav 打断高度链 */
  const sidebar = (
    <Box
      component="nav"
      aria-label="频道导航"
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Sidebar serverId={params.serverId} topic={params.topic} />
    </Box>
  );
  const header = <Header />;
  /** 占满 content 视区，避免裸 main 高度为 auto 导致滚动/分栏错乱 */
  const content = (
    <Box
      component="main"
      id="server-main"
      tabIndex={-1}
      aria-label="频道聊天与成员"
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <ServerContent />
    </Box>
  );
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
