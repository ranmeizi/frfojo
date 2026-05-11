import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Divider,
  Fade,
  IconButton,
  Paper,
  Slide,
  Stack,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import { FC, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { buildItemDetailModel } from "../engine/itemDetailText";
import {
  DRAGGABLE_OPACITY_FLOAT_HANDLE,
  DraggableOpacityFloat,
  type HorizontalAnchor,
} from "./DraggableOpacityFloat";

/** 与 DraggableOpacityFloat.boundsSelector、滚动根 className 保持一致 */
const RO_CALC_SCROLL_ROOT_SELECTOR = ".ro-calc-scroll-root";

/** 收起贴边留白（与 DraggableOpacityFloat.anchorInset 一致） */
const PEEK_ANCHOR_INSET = 20;

type ItemInfoFloatProps = {
  itemId: number;
};

/** 浮窗中心相对滚动根：偏左半区 / 偏右半区 */
function computeLayoutSide(boundsEl: Element, floatEl: Element): "left" | "right" {
  const rb = boundsEl.getBoundingClientRect();
  const eb = floatEl.getBoundingClientRect();
  const boundsMidX = rb.left + rb.width / 2;
  const floatMidX = eb.left + eb.width / 2;
  return floatMidX < boundsMidX ? "left" : "right";
}

/**
 * MUI Slide：direction="right" 表示从左侧进入；direction="left" 表示从右侧进入。
 * @see @mui/material/Slide getTranslateValue
 */
function muiSlideDirection(layoutSide: "left" | "right"): "left" | "right" {
  return layoutSide === "left" ? "right" : "left";
}

const ItemInfoFloat: FC<ItemInfoFloatProps> = ({ itemId }) => {
  const [open, setOpen] = useState(true);
  /** 仅在 Slide 完全收起后出现小圆按钮，避免与收起动画重叠 */
  const [peekVisible, setPeekVisible] = useState(false);
  /** 相对滚动根水平半区，用于 Slide 与收起贴边 */
  const [layoutSide, setLayoutSide] = useState<"left" | "right">("right");
  const layoutSideRef = useRef<"left" | "right">("right");

  const [dockAnchor, setDockAnchor] = useState<HorizontalAnchor>("none");
  const [dragPos, setDragPos] = useState({ x: 12, y: 120 });

  const contentRef = useRef<HTMLDivElement>(null);
  const floatRootRef = useRef<HTMLDivElement>(null);
  const detail = useMemo(() => buildItemDetailModel(itemId), [itemId]);

  const updateLayoutSideFromLayout = useCallback(() => {
    const root = document.querySelector(RO_CALC_SCROLL_ROOT_SELECTOR);
    const el = contentRef.current;
    if (!root || !el) return;
    const side = computeLayoutSide(root, el);
    layoutSideRef.current = side;
    setLayoutSide(side);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateLayoutSideFromLayout();
  }, [open, itemId, detail.id, updateLayoutSideFromLayout]);

  const handleClose = () => {
    updateLayoutSideFromLayout();
    setOpen(false);
  };

  const handleOpen = () => {
    setPeekVisible(false);
    updateLayoutSideFromLayout();
    const root = document.querySelector(RO_CALC_SCROLL_ROOT_SELECTOR);
    const node = floatRootRef.current;
    if (root && node) {
      const rb = root.getBoundingClientRect();
      const nb = node.getBoundingClientRect();
      const anch = layoutSideRef.current;
      const nextX =
        anch === "left"
          ? PEEK_ANCHOR_INSET
          : Math.max(0, rb.right - PEEK_ANCHOR_INSET - nb.width - rb.left);
      setDragPos((p) => ({ x: nextX, y: p.y }));
    }
    setDockAnchor("none");
    setOpen(true);
  };

  const handleSlideExited = () => {
    setDockAnchor(layoutSideRef.current);
    setDragPos((p) => ({ x: 0, y: p.y }));
    setPeekVisible(true);
  };

  return (
    <DraggableOpacityFloat
      boundsSelector={RO_CALC_SCROLL_ROOT_SELECTOR}
      position={dragPos}
      horizontalAnchor={dockAnchor}
      anchorInset={PEEK_ANCHOR_INSET}
      floatRootRef={floatRootRef}
      rootClassName="ro-calc-item-info-float"
      onDragStop={(_, d) => {
        if (dockAnchor !== "none") {
          setDragPos({ x: 0, y: d.y });
        } else {
          setDragPos({ x: d.x, y: d.y });
        }
      }}
    >
      <Box ref={contentRef} sx={{ position: "relative", display: "flex", alignItems: "center" }}>
        <Slide
          direction={muiSlideDirection(layoutSide)}
          in={open}
          timeout={280}
          mountOnEnter
          unmountOnExit={false}
          onExited={handleSlideExited}
        >
          <Paper
            elevation={6}
            sx={{
              width: { xs: "min(calc(100% - 8px), 300px)", sm: 300 },
              maxHeight: "min(70vh, 520px)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                px: 1.5,
                py: 1,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "action.hover",
              }}
            >
              <Box
                className={DRAGGABLE_OPACITY_FLOAT_HANDLE}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  cursor: "grab",
                  "&:active": { cursor: "grabbing" },
                  mx: -0.5,
                  px: 0.5,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  物品资料
                </Typography>
              </Box>
              <Tooltip title="收起">
                <IconButton
                  size="small"
                  aria-label="收起物品资料"
                  onClick={handleClose}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Fade in timeout={220} key={detail.id}>
              <Box
                sx={{
                  p: 1.5,
                  overflow: "auto",
                  flex: 1,
                  minHeight: 0,
                }}
              >
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  {detail.name}
                </Typography>

                <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                  <Row label={detail.atkOrDefLabel} value={String(detail.atkOrDef)} />
                  {detail.showWeaponLevel ? (
                    <Row label="武器 Lv" value={detail.weaponLevelDisplay} />
                  ) : null}
                  <Row label="洞数" value={detail.slotsDisplay} />
                  <Row label="重量" value={detail.weightDisplay} />
                  <Row label="要求 Lv" value={detail.reqLvDisplay} />
                </Stack>

                {detail.flavorText ? (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      说明
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5 }}
                    >
                      {detail.flavorText}
                    </Typography>
                  </>
                ) : null}

                {detail.scriptLines.length > 0 ? (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      效果（脚本摘要）
                    </Typography>
                    <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                      {detail.scriptLines.map((line, i) => (
                        <Typography
                          key={`${detail.id}-${i}`}
                          component="li"
                          variant="body2"
                          color="text.secondary"
                          sx={{ lineHeight: 1.45 }}
                        >
                          {line}
                        </Typography>
                      ))}
                    </Stack>
                  </>
                ) : null}
              </Box>
            </Fade>
          </Paper>
        </Slide>

        {peekVisible && !open ? (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              ...(layoutSide === "left"
                ? { left: 0, right: "auto" }
                : { right: 0, left: "auto" }),
            }}
          >
            <Fade in timeout={200}>
              <Box>
                <Zoom in timeout={280}>
                  <Box
                    className={DRAGGABLE_OPACITY_FLOAT_HANDLE}
                    sx={{
                      p: 0.5,
                      cursor: "grab",
                      "&:active": { cursor: "grabbing" },
                    }}
                  >
                    <Tooltip
                      title="展开物品资料"
                      placement={layoutSide === "left" ? "right" : "left"}
                    >
                      <IconButton
                        color="primary"
                        aria-label="展开物品资料"
                        onClick={handleOpen}
                        sx={{
                          width: 44,
                          height: 44,
                          boxShadow: 3,
                          bgcolor: "background.paper",
                          border: 1,
                          borderColor: "divider",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Zoom>
              </Box>
            </Fade>
          </Box>
        ) : null}
      </Box>
    </DraggableOpacityFloat>
  );
};

const Row: FC<{ label: string; value: string }> = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" gap={1} sx={{ typography: "body2" }}>
    <Typography component="span" color="text.secondary" variant="body2">
      {label}
    </Typography>
    <Typography component="span" variant="body2" fontWeight={500} textAlign="right">
      {value}
    </Typography>
  </Stack>
);

export default ItemInfoFloat;
