import { cardNumSearch } from "./equipCardCount";
import { legacyJobSearch } from "./legacyJobSearch";
import { resolveCombatJob } from "./jobResolve";
import type { CharacterBaseInput } from "./types";

/**
 * `refer/foot.js` 约 1498–1530：`PassSkill2[14]` 写入 `n_tok[56]` / `n_tok[66]`（贤者系，JOB 13/27 除外）。
 */
export function passSkill2Tok56Additive(input: CharacterBaseInput): number {
  const lv = input.buffSupport.elementalBarrierLv;
  if (lv <= 0) return 0;
  if (input.formJobId === 13 || input.formJobId === 27) return 0;
  return lv * 5;
}

export function passSkill2Tok66Additive(input: CharacterBaseInput): number {
  const lv = input.buffSupport.elementalBarrierLv;
  if (lv <= 0) return 0;
  if (input.formJobId === 13 || input.formJobId === 27) return 0;
  return 5 * lv;
}

/** 卡片 452 + JobSearch==3 时对 tok51/56 的增量（展示用，与 foot 1494–1497 一致） */
export function card452Tok56Bonus(input: CharacterBaseInput): number {
  const { effectiveJobId } = resolveCombatJob(input.formJobId);
  if (cardNumSearch(input.equipment, 452, effectiveJobId) <= 0) return 0;
  if (legacyJobSearch(input.formJobId) !== 3) return 0;
  return 30;
}
