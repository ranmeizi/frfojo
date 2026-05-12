import { sumCardStPlus } from "./cardBonuses";
import { equipNumSearch } from "./equipCardCount";
import {
  sumSetBonusStPlus,
  sumWornEquipItemScriptStPlus,
} from "./equipmentSetBonus";
import type { CharacterBaseInput } from "./types";

function sumTok87EquipAndCards(
  input: CharacterBaseInput,
  effectiveJobId: number,
): number {
  const eq = input.equipment;
  return (
    sumCardStPlus(eq, 87, effectiveJobId) +
    sumSetBonusStPlus(eq, 87, effectiveJobId) +
    sumWornEquipItemScriptStPlus(eq, 87, effectiveJobId)
  );
}

/**
 * foot `StAllCalc` **437–444**：`w = 100 + n_tok[87]`（此处以卡/套/穿 script **87** 之和近似 `n_tok[87]` 装备段），
 * 再 +1034/+1086（头精炼≥7）；`n_A_ATK = floor(n_A_ATK * w / 100)`。
 *
 * 返回 **w** 整型（通常 ≥100）。不含 `n_tok[87]` 中被动等其它写入。
 */
export function computeWeaponAtkPercentChainWApprox(
  input: CharacterBaseInput,
  effectiveJobId: number,
): number {
  const eq = input.equipment;
  let w = 100;
  w += sumTok87EquipAndCards(input, effectiveJobId);
  if (equipNumSearch(eq, 1034, effectiveJobId) > 0 && eq.head1Refine >= 7) w += 1;
  if (equipNumSearch(eq, 1086, effectiveJobId) > 0 && eq.head1Refine >= 7) w += 1;
  return w;
}
