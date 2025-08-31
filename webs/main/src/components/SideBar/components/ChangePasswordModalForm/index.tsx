import PasswordInput from "@/pages/Login/components/PasswordInput";
import { BoFormItem, ModalForm, ModalFormProps } from "@frfojo/components";

type ChangePasswordModalFormProps = {} & ModalFormProps;

export default function ChangePasswordModalForm({
  ...props
}: ChangePasswordModalFormProps) {
  return (
    <ModalForm title="修改密码" {...props}>
      <div>请输入原始密码和新密码</div>
      <BoFormItem
        label="原始密码"
        name="oldPassword"
        fieldProps={{ variant: "standard" }}
      >
        <PasswordInput autoComplete="current-password" />
      </BoFormItem>
      <BoFormItem
        label="新密码"
        name="newPassword"
        fieldProps={{ variant: "standard" }}
      >
        <PasswordInput autoComplete="current-password" />
      </BoFormItem>
    </ModalForm>
  );
}
