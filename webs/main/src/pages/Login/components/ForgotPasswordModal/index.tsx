import {
  BoFormItem,
  message,
  ModalForm,
  ModalFormProps,
} from "@frfojo/components";
import { TextField } from "@mui/material";
import VerifyCodeField from "../VerifyCodeField";
import PasswordInput from "../PasswordInput";
import { forgotChangePassword } from "@/services/base";

export function ForgotPasswordModal(props: ModalFormProps) {
  async function onSubmit(data: any) {
    const res = await forgotChangePassword(data);
    if (res.code === "000000") {
      message.success(res.msg);
      return true;
    } else {
      message.error(res.msg);
      return false;
    }
  }

  return (
    <ModalForm
      {...props}
      formProps={{ "aria-autocomplete": "none" }}
      title={"忘记密码"}
      onSubmit={onSubmit}
    >
      <VerifyForm />
    </ModalForm>
  );
}

function VerifyForm() {
  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        我们会向您的邮箱发送6位验证码，请您打开邮箱查看验证码，输入后完成验证方可修改密码
      </div>
      <BoFormItem
        ignoreFormItem
        name="email"
        label="邮箱"
        formControlProps={{ variant: "standard" }}
        options={{
          required: "邮箱地址不能为空",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "请输入有效的邮箱地址",
          },
        }}
      >
        <TextField variant="standard" />
      </BoFormItem>
      <BoFormItem
        ignoreFormItem
        name="code"
        label="验证码"
        formControlProps={{ variant: "standard" }}
        options={{
          required: "验证码不能为空",
        }}
      >
        <VerifyCodeField />
      </BoFormItem>
      <BoFormItem
        label="新密码"
        name="oldPassword"
        fieldProps={{ variant: "standard" }}
      >
        <PasswordInput placeholder="请输入新密码" autoComplete="new-password" />
      </BoFormItem>
      <BoFormItem
        label="确认密码"
        name="newPassword"
        fieldProps={{ variant: "standard" }}
      >
        <PasswordInput placeholder="请再输入一次" autoComplete="new-password" />
      </BoFormItem>
    </>
  );
}
