import { FC, useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Back, LayoutMenu, message, useAccess } from "@frfojo/components";
import { useNavigate } from "react-router-dom";
import GidGraphCanvas from "./components/GidGraphCanvas";
import PlayerSearchSelect from "./components/PlayerSearchSelect";
import ReviewPanel from "./components/ReviewPanel";
import GraphAuditBar, { type AuditSession } from "./components/GraphAuditBar";
import { buildBoNetGraph } from "./services/buildGraph";
import { submitSuspectForReview } from "./services/submitSuspectForReview";
import {
  DEFAULT_GID_BOUNDARY,
  NODE_KIND_LABELS,
  PERM_BONET_APPLY,
  PERM_BONET_AUDIT,
  PERM_BONET_TRIAL,
  hasPermission,
  normalizeGid,
} from "./constants";
import type { BoNetGraphData, ManualGidLink, MomoPlayerGid } from "./types";

type BoNetGraphBizMode = "apply" | "audit";

type BoNetProps = Record<string, never>;

const BoNet: FC<BoNetProps> = () => {
  const navigate = useNavigate();
  const { permissions } = useAccess();
  const canTrial =
    permissions.includes(PERM_BONET_TRIAL) || hasPermission(PERM_BONET_TRIAL);
  const canApply =
    permissions.includes(PERM_BONET_APPLY) || hasPermission(PERM_BONET_APPLY);
  const canAudit =
    permissions.includes(PERM_BONET_AUDIT) || hasPermission(PERM_BONET_AUDIT);
  const [showReviewList, setShowReviewList] = useState(false);
  const [graphBizMode, setGraphBizMode] = useState<BoNetGraphBizMode>("apply");
  const [auditSession, setAuditSession] = useState<AuditSession | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<MomoPlayerGid | null>(
    null,
  );
  const [centerGid, setCenterGid] = useState("");
  const [graph, setGraph] = useState<BoNetGraphData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (canTrial) return;
    message.warning("无 BoNet 访问权限");
    navigate("/ffj/homepage", { replace: true });
  }, [canTrial, navigate]);

  const loadGraph = useCallback(
    async (gid?: string) => {
      const raw = (gid ?? selectedPlayer?.gid ?? "").trim();
      if (!raw) {
        message.warning("请先搜索并选择角色");
        return;
      }
      setLoading(true);
      try {
        const normalized = normalizeGid(raw);
        const built = await buildBoNetGraph(normalized, DEFAULT_GID_BOUNDARY);
        setCenterGid(normalized);
        setGraph(built);
      } catch (e) {
        message.error(e instanceof Error ? e.message : "加载关联图失败");
      } finally {
        setLoading(false);
      }
    },
    [selectedPlayer?.gid],
  );

  const handleSwitchGid = useCallback(
    (gid: string) => {
      const normalized = normalizeGid(gid);
      setSelectedPlayer({
        id: 0,
        name: normalized,
        gid: normalized,
      });
      void loadGraph(normalized);
    },
    [loadGraph],
  );

  const handleSubmitSuspectReview = useCallback(
    async (suspectGid: string, kind: "C" | "D") => {
      if (!hasPermission(PERM_BONET_APPLY)) {
        message.warning("无申请权限（需 A_WEB_BONET_APPLY）");
        return false;
      }
      if (!centerGid) return false;
      const res = await submitSuspectForReview(centerGid, suspectGid, kind);
      if (res.ok) {
        message.success(res.message);
        await loadGraph(centerGid);
        return true;
      }
      if (res.message !== "已取消") {
        message.warning(res.message);
      }
      return false;
    },
    [centerGid, loadGraph],
  );

  const enterApplyMode = useCallback(() => {
    setShowReviewList(false);
    setGraphBizMode("apply");
    setAuditSession(null);
  }, []);

  const enterAuditFromList = useCallback(
    (link: ManualGidLink) => {
      if (!canAudit) {
        message.warning("无审核权限（需 A_WEB_BONET_AUDIT）");
        return;
      }
      setShowReviewList(false);
      setGraphBizMode("audit");
      setAuditSession({
        linkId: link.id,
        gidA: link.gidA,
        gidB: link.gidB,
      });
      handleSwitchGid(link.gidA);
    },
    [canAudit, handleSwitchGid],
  );

  /** 从审核表格点击 GID：进入申请模式关联图，以该 GID 为中心 */
  const viewGraphFromList = useCallback(
    (gid: string) => {
      setShowReviewList(false);
      setGraphBizMode("apply");
      setAuditSession(null);
      handleSwitchGid(gid);
    },
    [handleSwitchGid],
  );

  const backToReviewList = useCallback(() => {
    setGraphBizMode("apply");
    setAuditSession(null);
    setShowReviewList(true);
  }, []);

  const handleAuditDone = useCallback(() => {
    setGraphBizMode("apply");
    setAuditSession(null);
    setShowReviewList(true);
  }, []);

  const sidebar = (
    <List>
      <ListItem disablePadding>
        <ListItemButton selected={!showReviewList} onClick={enterApplyMode}>
          <ListItemText
            primary="关联图 · 申请"
            secondary="搜索角色 · 拖拽 D 提交核实"
          />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton
          selected={showReviewList}
          disabled={!canAudit}
          onClick={() => {
            if (!canAudit) {
              message.warning("无审核权限（需 A_WEB_BONET_AUDIT）");
              return;
            }
            setShowReviewList(true);
            setGraphBizMode("apply");
            setAuditSession(null);
          }}
        >
          <ListItemText
            primary="审核"
            secondary={
              canAudit
                ? "待审核 / 已审核列表 · 删除关系"
                : "无审核权限"
            }
          />
        </ListItemButton>
      </ListItem>
    </List>
  );

  const logo = (
    <Stack direction="row" spacing={2} alignItems="center">
      <Back tooltip="返回" onClick={() => navigate(-1)} />
      <Box>BoNet · GID 关联图</Box>
    </Stack>
  );

  const isAuditGraph = graphBizMode === "audit" && auditSession !== null;

  if (!canTrial) {
    return null;
  }

  return (
    <LayoutMenu logo={logo} sidebar={sidebar}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {showReviewList ? (
          <ReviewPanel
            onEnterAudit={enterAuditFromList}
            onViewGraph={viewGraphFromList}
            canAudit={canAudit}
          />
        ) : (
          <>
            {isAuditGraph ? (
              <GraphAuditBar
                session={auditSession}
                onBackToList={backToReviewList}
                onDone={handleAuditDone}
              />
            ) : (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ sm: "center" }}
                >
                  <Chip label="申请" color="primary" size="small" />
                  <PlayerSearchSelect
                    value={selectedPlayer}
                    onChange={setSelectedPlayer}
                    disabled={loading}
                  />
                  <Button
                    variant="contained"
                    onClick={() => void loadGraph()}
                    disabled={loading || !selectedPlayer}
                  >
                    查询并渲染
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {NODE_KIND_LABELS.A}/{NODE_KIND_LABELS.B}/
                    {NODE_KIND_LABELS.C} 中心力布局，
                    {NODE_KIND_LABELS.D} 外环 · 拖拽 {NODE_KIND_LABELS.D}{" "}
                    至虚线圈内提交核实
                    {!canApply ? "（当前无申请权限）" : ""}
                  </Typography>
                </Stack>
              </Paper>
            )}

            <Paper sx={{ p: 2, width: "100%" }}>
              {isAuditGraph ? (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    中心 GID：{centerGid || auditSession.gidA}
                  </Typography>
                </Stack>
              ) : null}
              <GidGraphCanvas
                data={graph}
                loading={loading}
                centerGid={centerGid}
                bizMode={graphBizMode}
                auditFocus={
                  isAuditGraph
                    ? {
                        gidA: auditSession.gidA,
                        gidB: auditSession.gidB,
                      }
                    : undefined
                }
                onSwitchGid={isAuditGraph ? undefined : handleSwitchGid}
                onSubmitSuspectReview={
                  isAuditGraph ? undefined : handleSubmitSuspectReview
                }
              />
            </Paper>
          </>
        )}
      </Container>
    </LayoutMenu>
  );
};

export default BoNet;
