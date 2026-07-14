import { FC, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { message, useAccess } from "@frfojo/components";
import {
  approveSuspectLink,
  rejectSuspectLink,
} from "../services/api";
import {
  NODE_KIND_LABELS,
  PERM_BONET_AUDIT,
  hasPermission,
} from "../constants";
import { modalConfirm } from "../utils/modalConfirm";

export type AuditSession = {
  linkId: number;
  gidA: string;
  gidB: string;
};

type GraphAuditBarProps = {
  session: AuditSession;
  onBackToList: () => void;
  onDone: () => void;
};

const GraphAuditBar: FC<GraphAuditBarProps> = ({
  session,
  onBackToList,
  onDone,
}) => {
  const { permissions } = useAccess();
  const canAudit =
    permissions.includes(PERM_BONET_AUDIT) || hasPermission(PERM_BONET_AUDIT);
  const [auditMemo, setAuditMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleApprove() {
    if (!canAudit) {
      message.warning("无审核权限（需 A_WEB_BONET_AUDIT）");
      return;
    }
    if (!auditMemo.trim()) {
      message.warning("请填写审核依据");
      return;
    }
    setSubmitting(true);
    try {
      await approveSuspectLink(session.linkId, auditMemo.trim());
      message.success(
        `已通过：${NODE_KIND_LABELS.C} → ${NODE_KIND_LABELS.B}`,
      );
      setAuditMemo("");
      onDone();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "操作失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!canAudit) {
      message.warning("无审核权限（需 A_WEB_BONET_AUDIT）");
      return;
    }
    const ok = await modalConfirm({
      title: "驳回关联核实",
      content: `确认驳回 ${session.gidA} ↔ ${session.gidB} 的关联核实？`,
      okText: "驳回",
      cancelText: "取消",
    });
    if (!ok) return;

    setSubmitting(true);
    try {
      await rejectSuspectLink(session.linkId);
      message.success("已驳回该关联核实");
      onDone();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "操作失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderColor: "warning.main",
        bgcolor: "rgba(237, 108, 2, 0.06)",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip label="审核" color="warning" size="small" />
            <Typography variant="subtitle1">
              {session.gidA} ↔ {session.gidB}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {canAudit
                ? "请在下方关联图中核对节点关系"
                : "当前无审核权限，仅可查看关联图"}
            </Typography>
          </Stack>
          <Button size="small" onClick={onBackToList} disabled={submitting}>
            返回待审核列表
          </Button>
        </Stack>

        <TextField
          label="审核依据（通过时必填）"
          value={auditMemo}
          onChange={(e) => setAuditMemo(e.target.value)}
          multiline
          minRows={2}
          fullWidth
          size="small"
          disabled={submitting || !canAudit}
        />

        <Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="success"
              disabled={submitting || !canAudit}
              onClick={() => void handleApprove()}
            >
              通过 → {NODE_KIND_LABELS.B}
            </Button>
            <Button
              variant="outlined"
              color="error"
              disabled={submitting || !canAudit}
              onClick={() => void handleReject()}
            >
              驳回
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default GraphAuditBar;
