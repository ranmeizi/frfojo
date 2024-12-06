import { FC, useRef, useState } from "react";
import { Box, Button, Container, styled } from "@mui/material";
import { sleep } from "@frfojo/common";
import Grid from "./components/Grid";
import { useGameManager } from "./useGameManager";

const Root = styled("div")(({ theme }) => ({}));

type ExecProps = {};

const Exec: FC<ExecProps> = (props) => {
  const [handle, setHandle] = useState();

  const [showGrid, setShowGrid] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);

  const manager = useGameManager();

  async function getAccess() {
    const fsFileHandle = await showOpenFilePicker();

    console.log("fsFileHandle", fsFileHandle);
    // pick 出文件名为 grid.csv 的文件
    const handle = fsFileHandle.find((f) => f.name === "grid.csv");

    setHandle(handle);
  }

  async function run() {
    console.log("牛逼么", manager);
    while (true) {
      const grid = await getGrid();
      manager.current.setGrid(grid);
      setShowGrid(grid);
      await sleep(500);
    }
  }

  async function getGrid() {
    // 获取文件
    const file: File = await handle.getFile();

    console.log("file", file);

    const fr = new FileReader();

    fr.readAsText(file);

    return new Promise((resolve) =>
      fr.addEventListener("load", (d) => {
        console.log("FileReader", d.target?.result);
        const text = d.target?.result as string;
        const grid = text
          ?.split("\r\n")
          .filter((row) => row)
          .map((row) => row.split(","));

        resolve(grid);
      })
    );
  }
  return (
    <Root>
      <Container>
        <Button onClick={getAccess}>点击获取文件权限</Button>
        <Button onClick={run} disabled={!handle}>
          开始获取啦
        </Button>
        {/* 棋盘 */}
        <Box>
          <Grid data={showGrid} />
        </Box>
      </Container>
    </Root>
  );
};

export default Exec;
