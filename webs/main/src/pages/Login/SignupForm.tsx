import {
  Box,
  Button,
  Input,
  Link,
  Paper,
  PaperProps,
  styled,
  Typography,
} from "@mui/material";
import VerifyCodeField from "./components/VerifyCodeField";
import PasswordInput from "./components/PasswordInput";
import { BoFormItem } from "@frfojo/components";

const Root = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  marginTop: "-100px",
}));

type SignupFormProps = {
  onGoSignin: () => void;
};

export default function SignupForm({
  onGoSignin,
  ...props
}: PaperProps & SignupFormProps) {
  return (
    <Root {...props}>
      <Box
        sx={{
          width: "400px",
          pb: 4,
          pt: 3,
        }}
      >
        <Box
          sx={{
            pl: 5,
            pr: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography sx={{ mb: 2 }}>Boboan.net 注册</Typography>
          <BoFormItem
            name="username"
            label="用户名"
            formControlProps={{ variant: "standard" }}
            options={{
              required: "用户名不能为空",
              maxLength: {
                value: 20,
                message: "用户名最大20位",
              },
              minLength: {
                value: 6,
                message: "用户名至少6位",
              },
            }}
          >
            <Input />
          </BoFormItem>
          <BoFormItem
            name="password"
            label="密码"
            formControlProps={{ variant: "standard" }}
            options={{
              required: "密码不能为空",
              maxLength: {
                value: 20,
                message: "密码最大20位",
              },
              minLength: {
                value: 6,
                message: "密码至少6位",
              },
            }}
          >
            <PasswordInput autoComplete="current-password" />
          </BoFormItem>

          <BoFormItem
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
            <Input />
          </BoFormItem>

          <VerifyCodeField />
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {/* 去登陆(切换表单) */}
            <Link sx={{ fontSize: "14px", mb: 4 }} onClick={onGoSignin}>
              去登陆
            </Link>
          </Box>
          {/* 提交 */}
          <Button type="submit" variant="contained" fullWidth>
            注册
          </Button>
        </Box>
      </Box>
    </Root>
  );
}
