import { FC, useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { message } from "@frfojo/components";
import PlayerSearchSelect from "./PlayerSearchSelect";
import { getPlayerGraphByGid } from "../services/api";
import { submitRuleSuspectAdd } from "../services/submitRuleSuspect";
import {
  DEFAULT_GID_BOUNDARY,
  NODE_KIND_LABELS,
  normalizeGid,
} from "../constants";
import type {
  MomoPlayerGid,
  PlayerGraphData,
  TempSuspectInjection,
} from "../types";

export type ContrastGidOption = {
  gid: string;
  names: MomoPlayerGid[];
  kindHint: string;
};

type SuspectInjectPanelProps = {
  centerGid: string;
  tempSuspects: TempSuspectInjection[];
  disabled?: boolean;
  canApply: boolean;
  onInject: (items: TempSuspectInjection[]) => void;
  onRemoveTemp: (gid: string) => void;
  onPersisted: (suspectGid: string) => void;
};

function collectContrastOptions(data: PlayerGraphData): ContrastGidOption[] {
  const center = normalizeGid(data.centerGid);
  const map = new Map<string, ContrastGidOption>();

  const ensure = (gid: string, kindHint: string) => {
    const g = normalizeGid(gid);
    if (!map.has(g)) {
      map.set(g, {
        gid: g,
        names: data.namesByGid[g] ?? [],
        kindHint,
      });
    }
  };

  ensure(center, "对照中心");
  for (const p of data.exactCluster) {
    ensure(p.gid, "同 GID 簇");
  }
  for (const link of data.confirmedLinks) {
    const other = link.gidA === center ? link.gidB : link.gidA;
    ensure(other, NODE_KIND_LABELS.B);
  }
  for (const link of data.suspectLinks) {
    const other = link.gidA === center ? link.gidB : link.gidA;
    ensure(other, NODE_KIND_LABELS.C);
  }
  for (const item of data.ruleSuspects ?? []) {
    ensure(item.gid, NODE_KIND_LABELS.D);
  }

  return [...map.values()];
}

const SuspectInjectPanel: FC<SuspectInjectPanelProps> = ({
  centerGid,
  tempSuspects,
  disabled,
  canApply,
  onInject,
  onRemoveTemp,
  onPersisted,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<MomoPlayerGid | null>(
    null,
  );
  const [gidInput, setGidInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contrast, setContrast] = useState<PlayerGraphData | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [memo, setMemo] = useState("");
  const [persistGid, setPersistGid] = useState("");
  const [persisting, setPersisting] = useState(false);

  const options = useMemo(
    () => (contrast ? collectContrastOptions(contrast) : []),
    [contrast],
  );

  const tempGidSet = useMemo(
    () => new Set(tempSuspects.map((t) => normalizeGid(t.gid))),
    [tempSuspects],
  );

  const queryContrast = useCallback(async () => {
    const raw =
      selectedPlayer?.gid?.trim() ||
      gidInput.trim() ||
      "";
    if (!raw) {
      message.warning("请搜索角色或输入 GID");
      return;
    }
    if (!centerGid) {
      message.warning("请先查询并渲染当前中心图");
      return;
    }

    setLoading(true);
    try {
      const data = await getPlayerGraphByGid(raw, DEFAULT_GID_BOUNDARY);
      setContrast(data);
      const center = normalizeGid(data.centerGid);
      setPicked(new Set([center]));
      setGidInput(center);
      message.success(`已加载对照图：${center}`);
    } catch (e) {
      setContrast(null);
      message.error(e instanceof Error ? e.message : "查询对照图失败");
    } finally {
      setLoading(false);
    }
  }, [centerGid, gidInput, selectedPlayer?.gid]);

  const togglePick = useCallback((gid: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(gid)) next.delete(gid);
      else next.add(gid);
      return next;
    });
  }, []);

  const handleInject = useCallback(() => {
    if (!contrast) {
      message.warning("请先按 GID 查询对照人物节点图");
      return;
    }
    const fromCenter = normalizeGid(contrast.centerGid);
    const center = normalizeGid(centerGid);
    const items: TempSuspectInjection[] = [];

    for (const opt of options) {
      if (!picked.has(opt.gid)) continue;
      if (opt.gid === center) continue;
      if (tempGidSet.has(opt.gid)) continue;
      items.push({
        gid: opt.gid,
        names: opt.names,
        fromCenterGid: fromCenter,
      });
    }

    if (!items.length) {
      message.warning("没有可插入的 GID（可能已在图中或未勾选）");
      return;
    }

    onInject(items);
    if (!persistGid) {
      setPersistGid(items[0].gid);
    }
    message.success(
      `已临时插入 ${items.length} 个可疑节点（不可拖拽，需落库后可拖）`,
    );
  }, [
    centerGid,
    contrast,
    onInject,
    options,
    persistGid,
    picked,
    tempGidSet,
  ]);

  const handlePersist = useCallback(async () => {
    if (!canApply) {
      message.warning("无申请权限（需 A_WEB_BONET_APPLY）");
      return;
    }
    const suspect = normalizeGid(persistGid || tempSuspects[0]?.gid || "");
    if (!suspect) {
      message.warning("请选择要落库的临时可疑 GID");
      return;
    }
    if (!tempGidSet.has(suspect)) {
      message.warning("该 GID 不在临时可疑列表中");
      return;
    }

    setPersisting(true);
    try {
      const res = await submitRuleSuspectAdd(centerGid, suspect, memo);
      if (res.ok) {
        message.success(res.message);
        setMemo("");
        onPersisted(suspect);
      } else if (res.message !== "已取消") {
        message.warning(res.message);
      }
    } finally {
      setPersisting(false);
    }
  }, [
    canApply,
    centerGid,
    memo,
    onPersisted,
    persistGid,
    tempGidSet,
    tempSuspects,
  ]);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ sm: "center" }}
          flexWrap="wrap"
        >
          <Chip label="对照插入" size="small" color="secondary" />
          <Typography variant="body2" color="text.secondary">
            按 GID 查询另一人物节点图 → 临时插入可疑节点（不可拖拽）→ 落库后可拖拽提交核实
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ sm: "center" }}
        >
          <PlayerSearchSelect
            value={selectedPlayer}
            onChange={(p) => {
              setSelectedPlayer(p);
              if (p) setGidInput(p.gid);
            }}
            disabled={disabled || loading}
          />
          <TextField
            size="small"
            label="或直接输入 GID"
            value={gidInput}
            onChange={(e) => setGidInput(e.target.value)}
            disabled={disabled || loading}
            sx={{ minWidth: 160 }}
          />
          <Button
            variant="outlined"
            onClick={() => void queryContrast()}
            disabled={disabled || loading || !centerGid}
          >
            查询对照图
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleInject}
            disabled={disabled || loading || !contrast || !centerGid}
          >
            临时插入可疑节点
          </Button>
        </Stack>

        {contrast ? (
          <Box>
            <Typography variant="caption" color="text.secondary">
              对照中心 {normalizeGid(contrast.centerGid)} · 勾选要插入当前图的
              GID（含角色名）
            </Typography>
            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 0.5 }}
            >
              {options.map((opt) => {
                const alreadyTemp = tempGidSet.has(opt.gid);
                const isCenter = opt.gid === normalizeGid(centerGid);
                const names =
                  opt.names.length > 0
                    ? opt.names.map((n) => n.name).join("、")
                    : "无角色名";
                return (
                  <FormControlLabel
                    key={opt.gid}
                    control={
                      <Checkbox
                        size="small"
                        checked={picked.has(opt.gid)}
                        disabled={isCenter || alreadyTemp}
                        onChange={() => togglePick(opt.gid)}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {opt.gid}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 0.5 }}
                        >
                          [{opt.kindHint}] {names}
                          {isCenter
                            ? "（当前中心，跳过）"
                            : alreadyTemp
                              ? "（已临时插入）"
                              : ""}
                        </Typography>
                      </Typography>
                    }
                  />
                );
              })}
            </Stack>
          </Box>
        ) : null}

        {tempSuspects.length > 0 ? (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              已临时插入（未落库，不可拖拽）
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {tempSuspects.map((t) => (
                <Chip
                  key={t.gid}
                  size="small"
                  color={
                    normalizeGid(persistGid) === normalizeGid(t.gid)
                      ? "secondary"
                      : "default"
                  }
                  variant={
                    normalizeGid(persistGid) === normalizeGid(t.gid)
                      ? "filled"
                      : "outlined"
                  }
                  label={`${t.gid}${
                    t.names.length
                      ? ` · ${t.names.map((n) => n.name).slice(0, 2).join("/")}`
                      : ""
                  }`}
                  onClick={() => setPersistGid(t.gid)}
                  onDelete={() => onRemoveTemp(t.gid)}
                />
              ))}
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "flex-start" }}
            >
              <TextField
                size="small"
                label="可疑原因（memo）"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                disabled={persisting || !canApply}
                sx={{ flex: 1, minWidth: 220 }}
                placeholder="例如：人工对照角色名相似"
              />
              <Button
                variant="contained"
                onClick={() => void handlePersist()}
                disabled={
                  persisting ||
                  !canApply ||
                  !tempSuspects.length ||
                  !centerGid
                }
              >
                添加可疑关系（落库）
              </Button>
            </Stack>
            {!canApply ? (
              <Typography variant="caption" color="warning.main">
                当前无申请权限，无法落库
              </Typography>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
};

export default SuspectInjectPanel;
