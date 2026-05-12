import { sumCardStPlus } from "./cardBonuses";
import { cardNumSearch } from "./equipCardCount";
import {
  sumSetBonusStPlus,
  sumWornEquipItemScriptStPlus,
} from "./equipmentSetBonus";
import type { CharacterBaseInput } from "./types";

/**
 * 与 `refer/foot.js` `StAllCalc` **357–364** 一致：`StPlusCard(198)`，为 0 时再 `StPlusCalc2(198)`，
 * 贤者系+卡 456、圣体 `PassSkill6[6]` 时强制为 **6**（念）。
 */
export function computeLegacyBodyZokusei(
  input: CharacterBaseInput,
  effectiveJobId: number,
): number {
  const eq = input.equipment;
  let z = sumCardStPlus(eq, 198, effectiveJobId);
  if (z === 0) {
    z =
      sumSetBonusStPlus(eq, 198, effectiveJobId) +
      sumWornEquipItemScriptStPlus(eq, 198, effectiveJobId);
  }
  if (
    (input.formJobId === 13 || input.formJobId === 27) &&
    cardNumSearch(eq, 456, effectiveJobId) > 0
  ) {
    return 6;
  }
  if (input.holySupport.holyBodyBless) return 6;
  return z;
}

/**
 * foot **421–422**：火领域 `PassSkill6[0]==0`、虐杀 `>=1`、火属性铠甲 `n_A_BodyZokusei==3` → `w += [1]*10`。
 */
export function holySlaughterWeaponAtkFlat(
  input: CharacterBaseInput,
  effectiveJobId: number,
): number {
  const h = input.holySupport;
  if (h.elementField !== 0 || h.slaughterLevel < 1) return 0;
  if (computeLegacyBodyZokusei(input, effectiveJobId) !== 3) return 0;
  return h.slaughterLevel * 10;
}
