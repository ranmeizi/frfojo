/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Box, styled, alpha, useMediaQuery, useTheme } from "@mui/material";
import SigninForm from "./SigninForm";
import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import SignupForm from "./SignupForm";
import { motion } from "framer-motion";
import { signin, emailsignup } from "@/services/base";
import { BoForm, FormApis, message } from "@frfojo/components";
import { sleep } from "@frfojo/common/utils/delay";
import {
  calcExpiresAt,
  clearToken,
  getToken,
  setToken,
} from "@frfojo/common/request";
import { useNavigate, useSearchParams } from "react-router-dom";
import { googleFastSignIn } from "@/services/oauth";
import { useGlobalStates } from "@/contexts/GlobalStates";

const BGImg = new URL("@/assets/bg.jpg", import.meta.url).href;

const HOMEPAGE_URL = "/";

const Root = styled(Box)(() => ({
  background: `url(${BGImg})`,
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  backgroundPosition: "center",
  height: "100vh",
  width: "100vw",
  position: "relative",

  ".box": {
    position: "absolute",
  },
}));

type SigninFormType = {
  username: string;
  password: string;
};

type SignupFormType = {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  verifyCode: string;
};

export default function Login() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [type, setType] = useState<"signin" | "signup" | undefined>();

  const [searchParams] = useSearchParams();

  const { user } = useGlobalStates();

  const navigate = useNavigate();

  // 获取单个参数
  const redirect_uri = searchParams.get("redirect_uri") || HOMEPAGE_URL;

  function redirectFn() {
    // redirect_uri 可能是完整 URL（例如从 location.href encode 过来的）
    // 完整 URL 用 location.replace 做真正的 redirect；站内 path 再用 navigate
    if (/^https?:\/\//i.test(redirect_uri)) {
      location.replace(redirect_uri);
      return;
    }
    navigate(redirect_uri, { replace: true });
  }

  useHiddenLoginHandler(redirectFn);

  const formRef = useRef<FormApis>();

  useEffect(() => {
    // 进来先清token
    clearToken();
    // 看看用path 判断用什么界面呢？
    setType("signin");
  }, []);

  // 谷歌快速登陆
  async function handleGoogleFastLogin<T extends { code: string }>({
    code,
  }: T) {
    const res = await googleFastSignIn({ code });

    if (res.code === "000000") {
      await handleLogInSuccess(res);
    } else {
      message.error(res.msg);
    }
  }

  async function onSignIn(data: SigninFormType) {
    const res = await signin(data);
    if (res.code === "000000") {
      await handleLogInSuccess(res);
    } else {
      message.error(res.msg);
    }
  }

  async function onSignUp(data: SignupFormType) {
    await sleep(1000);
    const res = await emailsignup(data);
    if (res.code === "000000") {
      formRef.current?.reset?.();
      // 提示
      message.success("注册成功! 去登录吧😊");
      await sleep(1000);
      // 跳登陆
      setType("signin");
    } else {
      message.error(res.msg);
    }
  }

  // 登陆成功
  async function handleLogInSuccess(res: Res.data<DTOs.BoboanNetBase.Signin>) {
    // 存token
    const token = calcExpiresAt(res.data);
    setToken(token);
    // 获取用户信息
    const info = await user.getCurrentUser();
    await user.getPermissions();

    message.success(`登录成功,欢迎 ${info?.nickname || "匿名"} 大大`);

    // 跳转
    redirectFn();
  }

  const renderform = useMemo(() => {
    switch (type) {
      case "signin":
        return (
          <motion.div
            key={"signin"}
            className="box"
            transition={{ duration: 0.5 }}
            initial={{
              opacity: 0,
              transform: "translateY(-100px)",
              zIndex: 100,
            }}
            animate={{ opacity: 1, transform: "translateY(0px)", zIndex: 100 }}
            exit={{ opacity: 0, transform: "translateY(-100px)", zIndex: 0 }}
            style={
              isMobile
                ? {
                    position: "relative",
                    top: "auto",
                    right: "auto",
                    left: "auto",
                    bottom: "auto",
                  }
                : undefined
            }
          >
            <SigninForm
              onGoSignup={() => {
                setType("signup");
              }}
              handleGoogleFastLogin={handleGoogleFastLogin}
            />
          </motion.div>
        );
      case "signup":
        return (
          <motion.div
            key={"signup"}
            className="box"
            transition={{ duration: 0.5 }}
            initial={{
              opacity: 0,
              transform: "translateY(-100px)",
              zIndex: 100,
            }}
            animate={{ opacity: 1, transform: "translateY(0px)", zIndex: 100 }}
            exit={{ opacity: 0, transform: "translateY(-100px)", zIndex: 0 }}
            style={
              isMobile
                ? {
                    position: "relative",
                    top: "auto",
                    right: "auto",
                    left: "auto",
                    bottom: "auto",
                  }
                : undefined
            }
          >
            <SignupForm
              onGoSignin={() => {
                setType("signin");
              }}
            />
          </motion.div>
        );
      default:
        return null;
    }
  }, [type]);

  return (
    <Root>
      <BoForm
        key={type}
        formRef={formRef}
        onSubmit={async (data) => {
          if (type === "signin") {
            await onSignIn(data);
          } else {
            await onSignUp(data);
          }
          return true;
        }}
        style={{
          width: isMobile ? "100%" : "66%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: isMobile ? "flex-start" : "center",
          position: "absolute",
          top: "0",
          right: isMobile ? "auto" : "0",
          left: isMobile ? "0" : "auto",
          paddingTop: isMobile ? 64 : 0,
          paddingBottom: isMobile ? 24 : 0,
          overflowY: isMobile ? "auto" : "visible",
          background: isMobile ? alpha("#000", 0.35) : "transparent",
        }}
      >
        <AnimatePresence>{renderform}</AnimatePresence>
      </BoForm>
    </Root>
  );
}

// 处理在别的页面进行登录的情况，回到login页如果有userinfo和token，就跳转
function useHiddenLoginHandler(redirectFn: Function) {
  const { user } = useGlobalStates();
  useEffect(() => {
    document.addEventListener("visibilitychange", function (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      if (!e?.target?.hidden) {
        if (getToken()) {
          // 跳转
          redirectFn();
          message.success(
            `登录成功,欢迎 ${user.info?.nickname || "匿名"} 大大`,
          );
        }
      }
    });
  }, []);
}
