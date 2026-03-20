import { FC, useEffect, useMemo, useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography,
  alpha,
  styled,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useNavigate, useParams } from "react-router-dom";
import { AsyncButton, message } from "@frfojo/components";
import * as BcServices from "@/services/bc";

const Root = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  height: "100%",
}));

const Header: FC = () => {
  const params = useParams<{ serverId: string; topic?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [channels, setChannels] = useState<DTOs.Bc.Channel[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  const [channelDlgOpen, setChannelDlgOpen] = useState(false);
  const [channelDlgLoading, setChannelDlgLoading] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelTopic, setChannelTopic] = useState("");
  const [channelType, setChannelType] =
    useState<DTOs.Bc.Channel["type"]>("text");

  const [delDlgOpen, setDelDlgOpen] = useState(false);
  const [delDlgLoading, setDelDlgLoading] = useState(false);

  async function refreshChannels() {
    if (!params.serverId) return;
    const res = await BcServices.listChannels({ serverId: params.serverId });
    if (res.code === "000000") setChannels(res.data || []);
  }

  useEffect(() => {
    refreshChannels().catch(() => {});
  }, [params.serverId]);

  useEffect(() => {
    const handler = () => refreshChannels().catch(() => {});
    window.addEventListener("bc:refreshChannels", handler);
    return () => window.removeEventListener("bc:refreshChannels", handler);
  }, [params.serverId]);

  const channel = useMemo(() => {
    if (!params.topic) return null;
    return channels.find((c) => c.id === params.topic) || null;
  }, [params.topic, channels]);

  function refreshMessages() {
    window.dispatchEvent(new CustomEvent("bc:refreshMessages"));
  }

  function refreshMembers(search?: string) {
    window.dispatchEvent(
      new CustomEvent("bc:refreshMembers", { detail: { search } }),
    );
  }

  function toggleMembers() {
    window.dispatchEvent(new CustomEvent("bc:toggleMembers"));
  }

  function emitRefreshChannels() {
    window.dispatchEvent(new CustomEvent("bc:refreshChannels"));
  }

  function openChannelSettings() {
    if (!channel) return;
    setChannelName(channel.name || "");
    setChannelTopic(channel.topic || "");
    setChannelType(channel.type);
    setChannelDlgOpen(true);
  }

  async function saveChannelSettings() {
    if (!channel) return;
    setChannelDlgLoading(true);
    try {
      const res = await BcServices.updateChannel({
        id: channel.id,
        name: channelName.trim() || channel.name,
        topic: channelTopic.trim() || null,
        type: channelType,
      });
      if (res.code !== "000000") {
        message.error(res.msg || "保存失败");
        return;
      }
      message.success("已保存");
      setChannelDlgOpen(false);
      emitRefreshChannels();
    } finally {
      setChannelDlgLoading(false);
    }
  }

  async function confirmDeleteChannel() {
    if (!channel) return;
    setDelDlgLoading(true);
    try {
      const res = await BcServices.deleteChannel({ id: channel.id });
      if (res.code !== "000000") {
        message.error(res.msg || "删除失败");
        return;
      }
      message.success("频道已删除");
      setDelDlgOpen(false);
      navigate(`/m/server/${params.serverId}`);
      emitRefreshChannels();
    } finally {
      setDelDlgLoading(false);
    }
  }

  return (
    <Root
      style={{
        background: alpha(theme.palette.common.black, 0.1),
        borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.25)}`,
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: isMobile ? 1 : 2,
          gap: 2,
        }}
      >
        {/* 左侧：频道信息 */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
        >
          <TagOutlinedIcon sx={{ opacity: 0.85 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontWeight={800}
              noWrap
              sx={{ fontSize: isMobile ? 14 : 16 }}
            >
              {channel ? `${channel.name}` : ""}
            </Typography>
            {channel?.topic && !isMobile ? (
              <Typography variant="caption" color="text.secondary" noWrap>
                {channel.topic}
              </Typography>
            ) : null}
          </Box>
        </Box>

        {/* 右侧：搜索 + 操作 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 0.75 : 1.25,
            flexShrink: 0,
          }}
        >
          {/* 移动端不显示长输入框，改到成员抽屉里搜索 */}
          {!isMobile ? (
            <Box
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 1.5,
                background: alpha(theme.palette.common.black, 0.18),
                width: 220,
              }}
            >
              <TextField
                fullWidth
                variant="standard"
                placeholder="搜索成员"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") refreshMembers(memberSearch.trim());
                }}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: 13,
                    color: alpha(theme.palette.text.primary, 0.9),
                  },
                }}
              />
            </Box>
          ) : null}

          <Box
            onClick={() => refreshMessages()}
            role="button"
            aria-label="refresh-messages"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: alpha(theme.palette.common.white, 0.06),
            }}
          >
            <RefreshOutlinedIcon sx={{ fontSize: 20, opacity: 0.9 }} />
          </Box>

          <Box
            onClick={() => toggleMembers()}
            role="button"
            aria-label="toggle-members"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: alpha(theme.palette.common.white, 0.06),
            }}
          >
            <GroupOutlinedIcon sx={{ fontSize: 20, opacity: 0.9 }} />
          </Box>

          <Box
            onClick={() => openChannelSettings()}
            role="button"
            aria-label="channel-settings"
            style={{
              width: isMobile ? 30 : 34,
              height: isMobile ? 30 : 34,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: channel ? "pointer" : "not-allowed",
              opacity: channel ? 1 : 0.4,
              background: alpha(theme.palette.common.white, 0.06),
            }}
          >
            <SettingsOutlinedIcon sx={{ fontSize: 20, opacity: 0.9 }} />
          </Box>

          <Box
            onClick={() => (channel ? setDelDlgOpen(true) : null)}
            role="button"
            aria-label="channel-delete"
            style={{
              width: isMobile ? 30 : 34,
              height: isMobile ? 30 : 34,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: channel ? "pointer" : "not-allowed",
              opacity: channel ? 1 : 0.4,
              background: alpha(theme.palette.common.white, 0.06),
            }}
          >
            <DeleteOutlineOutlinedIcon sx={{ fontSize: 20, opacity: 0.9 }} />
          </Box>
        </Box>
      </Box>

      {/* 频道设置 */}
      <Dialog
        open={channelDlgOpen}
        onClose={() => setChannelDlgOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>频道设置</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="频道名称"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label="频道主题（可选）"
            value={channelTopic}
            onChange={(e) => setChannelTopic(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              频道类型
            </Typography>
            <Select
              fullWidth
              size="small"
              value={channelType}
              onChange={(e) => setChannelType(e.target.value as any)}
            >
              <MenuItem value="text">text</MenuItem>
              <MenuItem value="voice">voice</MenuItem>
              <MenuItem value="category">category</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <AsyncButton
            variant="text"
            onClick={async () => setChannelDlgOpen(false)}
          >
            取消
          </AsyncButton>
          <AsyncButton
            variant="contained"
            onClick={saveChannelSettings}
            loading={channelDlgLoading}
          >
            保存
          </AsyncButton>
        </DialogActions>
      </Dialog>

      {/* 删除频道确认 */}
      <Dialog
        open={delDlgOpen}
        onClose={() => setDelDlgOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>删除频道</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            确认删除当前频道吗？删除后不可恢复。
          </Typography>
        </DialogContent>
        <DialogActions>
          <AsyncButton
            variant="text"
            onClick={async () => setDelDlgOpen(false)}
          >
            取消
          </AsyncButton>
          <AsyncButton
            variant="contained"
            color="error"
            onClick={confirmDeleteChannel}
            loading={delDlgLoading}
          >
            删除
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </Root>
  );
};

export default Header;
