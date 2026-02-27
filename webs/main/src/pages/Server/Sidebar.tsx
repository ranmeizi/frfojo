import { FC, forwardRef, useEffect, useMemo, useState } from "react";
import { Box, Divider, styled, alpha } from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import {
  TreeItem2Root,
  TreeItem2Props,
  TreeItem2Label,
  TreeItem2GroupTransition,
  TreeItem2Content,
  TreeItem2IconContainer,
} from "@mui/x-tree-view/TreeItem2";
import { TreeItem2Provider } from "@mui/x-tree-view/TreeItem2Provider";
import { TreeItem2Icon } from "@mui/x-tree-view/TreeItem2Icon";
import { useTreeItem2 } from "@mui/x-tree-view/useTreeItem2/useTreeItem2";
import { TreeItem2DragAndDropOverlay } from "@mui/x-tree-view/TreeItem2DragAndDropOverlay";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import ImageBlackboard from "@/assets/blackboard.jpg";
import { services } from "@/db/services/Menu.service";
import { motion } from "framer-motion";
import { yellow } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import * as BcServices from "@/services/bc";

type ChannelNode = TreeViewBaseItem & {
  meta?: { kind: "category" | "channel"; type?: DTOs.Bc.Channel["type"] };
};

function toChannelTree(channels: DTOs.Bc.Channel[]): ChannelNode[] {
  const categories = channels.filter((c) => c.type === "category");
  const byCategory: Record<string, DTOs.Bc.Channel[]> = {};
  const rootChannels: DTOs.Bc.Channel[] = [];

  for (const c of channels) {
    if (c.type === "category") continue;
    if (c.parentId) {
      byCategory[c.parentId] ||= [];
      byCategory[c.parentId].push(c);
    } else {
      rootChannels.push(c);
    }
  }

  const sortFn = (a: DTOs.Bc.Channel, b: DTOs.Bc.Channel) =>
    (a.position || 0) - (b.position || 0);

  const nodes: ChannelNode[] = [];

  for (const cat of [...categories].sort(sortFn)) {
    const children = (byCategory[cat.id] || []).sort(sortFn).map<ChannelNode>((c) => ({
      id: c.id,
      label: c.name,
      meta: { kind: "channel", type: c.type },
    }));
    nodes.push({
      id: cat.id,
      label: cat.name,
      children,
      meta: { kind: "category" },
    });
  }

  // 未分类频道按 type 分组（Discord 风格）
  const texts = rootChannels.filter((c) => c.type === "text").sort(sortFn);
  const voices = rootChannels.filter((c) => c.type === "voice").sort(sortFn);

  if (texts.length) {
    nodes.push({
      id: "__text__",
      label: "TEXT CHANNELS",
      meta: { kind: "category" },
      children: texts.map((c) => ({
        id: c.id,
        label: c.name,
        meta: { kind: "channel", type: "text" },
      })),
    });
  }
  if (voices.length) {
    nodes.push({
      id: "__voice__",
      label: "VOICE CHANNELS",
      meta: { kind: "category" },
      children: voices.map((c) => ({
        id: c.id,
        label: c.name,
        meta: { kind: "channel", type: "voice" },
      })),
    });
  }

  return nodes;
}

const Root = styled("div")(() => ({
  // padding: theme.spacing(1),
}));

const CustomTreeItem = forwardRef(
  (props: TreeItem2Props, ref: React.Ref<HTMLLIElement>) => {
    const { id, itemId, label, disabled, children, ...other } = props;
    const meta = (other as any)?.meta as ChannelNode["meta"] | undefined;

    const {
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getLabelProps,
      getGroupTransitionProps,
      getDragAndDropOverlayProps,
      status,
    } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

    const treeItemPrope = getRootProps(other) as any;

    return (
      <TreeItem2Provider itemId={itemId}>
        <TreeItem2Root {...treeItemPrope}>
          <TreeItem2Content
            {...getContentProps()}
            sx={(theme) => ({
              padding: "2px 8px",
              margin: "0 8px",
              borderRadius: "6px",
              minHeight: "32px",
              color: alpha(theme.palette.text.primary, 0.92),
              "&:hover": {
                background: alpha(theme.palette.common.white, 0.06),
              },
              '&[data-selected="true"]': {
                background: alpha(theme.palette.common.white, 0.12),
              },
            })}
          >
            <TreeItem2IconContainer {...getIconContainerProps()}>
              <TreeItem2Icon status={status} />
              {!children && meta?.type === "text" ? (
                <TagOutlinedIcon sx={{ fontSize: 18, opacity: 0.9 }} />
              ) : null}
              {!children && meta?.type === "voice" ? (
                <VolumeUpOutlinedIcon sx={{ fontSize: 18, opacity: 0.9 }} />
              ) : null}
            </TreeItem2IconContainer>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                gap: 1,
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <TreeItem2Label
                {...getLabelProps()}
                sx={(theme) => ({
                  fontSize: children ? 12 : 14,
                  fontWeight: children ? 800 : 500,
                  textTransform: children ? "uppercase" : "none",
                  letterSpacing: children ? "0.4px" : "normal",
                  color: children
                    ? alpha(theme.palette.text.primary, 0.65)
                    : alpha(theme.palette.text.primary, 0.92),
                  minWidth: 0,
                })}
              />
            </Box>
            <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
          </TreeItem2Content>
          {children && (
            <TreeItem2GroupTransition {...getGroupTransitionProps()} />
          )}
        </TreeItem2Root>
      </TreeItem2Provider>
    );
  },
);

type SidebarProps = {
  serverId?: string;
  topic?: string;
};
const Sidebar: FC<SidebarProps> = (props) => {
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const [channels, setChannels] = useState<DTOs.Bc.Channel[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (props.serverId) {
      getIcon(props.serverId);
      refreshChannels(props.serverId).catch(() => {});
    } else {
      setIcon(undefined);
      setChannels([]);
    }
  }, [props.serverId]);

  useEffect(() => {
    const sid = props.serverId;
    if (!sid) return;
    const handler = () => {
      refreshChannels(sid).catch(() => {});
    };
    window.addEventListener("bc:refreshChannels", handler);
    return () => window.removeEventListener("bc:refreshChannels", handler);
  }, [props.serverId, props.topic]);

  async function getIcon(id: string) {
    const doc = await services.getMenuById(id);

    if (doc) {
      setIcon(doc.src);
    } else {
      setIcon(undefined);
    }
  }

  async function refreshChannels(serverId: string) {
    const res = await BcServices.listChannels({ serverId });
    if (res.code === "000000") {
      const list = res.data || [];
      setChannels(list);

      // topic 不存在/已被删除时，自动跳到第一个 text 频道（否则第一个）
      const ok = props.topic && list.some((c) => c.id === props.topic);
      if (!ok) {
        const first = list.find((c) => c.type === "text") || list[0];
        if (first?.id) {
          navigate(`/m/server/${serverId}/${first.id}`);
        }
      }
    } else {
      setChannels([]);
    }
  }

  function gotoTopic(topic: string) {
    navigate(`/m/server/${props.serverId}/${topic}`);
  }

  const rawItems: ChannelNode[] = useMemo(() => toChannelTree(channels), [channels]);
  const items: TreeViewBaseItem[] = rawItems;

  const defaultExpandedItems = useMemo(
    () => rawItems.filter((i) => i.children?.length).map((i) => i.id),
    [rawItems]
  );

  return (
    <Root>
      <Box
        sx={() => ({
          // padding: theme.spacing(2),
          background: `url(${ImageBlackboard})`,
          height: "80px",
          backgroundSize: "auto 100%",
          position: "relative",
          overflow: "hidden",
        })}
      >
        {/* 运动图标 */}
        {icon ? (
          <motion.div
            key={icon}
            transition={{ duration: 1 }}
            initial={{ transform: "translateY(50px)" }}
            animate={{ transform: "translateY(0px)" }}
          >
            <motion.div
              transition={{
                duration: 5,
                ease: "linear",
                times: [0, 0.25, 0.5, 0.75, 1],
                repeat: Infinity,
              }}
              animate={{
                transform: [
                  "translateY(0px)",
                  "translateY(-2px)",
                  "translateY(0px)",
                  "translateY(2px)",
                  "translateY(0px)",
                ],
              }}
            >
              <motion.div
                transition={{
                  duration: 15,
                  ease: "backInOut",
                  times: [0, 0.25, 0.5, 0.75, 1],
                  repeat: Infinity,
                }}
                animate={{
                  transform: [
                    "rotateZ(0)",
                    "rotateZ(8deg)",
                    "rotateZ(0)",
                    "rotateZ(-8deg)",
                    "rotateZ(0)",
                  ],
                }}
              >
                <Box
                  sx={(theme) => {
                    const color = alpha(theme.palette.primary.dark, 0.6);
                    const shadow = alpha(yellow["400"], 0.5);
                    return {
                      position: "absolute",
                      top: "15px",
                      left: "28px",
                      borderRadius: "25px",
                      height: "56px",
                      width: "50px",
                      backgroundImage: `url(${icon})`,
                      backgroundColor: color,
                      backgroundSize: "40px 40px",
                      backgroundPosition: "5px 8px",
                      backgroundRepeat: "no-repeat",
                      boxShadow: `0 0 5px 2px ${shadow}`,
                      "::after": {
                        content: "''",
                        position: "absolute",
                        bottom: "-6px",
                        left: "20px",
                        height: 0,
                        width: 0,
                        borderTop: `6px solid transparent`,
                        borderLeft: `6px solid transparent`,
                        borderRight: `6px solid transparent`,
                        borderBottom: `8px solid ${color}`,
                      },
                    };
                  }}
                ></Box>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}

        <Box
          sx={{
            position: "absolute",
            height: "100%",
            width: "70%",
            top: "0",
            right: "0",
            fontSize: "16px",
            fontWeight: 900,
            color: "#d2d2d2",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: "35px",
              top: "17px",
              transform: "rotate(5deg)",
            }}
          >
            欢
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "86px",
              top: "16px",
              transform: "rotate(2deg)",
            }}
          >
            迎
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "24px",
              top: "42px",
              transform: "rotate(-5deg)",
            }}
          >
            新
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "65px",
              top: "40px",
              transform: "rotate(-5deg)",
            }}
          >
            同
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "106px",
              top: "39px",
              transform: "rotate(-3deg)",
            }}
          >
            学
          </Box>
        </Box>
      </Box>
      <Divider />
      <Box
        sx={(theme) => ({
          paddingBottom: theme.spacing(2),
        })}
      >
        <RichTreeView
          defaultExpandedItems={defaultExpandedItems}
          selectedItems={props.topic}
          items={items}
          slots={{ item: CustomTreeItem }}
          onSelectedItemsChange={(event, itemIds) => {
            void event;
            if (!itemIds) return;
            const isLeaf = channels.some((c) => c.id === itemIds);
            if (isLeaf) gotoTopic(itemIds);
          }}
        />
      </Box>
    </Root>
  );
};

export default Sidebar;
