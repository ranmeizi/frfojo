import { request } from "@frfojo/common/request";
import { sleep } from "@frfojo/common/utils/delay";
import {
  AccessArea,
  LayoutMenu,
  Modal,
  message,
  ModalForm,
  BoFormItem,
} from "@frfojo/components";
import {
  Button,
  Box,
  Divider,
  FormControlLabel,
  Input,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { FC } from "react";
import GoogleOAuthButton from "../Login/components/GoogleOAuthButton";
import * as TitleAnime from "@/utils/flashTitle";
import { useUserSelector } from "@/contexts/GlobalStates";
import { useNavigate } from "react-router-dom";
import { useAppRxDBState } from "@/db/hook/useAppRXDBState";

type HomePageProps = Record<string, never>;

/**
 * 必须作为独立组件挂载在 Modal 内：`Modal.confirm` 的 content 是打开时的快照，
 * 若把 useAppRxDBState 写在 HomePage 里，弹窗内的 Switch 不会随 RxDB 更新重渲染。
 */
function sectionPaperSx() {
  return {
    p: 2,
    borderRadius: 2,
    border: 1,
    borderColor: "divider",
    bgcolor: "background.paper",
  } as const;
}

const DeveloperTestModalContent: FC<{ onOpenNested: () => void }> = ({
  onOpenNested,
}) => {
  const [themeMode = "light", setThemeMode] =
    useAppRxDBState<"dark" | "light">("theme_mode");

  return (
    <Stack spacing={2.25}>
        <Paper variant="outlined" sx={sectionPaperSx()}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                主题模式
              </Typography>
              <Typography variant="caption" color="text.secondary">
                写入本地配置，整站 MUI 主题会立即切换
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={themeMode === "dark"}
                  onChange={(_, checked) =>
                    setThemeMode(checked ? "dark" : "light")
                  }
                />
              }
              label={themeMode === "dark" ? "深色" : "浅色"}
              sx={{ m: 0 }}
            />
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2.25,
            alignItems: "stretch",
          }}
        >
          <Paper variant="outlined" sx={{ ...sectionPaperSx(), height: "100%" }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Popup / Message
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button size="small" variant="outlined" onClick={onOpenNested}>
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

          <Stack spacing={2.25}>
            <Paper variant="outlined" sx={sectionPaperSx()}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Test Auth
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Button
                size="small"
                variant="outlined"
                onClick={() => request("/users/list", {})}
              >
                request auth guard
              </Button>
            </Paper>

            <Paper variant="outlined" sx={sectionPaperSx()}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                测试 title 动画
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
          </Stack>
        </Box>

        <Paper variant="outlined" sx={sectionPaperSx()}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            ModalForm
          </Typography>
          <Divider sx={{ mb: 1.5 }} />
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

        <Paper variant="outlined" sx={sectionPaperSx()}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Google OAuth 回调测试
          </Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <GoogleOAuthButton
              onCallback={({ code }) => {
                alert(`code:${code}`);
              }}
            />
          </Box>
        </Paper>
    </Stack>
  );
};

const HomePage: FC<HomePageProps> = () => {
  const user = useUserSelector();
  const navigate = useNavigate();

  function gotoUserCenterStandalone() {
    const url = new URL(location.href);
    url.port = "8013";
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    location.href = url.toString();
  }

  function gotoUserCenterMicroRoute() {
    navigate("/m/sub/user-center/users");
  }

  function gotoBrowser() {
    location.href = `${location.origin}/api/browser/index.html`;
  }

  async function open() {
    Modal.confirm({
      title: "开发者测试入口",
      width: 760,
      content: <DeveloperTestModalContent onOpenNested={open} />,
      maskClosable: true,
      async onOk() {
        await sleep(3000);
      },
    });
  }

  return (
    <LayoutMenu
      header={
        <Box
          sx={{
            width: "100%",
            height: "100%",
            px: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          <AccessArea
            require="F_WEB_HIDDEN_ADMIN"
            permissions={user.permissions || []}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={gotoUserCenterStandalone}
            >
              UserCenter（独立）
            </Button>
          </AccessArea>
          <AccessArea
            require="F_WEB_HIDDEN_ADMIN"
            permissions={user.permissions || []}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={gotoUserCenterMicroRoute}
            >
              UserCenter（子应用）
            </Button>
          </AccessArea>
          <AccessArea
            require="F_WEB_HIDDEN_BROWSER"
            permissions={user.permissions || []}
          >
            <Button size="small" variant="outlined" onClick={gotoBrowser}>
              Browser
            </Button>
          </AccessArea>
        </Box>
      }
    >
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
