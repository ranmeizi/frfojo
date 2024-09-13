import { FC, useMemo } from "react";
import { LayoutApp } from "@frfojo/components/layout";
import { Outlet } from "react-router-dom";
import SideBar from "@/components/SideBar";

const MainApp: FC = (props) => {
  return (
    <LayoutApp sidebar={<SideBar />}>
      <Outlet></Outlet>
    </LayoutApp>
  );
};

export default MainApp;
