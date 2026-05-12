import {
  Box,
  Button,
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
import type { BuffSupportState, CharacterBaseInput } from "../engine/types";
import { defaultBuffSupport, maxBuffSupport } from "../engine/sanitizeCharacter";
import {
  roCalcFormControlDenseSx,
  roCalcPaperSx,
  roCalcSectionTitleSx,
} from "../roCalcDenseSx";

type BuffSupportSkillsCardProps = {
  value: CharacterBaseInput;
  onChange: (next: CharacterBaseInput) => void;
};

function lvOpts(max: number) {
  return Array.from({ length: max + 1 }, (_, i) => i);
}

const ADRENALINE_OPTIONS = [
  { v: 0, label: "OFF" },
  { v: 1, label: "普通状态" },
  { v: 2, label: "灵魂状态" },
  { v: 3, label: "速度激发 Lv5 卷轴" },
];

const BuffSupportSkillsCard: FC<BuffSupportSkillsCardProps> = ({ value, onChange }) => {
  const b = value.buffSupport;
  const hideSpiritSphere = value.formJobId === 15 || value.formJobId === 29;
  const hideWeaponResearch = hideSpiritSphere;

  const patch = (partial: Partial<BuffSupportState>) => {
    onChange({ ...value, buffSupport: { ...value.buffSupport, ...partial } });
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        ...roCalcPaperSx,
        ...roCalcFormControlDenseSx,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
        sx={{ mb: 0.5 }}
      >
        <Typography variant="subtitle2" sx={roCalcSectionTitleSx}>
          强化技能 / 辅助技能
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onChange({ ...value, buffSupport: maxBuffSupport() })}
          >
            全选
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onChange({ ...value, buffSupport: defaultBuffSupport() })}
          >
            重置
          </Button>
        </Stack>
      </Stack>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 1, fontSize: "0.7rem", lineHeight: 1.35 }}
      >
        A2_Skill / PassSkill2；六维、FLEE、ASPD 等已进右侧衍生属性。
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          alignItems: "start",
        }}
      >
        <Stack spacing={1}>
          <FormControl size="small" fullWidth>
            <InputLabel shrink>天使之赐福</InputLabel>
            <Select
              label="天使之赐福"
              value={b.blessLv}
              onChange={(e) => patch({ blessLv: Number(e.target.value) })}
            >
              {lvOpts(10).map((n) => (
                <MenuItem key={n} value={n}>
                  Lv.{n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel shrink>加速术</InputLabel>
            <Select
              label="加速术"
              value={b.agiUpLv}
              onChange={(e) => patch({ agiUpLv: Number(e.target.value) })}
            >
              {lvOpts(10).map((n) => (
                <MenuItem key={n} value={n}>
                  Lv.{n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel shrink>神威祈福</InputLabel>
            <Select
              label="神威祈福"
              value={b.magnusLv}
              onChange={(e) => patch({ magnusLv: Number(e.target.value) })}
            >
              {lvOpts(5).map((n) => (
                <MenuItem key={n} value={n}>
                  Lv.{n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={b.fortuneKiss}
                onChange={(e) => patch({ fortuneKiss: e.target.checked })}
              />
            }
            label="幸运之颂歌"
          />
          <FormControl size="small" fullWidth>
            <InputLabel shrink>天使之障壁</InputLabel>
            <Select
              label="天使之障壁"
              value={b.kyrieLv}
              onChange={(e) => patch({ kyrieLv: Number(e.target.value) })}
            >
              {lvOpts(10).map((n) => (
                <MenuItem key={n} value={n}>
                  Lv.{n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox checked={b.gloria} onChange={(e) => patch({ gloria: e.target.checked })} />
            }
            label="圣母之祈福"
          />
          <FormControl size="small" fullWidth>
            <InputLabel shrink>诵经（Suffragium）</InputLabel>
            <Select
              label="诵经（Suffragium）"
              value={b.suffragiumLv}
              onChange={(e) => patch({ suffragiumLv: Number(e.target.value) })}
            >
              {lvOpts(5).map((n) => (
                <MenuItem key={n} value={n}>
                  Lv.{n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel shrink>元素领域（A2[14]）</InputLabel>
            <Select
              label="元素领域（A2[14]）"
              value={b.elementalBarrierLv}
              onChange={(e) => patch({ elementalBarrierLv: Number(e.target.value) })}
            >
              {lvOpts(10).map((n) => (
                <MenuItem key={n} value={n}>
                  Lv.{n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!hideWeaponResearch ? (
            <FormControl size="small" fullWidth>
              <InputLabel shrink>武器研究（A2[10]）</InputLabel>
              <Select
                label="武器研究（A2[10]）"
                value={b.weaponResearchLv}
                onChange={(e) => patch({ weaponResearchLv: Number(e.target.value) })}
              >
                {lvOpts(5).map((n) => (
                  <MenuItem key={n} value={n}>
                    Lv.{n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography variant="caption" color="text.secondary">
              武器研究：弓手/游侠系用被动 SkillSearch(185)，原版 A2_Skill10 为「-」。
            </Typography>
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={b.soulBreakerEdp}
                onChange={(e) => patch({ soulBreakerEdp: e.target.checked })}
              />
            }
            label="灵魂破坏者对 EDP 暗属支（PassSkill2[11]）"
          />
          <FormControl size="small" fullWidth>
            <InputLabel shrink>速度激发</InputLabel>
            <Select
              label="速度激发"
              value={b.adrenalineMode}
              onChange={(e) => patch({ adrenalineMode: Number(e.target.value) })}
            >
              {ADRENALINE_OPTIONS.map((o) => (
                <MenuItem key={o.v} value={o.v}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={b.weaponSizeIgnore}
                onChange={(e) => patch({ weaponSizeIgnore: e.target.checked })}
              />
            }
            label="无视体型攻击"
          />
          <FormControl size="small" fullWidth>
            <InputLabel shrink>凶砍</InputLabel>
            <Select
              label="凶砍"
              value={b.overthrustLv}
              onChange={(e) => patch({ overthrustLv: Number(e.target.value) })}
            >
              {lvOpts(5).map((n) => (
                <MenuItem key={n} value={n}>
                  Lv.{n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel shrink>风之步</InputLabel>
            <Select
              label="风之步"
              value={b.windWalkerLv}
              onChange={(e) => patch({ windWalkerLv: Number(e.target.value) })}
            >
              {lvOpts(10).map((n) => (
                <MenuItem key={n} value={n}>
                  Lv.{n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!hideSpiritSphere ? (
            <FormControl size="small" fullWidth>
              <InputLabel shrink>气弹（将军魔碑卡）</InputLabel>
              <Select
                label="气弹（将军魔碑卡）"
                value={b.spiritSphereLv}
                onChange={(e) => patch({ spiritSphereLv: Number(e.target.value) })}
              >
                {lvOpts(5).map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography variant="caption" color="text.secondary">
              气弹：当前职业在 legacy 中不适用（武道家 / 武术宗师）。
            </Typography>
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={b.berserkState}
                onChange={(e) => patch({ berserkState: e.target.checked })}
              />
            }
            label="怒爆状态"
          />
          <FormControlLabel
            control={
              <Checkbox checked={b.provoke} onChange={(e) => patch({ provoke: e.target.checked })} />
            }
            label="挑衅（PassSkill2[12]·VITDEF×0.9）"
          />
          <FormControl size="small" fullWidth>
            <InputLabel shrink>牺牲祈福</InputLabel>
            <Select
              label="牺牲祈福"
              value={b.sacrificePoemLv}
              onChange={(e) => patch({ sacrificePoemLv: Number(e.target.value) })}
            >
              {lvOpts(3).map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel shrink>神祐之光</InputLabel>
            <Select
              label="神祐之光"
              value={b.lightOfLordLv}
              onChange={(e) => patch({ lightOfLordLv: Number(e.target.value) })}
            >
              {lvOpts(5).map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Divider sx={{ my: 1 }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", lineHeight: 1.35 }}>
        演奏/舞蹈见下卡；牺牲祈福等部分段未全接 foot.js。
      </Typography>
    </Paper>
  );
};

export default BuffSupportSkillsCard;
