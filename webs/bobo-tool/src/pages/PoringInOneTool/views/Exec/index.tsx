import { FC, ReactNode, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  styled,
  Typography,
} from "@mui/material";
import { sleep } from "@frfojo/common";
import Grid from "./components/Grid";
import { useGameManager } from "./useGameManager";
import ArrowCircleUpOutlinedIcon from "@mui/icons-material/ArrowCircleUpOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";
import ArrowCircleDownOutlinedIcon from "@mui/icons-material/ArrowCircleDownOutlined";

window.ffj_2048_interval = 500;

const move_nodes: Record<string, ReactNode> = {
  0: <ArrowCircleUpOutlinedIcon sx={{ fontSize: "128px" }} />,
  1: <ArrowCircleRightOutlinedIcon sx={{ fontSize: "128px" }} />,
  2: <ArrowCircleDownOutlinedIcon sx={{ fontSize: "128px" }} />,
  3: <ArrowCircleLeftOutlinedIcon sx={{ fontSize: "128px" }} />,
};

const Root = styled("div")(({ theme }) => ({}));

type ExecProps = {};

const Exec: FC<ExecProps> = (props) => {
  const [handle, setHandle] = useState();
  const [bestMove, setBestMove] = useState();

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
    const net = manager.current.net;
    while (true) {
      const grid = await getGrid();
      manager.current.setGrid(grid);
      setShowGrid(grid);
      // 预测下一步
      const res = manager.current.ai.getBest(net);
      console.log(res);
      setBestMove(res?.move);
      await sleep(window.ffj_2048_interval);
    }
  }

  async function getGrid() {
    // 获取文件
    const file: File = await handle.getFile();

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
        <Paper sx={{}}>
          <Button onClick={getAccess}>点击获取文件权限</Button>
          <Button onClick={run} disabled={!handle}>
            开始获取啦
          </Button>
        </Paper>

        {/* 棋盘 */}
        <Paper
          sx={{
            display: "flex",
            justifyContent: "space-around",
            overflow: "hidden",
            padding: "24px",
          }}
        >
          <Grid data={showGrid} />
          <TheBestMove move={bestMove} />
        </Paper>
      </Container>
    </Root>
  );
};

function TheBestMove({ move }: { move: number }) {
  const moveNode = move_nodes[move];
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "400px",
      }}
    >
      <Box>最佳预测</Box>
      {moveNode ? <Box sx={{ color: "red" }}>{moveNode}</Box> : null}
    </Box>
  );
}

export default Exec;
