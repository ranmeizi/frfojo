import { FC, useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Link,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { message, useAccess } from "@frfojo/components";
import {
  boNetDeleteLink,
  getBoNetApplyList,
  getBoNetConfirmedList,
} from "../services/api";
import type { ManualGidLink } from "../types";
import {
  NODE_KIND_LABELS,
  PERM_BONET_AUDIT,
  hasPermission,
} from "../constants";
import { modalConfirm } from "../utils/modalConfirm";

type ReviewPanelProps = {
  onEnterAudit: (link: ManualGidLink) => void;
  /** 点击 GID 跳转关联图（以该 GID 为中心） */
  onViewGraph: (gid: string) => void;
  /** 审核 / 删除权限；不传则内部自行判断 */
  canAudit?: boolean;
};

type ReviewTab = "pending" | "confirmed";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

const gidLinkSx = {
  fontFamily: "monospace",
  cursor: "pointer",
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
} as const;

const ReviewPanel: FC<ReviewPanelProps> = ({
  onEnterAudit,
  onViewGraph,
  canAudit: canAuditProp,
}) => {
  const { permissions } = useAccess();
  const canAudit =
    canAuditProp ??
    (permissions.includes(PERM_BONET_AUDIT) ||
      hasPermission(PERM_BONET_AUDIT));
  const [tab, setTab] = useState<ReviewTab>("pending");
  const [pending, setPending] = useState<ManualGidLink[]>([]);
  const [confirmed, setConfirmed] = useState<ManualGidLink[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadPending = useCallback(async () => {
    const result = await getBoNetApplyList({ pageSize: 100 });
    setPending(result.list);
    setPendingTotal(result.total);
  }, []);

  const loadConfirmed = useCallback(async () => {
    const result = await getBoNetConfirmedList({ pageSize: 100 });
    setConfirmed(result.list);
    setConfirmedTotal(result.total);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadPending(), loadConfirmed()]);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "加载失败");
      setPending([]);
      setConfirmed([]);
      setPendingTotal(0);
      setConfirmedTotal(0);
    } finally {
      setLoading(false);
    }
  }, [loadConfirmed, loadPending]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = useCallback(
    async (link: ManualGidLink) => {
      if (!canAudit) {
        message.warning("无审核权限（需 A_WEB_BONET_AUDIT）");
        return;
      }
      const ok = await modalConfirm({
        title: "删除关联关系",
        content: `确认删除 ${link.gidA} ↔ ${link.gidB} 的已确认关联？\n删除后两个 GID 将不再视为同账号。`,
        okText: "删除",
        cancelText: "取消",
      });
      if (!ok) return;

      setDeletingId(link.id);
      try {
        await boNetDeleteLink({ linkId: link.id });
        message.success("已删除关联关系");
        await loadConfirmed();
      } catch (e) {
        message.error(e instanceof Error ? e.message : "删除失败");
      } finally {
        setDeletingId(null);
      }
    },
    [canAudit, loadConfirmed],
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Box>
          <Typography variant="h6">关联审核</Typography>
          <Typography variant="body2" color="text.secondary">
            待审核 {pendingTotal} 条 · 已审核 {confirmedTotal} 条
          </Typography>
        </Box>
        <Button size="small" onClick={() => void load()} disabled={loading}>
          刷新
        </Button>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v: ReviewTab) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label={`待审核 (${pendingTotal})`} value="pending" />
        <Tab label={`已审核 (${confirmedTotal})`} value="confirmed" />
      </Tabs>

      {tab === "pending" ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>GID A</TableCell>
                <TableCell>GID B</TableCell>
                <TableCell>提交人</TableCell>
                <TableCell>提交时间</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pending.map((link) => (
                <TableRow key={link.id} hover>
                  <TableCell>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      sx={gidLinkSx}
                      onClick={() => onViewGraph(link.gidA)}
                    >
                      {link.gidA}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      sx={gidLinkSx}
                      onClick={() => onViewGraph(link.gidB)}
                    >
                      {link.gidB}
                    </Link>
                  </TableCell>
                  <TableCell>{link.applicant ?? "—"}</TableCell>
                  <TableCell>{formatTime(link.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="contained"
                      disabled={!canAudit}
                      onClick={() => {
                        if (!canAudit) {
                          message.warning("无审核权限（需 A_WEB_BONET_AUDIT）");
                          return;
                        }
                        onEnterAudit(link);
                      }}
                    >
                      进入关联图审核
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && pending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: "text.secondary" }}>
                    暂无待审核的关联核实
                  </TableCell>
                </TableRow>
              ) : null}
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: "text.secondary" }}>
                    加载中…
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>GID A</TableCell>
                <TableCell>GID B</TableCell>
                <TableCell>审核人</TableCell>
                <TableCell>审核依据</TableCell>
                <TableCell>审核时间</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {confirmed.map((link) => (
                <TableRow key={link.id} hover>
                  <TableCell>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      sx={gidLinkSx}
                      onClick={() => onViewGraph(link.gidA)}
                    >
                      {link.gidA}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      sx={gidLinkSx}
                      onClick={() => onViewGraph(link.gidB)}
                    >
                      {link.gidB}
                    </Link>
                  </TableCell>
                  <TableCell>{link.auditor ?? "—"}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 240,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={link.auditMemo ?? undefined}
                  >
                    {link.auditMemo ?? "—"}
                  </TableCell>
                  <TableCell>{formatTime(link.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      disabled={!canAudit || deletingId === link.id}
                      onClick={() => void handleDelete(link)}
                    >
                      {deletingId === link.id ? "删除中…" : "删除关系"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && confirmed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ color: "text.secondary" }}>
                    暂无已审核的关联记录
                  </TableCell>
                </TableRow>
              ) : null}
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ color: "text.secondary" }}>
                    加载中…
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block" }}
      >
        {tab === "pending"
          ? canAudit
            ? `待审核项可在关联图中通过或驳回，通过后变为 ${NODE_KIND_LABELS.B} 类节点。`
            : "当前无审核权限（需 A_WEB_BONET_AUDIT），仅可查看列表。"
          : canAudit
            ? "已审核列表展示 confirmed 关联，可删除错误确认的关联关系。"
            : "当前无审核权限（需 A_WEB_BONET_AUDIT），不可删除关联。"}
      </Typography>
    </Paper>
  );
};

export default ReviewPanel;
