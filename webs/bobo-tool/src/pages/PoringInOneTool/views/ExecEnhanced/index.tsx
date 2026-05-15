/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
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
import {
  applyMoveWithoutSpawn,
  exportGridFromManager,
  maxTileInMatrix,
  parseGridCsvText,
} from "./libs/board2048";
import { createFilePushHandleTransport } from "./libs/filePushTransport";
import { runMockControlUnitPush } from "./libs/mockControlUnit";
import { useLocation } from "react-router-dom";
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

/** 盘面最大块 ≥ 此值时关闭乐观 UI，仅回执/文件更新（见 DEV_PLAN.md） */
const OPTIMISTIC_UI_MAX_TILE = 1024;

const move_nodes: Record<string, ReactNode> = {
  0: <ArrowCircleUpOutlinedIcon sx={{ fontSize: "256px" }} />,
  1: <ArrowCircleRightOutlinedIcon sx={{ fontSize: "256px" }} />,
  2: <ArrowCircleDownOutlinedIcon sx={{ fontSize: "256px" }} />,
  3: <ArrowCircleLeftOutlinedIcon sx={{ fontSize: "256px" }} />,
};

const Root = styled("div")(({ theme }) => ({}));

type ExecEnhancedProps = {};

/** 由 Exec 复制：功能增强版在此目录迭代，原版保留在 views/Exec。开发计划见 ./DEV_PLAN.md */
const ExecEnhanced: FC<ExecEnhancedProps> = (props) => {
  const [handle, setHandle] = useState<FileSystemFileHandle | undefined>();
  const [mockControlUnit, setMockControlUnit] = useState(false);
  const [bestMove, setBestMove] = useState({});
  // 文件上一次修改时间
  const lastModified = useRef<number>(0);
  /** 每次 +1 会使当前所有 run 循环在下一轮退出 */
  const pollGenerationRef = useRef(0);
  const location = useLocation();

  const [showGrid, setShowGrid] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);

  const { manager, progress } = useGameManager();

  const stopPolling = useCallback(() => {
    pollGenerationRef.current += 1;
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  useEffect(() => {
    stopPolling();
  }, [location.pathname, location.key, stopPolling]);

  window.m = manager;
  console.log("progress", progress);

  useEffect(() => {
    if (!mockControlUnit || !handle) {
      return;
    }
    const fileHandle = handle;
    const prev = window.ffj_onPushHandle;
    const installed = async (dir: number, board: number[][]) => {
      await runMockControlUnitPush(dir, board, fileHandle, {
        maxDelayMs: 500,
      });
    };
    window.ffj_onPushHandle = installed;
    return () => {
      if (window.ffj_onPushHandle === installed) {
        window.ffj_onPushHandle = prev;
      }
    };
  }, [mockControlUnit, handle]);

  async function getAccess() {
    stopPolling();
    try {
      const fsFileHandle = await showOpenFilePicker({
        multiple: true,
        mode: "readwrite",
      });

      console.log("fsFileHandle", fsFileHandle);
      // pick 出文件名为 grid.csv 的文件
      const next = fsFileHandle.find((f) => f.name === "grid.csv");

      setHandle(next);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        return;
      }
      throw e;
    }
  }

  async function readGridFromFile(file: File): Promise<number[][]> {
    const text = await file.text();
    return parseGridCsvText(text);
  }

  async function run() {
    if (!handle) {
      return;
    }

    stopPolling();
    const generation = pollGenerationRef.current;
    const fileHandle = handle;
    const net = manager.current.net;

    const transport = createFilePushHandleTransport({
      fileHandle,
      lastModifiedRef: lastModified,
      readGrid: readGridFromFile,
      pollIntervalMs: 50,
      ackTimeoutMs: 120_000,
    });

    try {
      const bootFile = await fileHandle.getFile();
      lastModified.current = bootFile.lastModified;
      const bootGrid = await readGridFromFile(bootFile);
      manager.current.setGrid(bootGrid);
      setShowGrid(bootGrid);
    } catch (e) {
      console.error(e);
      return;
    }

    while (generation === pollGenerationRef.current) {
      if (generation !== pollGenerationRef.current) {
        break;
      }

      try {
        const res = manager.current.ai.getBest(net);
        setBestMove(res);

        const nums = exportGridFromManager(manager.current);
        const maxVal = maxTileInMatrix(nums);
        const allowOptimisticUi = maxVal < OPTIMISTIC_UI_MAX_TILE;
        const sim = applyMoveWithoutSpawn(nums, res.move);

        if (allowOptimisticUi && sim.moved) {
          setShowGrid(sim.board);
        }

        if (!sim.moved) {
          await sleep(window.ffj_2048_interval);
          try {
            const f = await fileHandle.getFile();
            if (f.lastModified !== lastModified.current) {
              lastModified.current = f.lastModified;
              const g = await readGridFromFile(f);
              manager.current.setGrid(g);
              setShowGrid(g);
            }
          } catch {
            //
          }
          continue;
        }

        const ackGrid = await transport.pushMove(res.move, sim.board);
        if (generation !== pollGenerationRef.current) {
          break;
        }
        if (ackGrid) {
          manager.current.setGrid(ackGrid);
          setShowGrid(ackGrid);
        }
      } catch {
        await sleep(window.ffj_2048_interval);
      }
    }
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
            <FormControlLabel
              sx={{ ml: 1, display: "block", mt: 1 }}
              control={
                <Switch
                  checked={mockControlUnit}
                  onChange={(_, c) => setMockControlUnit(c)}
                  disabled={!handle}
                />
              }
              label="测试控制单元挡板（写 grid.csv + 随机 2/4）"
            />
            <Typography variant="body2" sx={{ mt: 1, maxWidth: 720 }}>
              增强逻辑：模型基于权威 grid → 可选乐观 UI（合并、不生成随机块，max
              &lt; {OPTIMISTIC_UI_MAX_TILE}）→{" "}
              <code>window.ffj_onPushHandle(direction, predictedBoard)</code>{" "}
              触发控制单元 → 以 grid.csv 变更作为回执对齐。挡板开启时由页面在
              0～500ms 内写入预测盘并随机落子。需对 grid.csv
              选择「读写」权限。详见 <code>views/ExecEnhanced/DEV_PLAN.md</code>
              。
            </Typography>
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
      `audio-${direction}`,
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
  props: LinearProgressProps & { value: number },
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

export default ExecEnhanced;
