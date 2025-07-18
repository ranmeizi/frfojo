import { sleep } from "@frfojo/common/utils/delay";
import { LayoutMenu, Modal, message } from "@frfojo/components";
import { FC } from "react";

type HomePageProps = {};

const HomePage: FC<HomePageProps> = () => {
  function open() {
    const a = Modal.confirm({
      title: "hi",
      content: "content",
      maskClosable: true,
      async onOk() {
        await sleep(3000);
      },
    });
    console.log("open over", a);
  }

  return (
    <LayoutMenu>
      <div>hello world</div>
      <button onClick={() => open()}>点我弹窗</button>
      <button onClick={() => message.success("成功")}>
        点我message.success
      </button>
      <button onClick={() => message.warning("警告")}>
        点我message.warning
      </button>
      <button onClick={() => message.error("错误")}>点我message.error</button>
      <button onClick={() => message.info("信息")}>点我message.info</button>
    </LayoutMenu>
  );
};

export default HomePage;
