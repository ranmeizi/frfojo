import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Divider,
  List,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { AsyncButton, message } from "@frfojo/components";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import * as BcServices from "@/services/bc";

function labelUser(u?: DTOs.Bc.User | null) {
  if (!u) return "unknown";
  return u.nickname || u.username || u.id;
}

export default function ServerContent() {
  const params = useParams<{ serverId: string; topic?: string }>();
  const serverId = params.serverId;
  const channelId = params.topic;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [channels, setChannels] = useState<DTOs.Bc.Channel[]>([]);
  const [members, setMembers] = useState<DTOs.Bc.Member[]>([]);
  const [messages, setMessages] = useState<DTOs.Bc.Message[]>([]);

  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [sendContent, setSendContent] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const [editMsgOpen, setEditMsgOpen] = useState(false);
  const [editMsgLoading, setEditMsgLoading] = useState(false);
  const [editMsgTarget, setEditMsgTarget] = useState<DTOs.Bc.Message | null>(
    null
  );
  const [editMsgContent, setEditMsgContent] = useState("");

  const [delMsgOpen, setDelMsgOpen] = useState(false);
  const [delMsgLoading, setDelMsgLoading] = useState(false);
  const [delMsgId, setDelMsgId] = useState<string | null>(null);

  const [membersDrawerOpen, setMembersDrawerOpen] = useState(false);

  const selectedChannel = useMemo(
    () => channels.find((c) => c.id === channelId) || null,
    [channels, channelId]
  );

  const memberGroups = useMemo(() => {
    const groups: Record<DTOs.Bc.Member["status"], DTOs.Bc.Member[]> = {
      online: [],
      idle: [],
      dnd: [],
      offline: [],
    };
    for (const m of members) groups[m.status].push(m);
    const sortByName = (a: DTOs.Bc.Member, b: DTOs.Bc.Member) =>
      labelUser(a.user).localeCompare(labelUser(b.user), "zh-Hans-CN");
    for (const k of Object.keys(groups) as Array<DTOs.Bc.Member["status"]>) {
      groups[k].sort(sortByName);
    }
    return groups;
  }, [members]);

  function statusColor(status: DTOs.Bc.Member["status"]) {
    switch (status) {
      case "online":
        return "#23a559";
      case "idle":
        return "#f0b232";
      case "dnd":
        return "#f23f43";
      case "offline":
      default:
        return alpha(theme.palette.text.primary, 0.35);
    }
  }

  function initials(name: string) {
    const t = (name || "").trim();
    if (!t) return "?";
    return t.slice(0, 2).toUpperCase();
  }

  async function refreshChannels() {
    if (!serverId) return;
    setLoadingChannels(true);
    try {
      const res = await BcServices.listChannels({ serverId });
      if (res.code !== "000000") {
        message.error(res.msg || "拉取频道失败");
        return;
      }
      setChannels(res.data || []);
    } finally {
      setLoadingChannels(false);
    }
  }

  async function refreshMembers(next?: { search?: string }) {
    if (!serverId) return;
    setLoadingMembers(true);
    try {
      const res = await BcServices.listMembers({
        serverId,
        current: 1,
        pageSize: 50,
        search: next?.search,
      });
      if (res.code !== "000000") {
        message.error(res.msg || "拉取成员失败");
        return;
      }
      setMembers(res.data.list || []);
    } finally {
      setLoadingMembers(false);
    }
  }

  async function refreshMessages() {
    if (!serverId || !channelId) return;
    setLoadingMessages(true);
    try {
      const res = await BcServices.listMessages({ serverId, channelId, limit: 50 });
      if (res.code !== "000000") {
        message.error(res.msg || "拉取消息失败");
        return;
      }
      setMessages(res.data.list || []);
    } finally {
      setLoadingMessages(false);
    }
  }

  function openEditMessage(m: DTOs.Bc.Message) {
    setEditMsgTarget(m);
    setEditMsgContent(m.content || "");
    setEditMsgOpen(true);
  }

  async function onSaveEditMessage() {
    if (!editMsgTarget) return;
    const content = editMsgContent.trim();
    if (!content) {
      message.error("消息内容不能为空");
      return;
    }
    setEditMsgLoading(true);
    try {
      const res = await BcServices.updateMessage({ id: editMsgTarget.id, content });
      if (res.code !== "000000") {
        message.error(res.msg || "编辑失败");
        return;
      }
      message.success("已编辑");
      setEditMsgOpen(false);
      setEditMsgTarget(null);
      await refreshMessages();
    } finally {
      setEditMsgLoading(false);
    }
  }

  function openDeleteMessage(id: string) {
    setDelMsgId(id);
    setDelMsgOpen(true);
  }

  async function onConfirmDeleteMessage() {
    if (!delMsgId) return;
    setDelMsgLoading(true);
    try {
      const res = await BcServices.deleteMessage({ id: delMsgId });
      if (res.code !== "000000") {
        message.error(res.msg || "删除失败");
        return;
      }
      message.success("已删除");
      setDelMsgOpen(false);
      setDelMsgId(null);
      await refreshMessages();
    } finally {
      setDelMsgLoading(false);
    }
  }

  async function onSend() {
    const content = sendContent.trim();
    if (!serverId || !channelId) {
      message.error("请先选择频道");
      return;
    }
    if (!content) {
      message.error("请输入消息内容");
      return;
    }
    const res = await BcServices.sendMessage({
      serverId,
      channelId,
      content,
      replyTo: null,
    });
    if (res.code !== "000000") {
      message.error(res.msg || "发送失败");
      return;
    }
    setSendContent("");
    await refreshMessages();
  }

  useEffect(() => {
    refreshChannels().catch(() => {});
    refreshMembers({ search: "" }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  useEffect(() => {
    refreshMessages().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, channelId]);

  useEffect(() => {
    const onRefreshMessages = () => {
      refreshMessages().catch(() => {});
    };
    const onRefreshMembers = (e: Event) => {
      const ce = e as CustomEvent<{ search?: string }>;
      const search = ce.detail?.search ?? memberSearch;
      setMemberSearch(search || "");
      refreshMembers({ search }).catch(() => {});
    };
    const onRefreshChannels = () => {
      refreshChannels().catch(() => {});
    };
    const onToggleMembers = () => {
      if (isMobile) {
        setMembersDrawerOpen((v) => !v);
        // 打开时顺便拉一次（避免 stale）
        if (!membersDrawerOpen) {
          refreshMembers({ search: memberSearch }).catch(() => {});
        }
      } else {
        // 桌面端保持右侧常驻，不做 toggle
        refreshMembers({ search: memberSearch }).catch(() => {});
      }
    };

    window.addEventListener("bc:refreshMessages", onRefreshMessages);
    window.addEventListener("bc:refreshMembers", onRefreshMembers as EventListener);
    window.addEventListener("bc:refreshChannels", onRefreshChannels);
    window.addEventListener("bc:toggleMembers", onToggleMembers);
    return () => {
      window.removeEventListener("bc:refreshMessages", onRefreshMessages);
      window.removeEventListener("bc:refreshMembers", onRefreshMembers as EventListener);
      window.removeEventListener("bc:refreshChannels", onRefreshChannels);
      window.removeEventListener("bc:toggleMembers", onToggleMembers);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, channelId, memberSearch, isMobile, membersDrawerOpen]);

  useEffect(() => {
    if (!isMobile) setMembersDrawerOpen(false);
  }, [isMobile]);

  const membersPanel = (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderLeft: `1px solid ${alpha(theme.palette.common.black, 0.25)}`,
        background: alpha(theme.palette.common.black, 0.12),
        height: "100%",
      }}
    >
      <Box
        sx={{
          height: 48,
          px: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.25)}`,
        }}
      >
        <Typography fontWeight={800} sx={{ fontSize: 13, letterSpacing: "0.4px" }}>
          成员 — {members.length}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {loadingMembers ? "加载中…" : ""}
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 1 }}>
        {(
          [
            ["online", "ONLINE"],
            ["idle", "IDLE"],
            ["dnd", "DO NOT DISTURB"],
            ["offline", "OFFLINE"],
          ] as const
        ).map(([key, title]) => {
          const list = memberGroups[key];
          if (!list.length) return null;
          return (
            <Box key={key} sx={{ pt: 1.5 }}>
              <Typography
                sx={{
                  px: 1,
                  pb: 0.5,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.6px",
                  color: alpha(theme.palette.text.primary, 0.65),
                }}
              >
                {title} — {list.length}
              </Typography>
              {list.map((m) => {
                const name = labelUser(m.user);
                return (
                  <Box
                    key={m.user.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1,
                      py: 0.75,
                      borderRadius: 1,
                      cursor: "default",
                      "&:hover": {
                        background: alpha(theme.palette.common.white, 0.06),
                      },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        src={m.user.avatar || undefined}
                        sx={{
                          width: 30,
                          height: 30,
                          fontSize: 11,
                          bgcolor: alpha(theme.palette.primary.main, 0.35),
                        }}
                      >
                        {initials(name)}
                      </Avatar>
                      <Box
                        sx={{
                          position: "absolute",
                          right: -1,
                          bottom: -1,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: statusColor(m.status),
                          border: `2px solid ${alpha(theme.palette.common.black, 0.25)}`,
                        }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: alpha(theme.palette.text.primary, 0.9),
                        }}
                        noWrap
                      >
                        {name}
                      </Typography>
                      {(m.roles || []).length ? (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {(m.roles || []).join(" · ")}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: "100%" }}>
      {/* Discord 风格：中间聊天区 + 右侧成员栏（都在 content 内部实现） */}
      <Box sx={{ display: "flex", height: "100%" }}>
        {/* 中间：聊天 */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            background: alpha(theme.palette.common.black, 0.08),
          }}
        >
          {/* 消息区 */}
          <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", py: 1 }}>
            {!serverId || !channelId ? (
              <Box sx={{ p: 2 }}>
                <Alert severity="info">左侧选择频道后开始聊天。</Alert>
              </Box>
            ) : (
              <List dense sx={{ px: 1 }}>
                {messages.map((m) => {
                  const authorName = labelUser(m.author);
                  return (
                    <Box
                      key={m.id}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        px: 1,
                        py: 1,
                        borderRadius: 1,
                        "&:hover": {
                          background: alpha(theme.palette.common.white, 0.06),
                        },
                        "&:hover .bc-msg-actions": {
                          opacity: 1,
                        },
                      }}
                    >
                      <Avatar
                        src={m.author?.avatar || undefined}
                        sx={{
                          width: 38,
                          height: 38,
                          fontSize: 12,
                          bgcolor: alpha(theme.palette.primary.main, 0.35),
                        }}
                      >
                        {initials(authorName)}
                      </Avatar>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="baseline">
                          <Typography fontWeight={800} sx={{ fontSize: 14 }} noWrap>
                            {authorName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {m.createdAt}
                          </Typography>
                          {m.editedAt ? (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              (已编辑)
                            </Typography>
                          ) : null}
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap", color: alpha(theme.palette.text.primary, 0.92) }}
                        >
                          {m.content}
                        </Typography>
                      </Box>

                      <Box
                        className="bc-msg-actions"
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          alignItems: "flex-start",
                          opacity: 0,
                          transition: "opacity 0.15s ease",
                        }}
                      >
                        <Box
                          onClick={() => openEditMessage(m)}
                          role="button"
                          aria-label="edit-message"
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            background: alpha(theme.palette.common.black, 0.18),
                            "&:hover": { background: alpha(theme.palette.common.black, 0.28) },
                          }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                        </Box>
                        <Box
                          onClick={() => openDeleteMessage(m.id)}
                          role="button"
                          aria-label="delete-message"
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            background: alpha(theme.palette.common.black, 0.18),
                            "&:hover": { background: alpha(theme.palette.error.main, 0.25) },
                          }}
                        >
                          <DeleteOutlineOutlinedIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </List>
            )}
          </Box>

          {/* 输入框底栏 */}
          <Box
            sx={{
              px: 2,
              py: 2,
              borderTop: `1px solid ${alpha(theme.palette.common.black, 0.25)}`,
              background: alpha(theme.palette.common.black, 0.08),
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                px: 1.5,
                py: 1,
                borderRadius: 2,
                background: alpha(theme.palette.common.black, 0.18),
              }}
            >
              <TextField
                fullWidth
                variant="standard"
                placeholder={selectedChannel ? `发消息到 #${selectedChannel.name}` : "输入消息"}
                value={sendContent}
                onChange={(e) => setSendContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSend();
                }}
                disabled={!serverId || !channelId}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    color: alpha(theme.palette.text.primary, 0.92),
                    fontSize: 14,
                  },
                }}
              />
              <AsyncButton
                variant="text"
                onClick={onSend}
                disabled={!serverId || !channelId}
                sx={{ minWidth: 0, px: 1 }}
              >
                发送
              </AsyncButton>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
              支持：发送、编辑、删除（按钮在消息 hover 时显示）。
            </Typography>
          </Box>
        </Box>

        {/* 右侧：成员栏（桌面常驻 / 手机抽屉） */}
        {!isMobile ? membersPanel : null}
      </Box>

      {/* 手机：成员抽屉 */}
      <Drawer
        anchor="right"
        open={membersDrawerOpen}
        onClose={() => setMembersDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            maxWidth: "85vw",
            background: alpha(theme.palette.common.black, 0.12),
            borderLeft: `1px solid ${alpha(theme.palette.common.black, 0.25)}`,
          },
        }}
      >
        <Box
          sx={{
            height: 48,
            px: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.25)}`,
          }}
        >
          <Typography fontWeight={800} sx={{ fontSize: 14 }}>
            成员
          </Typography>
          <IconButton size="small" onClick={() => setMembersDrawerOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ p: 1 }}>
          <Box
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: 1.5,
              background: alpha(theme.palette.common.black, 0.18),
            }}
          >
            <TextField
              fullWidth
              variant="standard"
              placeholder="搜索成员"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") refreshMembers({ search: memberSearch.trim() });
              }}
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: 13, color: alpha(theme.palette.text.primary, 0.9) },
              }}
            />
          </Box>
        </Box>
        {membersPanel}
      </Drawer>

      {/* 编辑消息 */}
      <Dialog open={editMsgOpen} onClose={() => setEditMsgOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>编辑消息</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            value={editMsgContent}
            onChange={(e) => setEditMsgContent(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <AsyncButton variant="text" onClick={async () => setEditMsgOpen(false)}>
            取消
          </AsyncButton>
          <AsyncButton variant="contained" onClick={onSaveEditMessage} loading={editMsgLoading}>
            保存
          </AsyncButton>
        </DialogActions>
      </Dialog>

      {/* 删除消息 */}
      <Dialog open={delMsgOpen} onClose={() => setDelMsgOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>删除消息</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            确认删除这条消息吗？删除后不可恢复。
          </Typography>
        </DialogContent>
        <DialogActions>
          <AsyncButton variant="text" onClick={async () => setDelMsgOpen(false)}>
            取消
          </AsyncButton>
          <AsyncButton
            variant="contained"
            color="error"
            onClick={onConfirmDeleteMessage}
            loading={delMsgLoading}
          >
            删除
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

