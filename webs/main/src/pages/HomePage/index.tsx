import { request } from "@frfojo/common/request";
import { sleep } from "@frfojo/common/utils/delay";
import {
  LayoutMenu,
  Modal,
  message,
  ModalForm,
  BoFormItem,
} from "@frfojo/components";
import {
  Button,
  Box,
  Input,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FC } from "react";
import GoogleOAuthButton from "../Login/components/GoogleOAuthButton";
import * as TitleAnime from "@/utils/flashTitle";

type HomePageProps = Record<string, never>;

const HomePage: FC<HomePageProps> = () => {
  async function open() {
    Modal.confirm({
      title: "开发者测试入口",
      content: (
        <Box sx={{ p: 1.5 }}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Popup / Message
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button size="small" variant="outlined" onClick={() => open()}>
                  点我弹窗
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => message.success("成功")}
                >
                  message.success
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => message.warning("警告")}
                >
                  message.warning
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => message.error("错误")}
                >
                  message.error
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => message.info("信息")}
                >
                  message.info
                </Button>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Test Auth
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => request("/users/list", {})}
              >
                request auth guard
              </Button>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                ModalForm
              </Typography>
              <ModalForm
                title="see"
                onSubmit={async (data) => {
                  console.log("提交", data);
                  await sleep(2000);
                  return true;
                }}
                trigger={
                  <Button size="small" variant="outlined">
                    open ModalForm
                  </Button>
                }
              >
                <BoFormItem
                  ignoreFormItem
                  label="输入项1"
                  name="input1"
                  fieldProps={{ variant: "standard" }}
                >
                  <TextField />
                </BoFormItem>
                <BoFormItem
                  label="输入项2没有"
                  name="input2"
                  fieldProps={{ variant: "standard" }}
                >
                  <Input />
                </BoFormItem>
                <BoFormItem label="选择1" name="select1">
                  <Select>
                    <MenuItem value={"1"}>选项1</MenuItem>
                    <MenuItem value={"2"}>选项2</MenuItem>
                  </Select>
                </BoFormItem>
              </ModalForm>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                测试 title 动画
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    TitleAnime.newMessage("你好我是波波安，这是你的蛋糕");
                  }}
                >
                  开始
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    TitleAnime.reset();
                  }}
                >
                  中断
                </Button>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Google OAuth 回调测试
              </Typography>
              <GoogleOAuthButton
                onCallback={({ code }) => {
                  alert(`code:${code}`);
                }}
              />
            </Paper>
          </Stack>
        </Box>
      ),
      maskClosable: true,
      async onOk() {
        await sleep(3000);
      },
    });
  }

  return (
    <LayoutMenu>
      <Box
        sx={{
          flex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 4,
          py: 6,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 880,
            width: "100%",
            borderRadius: 3,
            p: 4,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                letterSpacing: "-0.03em",
              }}
            >
              欢迎来到 FRFOJO
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
              集中管理你的工具与实验功能，在一个地方快速找到你需要的一切。
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button variant="contained" color="primary">
                立即开始
              </Button>
              <Button variant="outlined" onClick={() => open()}>
                开发者测试入口
              </Button>
            </Stack>

            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              测试入口与调试功能已被收纳到弹窗中，不会影响正常使用。
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 320,
                height: 180,
                borderRadius: 3,
                background:
                  "radial-gradient(circle at 0% 0%, rgba(33,150,243,0.18), transparent 55%), radial-gradient(circle at 100% 100%, rgba(156,39,176,0.14), transparent 55%)",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ color: "text.secondary", textAlign: "center", px: 3 }}
              >
                这里可以放一些统计、欢迎语或是你的工具预览。
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </LayoutMenu>
  );
};

export default HomePage;
