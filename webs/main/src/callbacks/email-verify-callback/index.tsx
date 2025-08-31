/* eslint-disable react-refresh/only-export-components */
import { codeLogin } from "@/services/oauth";
import useConstant from "@frfojo/common/hooks/useConstant";
import { calcExpiresAt, setToken } from "@frfojo/common/request";
import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import * as FlashTitle from "@/utils/flashTitle";
import { GlobalStatesProvider, useGlobalStates } from "@/contexts/GlobalStates";

export async function checkIfEmailVerifyCallback(next: AsyncProcessFn) {
  if (location.pathname.endsWith("/o2/verify-res")) {
    window.ffj_loaded();
    // 终止在这里, 渲染一个简单的界面
    handelEmailVerifyCallback();
  } else {
    await next();
  }
}

function handelEmailVerifyCallback() {
  // 渲染一个简单界面
  createRoot(document.getElementById("root")!).render(
    <GlobalStatesProvider>
      <CallbackApp />
    </GlobalStatesProvider>
  );
}

function CallbackApp() {
  const searchParams = useConstant(
    () => new URLSearchParams(location.hash.slice(1))
  );

  const [code, setCode] = useState<string | null>(null);
  // 用来装错误
  const [error, setError] = useState("");

  const [loginFlag, setLoginFlat] = useState(false);

  const { user } = useGlobalStates();

  useEffect(() => {
    init();
  }, []);

  function init() {
    const code: string | null = searchParams.get("code");

    setCode(code);

    if (code) {
      // 登陆
      reqCodeLogin(code).catch((e) => {
        console.log("ee", e);
      });
    }
  }

  async function reqCodeLogin(code: string) {
    const res = await codeLogin({ code });

    if (res.code === "000000") {
      console.log("codelogin", res);
      // 存token
      const token = calcExpiresAt(res.data);
      setToken(token);
      // 跳转
      setLoginFlat(true);

      const info = await user.getCurrentUser();

      await user.getPermissions();

      // 闪烁
      FlashTitle.sendNewMessage(
        `登陆成功，${info?.nickname || "匿名"}大大，欢迎光临`
      );
    } else {
      setError("服务器错误");
    }
  }

  return (
    <Container fixed>
      {code && loginFlag ? (
        <Box>
          <Typography variant="h6">登录成功,您可以关闭此页面</Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6">
            邮箱验证成功,您可以关闭此页面,继续使用google账号登录
          </Typography>
        </Box>
      )}
    </Container>
  );
}
