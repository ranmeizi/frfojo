import {
  Box,
  Checkbox,
  Divider,
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
import type { CharacterBaseInput, PerformanceDanceState } from "../engine/types";
import { roCalcPaperSx, roCalcSectionTitleSx } from "../roCalcDenseSx";

const MAIN_LABELS = [
  "吹口哨",
  "刺客的黄昏",
  "布莱奇之诗",
  "依登的苹果",
  "哼唱之音(暂)",
  "女神之吻",
  "为您服务(暂)",
  "不死神齐格弗里德",
  "经验值倍增",
  "战鼓震天",
  "尼贝隆根之戒指",
];

type PerformanceDanceCardProps = {
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
};

const LV_KEYS_10: (keyof PerformanceDanceState)[] = [
  "lv0",
  "lv1",
  "lv2",
  "lv3",
  "lv4",
  "lv5",
  "lv6",
];
const LV_KEYS_5: (keyof PerformanceDanceState)[] = ["lv7", "lv8", "lv9", "lv10"];

const LvSelect: FC<{
  label: string;
  value: number;
  max: number;
  onChange: (n: number) => void;
}> = ({ label, value, max, onChange }) => (
  <FormControl size="small" fullWidth>
    <InputLabel shrink>{label}</InputLabel>
    <Select
      label={label}
      value={Math.min(max, Math.max(0, value))}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {Array.from({ length: max + 1 }, (_, i) => (
        <MenuItem key={i} value={i}>
          {i === 0 ? "关" : `Lv.${i}`}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const PerformanceDanceCard: FC<PerformanceDanceCardProps> = ({ value, onChange }) => {
  const p = value.performanceDance;

  const patch = (partial: Partial<PerformanceDanceState>) => {
    onChange({ ...value, performanceDance: { ...value.performanceDance, ...partial } });
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        ...roCalcPaperSx,
        width: "100%",
        height: { xs: "auto", md: "100%" },
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Typography variant="subtitle2" sx={roCalcSectionTitleSx}>
        演奏 / 舞蹈技能范围
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 1, fontSize: "0.7rem", lineHeight: 1.35 }}
      >
        PassSkill3；HIT/FLEE/CRIT/HP/SP/DEF/ASPD/傀儡六维等已进演算。
      </Typography>

      <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
        {LV_KEYS_10.map((key, i) => (
          <LvSelect
            key={key}
            label={MAIN_LABELS[i] ?? key}
            value={p[key] as number}
            max={10}
            onChange={(n) => patch({ [key]: n } as Partial<PerformanceDanceState>)}
          />
        ))}
        {LV_KEYS_5.map((key, i) => (
          <LvSelect
            key={key}
            label={MAIN_LABELS[7 + i] ?? key}
            value={p[key] as number}
            max={5}
            onChange={(n) => patch({ [key]: n } as Partial<PerformanceDanceState>)}
          />
        ))}

        <FormControlLabel
          control={
            <Checkbox
              checked={p.puppetTrick}
              onChange={(e) => patch({ puppetTrick: e.target.checked })}
            />
          }
          label="傀儡师的把戏"
        />

        <Divider sx={{ my: 0.25 }} />

        {p.lv0 > 0 ? (
          <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <Typography variant="caption" color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
              吹口哨：范围参数
            </Typography>
            <SmallNumSelect
              label="诗人的 AGI"
              value={p.row0PoetAgi}
              min={1}
              max={150}
              onChange={(n) => patch({ row0PoetAgi: n })}
            />
            <SmallNumSelect
              label="操控乐器"
              value={p.row0Instrument}
              min={1}
              max={10}
              onChange={(n) => patch({ row0Instrument: n })}
            />
          </Box>
        ) : null}

        {p.lv1 > 0 ? (
          <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <Typography variant="caption" color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
              刺客的黄昏
            </Typography>
            <SmallNumSelect
              label="诗人的 AGI"
              value={p.row1PoetAgi}
              min={1}
              max={150}
              onChange={(n) => patch({ row1PoetAgi: n })}
            />
            <SmallNumSelect
              label="操控乐器"
              value={p.row1Instrument}
              min={1}
              max={10}
              onChange={(n) => patch({ row1Instrument: n })}
            />
          </Box>
        ) : null}

        {p.lv2 > 0 ? (
          <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <Typography variant="caption" color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
              布莱奇之诗
            </Typography>
            <SmallNumSelect
              label="诗人的 DEX"
              value={p.row2PoetDex}
              min={1}
              max={200}
              onChange={(n) => patch({ row2PoetDex: n })}
            />
            <SmallNumSelect
              label="诗人的 INT"
              value={p.row2PoetInt}
              min={1}
              max={150}
              onChange={(n) => patch({ row2PoetInt: n })}
            />
            <SmallNumSelect
              label="操控乐器"
              value={p.row2Instrument}
              min={1}
              max={10}
              onChange={(n) => patch({ row2Instrument: n })}
            />
          </Box>
        ) : null}

        {p.lv3 > 0 ? (
          <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <Typography variant="caption" color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
              依登的苹果
            </Typography>
            <SmallNumSelect
              label="诗人的 VIT"
              value={p.row3PoetVit}
              min={1}
              max={150}
              onChange={(n) => patch({ row3PoetVit: n })}
            />
            <SmallNumSelect
              label="操控乐器"
              value={p.row3Instrument}
              min={1}
              max={10}
              onChange={(n) => patch({ row3Instrument: n })}
            />
          </Box>
        ) : null}

        {p.lv4 > 0 ? (
          <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <Typography variant="caption" color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
              哼唱之音
            </Typography>
            <SmallNumSelect
              label="舞娘的 DEX"
              value={p.row4DancerDex}
              min={1}
              max={180}
              onChange={(n) => patch({ row4DancerDex: n })}
            />
            <SmallNumSelect
              label="练习舞蹈"
              value={p.row4Dance}
              min={1}
              max={10}
              onChange={(n) => patch({ row4Dance: n })}
            />
          </Box>
        ) : null}

        {p.lv5 > 0 ? (
          <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <Typography variant="caption" color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
              女神之吻
            </Typography>
            <SmallNumSelect
              label="舞娘的 LUK"
              value={p.row5DancerLuk}
              min={1}
              max={180}
              onChange={(n) => patch({ row5DancerLuk: n })}
            />
            <SmallNumSelect
              label="练习舞蹈"
              value={p.row5Dance}
              min={1}
              max={10}
              onChange={(n) => patch({ row5Dance: n })}
            />
          </Box>
        ) : null}

        {p.lv6 > 0 ? (
          <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <Typography variant="caption" color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
              为您服务
            </Typography>
            <SmallNumSelect
              label="舞娘的 INT"
              value={p.row6DancerInt}
              min={1}
              max={180}
              onChange={(n) => patch({ row6DancerInt: n })}
            />
            <SmallNumSelect
              label="练习舞蹈"
              value={p.row6Dance}
              min={1}
              max={10}
              onChange={(n) => patch({ row6Dance: n })}
            />
          </Box>
        ) : null}

        {p.puppetTrick ? (
          <>
            <Divider sx={{ my: 0.25 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              施术者素质（傀儡）
            </Typography>
            <Box
              sx={{
                display: "grid",
                gap: 0.75,
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              }}
            >
              {(
                [
                  ["STR", "puppetStr", p.puppetStr],
                  ["AGI", "puppetAgi", p.puppetAgi],
                  ["VIT", "puppetVit", p.puppetVit],
                  ["INT", "puppetInt", p.puppetInt],
                  ["DEX", "puppetDex", p.puppetDex],
                  ["LUK", "puppetLuk", p.puppetLuk],
                ] as const
              ).map(([label, key, v]) => (
                <SmallNumSelect
                  key={key}
                  label={label}
                  value={v}
                  min={0}
                  max={99}
                  onChange={(n) => patch({ [key]: n } as Partial<PerformanceDanceState>)}
                />
              ))}
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={p.puppetFullStatsNoHalf}
                  onChange={(e) => patch({ puppetFullStatsNoHalf: e.target.checked })}
                />
              }
              label="所选属性不减半，直接加在基本能力值上"
            />
          </>
        ) : null}
      </Stack>
    </Paper>
  );
};

const SmallNumSelect: FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}> = ({ label, value, min, max, onChange }) => (
  <FormControl size="small" fullWidth>
    <InputLabel shrink>{label}</InputLabel>
    <Select
      label={label}
      value={Math.min(max, Math.max(min, value))}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
        <MenuItem key={n} value={n}>
          {n}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default PerformanceDanceCard;
