import { RouteObject } from "react-router-dom";
import FFJLayout from "../layouts/FFJLayout";
import Profile from "../pages/Profile";
import Search from "../pages/Search";
import React from "react";

const routes: RouteObject[] = [
  {
    path: "/ffj",
    children: [
      {
        path: "/ffj/search",
        element: <Search />,
      },
      {
        path: "/ffj/profile",
        element: <Profile />,
      },
      {
        path: "/ffj/*",
        element: <div>没有这个路由</div>,
      },
    ],
  },
];

export default routes;
