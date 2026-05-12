/**
 * 与「附加附魔与手动修正」共用的表单片段，供玩家卡与自定义装备弹窗复用。
 */
import {
  Box,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { type ChangeEvent, type FC, type ReactNode, useState } from "react";
import type { ManualVersusPair, PlayerManualEditsState } from "../engine/types";
import { SIZE_LABELS, SYUZOKU_LABELS, ZOKUSEI_BASE_LABELS } from "../engine/monsterCatalog";

const MVP_LABELS = ["(无)", "哥布灵", "巨岩", "守护者", "克瑞米", "兽人", "魔锅蛋"];

export type PlayerManualEditsFormBodyProps = {
  m: PlayerManualEditsState;
  onPatch: (partial: Partial<PlayerManualEditsState>) => void;
  /** 是否展示 MaxHP/ATK/ASPD 说明脚注 */
  showFormulaFootnote?: boolean;
};

function parseManualInt(raw: string): number | null {
  const t = raw.trim();
  if (t === "" || t === "-" || t === "+") return null;
  const n = Math.floor(Number(t));
  return Number.isFinite(n) ? n : null;
}

const ManualIntTextField: FC<{
  label: string;
  value: number;
  onCommit: (n: number) => void;
  widthCh?: number;
  fullWidth?: boolean;
  startAdornment?: ReactNode;
}> = ({ label, value, onCommit, widthCh = 5, fullWidth = true, startAdornment }) => {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const display = focused ? draft : String(value);
  return (
    <TextField
      label={label}
      size="small"
      fullWidth={fullWidth}
      value={display}
      onFocus={() => {
        setFocused(true);
        setDraft(value === 0 ? "" : String(value));
      }}
      onBlur={() => {
        const n = parseManualInt(draft);
        onCommit(n !== null ? n : 0);
        setFocused(false);
      }}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (!/^-?\d*$/.test(raw)) return;
        setDraft(raw);
        const n = parseManualInt(raw);
        if (n !== null) onCommit(n);
      }}
      InputProps={
        startAdornment
          ? {
              startAdornment: (
                <InputAdornment position="start">{startAdornment}</InputAdornment>
              ),
            }
          : undefined
      }
      inputProps={{
        inputMode: "numeric" as const,
        style: { maxWidth: `${widthCh}ch` },
      }}
    />
  );
};

const plusAdornment = (
  <Typography variant="caption" color="text.secondary">
    +
  </Typography>
);

const NumPlus: FC<{
  label: string;
  v: number;
  onChange: (n: number) => void;
  widthCh?: number;
}> = ({ label, v, onChange, widthCh = 5 }) => (
  <ManualIntTextField
    label={label}
    value={v}
    onCommit={onChange}
    widthCh={widthCh}
    startAdornment={plusAdornment}
  />
);

const VersusRow: FC<{
  pct: number;
  versus: number;
  onPct: (n: number) => void;
  onVersus: (n: number) => void;
  options: readonly string[];
  maxIdx: number;
}> = ({ pct, versus, onPct, onVersus, options, maxIdx }) => (
  <Box
    sx={{
      display: "grid",
      gap: 0.75,
      alignItems: "flex-end",
      gridTemplateColumns: { xs: "1fr", sm: "minmax(72px, 0.35fr) minmax(0, 1fr)" },
    }}
  >
    <ManualIntTextField
      label="%"
      value={pct}
      onCommit={onPct}
      fullWidth
      startAdornment={plusAdornment}
    />
    <FormControl size="small" fullWidth>
      <InputLabel shrink>vs</InputLabel>
      <Select
        label="vs"
        value={Math.min(maxIdx, Math.max(0, versus))}
        onChange={(e: SelectChangeEvent<number>) => onVersus(Number(e.target.value))}
      >
        {options.map((lab, i) => (
          <MenuItem key={lab} value={i}>
            {lab}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
);

const grid4 = {
  display: "grid",
  gap: 1,
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
} as const;

export const PlayerManualEditsFormBody: FC<PlayerManualEditsFormBodyProps> = ({
  m,
  onPatch,
  showFormulaFootnote = true,
}) => {
  const setRow = (
    key: "raceVs" | "elementVs" | "sizeVs" | "mvpVs",
    index: 0 | 1 | 2 | 3,
    next: ManualVersusPair,
  ) => {
    const arr = [...m[key]] as ManualVersusPair[];
    arr[index] = next;
    onPatch({ [key]: arr } as Partial<PlayerManualEditsState>);
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", mb: 0.75 }}>
        数值（平铺）
      </Typography>
      <Box sx={grid4}>
        <NumPlus label="STR" v={m.str} onChange={(n) => onPatch({ str: n })} />
        <NumPlus label="AGI" v={m.agi} onChange={(n) => onPatch({ agi: n })} />
        <NumPlus label="VIT" v={m.vit} onChange={(n) => onPatch({ vit: n })} />
        <NumPlus label="INT" v={m.int} onChange={(n) => onPatch({ int: n })} />
        <NumPlus label="DEX" v={m.dex} onChange={(n) => onPatch({ dex: n })} />
        <NumPlus label="LUK" v={m.luk} onChange={(n) => onPatch({ luk: n })} />
      </Box>

      <Box sx={{ ...grid4, mt: 1 }}>
        <NumPlus label="MaxHP" v={m.maxHpFlat} onChange={(n) => onPatch({ maxHpFlat: n })} />
        <NumPlus label="% MaxHP" v={m.maxHpPct} onChange={(n) => onPatch({ maxHpPct: n })} />
        <NumPlus label="MaxSP" v={m.maxSpFlat} onChange={(n) => onPatch({ maxSpFlat: n })} />
        <NumPlus label="% MaxSP" v={m.maxSpPct} onChange={(n) => onPatch({ maxSpPct: n })} />
        <NumPlus label="DEF" v={m.def} onChange={(n) => onPatch({ def: n })} />
        <NumPlus label="MDEF" v={m.mdef} onChange={(n) => onPatch({ mdef: n })} />
        <NumPlus label="HIT" v={m.hit} onChange={(n) => onPatch({ hit: n })} />
        <NumPlus label="FLEE" v={m.flee} onChange={(n) => onPatch({ flee: n })} />
        <NumPlus label="ATK" v={m.atk} onChange={(n) => onPatch({ atk: n })} />
        <NumPlus label="% ATK" v={m.atkPct} onChange={(n) => onPatch({ atkPct: n })} />
        <NumPlus label="P.Dodge" v={m.perfectDodge} onChange={(n) => onPatch({ perfectDodge: n })} />
        <NumPlus label="暴击率" v={m.criticalRate} onChange={(n) => onPatch({ criticalRate: n })} />
        <NumPlus label="MATK" v={m.matk} onChange={(n) => onPatch({ matk: n })} />
        <NumPlus label="% MATK" v={m.matkPct} onChange={(n) => onPatch({ matkPct: n })} />
        <NumPlus label="% ASPD" v={m.aspdPct} onChange={(n) => onPatch({ aspdPct: n })} />
        <NumPlus label="% HP 回复" v={m.hpRegenPct} onChange={(n) => onPatch({ hpRegenPct: n })} />
        <NumPlus label="% SP 回复" v={m.spRegenPct} onChange={(n) => onPatch({ spRegenPct: n })} />
      </Box>
      {showFormulaFootnote ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75, lineHeight: 1.45 }}>
          MaxHP / MaxSP：先与已有数值相加，再按百分比整体缩放。% ATK：先加在面板 ATK 上，再参与衍生属性中的百分比与普攻加成。% ASPD：参与攻速权重计算，不对最终攻速重复乘算。
        </Typography>
      ) : null}

      <Divider sx={{ my: 1.25 }} />

      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", mb: 0.75 }}>
        +% ATK 类伤害（对目标）
      </Typography>
      <Box sx={{ ...grid4, mt: 0.75 }}>
        {[0, 1, 2, 3].map((i) => (
          <VersusRow
            key={`race-${i}`}
            pct={m.raceVs[i].pct}
            versus={m.raceVs[i].versus}
            onPct={(n) => setRow("raceVs", i as 0 | 1 | 2 | 3, { ...m.raceVs[i], pct: n })}
            onVersus={(n) => setRow("raceVs", i as 0 | 1 | 2 | 3, { ...m.raceVs[i], versus: n })}
            options={SYUZOKU_LABELS}
            maxIdx={9}
          />
        ))}
      </Box>
      <Box sx={grid4}>
        {[0, 1, 2, 3].map((i) => (
          <VersusRow
            key={`el-${i}`}
            pct={m.elementVs[i].pct}
            versus={m.elementVs[i].versus}
            onPct={(n) => setRow("elementVs", i as 0 | 1 | 2 | 3, { ...m.elementVs[i], pct: n })}
            onVersus={(n) => setRow("elementVs", i as 0 | 1 | 2 | 3, { ...m.elementVs[i], versus: n })}
            options={ZOKUSEI_BASE_LABELS}
            maxIdx={9}
          />
        ))}
      </Box>
      <Box sx={grid4}>
        {[0, 1, 2, 3].map((i) => (
          <VersusRow
            key={`sz-${i}`}
            pct={m.sizeVs[i].pct}
            versus={m.sizeVs[i].versus}
            onPct={(n) => setRow("sizeVs", i as 0 | 1 | 2 | 3, { ...m.sizeVs[i], pct: n })}
            onVersus={(n) => setRow("sizeVs", i as 0 | 1 | 2 | 3, { ...m.sizeVs[i], versus: n })}
            options={SIZE_LABELS}
            maxIdx={2}
          />
        ))}
      </Box>
      <Box sx={grid4}>
        {[0, 1, 2, 3].map((i) => (
          <VersusRow
            key={`mvp-${i}`}
            pct={m.mvpVs[i].pct}
            versus={m.mvpVs[i].versus}
            onPct={(n) => setRow("mvpVs", i as 0 | 1 | 2 | 3, { ...m.mvpVs[i], pct: n })}
            onVersus={(n) => setRow("mvpVs", i as 0 | 1 | 2 | 3, { ...m.mvpVs[i], versus: n })}
            options={MVP_LABELS}
            maxIdx={6}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1,
          mt: 1,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <NumPlus label="% ATK 类伤害（任意目标）" v={m.atkDmgPctAny} onChange={(n) => onPatch({ atkDmgPctAny: n })} />
        <NumPlus label="% MATK 类伤害（任意目标）" v={m.matkDmgPctAny} onChange={(n) => onPatch({ matkDmgPctAny: n })} />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, fontSize: "0.65rem" }}>
        MATK「任意目标」% 已乘入衍生属性 MATK；魔伤技能链仍待后续接入。
      </Typography>
    </Box>
  );
};
