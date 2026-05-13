import { tPlusDamCutTaijinZero, type BaiCIPhysicalCtx } from "./baiCIPhysical";
import { cardScriptFirstCode } from "./cardBonuses";
import { applyTPlusLuckyBattleCalc3, type TPlusLuckyBattleCalc3Input } from "./tPlusLucky";
import type { EquipmentState } from "./types";
import { isNitouActive } from "./nitouSupport";

/**
 * `head.js` **`BattleCalc3`**（**4305～4312**）与 **3877～3888** 权重（**`w998D`/`w998E`** 双满/天使之怒、**`w998B×六合中档`**）。
 * 末尾 **`return tPlusLucky(wBC3_X)`**（`tPlusLucky.ts`；魔物表 **Taijin=0** 恒等）。**`computeBattleCalc998Weights`** 与 **`referHitDisplayW998K`** / **`battleCalc3ExpectedApprox(..., head998)`** 共用 **`w998K`** 段。
 *
 * 暴伤支：**`BattleCalc(...,10)`**（跳过 BC4、`4035～4068`、属克）+ **`BaiCI` 含 `n_tok[70]`** + 拳刃 **L13**；Miss 段见 `battleCalc2ZeroMissApprox`。
 */
/** `head.js`：`w_HIT` 先钳在 5–100，再 `Math.floor(w_HIT*100)/100`（`StPlusCalc2(86)` 等略） */
export function normalizeHitForBattleCalc3(wHitRaw: number): number {
  let h = wHitRaw;
  if (h > 100) h = 100;
  else if (h < 5) h = 5;
  return Math.floor(h * 100) / 100;
}

export function clampBattleCritPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

/** `head.js` **3877～3888** 与 **`BattleCalc3`**（**4305～4312**）权重（**`w998D`/`w998E`** 双满/天使之怒期望段）。 */
export function computeBattleCalc998Weights(p: {
  wHitRaw: number;
  playerCritStat: number;
  monsterLuk: number;
  weaponType: number;
  skill13Lv: number;
  skill187Lv: number;
  wDA: number;
}): {
  w_HIT: number;
  w_Cri: number;
  wBC3_3danHatudouRitu: number;
  w998A: number;
  w998B: number;
  w998D: number;
  w998E: number;
  w998G: number;
  w998H: number;
  w998I: number;
  w998K: number;
  w998L: number;
} {
  const w_HIT = normalizeHitForBattleCalc3(p.wHitRaw);
  let w_Cri = legacyCritRateVsMonster(p.playerCritStat, p.monsterLuk);
  w_Cri = clampBattleCritPercent(w_Cri);

  const wBC3_3danHatudouRitu = p.skill187Lv > 0 ? 30 - p.skill187Lv : 0;
  const wDA = p.wDA;

  let w_HIT_DA = w_HIT;
  if (wDA !== 0 && Math.floor(p.weaponType) !== 17) {
    w_HIT_DA = (w_HIT_DA * (100 + p.skill13Lv)) / 100;
    if (w_HIT_DA >= 100) w_HIT_DA = 100;
  }

  const w998A = 100 - wBC3_3danHatudouRitu;
  const w998B = (wBC3_3danHatudouRitu * w_HIT) / 100;
  const w998D = (w998A * wDA) / 100;
  const w998E = (w998D * w_HIT_DA) / 100;
  const w998G = ((100 - wBC3_3danHatudouRitu - w998D) * w_Cri) / 100;
  const w998H = 100 - wBC3_3danHatudouRitu - w998D - w998G;
  const w998I = (w998H * w_HIT) / 100;
  const w998K = w998B + w998E + w998G + w998I;
  const w998L = 100 - w998K;

  return {
    w_HIT,
    w_Cri,
    wBC3_3danHatudouRitu,
    w998A,
    w998B,
    w998D,
    w998E,
    w998G,
    w998H,
    w998I,
    w998K,
    w998L,
  };
}

/** @param w998 普攻段经 BattleCalc 后的一击（本链路用 min/ave/max 之一） */
export function battleCalc3ExpectedApprox(
  w998: number,
  criAtkApprox: number,
  wHitRaw: number,
  wCriRaw: number,
  battleCalc2MissDamage: number,
  /** 默认魔物表（`taijin: false`）→ **`tPlusLucky` 恒等** */
  tPlusLucky?: TPlusLuckyBattleCalc3Input,
  /** 与 **`head.js` 3877～4312** 一致（**`w998E`** 双满/天使之怒、**`w998B×六合中档`**）；不传则退化为旧版（无 **w998D** 拆分）。 */
  head998?: {
    weaponType: number;
    skill13Lv: number;
    skill187Lv: number;
    wDA: number;
    critStat: number;
    monsterLuk: number;
    /** 六合拳中档 **`san[1]`**（**`head.js` 346～351`**）；无 **187** 时省略 */
    sixMidSan?: number;
  },
): number {
  const miss = Number.isFinite(battleCalc2MissDamage) ? Math.max(0, battleCalc2MissDamage) : 0;

  if (!head998) {
    const hit = normalizeHitForBattleCalc3(wHitRaw);
    const cri = clampBattleCritPercent(wCriRaw);
    const w998H = 100 - cri;
    const w998I = (w998H * hit) / 100;
    const w998G = cri;
    const w998L = 100 - w998G - w998I;
    const wBC3_Normal = w998I * w998;
    const wBC3_Cri = w998G * criAtkApprox;
    const wBC3_Miss = w998L * miss;
    const wBC3_X = (wBC3_Normal + wBC3_Cri + wBC3_Miss) / 100;
    const lucky = applyTPlusLuckyBattleCalc3(wBC3_X, tPlusLucky ?? { taijin: false });
    return Math.max(0, Math.floor(lucky));
  }

  const w = computeBattleCalc998Weights({
    wHitRaw,
    playerCritStat: head998.critStat,
    monsterLuk: head998.monsterLuk,
    weaponType: head998.weaponType,
    skill13Lv: head998.skill13Lv,
    skill187Lv: head998.skill187Lv,
    wDA: head998.wDA,
  });

  const tyou = head998.sixMidSan ?? 0;
  const wBC3_3dan = w.w998B * tyou;
  const wBC3_DA = w.w998E * w998 * 2;
  const wBC3_Cri = w.w998G * criAtkApprox;
  const wBC3_Normal = w.w998I * w998;
  const wBC3_Miss = w.w998L * miss;
  const wBC3_X = (wBC3_3dan + wBC3_DA + wBC3_Cri + wBC3_Normal + wBC3_Miss) / 100;
  const lucky = applyTPlusLuckyBattleCalc3(wBC3_X, tPlusLucky ?? { taijin: false });
  return Math.max(0, Math.floor(lucky));
}

/**
 * `head.js` **`BattleCalc3left`**（约 **4318～4334**）：
 * - Miss 段 **`wBC3L2`**：槽 **4～7** 上 **`cardOBJ[id][0].code==106`** 各 **+5**（与 **`w_left_star`** 的槽 **7** id **106** 规则不同，原版即如此）。
 * - **`tPlusDamCut`**（**4332**）：在 **`tPlusLucky`** 前作用于 **`wBC3_X`**；本处用 **`tPlusDamCutTaijinZero`**（Taijin=0 子集，与主预览 **`baiCtx`** 同源）。
 * - **不经 `BaiCI`**：与原版 **`BattleCalc3left`** 一致。
 */
export function battleCalc3leftApprox(
  w998: number,
  wHitRaw: number,
  eq: EquipmentState,
  effectiveJobId: number,
  tPlusLucky?: TPlusLuckyBattleCalc3Input,
  baiCtx?: BaiCIPhysicalCtx,
): number {
  let wBC3L2 = 0;
  if (isNitouActive(eq, effectiveJobId)) {
    const c = [eq.weapon2Card1, eq.weapon2Card2, eq.weapon2Card3, eq.weapon2Card4];
    for (const id of c) {
      if (cardScriptFirstCode(id) === 106) wBC3L2 += 5;
    }
  }
  const hit = normalizeHitForBattleCalc3(wHitRaw);
  const wBC3_Normal = (w998 * hit) / 100;
  const wBC3_Miss = (wBC3L2 * (100 - hit)) / 100;
  let wBC3_X = wBC3_Normal + wBC3_Miss;
  if (baiCtx) {
    wBC3_X = Math.floor(tPlusDamCutTaijinZero(wBC3_X, baiCtx));
  }
  return Math.max(0, Math.floor(applyTPlusLuckyBattleCalc3(wBC3_X, tPlusLucky ?? { taijin: false })));
}

/** 无异常/强化面板时的 `n_B[27]`（Lv+AGI），便于对照 `computeLegacyMonsterFlee27`。 */
export function legacyMonsterFleeBaselineLvAgi(nB: readonly number[]): number {
  const lv = Math.floor(Number(nB[5]) || 0);
  const agi = Math.floor(Number(nB[8]) || 0);
  return lv + agi;
}

/** `head.js`：`w_Cri = n_A_CRI - n_B[11]*0.2 - 0.1` */
export function legacyCritRateVsMonster(playerCritStat: number, monsterLuk: number): number {
  return playerCritStat - monsterLuk * 0.2 - 0.1;
}
