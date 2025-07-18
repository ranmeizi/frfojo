import { sleep } from "@frfojo/common/utils/delay";
import { LayoutMenu, ModalExpand } from "@frfojo/components";
import { FC } from "react";

type HomePageProps = {};

const HomePage: FC<HomePageProps> = () => {
  function open() {
    const a = ModalExpand.confirm({
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
    </LayoutMenu>
  );
};

export default HomePage;
