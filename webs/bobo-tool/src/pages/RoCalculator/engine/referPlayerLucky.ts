import { cardNumSearch, equipNumSearch } from "./equipCardCount";
import { legacyJobSearch } from "./legacyJobSearch";
import type { CharacterBaseInput } from "./types";

/**
 * `foot.js` **1008–1031**：`n_A_LUCKY`（展示用幸运回避系数）。
 * 未接：`n_tok[11]` 全链（装备/卡写入 `n_tok` 的片段）。
 */
export function computeReferNLucky(input: CharacterBaseInput, totalLuk: number, effectiveJobId: number): number {
  const eq = input.equipment;
  let n = 1 + totalLuk * 0.1;
  const js = legacyJobSearch(input.formJobId);
  if (js === 2) n += 5 * cardNumSearch(eq, 391, effectiveJobId);
  if (js === 1) n += 4 * cardNumSearch(eq, 354, effectiveJobId);
  if (eq.shoulderRefine <= 4 && cardNumSearch(eq, 401, effectiveJobId) > 0) n += 1;
  if (eq.shoulderId === 535) {
    const hpvs = js;
    if (hpvs === 3 || hpvs === 4 || hpvs === 5) {
      n += 5;
      n += eq.shoulderRefine * 2;
    }
  }
  if (js === 41 && equipNumSearch(eq, 678, effectiveJobId) > 0) n += 2;
  return Math.round(n * 10) / 10;
}
