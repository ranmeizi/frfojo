import { RouteObject } from "react-router-dom";
import Homepage from "../pages/Homepage";
import { LayoutMenu } from "@frfojo/components/layout";
import PoringInOneTool from "@/pages/PoringInOneTool";

const routes: RouteObject[] = [
  {
    path: "/ffj",
    children: [
      {
        path: "/ffj/homepage",
        element: <Homepage />,
      },
      {
        path: "/ffj/2048",
        element: <PoringInOneTool />,
      },
      {
        path: "/ffj/*",
        element: <LayoutMenu>没有这个路由</LayoutMenu>,
      },
    ],
  },
];

export default routes;
