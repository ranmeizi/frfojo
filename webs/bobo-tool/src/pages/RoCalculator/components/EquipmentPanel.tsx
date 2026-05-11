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
} from "@mui/material";
import { FC, useEffect, useMemo } from "react";
import type { CharacterBaseInput, EquipmentState } from "../engine/types";
import { armorItemOptions, type ItemOption, weaponItemOptions } from "../engine/itemLists";
import { resolveCombatJob } from "../engine/jobResolve";
import { roCalcPaperSx, roCalcSectionTitleSx } from "../roCalcDenseSx";

const REFINE: number[] = Array.from({ length: 11 }, (_, i) => i);

function slotRowGridSx(hasRefine: boolean) {
  return {
    display: "grid",
    gap: 1,
    alignItems: "flex-start" as const,
    gridTemplateColumns: hasRefine
      ? { xs: "minmax(0, 1fr)", sm: "minmax(0, 1fr) 104px" }
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

const RefineSelect: FC<{
  label: string;
  value: number;
  disabled?: boolean;
  onChange: (n: number) => void;
}> = ({ label, value, disabled, onChange }) => (
  <FormControl size="small" disabled={disabled} sx={{ width: 1, maxWidth: 104 }}>
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
    ["头饰上", head1Opts, "head1Id", "head1Refine"],
    ["头饰中", head2Opts, "head2Id", null],
    ["头饰下", head3Opts, "head3Id", "head3Refine"],
    ["左手", leftOpts, "leftId", "leftRefine"],
    ["身体", bodyOpts, "bodyId", "bodyRefine"],
    ["披肩", shoulderOpts, "shoulderId", "shoulderRefine"],
    ["鞋子", shoesOpts, "shoesId", "shoesRefine"],
    ["饰品 1", accOpts, "acc1Id", null],
    ["饰品 2", accOpts, "acc2Id", null],
  ] as const;

  const colA = armorSlots.slice(0, 5);
  const colB = armorSlots.slice(5);

  const renderSlotRow = (
    label: string,
    opts: ItemOption[],
    idKey: keyof EquipmentState,
    refKey: keyof EquipmentState | null,
  ) => (
    <Box key={String(idKey)} sx={slotRowGridSx(!!refKey)}>
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
    </Box>
  );

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
        ItemOBJ 排序；精炼 DEF 计头/手/身/披肩/鞋。大屏防具双列。
      </Typography>

      <Stack spacing={1}>
        <Box sx={slotRowGridSx(true)}>
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
            gap: { xs: 1, lg: 1.5 },
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            alignItems: "start",
          }}
        >
          <Stack spacing={1}>
            {colA.map(([label, opts, idKey, refKey]) =>
              renderSlotRow(label, opts, idKey, refKey),
            )}
          </Stack>
          <Stack spacing={1}>
            {colB.map(([label, opts, idKey, refKey]) =>
              renderSlotRow(label, opts, idKey, refKey),
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default EquipmentPanel;
