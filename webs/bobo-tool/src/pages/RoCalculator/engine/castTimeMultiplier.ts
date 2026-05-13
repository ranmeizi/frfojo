import { sumCardStPlus } from "./cardBonuses";
import { cardNumSearch, equipNumSearch } from "./equipCardCount";
import { sumSetBonusStPlus, sumWornEquipItemScriptStPlus } from "./equipmentSetBonus";
import { legacyJobSearch } from "./legacyJobSearch";
import { resolveCombatJob } from "./jobResolve";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import type { CharacterBaseInput } from "./types";

/**
 * 近似 `refer/foot.js` 约 1353–1399 的 `n_A_CAST` 乘段。
 * 已含部分 **`n_A_ActiveSkill`** 装备/卡条件及 **`StPlusCalc2(7000+skill)`** 的卡/套/穿 script 同源和（见 `sum*StPlus`）。
 * **路线图 H3**：完整 **`StPlusCalc2`** 条件树与全主动分支见 **`LEGACY_GAP_SCAN.md`** 残差 **咏唱**。
 */
export function computeCastTimeMultiplierApprox(
  input: CharacterBaseInput,
  dex: number,
): number {
  const { effectiveJobId } = resolveCombatJob(input.formJobId);
  let nCast = Math.max(0, 1 - dex / 150);
  let w =
    100 +
    sumCardStPlus(input.equipment, 73, effectiveJobId) +
    sumSetBonusStPlus(input.equipment, 73, effectiveJobId) +
    sumWornEquipItemScriptStPlus(input.equipment, 73, effectiveJobId);

  if (
    legacyJobSearch(input.formJobId) === 5 &&
    cardNumSearch(input.equipment, 454, effectiveJobId) > 0
  ) {
    w -= 15;
  }
  if (
    (input.formJobId === 18 || input.formJobId === 32) &&
    cardNumSearch(input.equipment, 460, effectiveJobId) > 0
  ) {
    w -= 15;
  }

  const eq = input.equipment;
  const ac = input.activeSkillId;
  if ((ac === 132 || ac === 133) && equipNumSearch(eq, 1083, effectiveJobId) > 0) {
    w -= 25;
  }
  if (ac === 51) {
    w -= 25 * cardNumSearch(eq, 493, effectiveJobId);
  }
  if (ac === 54) {
    w -= 25 * cardNumSearch(eq, 488, effectiveJobId);
  }
  if (ac === 131 && eq.weaponRefine >= 10 && equipNumSearch(eq, 1047, effectiveJobId) > 0) {
    w -= 8;
  }

  if (equipNumSearch(eq, 750, effectiveJobId) > 0) {
    w -= eq.weaponRefine;
  }
  if (eq.head1Card === 177) {
    w -= eq.head1Refine;
  }
  if (equipNumSearch(eq, 849, effectiveJobId) > 0) {
    w -= eq.head1Refine;
  }
  if (equipNumSearch(eq, 1016, effectiveJobId) > 0) {
    w -= eq.head3Refine;
  }

  const castSkillCode = 7000 + ac;
  w -=
    sumCardStPlus(input.equipment, castSkillCode, effectiveJobId) +
    sumSetBonusStPlus(input.equipment, castSkillCode, effectiveJobId) +
    sumWornEquipItemScriptStPlus(input.equipment, castSkillCode, effectiveJobId);

  const pd = input.performanceDance;
  if (pd.lv2 > 0) {
    w -= pd.lv2 * 3 + pd.row2Instrument + Math.floor(pd.row2PoetDex / 10);
  }

  if (w < 0) w = 0;
  nCast *= w / 100;

  const suff = input.buffSupport.suffragiumLv;
  if (suff > 0) {
    nCast *= (100 - 15 * suff) / 100;
  }

  if (passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 322) > 0) {
    nCast /= 2;
  }

  return Math.max(0, Math.min(2, nCast));
}
