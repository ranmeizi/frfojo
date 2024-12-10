import { FC, PropsWithChildren, ReactNode, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  LinearProgress,
  LinearProgressProps,
  Link,
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
import Spin from "@frfojo/components/loading/Spin";

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

  const { manager, progress } = useGameManager();

  console.log("progress", progress);

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
        <LoadModelGuard progress={progress}>
          <Paper sx={{ marginBottom: "12px", padding: "24px" }}>
            <Box sx={{ display: "flex" }}>
              <Typography sx={{ mr: "12px" }}>生命体脚本下载:</Typography>
              <a
                href="https://raw.githubusercontent.com/ranmeizi/ro-homu-ai/refs/heads/main/2048/AI.lua"
                target="downloadFile"
                download
              >
                AI.lua
              </a>
            </Box>
            <Button onClick={getAccess}>点击获取文件权限</Button>
            <Button onClick={run} disabled={!handle}>
              运行
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
        </LoadModelGuard>
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

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "30%" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary" }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

function LoadModelGuard({
  progress,
  children,
}: PropsWithChildren<{ progress: number }>) {
  const loading = progress < 100;
  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      {loading ? (
        <Box
          className="loading-mask"
          sx={{
            position: "absolute",
            zIndex: "1000",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0,0,0,.8)",
          }}
        >
          <Typography sx={{ marginBottom: "16px" }}>模型加载中...</Typography>
          <LinearProgressWithLabel value={progress} />
        </Box>
      ) : null}

      {children}
    </Box>
  );
}

export default Exec;
