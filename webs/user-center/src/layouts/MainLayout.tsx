import React, { useMemo } from "react";
import { ProLayout, PageContainer } from "@ant-design/pro-components";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppstoreOutlined, TeamOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { getRuntimeMode } from "../runtime/mode";
import { useAuth } from "../auth/AuthContext";
import { Button, Result } from "antd";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  // 独立运行：未登录直接跳 /login
  if (getRuntimeMode() === "standalone" && !auth.token?.access_token) {
    auth.gotoLogin(location.pathname + location.search);
    return null;
  }

  // 子应用：如果主应用未登录，提示跳主登录页
  if (getRuntimeMode() === "garfish" && !auth.token?.access_token) {
    return (
      <Result
        status="403"
        title="未登录"
        subTitle="当前为子应用模式，请先在主应用完成登录。"
        extra={[
          <Button
            key="login"
            type="primary"
            onClick={() => auth.gotoLogin(window.location.href)}
          >
            去主应用登录
          </Button>,
        ]}
      />
    );
  }

  const route = useMemo(() => {
    return {
      path: "/",
      routes: [
        { path: "/users", name: "用户", icon: <TeamOutlined /> },
        { path: "/roles", name: "角色", icon: <AppstoreOutlined /> },
        { path: "/permissions", name: "权限", icon: <SafetyCertificateOutlined /> },
      ],
    };
  }, []);

  return (
    <ProLayout
      title="UserCenter"
      location={{ pathname: location.pathname }}
      route={route as any}
      fixSiderbar
      layout="mix"
      splitMenus={false}
      menuItemRender={(item, dom) => {
        return (
          <a
            onClick={(e) => {
              e.preventDefault();
              if (item.path) navigate(item.path);
            }}
          >
            {dom}
          </a>
        );
      }}
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </ProLayout>
  );
}

