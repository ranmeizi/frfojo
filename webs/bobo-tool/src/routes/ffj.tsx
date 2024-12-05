import { RouteObject } from "react-router-dom";
import Homepage from "../pages/Homepage";
import { LayoutMenu } from "@frfojo/components/layout";

const routes: RouteObject[] = [
  {
    path: "/ffj",
    children: [
      {
        path: "/ffj/homepage",
        element: <Homepage />,
      },
      {
        path: "/ffj/*",
        element: <LayoutMenu>没有这个路由</LayoutMenu>,
      },
    ],
  },
];

export default routes;
