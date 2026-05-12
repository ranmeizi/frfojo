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
  Typography,
} from "@mui/material";
import { FC } from "react";
import type { CharacterBaseInput, FoodConsumableState } from "../engine/types";
import {
  roCalcFormControlDenseSx,
  roCalcPaperSx,
  roCalcSectionTitleSx,
} from "../roCalcDenseSx";

type FoodConsumableCardProps = {
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
};

const STAT_FOOD: { key: keyof FoodConsumableState; label: string }[] = [
  { key: "strBonus", label: "STR+料理" },
  { key: "agiBonus", label: "AGI+料理" },
  { key: "vitBonus", label: "VIT+料理" },
  { key: "intBonus", label: "INT+料理" },
  { key: "dexBonus", label: "DEX+料理" },
  { key: "lukBonus", label: "LUK+料理" },
];

const FoodConsumableCard: FC<FoodConsumableCardProps> = ({ value, onChange }) => {
  const f = value.foodConsumable;

  const patch = (partial: Partial<FoodConsumableState>) => {
    onChange({ ...value, foodConsumable: { ...value.foodConsumable, ...partial } });
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        ...roCalcPaperSx,
        ...roCalcFormControlDenseSx,
        width: "100%",
        height: { xs: "auto", md: "100%" },
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Typography variant="subtitle2" sx={roCalcSectionTitleSx}>
        强化素质（食品／箱）
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 1, fontSize: "0.7rem", lineHeight: 1.35 }}
      >
        PassSkill7；六维/HIT/FLEE/武器与 MATK 平铺已参与演算。
      </Typography>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        }}
      >
        <Stack spacing={0.5}>
          <FormControlLabel
            control={
              <Checkbox checked={f.teaHit} onChange={(e) => patch({ teaHit: e.target.checked })} />
            }
            label="茶食 (HIT+30)"
          />
          <FormControlLabel
            control={
              <Checkbox checked={f.oilFlee} onChange={(e) => patch({ oilFlee: e.target.checked })} />
            }
            label="油果 (FLEE+30)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.coloredCake}
                onChange={(e) => patch({ coloredCake: e.target.checked })}
              />
            }
            label="彩色糕饼 (ATK/MATK+10)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.resentmentBox}
                onChange={(e) => patch({ resentmentBox: e.target.checked })}
              />
            }
            label="怨恨的箱子 (ATK+20)"
          />
          <FormControlLabel
            control={
              <Checkbox checked={f.sleepBox} onChange={(e) => patch({ sleepBox: e.target.checked })} />
            }
            label="睡眠的箱子 (MATK+20)"
          />
        </Stack>
        <Stack spacing={0.5}>
          <FormControlLabel
            control={
              <Checkbox
                checked={f.resistWater}
                onChange={(e) => patch({ resistWater: e.target.checked })}
              />
            }
            label="水属性魔法抗药"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.resistEarth}
                onChange={(e) => patch({ resistEarth: e.target.checked })}
              />
            }
            label="地属性魔法抗药"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.resistFire}
                onChange={(e) => patch({ resistFire: e.target.checked })}
              />
            }
            label="火属性魔法抗药"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.resistWind}
                onChange={(e) => patch({ resistWind: e.target.checked })}
              />
            }
            label="风属性魔法抗药"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.magicScrollExtra}
                onChange={(e) => patch({ magicScrollExtra: e.target.checked })}
              />
            }
            label="魔法卷轴 / 天地树"
          />
        </Stack>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1, mb: 0.5, fontSize: "0.7rem" }}
      >
        六维料理 +1～+99（0=无）
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
        }}
      >
        {STAT_FOOD.map(({ key, label }) => (
          <FormControl key={key} size="small" fullWidth>
            <InputLabel shrink>{label}</InputLabel>
            <Select
              label={label}
              value={f[key] as number}
              onChange={(e) => patch({ [key]: Number(e.target.value) } as Partial<FoodConsumableState>)}
            >
              <MenuItem value={0}>无</MenuItem>
              {Array.from({ length: 99 }, (_, i) => i + 1).map((n) => (
                <MenuItem key={n} value={n}>
                  +{n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>
      </Box>
    </Paper>
  );
};

export default FoodConsumableCard;
