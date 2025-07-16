import { RouteObject } from "react-router-dom";
import Profile from "../pages/Profile";
import Search from "../pages/Search";
import { LayoutMenu } from "@frfojo/components";

const routes: RouteObject[] = [
  {
    path: "/ffj",
    children: [
      {
        path: "/ffj/search",
        element: <Search />,
      },
      {
        path: "/ffj/profile/:account_id",
        element: <Profile />,
      },
      {
        path: "/ffj/*",
        element: <LayoutMenu>没有这个路由</LayoutMenu>,
      },
    ],
  },
];

export default routes;
