import {
  Box,
  Button,
  Input,
  Link,
  Paper,
  PaperProps,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import PasswordInput from "./components/PasswordInput";
import { BoFormItem } from "@frfojo/components";

const Root = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  marginTop: "-100px",
}));

type SigninFormProps = {
  onGoSignup: () => void;
};

export default function LoginForm({
  onGoSignup,
  ...props
}: PaperProps & SigninFormProps) {
  return (
    <Root {...props}>
      <Box
        sx={{
          width: "300px",
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
            gap: 2,
            alignItems: "center",
          }}
        >
          <Typography sx={{ mb: 2 }}>Boboan.net 登录</Typography>
          <BoFormItem
            ignoreFormItem
            name="username"
            label="用户名"
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
            <TextField variant="standard" />
          </BoFormItem>

          <BoFormItem
            ignoreFormItem
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
            <PasswordInput variant="standard" autoComplete="current-password" />
          </BoFormItem>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              mb: 4,
            }}
          >
            {/* 忘记密码(切换表单) */}
            <Link sx={{ fontSize: "14px" }}>忘记密码</Link>
            {/* 去注册(切换表单) */}
            <Link sx={{ fontSize: "14px" }} onClick={onGoSignup}>
              去注册
            </Link>
          </Box>
          {/* 提交 */}
          <Button variant="contained" fullWidth type="submit">
            登录
          </Button>
        </Box>
      </Box>
    </Root>
  );
}
