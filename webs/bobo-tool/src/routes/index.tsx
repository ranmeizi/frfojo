import { useEffect } from "react";
import { RouteObject, useNavigate } from "react-router-dom";
import ffjRoutes from "./ffj";

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
    element: <Redirect to="/ffj/homepage" />,
  },
  ...ffjRoutes,
];

export default routes;
