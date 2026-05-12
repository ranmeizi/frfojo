import type { CharacterBaseInput, EquipmentState } from "./types";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import { battleCalc2ApproxNoBaiCI } from "./battleCalc2Approx";

/**
 * `head.js` `BattleCalc2(0)` 的 **可迁子集**（普攻、EDP 关、w999 由 0 起）：
 * `+2*SkillSearch(148)` → ×`zokusei[…]` → 弓手系 `+3*SkillSearch(185)` **否则** `+3*PassSkill2[10]`（**`buffSupport.weaponResearchLv`**）→ `+3*SkillSearch(416)` → 武器槽卡 **106**。
 *
 * **已乘 `BaiCI` 近似**（`baiCIPhysical.ts`：卡/套/穿 `n_tok` 子集 + Taijin=0 的 `tPlusDamCut` 子集）；与原版 Miss 段相比仍可能因 `n_tok` 未全量而有偏差。
 */
export function card106BonusBattleCalc2FromWeapon(eq: EquipmentState): number {
  const a = eq.weaponCard1;
  const b = eq.weaponCard2;
  const c = eq.weaponCard3;
  if (a === 106 && b === 106 && c === 106) return 40;
  let s = 0;
  if (a === 106) s += 5;
  if (b === 106) s += 5;
  if (c === 106) s += 5;
  if (eq.weaponCard4 === 106) s += 10;
  return s;
}

export function battleCalc2ZeroMissApprox(p: {
  input: CharacterBaseInput;
  monsterElementCode: number;
  weaponZokuseiIndex: number;
}): number {
  const { input, monsterElementCode, weaponZokuseiIndex } = p;
  // Miss 段：w999 起始为 0，原版 `w999_AB` 为 0，因此不会触发 254 段。
  // 这里复用 `battleCalc2ApproxNoBaiCI` 并强制 weaponType=0，以避免误触发 254。
  const w999 = battleCalc2ApproxNoBaiCI({
    input,
    w999Start: 0,
    monsterElementCode,
    weaponZokuseiIndex,
    weaponType: 0,
  });
  return Math.max(0, Math.floor(w999));
}
