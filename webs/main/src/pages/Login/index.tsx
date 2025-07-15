import { Box, styled } from "@mui/material";
import SigninForm from "./SigninForm";
import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import SignupForm from "./SignupForm";
import { motion } from "framer-motion";
import { signin, signup } from "@/services/base";
import { BoForm, FormApis } from "@frfojo/components";

const BGImg = new URL("@/assets/bg.jpg", import.meta.url).href;

const Root = styled(Box)(() => ({
  background: `url(${BGImg})`,
  backgroundRepeat: "no-repeat",
  backgroundSize: "100% 100%",
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
  const [type, setType] = useState<"signin" | "signup" | undefined>();

  const formRef = useRef<FormApis>();

  useEffect(() => {
    // 看看用path 判断用什么界面呢？
    setType("signin");
  }, []);

  async function onSignIn(data: SigninFormType) {
    console.log("onSignIn", data);
    const res = await signin(data);
    console.log("???res", res);
    if (res.code === "000000") {
      // 存token
      // 跳转
    } else {
      alert("出错 换成mui");
    }
  }

  async function onSignUp(data: SignupFormType) {
    console.log("onSignUp", data);
    const res = await signup(data);
    if (res.code === "000000") {
      // 提示

      // 跳登陆
      setType("signin");
    } else {
      alert("出错 换成mui");
    }
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
          >
            <SigninForm
              onGoSignup={() => {
                setType("signup");
              }}
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
          width: "66%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: "0",
          right: "0",
        }}
      >
        <AnimatePresence>{renderform}</AnimatePresence>
      </BoForm>
    </Root>
  );
}
