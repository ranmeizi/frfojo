import { useEffect } from "react";
import { RouteObject, useNavigate } from "react-router-dom";
import TestLayout from "@/pages/TestLayout";
import TestTheme from "@/pages/TestTheme";
import MainApp from "@/layouts/MainApp";
import HomePage from "@/pages/HomePage";
import Topic from "@/pages/Topic";

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
        path: "/m/topic",
        element: <Topic />,
      },
      {
        path: "/m/theme",
        element: <TestTheme></TestTheme>,
      },
    ],
  },
];

export default routes;
