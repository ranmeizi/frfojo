import { RouteObject } from "react-router-dom";
import Homepage from "../pages/Homepage";
import PoringInOneTool from "@/pages/PoringInOneTool";
import AHKTesting from "@/pages/AHKTesting";
import MomoIngameNews from "@/pages/MomoIngameNews";
import { LayoutMenu } from "@frfojo/components";

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
        path: "/ffj/ahk-testing",
        element: <AHKTesting />,
      },
      {
        path: "/ffj/momo-ingamenews",
        element: <MomoIngameNews />,
      },
      {
        path: "/ffj/*",
        element: <LayoutMenu>没有这个路由</LayoutMenu>,
      },
    ],
  },
];

export default routes;
