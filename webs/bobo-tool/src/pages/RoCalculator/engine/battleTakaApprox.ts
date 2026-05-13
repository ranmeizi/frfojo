import { tPlusDamCutTaijinZero, type BaiCIPhysicalCtx } from "./baiCIPhysical";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import type { CharacterBaseInput } from "./types";
import { zokuseiDamageMultiplier } from "./zokuseiDamageTable";

/**
 * `head.js` **`BattleTAKA`**（约 **1902～1927**）：弓 **(`n_A_WeaponType==10`)**、被动 **118**、非 **272** 时，
 * 在 **`BattleCalc3`** 之后、`**+EDP_DMG(1)**` 之前并入 **`w_DMG[1]`** 的期望猎鹰段。
 *
 * 与原版一致：`wBT` 经 **`zokusei[n_B[3]][0]`** 与 **`tPlusDamCut`**；**`n_B[0]==44`** 时 **0**；
 * 期望段 **`n_TAKA_DMG * wBTw3 / 100`** 再乘 **`(w_HIT + (100-w_HIT)*w_Cri/100) / 100`**（**`w_Cri`** 为暴击率百分数）。
 */
export function computeBattleTakaFalconAvgAppend(p: {
  input: CharacterBaseInput;
  weaponType: number;
  previewAc: number;
  jobLv: number;
  totalDex: number;
  totalInt: number;
  totalLuk: number;
  monsterElementCode: number;
  /** 已钳的 **`w_HIT`**（与 **`normalizeHitForBattleCalc3`** 一致） */
  wHitPercent: number;
  /** **`w_Cri`** 暴击率 0～100 */
  wCriPercent: number;
  baiCtx: BaiCIPhysicalCtx;
}): number {
  const wt = Math.floor(p.weaponType);
  if (wt !== 10) return 0;
  if (p.previewAc === 272) return 0;

  const fj = p.input.formJobId;
  const pl = p.input.passiveSkillLevels;
  const L118 = passiveLevelBySkillId(fj, pl, 118);
  if (L118 <= 0) return 0;

  const mobId = Math.floor(Number(p.baiCtx.legacyNB[0]) || 0);
  if (mobId === 44) return 0;

  let wBTw1 = Math.floor((p.jobLv - 1) / 10) + 1;
  if (wBTw1 > 5) wBTw1 = 5;
  if (L118 < wBTw1) wBTw1 = L118;

  const L119 = passiveLevelBySkillId(fj, pl, 119);
  let wBT =
    80 +
    Math.floor(p.totalDex / 10) * 2 +
    Math.floor(p.totalInt / 2) * 2 +
    L119 * 6;
  wBT = Math.floor(wBT * zokuseiDamageMultiplier(p.monsterElementCode, 0));
  wBT = Math.floor(tPlusDamCutTaijinZero(wBT, p.baiCtx));

  const wBTw3 = Math.round((1 + p.totalLuk * 0.3) * 100) / 100;
  const nTakaDmg = wBT * wBTw1;
  let w = (nTakaDmg * wBTw3) / 100;
  const hitP = p.wHitPercent;
  const criP = p.wCriPercent;
  w = (w * (hitP + ((100 - hitP) * criP) / 100)) / 100;
  return Math.round(w * 100) / 100;
}
