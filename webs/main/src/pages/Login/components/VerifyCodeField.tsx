import { sendEmailCode } from "@/services/base";
import { BoFormItem, useFormApi, useWatch } from "@frfojo/components";

import { Box, Button, Input, InputProps } from "@mui/material";
import { useState } from "react";

export default function VerifyCodeField(props: InputProps) {
  const [cooldown, setCooldown] = useState(-1);

  const email = useWatch("email");

  const FormApi = useFormApi();

  // 获取字段状态（包括校验信息）
  const emailFieldState = FormApi.getFieldState("email");

  async function sendCode() {
    setCooldown(Infinity);

    const res = await sendEmailCode({ email });

    if (res.code === "000000") {
      const duration = 60;
      setCooldown(duration);
      countDown(duration);
    } else {
      alert("todo: 发送失败");
    }
  }

  function countDown(num: number) {
    if (num > 0) {
      setTimeout(() => {
        setCooldown(num - 1);
        countDown(num - 1);
      }, 1000);
    }
  }

  const canSend = email?.length > 0 && !emailFieldState.error;

  return (
    <Box sx={{ width: "100%", display: "flex", alignItems: "end" }}>
      <BoFormItem
        name="verifyCode"
        label="验证码"
        formControlProps={{ variant: "standard" }}
        options={{
          required: "验证码不能为空",
        }}
      >
        <Input {...props} inputProps={{ maxLength: 6 }} />
      </BoFormItem>
      <Box sx={{ pb: "12px" }}>
        {cooldown > 0 ? (
          <Button
            variant="outlined"
            loading
            loadingPosition="start"
            sx={{ ml: 2, width: "140px" }}
          >
            {cooldown === Infinity ? "" : `${cooldown} s`}
          </Button>
        ) : (
          <Button
            onClick={sendCode}
            variant="outlined"
            sx={{ ml: 2, width: "140px" }}
            disabled={!canSend}
          >
            发送验证码
          </Button>
        )}
      </Box>
    </Box>
  );
}
