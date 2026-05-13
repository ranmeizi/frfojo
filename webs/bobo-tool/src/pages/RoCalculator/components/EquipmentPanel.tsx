import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
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
import {
  armorItemOptions,
  dualWieldWeapon2ItemOptions,
  type ItemOption,
  weaponItemOptions,
} from "../engine/itemLists";
import { activeCardSetBonusCardIds } from "../engine/cardSetBonus";
import { formatActiveCardSetDescriptions } from "../engine/cardSetBonusText";
import { jobSupportsDualWield } from "../engine/nitouSupport";
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

function patchWeaponMainPick(o: ItemOption, eq: EquipmentState): Partial<EquipmentState> {
  if (o.customEquipId) {
    return {
      weaponId: 0,
      weaponRefine: 0,
      weaponCustomEquipId: o.customEquipId,
      weaponCard1: 0,
      weaponCard2: 0,
      weaponCard3: 0,
      weaponCard4: 0,
    };
  }
  return {
    weaponId: o.id,
    weaponCustomEquipId: null,
    weaponRefine: o.id === 0 ? 0 : eq.weaponRefine,
  };
}

function patchWeapon2Pick(o: ItemOption, eq: EquipmentState): Partial<EquipmentState> {
  if (o.customEquipId) {
    return {
      weapon2Id: 0,
      weapon2Refine: 0,
      weapon2CustomEquipId: o.customEquipId,
      weapon2Card1: 0,
      weapon2Card2: 0,
      weapon2Card3: 0,
      weapon2Card4: 0,
    };
  }
  return {
    weapon2Id: o.id,
    weapon2CustomEquipId: null,
    weapon2Refine: o.id === 0 ? 0 : eq.weapon2Refine,
  };
}

type ArmorSlotPickKeys = {
  idKey: keyof EquipmentState;
  customKey: keyof EquipmentState;
  refineKey: keyof EquipmentState | null;
  cardKey: keyof EquipmentState | null;
};

function patchArmorSlotPick(
  row: ArmorSlotPickKeys,
  o: ItemOption,
  prevEq: EquipmentState,
): Partial<EquipmentState> {
  if (o.customEquipId) {
    const p: Partial<EquipmentState> = {
      [row.idKey]: 0,
      [row.customKey]: o.customEquipId,
    } as Partial<EquipmentState>;
    if (row.refineKey) (p as Record<string, number>)[row.refineKey] = 0;
    if (row.cardKey) (p as Record<string, number>)[row.cardKey] = 0;
    return p;
  }
  const prevId = Math.floor(Number(prevEq[row.idKey]) || 0);
  const nextId = o.id;
  const p = { [row.idKey]: nextId, [row.customKey]: null } as Partial<EquipmentState>;
  /** 换一件普通防具时重置精炼，避免旧精炼套在新装备上；卡片不随装备 id 清空（与取消装备时保留卡号一致） */
  if (prevId !== nextId && row.refineKey) {
    (p as Record<string, number>)[row.refineKey] = 0;
  }
  return p;
}

const filterCardOptions = createFilterOptions<ItemOption>({
  matchFrom: "any",
  stringify: (o) => `${o.label} ${o.id}`,
});

const CardSelect: FC<{
  label: string;
  value: number;
  options: ItemOption[];
  disabled?: boolean;
  onChange: (id: number) => void;
}> = ({ label, value, options, disabled, onChange }) => {
  const safeId = options.some((o) => o.id === value) ? value : 0;
  const selected = useMemo(
    () => options.find((o) => o.id === safeId) ?? options[0],
    [options, safeId],
  );
  return (
    <Autocomplete
      fullWidth
      size="small"
      disabled={disabled}
      options={options}
      value={selected}
      onChange={(_, v) => {
        onChange(v?.id ?? 0);
      }}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      filterOptions={filterCardOptions}
      sx={{
        minWidth: 0,
        width: "100%",
        maxWidth: { xs: "100%", sm: colCard },
        justifySelf: "stretch",
      }}
      slotProps={{
        paper: {
          elevation: 3,
          sx: {
            minWidth: 280,
            maxWidth: "min(100vw - 24px, 520px)",
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
            typography: "caption",
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
  valueItemId: number;
  valueCustomEquipId: string | null;
  onPickOption: (o: ItemOption) => void;
  disabled?: boolean;
}> = ({ label, options, valueItemId, valueCustomEquipId, onPickOption, disabled }) => {
  const selected = useMemo(() => {
    if (valueCustomEquipId) {
      const c = options.find((o) => o.customEquipId === valueCustomEquipId);
      if (c) return c;
    }
    const plain = options.find((o) => o.id === valueItemId && !o.customEquipId);
    if (plain) return plain;
    return options.find((o) => o.id === valueItemId) ?? options[0];
  }, [options, valueItemId, valueCustomEquipId]);
  return (
    <Autocomplete
      fullWidth
      size="small"
      disabled={disabled}
      options={options}
      value={selected}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) =>
        a.customEquipId || b.customEquipId
          ? a.customEquipId === b.customEquipId
          : a.id === b.id
      }
      onChange={(_, v) => {
        if (v) onPickOption(v);
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

  const activeCardSetBonusIds = useMemo(
    () => activeCardSetBonusCardIds(eq, effectiveJobId),
    [eq, effectiveJobId],
  );
  const activeCardSetDescText = useMemo(
    () => formatActiveCardSetDescriptions(activeCardSetBonusIds),
    [activeCardSetBonusIds],
  );

  useEffect(() => {
    onPreviewItemId?.(eq.weaponCustomEquipId ? 0 : eq.weaponId);
  }, [eq.weaponId, eq.weaponCustomEquipId, effectiveJobId, isTensei, wt, onPreviewItemId]);

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
  const canNitou = jobSupportsDualWield(effectiveJobId);
  const weapon2Opts = useMemo(
    () => dualWieldWeapon2ItemOptions(effectiveJobId, isTensei),
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
    const neq = next.equipment;
    if ("weaponId" in p || "weaponCustomEquipId" in p) {
      onPreviewItemId?.(neq.weaponCustomEquipId ? 0 : neq.weaponId);
    } else if ("weapon2Id" in p || "weapon2CustomEquipId" in p) {
      onPreviewItemId?.(neq.weapon2CustomEquipId ? 0 : neq.weapon2Id);
    } else {
      const idKey = Object.keys(p).find((k) => k.endsWith("Id") && !k.includes("Custom"));
      if (idKey) {
        const id = next.equipment[idKey as keyof EquipmentState];
        if (typeof id === "number") onPreviewItemId?.(id);
      }
    }
  };

  const shieldSlotDisabled = canNitou && eq.dualWield;
  const armorSlots = [
    ["头饰上", head1Opts, "head1Id", "head1CustomEquipId", "head1Refine", "head1Card" as const, headCardOpts, false],
    ["头饰中", head2Opts, "head2Id", "head2CustomEquipId", null, "head2Card" as const, headCardOpts, false],
    ["头饰下", head3Opts, "head3Id", "head3CustomEquipId", "head3Refine", null, null, false],
    ["左手（盾）", leftOpts, "leftId", "leftCustomEquipId", "leftRefine", "leftCard" as const, shieldCardOpts, shieldSlotDisabled],
    ["身体", bodyOpts, "bodyId", "bodyCustomEquipId", "bodyRefine", "bodyCard" as const, bodyCardOpts, false],
    ["披肩", shoulderOpts, "shoulderId", "shoulderCustomEquipId", "shoulderRefine", "shoulderCard" as const, garmentCardOpts, false],
    ["鞋子", shoesOpts, "shoesId", "shoesCustomEquipId", "shoesRefine", "shoesCard" as const, shoesCardOpts, false],
    ["饰品 1", accOpts, "acc1Id", "acc1CustomEquipId", null, "acc1Card" as const, accCardOpts, false],
    ["饰品 2", accOpts, "acc2Id", "acc2CustomEquipId", null, "acc2Card" as const, accCardOpts, false],
  ] as const;

  const colA = armorSlots.slice(0, 5);
  const colB = armorSlots.slice(5);

  const renderSlotRow = (
    label: string,
    opts: ItemOption[],
    idKey: keyof EquipmentState,
    customKey: keyof EquipmentState,
    refKey: keyof EquipmentState | null,
    cardKey: keyof EquipmentState | null,
    cardOpts: ItemOption[] | null,
    slotDisabled = false,
  ) => {
    const hasCard = Boolean(cardKey && cardOpts);
    const rowLocked = Boolean(eq[customKey]);
    return (
      <Box key={String(idKey)} sx={armorSlotRowSx(!!refKey, hasCard)}>
        <ItemAutocomplete
          label={label}
          options={opts}
          valueItemId={eq[idKey] as number}
          valueCustomEquipId={(eq[customKey] as string | null) ?? null}
          disabled={slotDisabled}
          onPickOption={(o) =>
            applyEq(patchArmorSlotPick({ idKey, customKey, refineKey: refKey, cardKey }, o, eq))
          }
        />
        {refKey ? (
          <RefineSelect
            label="精炼"
            value={eq[refKey] as number}
            disabled={slotDisabled || rowLocked}
            onChange={(n) => applyEq({ [refKey]: n } as Partial<EquipmentState>)}
          />
        ) : null}
        {cardKey && cardOpts ? (
          <CardSelect
            label="卡片"
            options={cardOpts}
            value={eq[cardKey] as number}
            disabled={slotDisabled || rowLocked}
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
        精炼时 DEF 计入头、手、身、披肩、鞋。刺客开启二刀流时左手盾不参与装备套装与部分攻防计算。各槽卡片、装备套装、卡片套装与装备附加效果已计入右侧「衍生属性」与六维。若某槽所选卡片不在该槽默认列表中，界面上可能显示为「无」，但存档中的卡号仍会参与计算。更换普通防具（非自定义）时，若物品 id 变化，会重置该槽精炼；卡号保留。换为自定义装备时仍会清空该槽精炼与卡片。
      </Typography>
      {activeCardSetBonusIds.length > 0 ? (
        <Typography
          variant="caption"
          color="success.main"
          display="block"
          sx={{ mb: 1, fontSize: "0.7rem", lineHeight: 1.45 }}
        >
          已激活卡片套装（虚拟奖励卡 ID：{activeCardSetBonusIds.join("、")}）
          {activeCardSetDescText ? (
            <Box
              component="span"
              sx={{
                display: "block",
                mt: 0.35,
                color: "text.secondary",
                fontWeight: 500,
                whiteSpace: "pre-line",
              }}
            >
              {activeCardSetDescText}
            </Box>
          ) : null}
        </Typography>
      ) : null}

      <Stack spacing={1}>
        {wt === 0 ? (
          <Box sx={armorSlotRowSx(true, false)}>
            <ItemAutocomplete
              label="武器"
              options={weaponOpts}
              valueItemId={eq.weaponId}
              valueCustomEquipId={eq.weaponCustomEquipId}
              onPickOption={(o) => applyEq(patchWeaponMainPick(o, eq))}
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
              valueItemId={eq.weaponId}
              valueCustomEquipId={eq.weaponCustomEquipId}
              onPickOption={(o) => applyEq(patchWeaponMainPick(o, eq))}
            />
            <RefineSelect
              label="武器精炼"
              value={eq.weaponRefine}
              disabled={wt === 0 || Boolean(eq.weaponCustomEquipId)}
              onChange={(weaponRefine) => applyEq({ weaponRefine })}
            />
            <CardSelect
              label="武器卡 1"
              options={wCard1Opts}
              value={eq.weaponCard1}
              disabled={Boolean(eq.weaponCustomEquipId) || eq.weaponId === 0}
              onChange={(weaponCard1) => applyEq({ weaponCard1 })}
            />
            <CardSelect
              label="武器卡 2"
              options={wCard234Opts}
              value={eq.weaponCard2}
              disabled={Boolean(eq.weaponCustomEquipId) || eq.weaponId === 0}
              onChange={(weaponCard2) => applyEq({ weaponCard2 })}
            />
            <CardSelect
              label="武器卡 3"
              options={wCard234Opts}
              value={eq.weaponCard3}
              disabled={Boolean(eq.weaponCustomEquipId) || eq.weaponId === 0}
              onChange={(weaponCard3) => applyEq({ weaponCard3 })}
            />
            <CardSelect
              label="武器卡 4"
              options={wCard234Opts}
              value={eq.weaponCard4}
              disabled={Boolean(eq.weaponCustomEquipId) || eq.weaponId === 0}
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
                valueItemId={eq.weaponId}
                valueCustomEquipId={eq.weaponCustomEquipId}
                onPickOption={(o) => applyEq(patchWeaponMainPick(o, eq))}
              />
              <RefineSelect
                label="武器精炼"
                value={eq.weaponRefine}
                disabled={wt === 0 || Boolean(eq.weaponCustomEquipId)}
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
                disabled={Boolean(eq.weaponCustomEquipId) || eq.weaponId === 0}
                onChange={(weaponCard1) => applyEq({ weaponCard1 })}
              />
              <CardSelect
                label="武器卡 2"
                options={wCard234Opts}
                value={eq.weaponCard2}
                disabled={Boolean(eq.weaponCustomEquipId) || eq.weaponId === 0}
                onChange={(weaponCard2) => applyEq({ weaponCard2 })}
              />
              <CardSelect
                label="武器卡 3"
                options={wCard234Opts}
                value={eq.weaponCard3}
                disabled={Boolean(eq.weaponCustomEquipId) || eq.weaponId === 0}
                onChange={(weaponCard3) => applyEq({ weaponCard3 })}
              />
              <CardSelect
                label="武器卡 4"
                options={wCard234Opts}
                value={eq.weaponCard4}
                disabled={Boolean(eq.weaponCustomEquipId) || eq.weaponId === 0}
                onChange={(weaponCard4) => applyEq({ weaponCard4 })}
              />
            </Box>
          </Stack>
        )}

        {wt > 0 && canNitou ? (
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={eq.dualWield}
                  onChange={(e) => {
                    const on = e.target.checked;
                    if (on) {
                      applyEq({
                        dualWield: true,
                        leftId: 0,
                        leftRefine: 0,
                        leftCard: 0,
                      });
                    } else {
                      applyEq({
                        dualWield: false,
                        weapon2Id: 0,
                        weapon2CustomEquipId: null,
                        weapon2Refine: 0,
                        weapon2Card1: 0,
                        weapon2Card2: 0,
                        weapon2Card3: 0,
                        weapon2Card4: 0,
                      });
                    }
                  }}
                />
              }
              label="二刀副手（刺客 / 十字刺客）"
            />
            {eq.dualWield ? (
              mdUp ? (
                <Box
                  sx={{
                    display: "grid",
                    gap: 1,
                    alignItems: "flex-start",
                    gridTemplateColumns: `minmax(0, 1fr) ${colRefine} repeat(4, ${colCard})`,
                  }}
                >
                  <ItemAutocomplete
                    label="副手武器"
                    options={weapon2Opts}
                    valueItemId={eq.weapon2Id}
                    valueCustomEquipId={eq.weapon2CustomEquipId}
                    onPickOption={(o) => applyEq(patchWeapon2Pick(o, eq))}
                  />
                  <RefineSelect
                    label="副手精炼"
                    value={eq.weapon2Refine}
                    disabled={eq.weapon2Id === 0 && !eq.weapon2CustomEquipId}
                    onChange={(weapon2Refine) => applyEq({ weapon2Refine })}
                  />
                  <CardSelect
                    label="副手卡 1"
                    options={wCard1Opts}
                    value={eq.weapon2Card1}
                    disabled={eq.weapon2Id === 0 && !eq.weapon2CustomEquipId}
                    onChange={(weapon2Card1) => applyEq({ weapon2Card1 })}
                  />
                  <CardSelect
                    label="副手卡 2"
                    options={wCard234Opts}
                    value={eq.weapon2Card2}
                    disabled={eq.weapon2Id === 0 && !eq.weapon2CustomEquipId}
                    onChange={(weapon2Card2) => applyEq({ weapon2Card2 })}
                  />
                  <CardSelect
                    label="副手卡 3"
                    options={wCard234Opts}
                    value={eq.weapon2Card3}
                    disabled={eq.weapon2Id === 0 && !eq.weapon2CustomEquipId}
                    onChange={(weapon2Card3) => applyEq({ weapon2Card3 })}
                  />
                  <CardSelect
                    label="副手卡 4"
                    options={wCard234Opts}
                    value={eq.weapon2Card4}
                    disabled={eq.weapon2Id === 0 && !eq.weapon2CustomEquipId}
                    onChange={(weapon2Card4) => applyEq({ weapon2Card4 })}
                  />
                </Box>
              ) : (
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1,
                      gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: `minmax(0, 1fr) ${colRefine}` },
                    }}
                  >
                    <ItemAutocomplete
                      label="副手武器"
                      options={weapon2Opts}
                      valueItemId={eq.weapon2Id}
                      valueCustomEquipId={eq.weapon2CustomEquipId}
                      onPickOption={(o) => applyEq(patchWeapon2Pick(o, eq))}
                    />
                    <RefineSelect
                      label="副手精炼"
                      value={eq.weapon2Refine}
                      disabled={eq.weapon2Id === 0 && !eq.weapon2CustomEquipId}
                      onChange={(weapon2Refine) => applyEq({ weapon2Refine })}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1,
                      gridTemplateColumns: {
                        xs: `repeat(2, ${colCard})`,
                        sm: `repeat(4, ${colCard})`,
                      },
                      width: "max-content",
                      maxWidth: "100%",
                      overflowX: "auto",
                    }}
                  >
                    <CardSelect
                      label="副手卡 1"
                      options={wCard1Opts}
                      value={eq.weapon2Card1}
                      disabled={eq.weapon2Id === 0 && !eq.weapon2CustomEquipId}
                      onChange={(weapon2Card1) => applyEq({ weapon2Card1 })}
                    />
                    <CardSelect
                      label="副手卡 2"
                      options={wCard234Opts}
                      value={eq.weapon2Card2}
                      disabled={eq.weapon2Id === 0 && !eq.weapon2CustomEquipId}
                      onChange={(weapon2Card2) => applyEq({ weapon2Card2 })}
                    />
                    <CardSelect
                      label="副手卡 3"
                      options={wCard234Opts}
                      value={eq.weapon2Card3}
                      disabled={eq.weapon2Id === 0 && !eq.weapon2CustomEquipId}
                      onChange={(weapon2Card3) => applyEq({ weapon2Card3 })}
                    />
                    <CardSelect
                      label="副手卡 4"
                      options={wCard234Opts}
                      value={eq.weapon2Card4}
                      disabled={eq.weapon2Id === 0 && !eq.weapon2CustomEquipId}
                      onChange={(weapon2Card4) => applyEq({ weapon2Card4 })}
                    />
                  </Box>
                </Stack>
              )
            ) : null}
          </Stack>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gap: { xs: 1, lg: 1.5 },
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            alignItems: "start",
          }}
        >
          <Stack spacing={1}>
            {colA.map(([label, opts, idKey, customKey, refKey, cardKey, cardOpts, dis]) =>
              renderSlotRow(label, opts, idKey, customKey, refKey, cardKey, cardOpts, dis),
            )}
          </Stack>
          <Stack spacing={1}>
            {colB.map(([label, opts, idKey, customKey, refKey, cardKey, cardOpts, dis]) =>
              renderSlotRow(label, opts, idKey, customKey, refKey, cardKey, cardOpts, dis),
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default EquipmentPanel;
