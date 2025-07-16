/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Box,
  Button,
  Container,
  FormControlLabel,
  LinearProgress,
  LinearProgressProps,
  Paper,
  styled,
  Switch,
  Typography,
} from "@mui/material";
import { sleep } from "@frfojo/common/utils/delay";
import Grid from "./components/Grid";
import { useGameManager } from "./useGameManager";
import ArrowCircleUpOutlinedIcon from "@mui/icons-material/ArrowCircleUpOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";
import ArrowCircleDownOutlinedIcon from "@mui/icons-material/ArrowCircleDownOutlined";

//@ts-ignore
const upAudioUrl = new URL("/up.mp3", import.meta.url).href;
//@ts-ignore
const downAudioUrl = new URL("/down.mp3", import.meta.url).href;
//@ts-ignore
const leftAudioUrl = new URL("/left.mp3", import.meta.url).href;
//@ts-ignore
const rightAudioUrl = new URL("/right.mp3", import.meta.url).href;

window.ffj_2048_interval = 500;

const move_nodes: Record<string, ReactNode> = {
  0: <ArrowCircleUpOutlinedIcon sx={{ fontSize: "256px" }} />,
  1: <ArrowCircleRightOutlinedIcon sx={{ fontSize: "256px" }} />,
  2: <ArrowCircleDownOutlinedIcon sx={{ fontSize: "256px" }} />,
  3: <ArrowCircleLeftOutlinedIcon sx={{ fontSize: "256px" }} />,
};

const Root = styled("div")(({ theme }) => ({}));

type ExecProps = {};

const Exec: FC<ExecProps> = (props) => {
  const [handle, setHandle] = useState();
  const [bestMove, setBestMove] = useState({});
  // 文件上一次修改时间
  const lastModified = useRef<number>(0);

  const [showGrid, setShowGrid] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);

  const { manager, progress } = useGameManager();

  window.m = manager;
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
      await sleep(window.ffj_2048_interval);

      try {
        const file: File = await handle.getFile();

        // 若文件没有被修改，那么执行下一循环
        if (file.lastModified === lastModified.current) {
          continue;
        }

        lastModified.current = file.lastModified;

        const grid = await getGrid(file);
        manager.current.setGrid(grid);
        setShowGrid(grid);
        // 预测下一步
        const res = manager.current.ai.getBest(net);
        // console.log(res);
        setBestMove(res);
      } catch (e) {
        //
      }
    }
  }

  async function getGrid(file: File) {
    const fr = new FileReader();

    fr.readAsText(file);

    return new Promise((resolve) =>
      fr.addEventListener("load", (d) => {
        // console.log("FileReader", d.target?.result);
        const text = d.target?.result as string;
        const grid = text
          ?.split("\r\n")
          .filter((row) => row)
          .map((row) => row.split(",").map((item) => Number(item)));

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

const moveDirection = {
  0: "up",
  1: "right",
  2: "down",
  3: "left",
};

type TheBestMoveProps = {
  move: { move: number; moves: any };
};

function TheBestMove({ move }: TheBestMoveProps) {
  const moveNode = move_nodes[move?.move];

  const [playAudio, setPlayAudio] = useState(false);

  // 存储当前播放的音频
  const currentAudio = useRef<HTMLAudioElement>();

  // 播放指定方向的音频
  function play(direction: "up" | "down" | "left" | "right") {
    // 获取对应方向的音频元素
    const audioElement: HTMLAudioElement | null = document.getElementById(
      `audio-${direction}`
    );

    if (!audioElement) {
      return;
    }

    // 如果当前音频不是这个，先停止当前音频
    if (currentAudio.current && currentAudio.current !== audioElement) {
      currentAudio.current.pause();
    }

    // 播放新音频
    audioElement.play();
    currentAudio.current = audioElement;
  }

  // 刷新一次 move 就播放一次语音
  useEffect(() => {
    playAudio && play(moveDirection[move?.move]);
  }, [move, playAudio]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "400px",
        position: "relative",
      }}
    >
      <audio id="audio-up" src={upAudioUrl}></audio>
      <audio id="audio-down" src={downAudioUrl}></audio>
      <audio id="audio-left" src={leftAudioUrl}></audio>
      <audio id="audio-right" src={rightAudioUrl}></audio>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "absolute",
          top: "12px",
        }}
      >
        <Box>最佳预测</Box>
        <FormControlLabel
          control={
            <Switch
              checked={playAudio}
              onChange={(e) => setPlayAudio(e.target.checked)}
            />
          }
          label="语音提示"
        />
      </Box>
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
