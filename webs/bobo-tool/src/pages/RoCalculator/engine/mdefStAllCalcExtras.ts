import { cardNumSearch, equipNumSearch } from "./equipCardCount";
import { legacyJobSearch } from "./legacyJobSearch";
import { resolveCombatJob } from "./jobResolve";
import { isNitouActive } from "./nitouSupport";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import type { CharacterBaseInput } from "./types";

/**
 * `refer/foot.js` 约 841–876：`n_A_MDEF = n_tok[19]` 之后的装备/卡/被动平铺（不含末尾 196/258 覆盖）。
 */
export function computeMdefStAllCalcConditionalFlat(input: CharacterBaseInput): number {
  const { effectiveJobId } = resolveCombatJob(input.formJobId);
  const eq = input.equipment;
  const js = legacyJobSearch(input.formJobId);
  const nitou = isNitouActive(eq, effectiveJobId);
  const leftRef = nitou ? 0 : eq.leftRefine;
  let w = 0;

  if (equipNumSearch(eq, 986, effectiveJobId) > 0 && (js === 3 || js === 4 || js === 5)) {
    w += 5;
  }
  if (equipNumSearch(eq, 1050, effectiveJobId) > 0 && eq.head1Refine >= 7) {
    w += 1;
  }
  if (js === 3) {
    w += cardNumSearch(eq, 383, effectiveJobId);
  }
  if (leftRef >= 9 && cardNumSearch(eq, 310, effectiveJobId) > 0) {
    w += 5;
  }
  if (eq.head1Refine <= 5 && eq.head1Card === 213) {
    w += 5;
  }
  if (eq.head2Card === 213) {
    w += 5;
  }
  if (leftRef <= 5 && cardNumSearch(eq, 222, effectiveJobId) > 0) {
    w += 3;
  }
  if (eq.bodyRefine <= 5 && cardNumSearch(eq, 283, effectiveJobId) > 0) {
    w += 5;
  }
  if (equipNumSearch(eq, 1047, effectiveJobId) > 0) {
    w += eq.weaponRefine;
  }
  if (eq.shoesRefine <= 5 && cardNumSearch(eq, 381, effectiveJobId) > 0) {
    w += 7;
  }
  if (eq.shoulderRefine <= 5 && cardNumSearch(eq, 258, effectiveJobId) > 0) {
    w += 8;
  }
  if (equipNumSearch(eq, 764, effectiveJobId) > 0) {
    w += eq.head1Refine + leftRef;
  }
  if (equipNumSearch(eq, 809, effectiveJobId) > 0) {
    w += eq.head1Refine;
  }
  if (cardNumSearch(eq, 199, effectiveJobId) > 0 && js === 5) {
    w += 3;
  }

  const L = (id: number) =>
    passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, id);
  if (L(256) > 0) w += 1;
  if (L(9) > 0) w += L(9);

  return w;
}

/** 196 / 258 对展示 MDEF 的覆盖（与 foot 877–881 顺序一致：258 后执行则压过 196） */
export function applyMdefSkillOverrides(
  input: CharacterBaseInput,
  mdefBeforeOverride: number,
): number {
  const L = (id: number) =>
    passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, id);
  if (L(258) > 0) return 0;
  if (L(196) > 0) return 90;
  return mdefBeforeOverride;
}
