import React, { useMemo } from "react";
import { LayoutMenu } from "@frfojo/components";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppstoreOutlined, TeamOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { getRuntimeMode } from "../runtime/mode";
import { useAuth } from "../auth/AuthContext";
import { Button, Menu, Result, Typography } from "antd";

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

  const menus = useMemo(
    () => [
      { key: "/users", label: "用户", icon: <TeamOutlined /> },
      { key: "/roles", label: "角色", icon: <AppstoreOutlined /> },
      { key: "/permissions", label: "权限", icon: <SafetyCertificateOutlined /> },
    ],
    [],
  );

  const selectedKey = useMemo(() => {
    const p = location.pathname || "/";
    const seg = "/" + (p.split("/")[1] || "users");
    return menus.some((m) => m.key === seg) ? seg : "/users";
  }, [location.pathname, menus]);

  return (
    <LayoutMenu
      widthAutoSaveId="uc-layout"
      logo={
        <div style={{ paddingLeft: 12, paddingRight: 12, width: "100%" }}>
          <Typography.Text strong style={{ color: "inherit" }}>
            UserCenter
          </Typography.Text>
        </div>
      }
      sidebar={
        <div style={{ padding: 8, height: "100%" }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menus as any}
            onClick={(e) => navigate(e.key)}
          />
        </div>
      }
      header={
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 12,
            paddingRight: 12,
          }}
        >
          <Typography.Text>
            {selectedKey === "/users"
              ? "用户管理"
              : selectedKey === "/roles"
                ? "角色管理"
                : "权限管理"}
          </Typography.Text>
          <Typography.Text type="secondary">
            {auth.user?.username || auth.user?.email || auth.user?.id || ""}
          </Typography.Text>
        </div>
      }
      content={
        <div style={{ padding: 12, height: "100%", boxSizing: "border-box" }}>
          <Outlet />
        </div>
      }
    />
  );
}

