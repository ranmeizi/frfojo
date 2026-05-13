import { tPlusDamCutTaijinZero, type BaiCIPhysicalCtx } from "./baiCIPhysical";
import { cardScriptFirstCode } from "./cardBonuses";
import { applyTPlusLuckyBattleCalc3, type TPlusLuckyBattleCalc3Input } from "./tPlusLucky";
import type { EquipmentState } from "./types";
import { isNitouActive } from "./nitouSupport";

/**
 * `head.js` `BattleCalc3`：在六合拳发动率、二刀/凶砍等均为 0 时，
 * `wBC3_X = (w998I * w998 + w998G * n_A_CriATK[1] + w998L * BattleCalc2(0)) / 100`，
 * 末尾 **`return tPlusLucky(wBC3_X)`**（`tPlusLucky.ts`；魔物表 **Taijin=0** 为恒等）。
 *
 * **阶段 D 注**：原版 **`w998B * TyouEnkakuSousa3dan`**（六合拳）在普攻略化中 **`tyouEnkakuSousa3dan=0`** 时恒为 **0**，本模块未单独拆 **`w998B`** 项。
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

/** @param w998 普攻段经 BattleCalc 后的一击（本链路用 min/ave/max 之一） */
export function battleCalc3ExpectedApprox(
  w998: number,
  criAtkApprox: number,
  wHitRaw: number,
  wCriRaw: number,
  battleCalc2MissDamage: number,
  /** 默认魔物表（`taijin: false`）→ **`tPlusLucky` 恒等** */
  tPlusLucky?: TPlusLuckyBattleCalc3Input,
): number {
  const hit = normalizeHitForBattleCalc3(wHitRaw);
  const cri = clampBattleCritPercent(wCriRaw);
  const w998H = 100 - cri;
  const w998I = (w998H * hit) / 100;
  const w998G = cri;
  const w998L = 100 - w998G - w998I;
  const wBC3_Normal = w998I * w998;
  const wBC3_Cri = w998G * criAtkApprox;
  const miss = Number.isFinite(battleCalc2MissDamage) ? Math.max(0, battleCalc2MissDamage) : 0;
  const wBC3_Miss = w998L * miss;
  const wBC3_X = (wBC3_Normal + wBC3_Cri + wBC3_Miss) / 100;
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
