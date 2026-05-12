import { cardNumSearch } from "./equipCardCount";
import { legacyJobSearch } from "./legacyJobSearch";
import { resolveCombatJob } from "./jobResolve";
import { isNitouActive } from "./nitouSupport";
import type { CharacterBaseInput, EquipmentState, SixStats } from "./types";

const ZERO: SixStats = {
  str: 0,
  agi: 0,
  vit: 0,
  int: 0,
  dex: 0,
  luk: 0,
};

/**
 * `StPlusCalc` 中依赖精炼与手填裸素质 `SU_*` 的卡片段（foot.js 约 1693–1714），在 `StPlusCard` 静态表之后。
 */
export function cardDynamicSixStat(input: CharacterBaseInput): SixStats {
  const { effectiveJobId } = resolveCombatJob(input.formJobId);
  const d = { ...ZERO };
  const eq = input.equipment;
  const su = input.stats;
  const js = legacyJobSearch(input.formJobId);

  if (js === 3) d.int += cardNumSearch(eq, 383, effectiveJobId);
  if (cardNumSearch(eq, 173, effectiveJobId) > 0) {
    d.int += isNitouActive(eq, effectiveJobId) ? 0 : eq.leftRefine;
  }
  if (cardNumSearch(eq, 402, effectiveJobId) > 0) d.luk += eq.shoulderRefine;
  if (cardNumSearch(eq, 406, effectiveJobId) > 0) d.agi += eq.shoesRefine;
  if (cardNumSearch(eq, 198, effectiveJobId) > 0) d.vit += eq.bodyRefine;
  if (headSlot8Card(eq) === 180) d.str += eq.head1Refine;

  if (cardNumSearch(eq, 185, effectiveJobId) > 0) d.vit += Math.floor(su.dex / 18);
  if (cardNumSearch(eq, 187, effectiveJobId) > 0) d.str += Math.floor(su.int / 18);
  if (cardNumSearch(eq, 189, effectiveJobId) > 0) d.luk += Math.floor(su.agi / 18);
  if (cardNumSearch(eq, 191, effectiveJobId) > 0) d.agi += Math.floor(su.luk / 18);
  if (cardNumSearch(eq, 196, effectiveJobId) > 0) d.int += Math.floor(su.str / 18);
  if (cardNumSearch(eq, 197, effectiveJobId) > 0) d.dex += Math.floor(su.vit / 18);

  if (cardNumSearch(eq, 405, effectiveJobId) > 0) {
    if (js === 1 || js === 2 || js === 6) d.str += 2;
    if (js === 3 || js === 4 || js === 5) d.int += 2;
  }

  return d;
}

/** 与 `refer/foot.js` `n_A_card[8]` 一致：武器 4 槽 + 双手 4 占位后的第 9 张卡 = 头上 */
function headSlot8Card(eq: EquipmentState): number {
  return eq.head1Card;
}
