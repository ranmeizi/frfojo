import { useEffect } from "react";
import { RouteObject, useNavigate } from "react-router-dom";
import TestLayout from "@/pages/TestLayout";
import TestTheme from "@/pages/TestTheme";
import MainApp from "@/layouts/MainApp";
import HomePage from "@/pages/HomePage";
import Server from "@/pages/Server";
import Opendota from "@/pages/SubApps/Opendota";
import BoboTool from "@/pages/SubApps/BoboTool";
import Login from "@/pages/Login";

function Redirect({ to }: any) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace: true });
  });
  return null;
}

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Redirect to="/m/homepage" />,
  },
  {
    path: "/m",
    element: <MainApp />,
    children: [
      {
        path: "/m/homepage",
        element: <HomePage />,
      },
      {
        path: "/m/layout",
        element: <TestLayout />,
      },
      {
        path: "/m/server/:serverId",
        element: <Server />,
      },
      {
        path: "/m/server/:serverId/:topic",
        element: <Server />,
      },
      {
        path: "/m/theme",
        element: <TestTheme></TestTheme>,
      },
      {
        path: "/m/sub/opendota*",
        element: <Opendota />,
      },
      {
        path: "/m/sub/bobo-tool*",
        element: <BoboTool />,
      },
      // {
      //   path: "/m/*",
      // },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
];

export default routes;
