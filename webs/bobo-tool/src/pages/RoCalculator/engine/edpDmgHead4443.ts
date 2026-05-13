import { normalizeHitForBattleCalc3 } from "./battleCalc3Approx";

/** `head.js` **3775～3779**：`w_HIT_EDP` 钳在 **5～100**（先于 **148** 等对 `w_HIT` 的修正）。 */
export function clampWHitEdpHead3775(wHitRaw: number): number {
  let h = wHitRaw;
  if (h > 100) h = 100;
  else if (h < 5) h = 5;
  return Math.floor(h * 100) / 100;
}

/**
 * `head.js` **`EDP_DMG(num)`**（**4443～4471**）在 **`SkillSearch(266)||PassSkill2[11]`** 已成立、且未命中 **4445～4448** 零段时，
 * 对 **`n_A_EDP_DMG` 三档**的 **min / 期望 / max** 近似（传入的 `raw` 即内层 `BattleCalcEDP` 后的 **0/1/2** 线）。
 *
 * - **num==0**：`w_HIT_EDP==100` 时取 **`raw[0]`**，否则 **0**。
 * - **num==1**：若 **`w_HIT_HYOUJI==100`** 或 **`n_PerHIT_DMG`** → `⌊raw[1]*w_HIT_EDP/100⌋`；
 *   否则 **`⌊raw[1]*w_HIT*w_HIT_EDP/10000⌋`**（`w_HIT` 用 **`normalizeHitForBattleCalc3(wHitRaw)`** 近似 **148** 后的展示链；与原版在极端主动修正下仍可能有差）。
 * - **num==2**：恒 **`raw[2]`**。
 */
export function edpDmgTripletApplyHead4443(
  raw: readonly [number, number, number],
  wHitRaw: number,
  opts?: {
    /** `w_HIT_HYOUJI==100` */
    wHitHyoji100?: boolean;
    /** `n_PerHIT_DMG != 0` */
    nPerHitDmgNonZero?: boolean;
  },
): [number, number, number] {
  const wHitEdp = clampWHitEdpHead3775(wHitRaw);
  const wHit = normalizeHitForBattleCalc3(wHitRaw);
  const wE = Boolean(opts?.wHitHyoji100) || Boolean(opts?.nPerHitDmgNonZero);
  const [e0, e1, e2] = raw;
  const out0 = wHitEdp >= 100 ? e0 : 0;
  const out1 = wE ? Math.floor((e1 * wHitEdp) / 100) : Math.floor((e1 * wHit * wHitEdp) / 10000);
  return [out0, out1, e2];
}

/** `head.js` **`BattleCalcEDP`** 开头：这些主动下 **`BattleCalcEDP` 恒 0**（**4396**），与 **`EDP_DMG`** 无关。 */
export const ACTIVE_IDS_BATTLE_CALC_EDP_ALWAYS_ZERO = new Set([
  19, 88, 248, 263, 264,
]);
