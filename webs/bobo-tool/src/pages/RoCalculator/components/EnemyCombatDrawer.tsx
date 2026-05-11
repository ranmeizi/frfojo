import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Autocomplete,
  Box,
  Drawer,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { type FC, type RefObject, useEffect, useMemo, useRef, useState } from "react";
import type { CharacterBaseInput, CombatSnapshot } from "../engine/types";
import {
  monsterOptionList,
  sortedMonsterOptionList,
} from "../engine/monsterCatalog";
import EnemyCombatCard from "./EnemyCombatCard";

const DRAG_OPEN_PX = 52;
const DRAG_CLOSE_PX = 48;

function patchMonsterIndex(value: CharacterBaseInput, monsterIndex: number): CharacterBaseInput {
  return {
    ...value,
    enemyCombat: { ...value.enemyCombat, monsterIndex },
  };
}

type EnemyCombatDrawerProps = {
  snapshot: CombatSnapshot;
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
  /** 须指向 `.ro-calc-container`，Drawer 与底栏均挂在此节点内 */
  containerRef: RefObject<HTMLDivElement | null>;
};

/** 底栏 / Sheet 常用「三圆条」抓手，比默认 DragIndicator 更柔和 */
function SheetHandleGrip() {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        py: 0.25,
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={(theme) => ({
            width: i === 1 ? 38 : 32,
            height: 4,
            borderRadius: 10,
            bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.35 : 0.2),
            boxShadow:
              theme.palette.mode === "dark"
                ? `inset 0 1px 0 ${alpha("#fff", 0.12)}`
                : `inset 0 1px 0 ${alpha("#fff", 0.65)}`,
            transition: theme.transitions.create(["background-color", "transform"], {
              duration: theme.transitions.duration.shorter,
            }),
            ".ro-calc-enemy-drawer-drag:hover &": {
              bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.55 : 0.35),
            },
            ".ro-calc-enemy-drawer-drag:active &": {
              transform: "scaleX(0.96)",
            },
          })}
        />
      ))}
    </Box>
  );
}

const headerGridBase = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 200px) minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 1,
  px: 1.25,
  py: 1,
  minHeight: 52,
  borderColor: "divider",
  bgcolor: "background.paper",
} as const;

const EnemyCombatDrawer: FC<EnemyCombatDrawerProps> = ({
  snapshot,
  value,
  onChange,
  containerRef,
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;
  const ec = value.enemyCombat;
  const options = useMemo(() => sortedMonsterOptionList(ec.monsterSort), [ec.monsterSort]);
  const flatOptions = useMemo(() => monsterOptionList(), []);
  const currentOption = useMemo(
    () => flatOptions.find((o) => o.index === ec.monsterIndex) ?? flatOptions[0],
    [flatOptions, ec.monsterIndex],
  );

  const dragRef = useRef<{ pointerId: number; y0: number; wasOpen: boolean } | null>(null);

  const bindDrag = (el: HTMLElement | null) => {
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      el.setPointerCapture(e.pointerId);
      dragRef.current = { pointerId: e.pointerId, y0: e.clientY, wasOpen: openRef.current };
    };
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || d.pointerId !== e.pointerId) return;
      const dy = e.clientY - d.y0;
      if (d.wasOpen && dy > DRAG_CLOSE_PX) {
        setOpen(false);
        dragRef.current = null;
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
      } else if (!d.wasOpen && dy < -DRAG_OPEN_PX) {
        setOpen(true);
        dragRef.current = null;
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
      }
    };
    const end = (e: PointerEvent) => {
      dragRef.current = null;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
    };
  };

  const dragHandleRef = useRef<HTMLDivElement | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);
  useEffect(
    () => () => {
      dragCleanupRef.current?.();
      dragCleanupRef.current = null;
    },
    [],
  );
  const setDragHandleRef = (node: HTMLDivElement | null) => {
    dragCleanupRef.current?.();
    dragCleanupRef.current = null;
    dragHandleRef.current = node;
    if (node) dragCleanupRef.current = bindDrag(node);
  };

  const drawerModalProps = {
    container: () => containerRef.current ?? document.body,
    disableScrollLock: true,
    keepMounted: false,
    sx: { position: "absolute" as const },
  };

  const renderHeader = (opts: { showDrawerTitle?: boolean; showBottomBorder?: boolean }) => (
    <Box
      sx={{
        ...headerGridBase,
        borderBottom: opts.showBottomBorder ? 1 : 0,
      }}
    >
      <Box sx={{ minWidth: 0, maxWidth: 200, width: "100%" }}>
        {opts.showDrawerTitle ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.25 }}>
            对方
          </Typography>
        ) : null}
        <Autocomplete
          size="small"
          fullWidth
          options={options}
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(a, b) => a.index === b.index}
          value={currentOption}
          onChange={(_, v) => {
            if (v) onChange(patchMonsterIndex(value, v.index));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="搜索"
              label="魔物"
              InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
              sx={{
                "& .MuiInputBase-input": { textOverflow: "ellipsis" },
              }}
            />
          )}
          ListboxProps={{ style: { maxHeight: 280 } }}
          slotProps={{
            paper: {
              elevation: 8,
              sx: { minWidth: 260, maxWidth: "min(90vw, 360px)" },
            },
          }}
        />
      </Box>

      <Tooltip title="拖拽上下展开 / 收起">
        <Box
          ref={setDragHandleRef}
          className="ro-calc-enemy-drawer-drag"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            justifySelf: "stretch",
            minHeight: 44,
            px: 2,
            cursor: "grab",
            touchAction: "none",
            borderRadius: 1,
            color: "text.secondary",
            bgcolor: open ? "action.hover" : "transparent",
            "&:active": { cursor: "grabbing" },
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <SheetHandleGrip />
        </Box>
      </Tooltip>

      <Tooltip title={open ? "收起" : "展开"}>
        <IconButton
          size="small"
          color="primary"
          aria-expanded={open}
          aria-label={open ? "收起对方" : "展开对方"}
          onClick={() => setOpen((o) => !o)}
          sx={{ flexShrink: 0 }}
        >
          {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );

  const barZ = 5;
  const drawerZ = 6;

  return (
    <>
      <Paper
        elevation={open ? 0 : 3}
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: barZ,
          borderTop: 1,
          borderColor: "divider",
          borderRadius: 0,
          display: open ? "none" : "block",
          pb: "calc(2px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {renderHeader({ showDrawerTitle: true, showBottomBorder: false })}
      </Paper>

      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ zIndex: drawerZ, position: "absolute" }}
        ModalProps={drawerModalProps}
        PaperProps={{
          elevation: 16,
          sx: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: "min(92%, 900px)",
            height: "min(92%, 900px)",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            bgcolor: "background.paper",
            pb: "env(safe-area-inset-bottom, 0px)",
          },
        }}
        slotProps={{
          backdrop: { sx: { position: "absolute", inset: 0 } },
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="subtitle2" sx={{ px: 1.25, pt: 1, pb: 0, fontWeight: 600 }}>
            对方 · 魔物与战斗选项
          </Typography>
          {renderHeader({ showDrawerTitle: false, showBottomBorder: true })}
        </Box>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            px: 1,
            pb: 1,
            pt: 0.5,
          }}
        >
          <EnemyCombatCard
            snapshot={snapshot}
            value={value}
            onChange={onChange}
            hideMonsterSelectRow
            embedded
          />
        </Box>
      </Drawer>
    </>
  );
};

export default EnemyCombatDrawer;
