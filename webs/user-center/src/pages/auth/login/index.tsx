import React, { useMemo, useState } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { useSearchParams } from "react-router-dom";
import * as S from "./service";
import { setStandaloneToken } from "../../../request/token";
import { getRuntimeMode } from "../../../runtime/mode";

export default function LoginPage() {
  const [sp] = useSearchParams();
  const redirect_uri = sp.get("redirect_uri") || "/users";
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    return getRuntimeMode() === "garfish" ? "请在主应用登录" : "UserCenter 登录";
  }, []);

  async function onFinish(values: any) {
    if (getRuntimeMode() === "garfish") {
      message.warning("当前为子应用模式，请跳转主应用登录页。");
      return;
    }
    setLoading(true);
    try {
      const res = await S.signin(values);
      if (res.code !== "000000") {
        message.error(res.msg || "登录失败");
        return;
      }
      setStandaloneToken(res.data);
      // 预热一下用户信息/权限（可选）
      await Promise.allSettled([S.getCurrentUser(), S.getPermissions()]);

      if (/^https?:\/\//i.test(redirect_uri)) {
        location.replace(redirect_uri);
      } else {
        const nav = (globalThis as any).__FFJ_NAVIGATE__ as
          | ((to: string, opts?: { replace?: boolean }) => void)
          | undefined;
        if (nav) nav(redirect_uri, { replace: true });
        else location.replace(`${location.origin}${redirect_uri}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card style={{ width: 420, maxWidth: "92vw" }}>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          {title}
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="username"
            label="用户名/邮箱"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}

