import { legacyEquipIds } from "./equipmentSetBonus";
import { itemWeight } from "./itemAccessors";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import { resolveCombatJob } from "./jobResolve";
import type { CharacterBaseInput, CombatSnapshot } from "./types";
import {
  SIZE_LABELS,
  SYUZOKU_LABELS,
  ZOKUSEI_BASE_LABELS,
} from "./monsterCatalog";

/** refer `foot.js` `KakutyouKansuu`：**1～5、10** 可预览；**6～9** 仍为占位。路线图 **H3** 与 **`LEGACY_GAP_SCAN.md`** 残差 **Kakutyou / 咏唱** 互链。 */

/** refer `foot.js` `IjyouOBJ`（与 `itemSetumei.ts` 一致） */
const IJYOU_LABELS = [
  "中毒",
  "晕眩",
  "冰冻",
  "诅咒",
  "黑暗",
  "睡眠",
  "沉默",
  "混乱",
  "出血",
  "石化",
] as const;

/** refer `foot.js` Kakutyou wKK==1 治愈阶梯职业 */
const HEAL_LADDER_JOBS = new Set([
  3, 9, 13, 14, 15, 20, 23, 27, 28, 29,
]);

const KK2_JOBS = new Set([1, 7, 13, 20, 21, 27]);
const KK3_JOBS = new Set([5, 9, 11, 18, 20, 23, 25, 32, 44]);
const KK4_JOBS = new Set([15, 29]);
const KK5_MERCHANT_JOBS = new Set([6, 12, 19, 20, 26, 33]);

/** refer `foot.js` wKK==5 `syozijob`（下标 0～45） */
const SYOZIJOB_BY_FORM_JOB: readonly number[] = [
  0, 800, 400, 400, 600, 200, 800, 800, 400, 600, 700, 400, 1000, 800, 400, 600, 700, 700, 400,
  1000, 0, 800, 400, 600, 700, 400, 1000, 800, 400, 600, 700, 700, 400, 1000, 0, 0, 0, 0, 0, 0, 0,
  800, 800, 400, 600, 800,
];

function formatElementShort(code: number): string {
  const tier = Math.floor(code / 10);
  const lv = code % 10;
  const base = ZOKUSEI_BASE_LABELS[tier] ?? `属${tier}`;
  return lv > 0 ? `${base}${lv}` : base;
}

/** refer `head.js` `HealCalc` 核心段；不含 n_tok[91/92]、装备 644/1034/1065 等 */
function healAmountBase(
  baseLv: number,
  intTotal: number,
  healLv: number,
  skill269Lv: number,
): number {
  let wHeal = Math.floor((baseLv + intTotal) / 8) * (healLv * 8 + 4);
  const wHealBAI = 100 + skill269Lv * 2;
  wHeal = Math.floor((wHeal * wHealBAI) / 100);
  return wHeal;
}

function sumEquipWeightKg(input: CharacterBaseInput): number {
  const { effectiveJobId } = resolveCombatJob(input.formJobId);
  return legacyEquipIds(input.equipment, effectiveJobId).reduce(
    (s, id) => s + itemWeight(id),
    0,
  );
}

/**
 * 与 refer `foot.js` `KakutyouKansuu` 对齐的子集；6～9 等依赖完整 `n_A_zokusei` / `n_tok` 的项给出占位说明。
 */
export function computeKakutyouLines(
  input: CharacterBaseInput,
  snapshot: CombatSnapshot,
): string[] {
  const wKK = input.kakutyouMode;
  if (wKK === 0) return [];

  const job = input.formJobId;
  const sel = Math.min(10, Math.max(0, Math.floor(input.kakutyouSelNum)));
  const sel4 = Math.min(5, sel);

  if (wKK === 1) {
    const intT = snapshot.totalStats.int;
    const s269 = passiveLevelBySkillId(job, input.passiveSkillLevels, 269);
    const lines: string[] = [];
    if (HEAL_LADDER_JOBS.has(job)) {
      for (let i = 1; i <= 9; i++) {
        lines.push(`Lv${i} ${healAmountBase(input.baseLv, intT, i, s269)}`);
      }
      lines.push(`Lv10 ${healAmountBase(input.baseLv, intT, 10, s269)}`);
    } else {
      lines.push(`治愈术Lv1(治愈夹) ${healAmountBase(input.baseLv, intT, 1, s269)}`);
      for (let i = 2; i <= 4; i++) {
        lines.push(`治愈术Lv${i} ${healAmountBase(input.baseLv, intT, i, s269)}`);
      }
      lines.push(`治愈术Lv5(卷轴) ${healAmountBase(input.baseLv, intT, 5, s269)}`);
    }
    const mod8 = (input.baseLv + intT) % 8;
    lines.push(`下次治愈提高需 LV+INT +${8 - mod8}`);
    lines.push("（未含 n_tok[91/92] 与装备治愈加成段，与原版略有差）");
    return lines;
  }

  if (wKK === 2) {
    if (!KK2_JOBS.has(job)) return ["该职业无法使用「快速恢复」预览。"];
    const w = Math.floor((5 + snapshot.maxHp / 500) * sel);
    return [`恢复量 ${w}`];
  }

  if (wKK === 3) {
    if (!KK3_JOBS.has(job)) return ["该职业无法使用「禅心」预览。"];
    const w = Math.floor((3 + snapshot.maxSp / 500) * sel);
    return [`恢复量 ${w}`];
  }

  if (wKK === 4) {
    if (!KK4_JOBS.has(job)) return ["该职业无法使用「运气调息」预览。"];
    const lv = sel4;
    const w1 = Math.floor((4 + snapshot.maxHp / 500) * lv);
    const w2 = Math.floor((2 + snapshot.maxSp / 500) * lv);
    return [`HP恢复量 ${w1}`, `SP恢复量 ${w2}`];
  }

  if (wKK === 5) {
    const cap = SYOZIJOB_BY_FORM_JOB[job] ?? 0;
    let syoziryou = 2000 + cap;
    if (input.baby) syoziryou = 2000;
    syoziryou += input.stats.str * 30;
    if (passiveLevelBySkillId(job, input.passiveSkillLevels, 78) > 0) syoziryou += 1000;
    if (KK5_MERCHANT_JOBS.has(job)) syoziryou += sel * 200;
    const kg = sumEquipWeightKg(input);
    return [`可持负重量 ${syoziryou}`, `装备物品重量合计: ${kg}`];
  }

  if (wKK === 6) {
    return [
      "属性耐性表需完整 n_A_zokusei[0..9] 链（装备/卡/被动/抗歌等），当前引擎未汇总到此数组。",
    ];
  }

  if (wKK === 7) {
    return [
      "种族伤害修正需 n_tok[50..59] 全量；当前未写入快照，待与 StPlusCalc 种族段对齐。",
    ];
  }

  if (wKK === 8) {
    return [
      "异常状态耐性需 n_tok[150..159] 与面板 VIT/INT/LUK/MDEF 等组合，当前未接全链。",
      ...IJYOU_LABELS.map((lab) => `${lab} （待接）`),
    ];
  }

  if (wKK === 9) {
    return [
      "boss级魔物 / 远距离攻击 / 一般攻击 与 体型耐性需 n_tok[77..79]、[190..192]，待接。",
    ];
  }

  if (wKK === 10) {
    const castPct = Math.round(snapshot.castTimeMultiplierApprox * 10000) / 100;
    return [
      `咏唱时间：${castPct}%（近似，同 castTimeMultiplierApprox；不含 StPlusCalc2(7000+skill)）`,
      "延迟时间：待接 n_tok[74]（装备/被动 script 等写入全链）",
    ];
  }

  return [];
}

/** UI：扩展函数主下拉标签 */
export const KAKUTYOU_MODE_OPTIONS: readonly { value: number; label: string }[] = [
  { value: 0, label: "（关）" },
  { value: 1, label: "1 · 治愈术阶梯" },
  { value: 2, label: "2 · 快速恢复" },
  { value: 3, label: "3 · 禅心" },
  { value: 4, label: "4 · 运气调息" },
  { value: 5, label: "5 · 负重" },
  { value: 6, label: "6 · 属性耐性表（占位）" },
  { value: 7, label: "7 · 种族伤修（占位）" },
  { value: 8, label: "8 · 异常耐性（占位）" },
  { value: 9, label: "9 · Boss/远攻/体型（占位）" },
  { value: 10, label: "10 · 咏唱/延迟" },
];

export function kakutyouSubSelectMax(mode: number, formJobId: number): number | null {
  if (mode === 4) return 5;
  if (mode === 2 || mode === 3) return 10;
  if (mode === 5 && KK5_MERCHANT_JOBS.has(formJobId)) return 10;
  return null;
}

export function kakutyouSubSelectLabel(mode: number, formJobId: number): string | null {
  if (mode === 2 && KK2_JOBS.has(formJobId)) return "快速恢复 LV";
  if (mode === 3 && KK3_JOBS.has(formJobId)) return "禅心 LV";
  if (mode === 4 && KK4_JOBS.has(formJobId)) return "运气调息 LV";
  if (mode === 5 && KK5_MERCHANT_JOBS.has(formJobId)) return "负重量上升";
  return null;
}

/** 战斗表用：由 legacyNB 拼一行短摘要 */
export function formatLegacyNBSummary(nb: readonly number[]): string {
  if (nb.length < 16) return "—";
  const race = SYUZOKU_LABELS[nb[2]] ?? `种族${nb[2]}`;
  const elem = formatElementShort(nb[3]);
  const size = SIZE_LABELS[nb[4]] ?? `体型${nb[4]}`;
  return `${race} · ${elem} · ${size} · Lv${nb[5]} · HP ${nb[6]}`;
}
