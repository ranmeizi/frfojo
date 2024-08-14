import { useEffect } from "react";
import { RouteObject, useNavigate } from "react-router-dom";
import TestLayout from "@/pages/TestLayout";
import TestTheme from "@/pages/TestTheme";

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
    element: <Redirect to="/layout" />,
  },
  {
    path: "/layout",
    element: <TestLayout />,
  },
  {
    path: "/theme",
    element: <TestTheme></TestTheme>,
  },
];

export default routes;
