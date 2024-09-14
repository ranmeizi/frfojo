import { FC } from "react";
import { LayoutApp } from "@frfojo/components/layout";
import { Outlet } from "react-router-dom";
import SideBar from "@/components/SideBar";
import Header from "@/components/Header";

const MainApp: FC = () => {
  return (
    <LayoutApp
      sidebar={<SideBar />}
      header={window.__TAURI__ ? <Header /> : null}
    >
      <Outlet></Outlet>
    </LayoutApp>
  );
};

export default MainApp;
