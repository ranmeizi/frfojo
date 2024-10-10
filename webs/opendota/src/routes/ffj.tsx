import { RouteObject } from "react-router-dom";
import FFJLayout from "../layouts/FFJLayout";
import Profile from "../pages/Profile";
import Search from "../pages/Search";

const routes: RouteObject[] = [
  {
    path: "/ffj",
    element: <FFJLayout />,
    children: [
      {
        path: "/ffj/search",
        element: <Search />,
      },
      {
        path: "/ffj/profile",
        element: <Profile />,
      },
    ],
  },
];

export default routes;
