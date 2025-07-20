import { request } from "@frfojo/common/request";
import { sleep } from "@frfojo/common/utils/delay";
import { LayoutMenu, Modal, message } from "@frfojo/components";
import { Box, Paper, Typography } from "@mui/material";
import { FC } from "react";

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
          <button onClick={() => request("/users/list")}>
            request auth guard
          </button>
        </Paper>
        <Paper>
          <div>ModalForm</div>
          <button onClick={() => message.error("错误")}>open ModalForm</button>
        </Paper>
      </Box>
    </LayoutMenu>
  );
};

export default HomePage;
