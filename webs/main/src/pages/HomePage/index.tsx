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
  Box,
  Input,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { FC } from "react";
import GoogleOAuthButton from "../Login/components/GoogleOAuthButton";
import * as TitleAnime from "@/utils/flashTitle";

type HomePageProps = {};

const HomePage: FC<HomePageProps> = () => {
  async function open() {
    const { close } = Modal.confirm({
      title: "hi",
      content: "content",
      maskClosable: true,
      async onOk() {
        await sleep(3000);
      },
    });
  }

  return (
    <LayoutMenu>
      <Typography>Testing</Typography>
      <Box sx={{ padding: 2 }}>
        <Paper sx={{ mb: 2 }}>
          <div>Popup</div>
          <button onClick={() => open()}>点我弹窗</button>
          <button onClick={() => message.success("成功")}>
            点我message.success
          </button>
          <button onClick={() => message.warning("警告")}>
            点我message.warning
          </button>
          <button onClick={() => message.error("错误")}>
            点我message.error
          </button>
          <button onClick={() => message.info("信息")}>点我message.info</button>
        </Paper>
        <Paper>
          <div>Test Auth</div>
          <button onClick={() => request("/users/list", {})}>
            request auth guard
          </button>
        </Paper>
        <Paper>
          <div>ModalForm</div>
          <ModalForm
            title="see"
            onSubmit={async (data) => {
              console.log("提交", data);
              await sleep(2000);
              return true;
            }}
            trigger={<button>open ModalForm</button>}
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

        <Paper>
          <div>测试 title 动画</div>
          <button
            onClick={() => {
              TitleAnime.newMessage("你好我是波波安，这是你的蛋糕");
            }}
          >
            开始
          </button>
          <button
            onClick={() => {
              TitleAnime.reset();
            }}
          >
            中断
          </button>
        </Paper>
        <GoogleOAuthButton
          onCallback={({ code }) => {
            alert(`code:${code}`);
          }}
        />
      </Box>
    </LayoutMenu>
  );
};

export default HomePage;
