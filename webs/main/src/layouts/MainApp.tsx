import { FC } from "react";
import { LayoutApp } from "@frfojo/components";
import { Outlet } from "react-router-dom";
import SideBar from "@/components/SideBar";
import Header from "@/components/Header";

const MainApp: FC = () => {
  return (
    <LayoutApp
      sidebar={<SideBar />}
      header={window.__TAURI__ ? <Header /> : null}
    >
      <Outlet />
    </LayoutApp>
  );
};

export default MainApp;
