import Autocomplete from "@mui/material/Autocomplete";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, useEffect, useMemo } from "react";
import {
  accessoryCardOptions,
  bodyArmorCardOptions,
  garmentCardOptions,
  headgearCardOptions,
  shieldCardOptions,
  shoesCardOptions,
  weaponCard1Options,
  weaponCard234Options,
} from "../engine/cardSlotOptions";
import type { CharacterBaseInput, EquipmentState } from "../engine/types";
import { armorItemOptions, type ItemOption, weaponItemOptions } from "../engine/itemLists";
import { resolveCombatJob } from "../engine/jobResolve";
import { roCalcPaperSx, roCalcSectionTitleSx } from "../roCalcDenseSx";

const REFINE: number[] = Array.from({ length: 11 }, (_, i) => i);

/** 精炼列、卡片列固定宽度（px），装备列 `1fr` 吃剩余空间 */
const COL_REFINE = 104;
const COL_CARD = 168;
const colRefine = `${COL_REFINE}px`;
const colCard = `${COL_CARD}px`;

/** 防具单行：装备 | 精炼（可选）| 卡片（可选）；`xs` 单列堆叠 */
function armorSlotRowSx(hasRefine: boolean, hasCard: boolean) {
  if (hasCard && hasRefine) {
    return {
      display: "grid",
      gap: 1,
      alignItems: "flex-start" as const,
      gridTemplateColumns: {
        xs: "minmax(0, 1fr)",
        sm: `minmax(0, 1fr) ${colRefine} ${colCard}`,
      },
    };
  }
  if (hasCard && !hasRefine) {
    return {
      display: "grid",
      gap: 1,
      alignItems: "flex-start" as const,
      gridTemplateColumns: {
        xs: "minmax(0, 1fr)",
        sm: `minmax(0, 1fr) ${colCard}`,
      },
    };
  }
  return {
    display: "grid",
    gap: 1,
    alignItems: "flex-start" as const,
    gridTemplateColumns: hasRefine
      ? { xs: "minmax(0, 1fr)", sm: `minmax(0, 1fr) ${colRefine}` }
      : { xs: "1fr", sm: "1fr" },
  };
}

type EquipmentPanelProps = {
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
  /** 切换装备槽位时同步「物品资料」预览 */
  onPreviewItemId?: (itemId: number) => void;
};

function patchEq(
  value: CharacterBaseInput,
  patch: Partial<EquipmentState>,
): CharacterBaseInput {
  return {
    ...value,
    equipment: { ...value.equipment, ...patch },
  };
}

const CardSelect: FC<{
  label: string;
  value: number;
  options: ItemOption[];
  disabled?: boolean;
  onChange: (id: number) => void;
}> = ({ label, value, options, disabled, onChange }) => {
  const safe = options.some((o) => o.id === value) ? value : 0;
  return (
    <FormControl
      size="small"
      fullWidth
      disabled={disabled}
      sx={{
        minWidth: 0,
        width: "100%",
        maxWidth: { xs: "100%", sm: colCard },
        justifySelf: "stretch",
      }}
    >
      <InputLabel shrink>{label}</InputLabel>
      <Select
        label={label}
        value={safe}
        onChange={(e) => onChange(Number(e.target.value))}
        MenuProps={{ PaperProps: { sx: { maxHeight: 280 } } }}
      >
        {options.map((o) => (
          <MenuItem key={o.id} value={o.id} sx={{ whiteSpace: "normal", typography: "caption" }}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const RefineSelect: FC<{
  label: string;
  value: number;
  disabled?: boolean;
  onChange: (n: number) => void;
}> = ({ label, value, disabled, onChange }) => (
  <FormControl
    size="small"
    disabled={disabled}
    sx={{ width: colRefine, minWidth: colRefine, maxWidth: colRefine, justifySelf: "start" }}
  >
    <InputLabel shrink>{label}</InputLabel>
    <Select
      label={label}
      value={value}
      displayEmpty
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {REFINE.map((n) => (
        <MenuItem key={n} value={n}>
          +{n}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const ItemAutocomplete: FC<{
  label: string;
  options: ItemOption[];
  valueId: number;
  onPick: (id: number) => void;
}> = ({ label, options, valueId, onPick }) => {
  const selected = useMemo(
    () => options.find((o) => o.id === valueId) ?? options[0],
    [options, valueId],
  );
  return (
    <Autocomplete
      fullWidth
      size="small"
      options={options}
      value={selected}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      onChange={(_, v) => {
        if (v) onPick(v.id);
      }}
      slotProps={{
        paper: {
          elevation: 3,
          sx: {
            minWidth: 360,
            maxWidth: "min(100vw - 24px, 640px)",
          },
        },
      }}
      ListboxProps={{
        style: { maxHeight: 320 },
        sx: {
          "& .MuiAutocomplete-option": {
            alignItems: "flex-start",
            whiteSpace: "normal",
            wordBreak: "break-word",
            py: 0.5,
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
          sx={{
            minWidth: 0,
            "& .MuiInputBase-input": {
              textOverflow: "ellipsis",
            },
          }}
        />
      )}
    />
  );
};

const EquipmentPanel: FC<EquipmentPanelProps> = ({
  value,
  onChange,
  onPreviewItemId,
}) => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const { effectiveJobId, isTensei } = resolveCombatJob(value.formJobId);
  const eq = value.equipment;
  const wt = value.weaponType;

  useEffect(() => {
    onPreviewItemId?.(eq.weaponId);
  }, [eq.weaponId, effectiveJobId, isTensei, wt, onPreviewItemId]);

  const weaponOpts = useMemo(
    () => weaponItemOptions(effectiveJobId, isTensei, wt),
    [effectiveJobId, isTensei, wt],
  );
  const head1Opts = useMemo(
    () => armorItemOptions(effectiveJobId, isTensei, 50),
    [effectiveJobId, isTensei],
  );
  const head2Opts = useMemo(
    () => armorItemOptions(effectiveJobId, isTensei, 51),
    [effectiveJobId, isTensei],
  );
  const head3Opts = useMemo(
    () => armorItemOptions(effectiveJobId, isTensei, 52),
    [effectiveJobId, isTensei],
  );
  const leftOpts = useMemo(
    () => armorItemOptions(effectiveJobId, isTensei, 61),
    [effectiveJobId, isTensei],
  );
  const bodyOpts = useMemo(
    () => armorItemOptions(effectiveJobId, isTensei, 60),
    [effectiveJobId, isTensei],
  );
  const shoulderOpts = useMemo(
    () => armorItemOptions(effectiveJobId, isTensei, 62),
    [effectiveJobId, isTensei],
  );
  const shoesOpts = useMemo(
    () => armorItemOptions(effectiveJobId, isTensei, 63),
    [effectiveJobId, isTensei],
  );
  const accOpts = useMemo(
    () => armorItemOptions(effectiveJobId, isTensei, 64),
    [effectiveJobId, isTensei],
  );

  const wCard1Opts = useMemo(() => weaponCard1Options(), []);
  const wCard234Opts = useMemo(() => weaponCard234Options(), []);
  const headCardOpts = useMemo(() => headgearCardOptions(), []);
  const shieldCardOpts = useMemo(() => shieldCardOptions(), []);
  const bodyCardOpts = useMemo(() => bodyArmorCardOptions(), []);
  const garmentCardOpts = useMemo(() => garmentCardOptions(), []);
  const shoesCardOpts = useMemo(() => shoesCardOptions(), []);
  const accCardOpts = useMemo(() => accessoryCardOptions(), []);

  const applyEq = (p: Partial<EquipmentState>) => {
    const next = patchEq(value, p);
    onChange(next);
    const idKey = Object.keys(p).find((k) => k.endsWith("Id"));
    if (idKey) {
      const id = next.equipment[idKey as keyof EquipmentState];
      if (typeof id === "number") onPreviewItemId?.(id);
    }
  };

  const armorSlots = [
    ["头饰上", head1Opts, "head1Id", "head1Refine", "head1Card" as const, headCardOpts],
    ["头饰中", head2Opts, "head2Id", null, "head2Card" as const, headCardOpts],
    ["头饰下", head3Opts, "head3Id", "head3Refine", null, null],
    ["左手", leftOpts, "leftId", "leftRefine", "leftCard" as const, shieldCardOpts],
    ["身体", bodyOpts, "bodyId", "bodyRefine", "bodyCard" as const, bodyCardOpts],
    ["披肩", shoulderOpts, "shoulderId", "shoulderRefine", "shoulderCard" as const, garmentCardOpts],
    ["鞋子", shoesOpts, "shoesId", "shoesRefine", "shoesCard" as const, shoesCardOpts],
    ["饰品 1", accOpts, "acc1Id", null, "acc1Card" as const, accCardOpts],
    ["饰品 2", accOpts, "acc2Id", null, "acc2Card" as const, accCardOpts],
  ] as const;

  const colA = armorSlots.slice(0, 5);
  const colB = armorSlots.slice(5);

  const renderSlotRow = (
    label: string,
    opts: ItemOption[],
    idKey: keyof EquipmentState,
    refKey: keyof EquipmentState | null,
    cardKey: keyof EquipmentState | null,
    cardOpts: ItemOption[] | null,
  ) => {
    const hasCard = Boolean(cardKey && cardOpts);
    return (
      <Box key={String(idKey)} sx={armorSlotRowSx(!!refKey, hasCard)}>
        <ItemAutocomplete
          label={label}
          options={opts}
          valueId={eq[idKey] as number}
          onPick={(id) => applyEq({ [idKey]: id } as Partial<EquipmentState>)}
        />
        {refKey ? (
          <RefineSelect
            label="精炼"
            value={eq[refKey] as number}
            onChange={(n) => applyEq({ [refKey]: n } as Partial<EquipmentState>)}
          />
        ) : null}
        {cardKey && cardOpts ? (
          <CardSelect
            label="卡片"
            options={cardOpts}
            value={eq[cardKey] as number}
            onChange={(id) => applyEq({ [cardKey]: id } as Partial<EquipmentState>)}
          />
        ) : null}
      </Box>
    );
  };

  return (
    <Paper variant="outlined" sx={roCalcPaperSx}>
      <Typography variant="subtitle2" sx={roCalcSectionTitleSx}>
        装备
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 1, maxWidth: 900, lineHeight: 1.35, fontSize: "0.7rem" }}
      >
        ItemOBJ 排序；精炼 DEF 计头/手/身/披肩/鞋。卡片与 refer CardSortOBJ
        一致；六维与 HIT/FLEE/暴击、武器 ATK/DEF/MDEF 的卡片平铺已计入快照。
      </Typography>

      <Stack spacing={1}>
        {wt === 0 ? (
          <Box sx={armorSlotRowSx(true, false)}>
            <ItemAutocomplete
              label="武器"
              options={weaponOpts}
              valueId={eq.weaponId}
              onPick={(weaponId) =>
                applyEq({ weaponId, weaponRefine: weaponId === 0 ? 0 : eq.weaponRefine })
              }
            />
            <RefineSelect
              label="武器精炼"
              value={eq.weaponRefine}
              disabled
              onChange={(weaponRefine) => applyEq({ weaponRefine })}
            />
          </Box>
        ) : mdUp ? (
          <Box
            sx={{
              display: "grid",
              gap: 1,
              alignItems: "flex-start",
              gridTemplateColumns: `minmax(0, 1fr) ${colRefine} repeat(4, ${colCard})`,
            }}
          >
            <ItemAutocomplete
              label="武器"
              options={weaponOpts}
              valueId={eq.weaponId}
              onPick={(weaponId) =>
                applyEq({ weaponId, weaponRefine: weaponId === 0 ? 0 : eq.weaponRefine })
              }
            />
            <RefineSelect
              label="武器精炼"
              value={eq.weaponRefine}
              disabled={wt === 0}
              onChange={(weaponRefine) => applyEq({ weaponRefine })}
            />
            <CardSelect
              label="武器卡 1"
              options={wCard1Opts}
              value={eq.weaponCard1}
              onChange={(weaponCard1) => applyEq({ weaponCard1 })}
            />
            <CardSelect
              label="武器卡 2"
              options={wCard234Opts}
              value={eq.weaponCard2}
              onChange={(weaponCard2) => applyEq({ weaponCard2 })}
            />
            <CardSelect
              label="武器卡 3"
              options={wCard234Opts}
              value={eq.weaponCard3}
              onChange={(weaponCard3) => applyEq({ weaponCard3 })}
            />
            <CardSelect
              label="武器卡 4"
              options={wCard234Opts}
              value={eq.weaponCard4}
              onChange={(weaponCard4) => applyEq({ weaponCard4 })}
            />
          </Box>
        ) : (
          <Stack spacing={1} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: "grid",
                gap: 1,
                alignItems: "flex-start",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: `minmax(0, 1fr) ${colRefine}`,
                },
              }}
            >
              <ItemAutocomplete
                label="武器"
                options={weaponOpts}
                valueId={eq.weaponId}
                onPick={(weaponId) =>
                  applyEq({ weaponId, weaponRefine: weaponId === 0 ? 0 : eq.weaponRefine })
                }
              />
              <RefineSelect
                label="武器精炼"
                value={eq.weaponRefine}
                disabled={wt === 0}
                onChange={(weaponRefine) => applyEq({ weaponRefine })}
              />
            </Box>
            <Box
              sx={{
                display: "grid",
                gap: 1,
                alignItems: "flex-start",
                gridTemplateColumns: {
                  xs: `repeat(2, ${colCard})`,
                  sm: `repeat(4, ${colCard})`,
                },
                width: "max-content",
                maxWidth: "100%",
                overflowX: "auto",
                boxSizing: "border-box",
              }}
            >
              <CardSelect
                label="武器卡 1"
                options={wCard1Opts}
                value={eq.weaponCard1}
                onChange={(weaponCard1) => applyEq({ weaponCard1 })}
              />
              <CardSelect
                label="武器卡 2"
                options={wCard234Opts}
                value={eq.weaponCard2}
                onChange={(weaponCard2) => applyEq({ weaponCard2 })}
              />
              <CardSelect
                label="武器卡 3"
                options={wCard234Opts}
                value={eq.weaponCard3}
                onChange={(weaponCard3) => applyEq({ weaponCard3 })}
              />
              <CardSelect
                label="武器卡 4"
                options={wCard234Opts}
                value={eq.weaponCard4}
                onChange={(weaponCard4) => applyEq({ weaponCard4 })}
              />
            </Box>
          </Stack>
        )}

        <Box
          sx={{
            display: "grid",
            gap: { xs: 1, lg: 1.5 },
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            alignItems: "start",
          }}
        >
          <Stack spacing={1}>
            {colA.map(([label, opts, idKey, refKey, cardKey, cardOpts]) =>
              renderSlotRow(label, opts, idKey, refKey, cardKey, cardOpts),
            )}
          </Stack>
          <Stack spacing={1}>
            {colB.map(([label, opts, idKey, refKey, cardKey, cardOpts]) =>
              renderSlotRow(label, opts, idKey, refKey, cardKey, cardOpts),
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default EquipmentPanel;
