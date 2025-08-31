/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Button, CircularProgress } from "@mui/material";
import { getUrl } from "./urlQuery";
import { useEffect, useRef, useState } from "react";
import { message } from "@frfojo/components";

type GoogleOAuthButtonProps = {
  onCallback?: (payload: { code: string }) => void;
};

export default function GoogleOAuthButton({
  onCallback,
}: GoogleOAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const timer = useRef<number | undefined>();

  function clear() {
    setLoading(false);
    clearInterval(timer.current);
    timer.current = undefined;
  }

  function open() {
    setLoading(true);
    const left = (window.screen.width - 500) / 2; // 水平居中
    const top = (window.screen.height - 600) / 2; // 垂直居中

    const winRef = window.open(
      getUrl(),
      "oauth_window",
      `width=500,height=600,left=${left},top=${top}`
    );

    timer.current = setInterval(() => {
      if (winRef?.closed) {
        clear();
        message.warning("取消授权");
      }
    }, 100);
  }

  useEffect(() => {}, [loading]);

  useEffect(() => {
    function onMessage(e) {
      const type = e.data?.type;

      if (type === "google-callback") {
        console.log("回来了。与后端交互", e.data?.payload);
        onCallback && onCallback(e.data?.payload);
        clear();
      }
    }
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <Button
      loading={loading}
      loadingIndicator={<Pendding text="等待授权" />}
      variant="outlined"
      onClick={open}
      startIcon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 0 24 24"
          width="24"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          ></path>
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          ></path>
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          ></path>
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          ></path>
          <path d="M1 1h22v22H1z" fill="none"></path>
        </svg>
      }
    >
      使用 Google 账号登录
    </Button>
  );
}

function Pendding({ text }: { text: string }) {
  const [stage, setStage] = useState(0);

  function animate(v: number) {
    setStage(v);

    setTimeout(() => {
      animate(v > 2 ? 0 : v + 1);
    }, 500);
  }

  useEffect(() => {
    animate(stage);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress size={14} />
      <div
        style={{
          minWidth: text.length + 2 + "em",
          textAlign: "start",
          marginLeft: "8px",
        }}
      >
        {text}
        {Array(stage).fill(".").join("")}
      </div>
    </div>
  );
}
