import { passSkill6RaptorVitDefLevel } from "./holyPassSkill6";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import type { CharacterBaseInput } from "./types";

/**
 * 与 `refer/foot.js` 中 `n_A_VITDEF` 乘段同序的**近似**合并系数（不含 `StPlusCalc2(24)` 等装备项）。
 * 用于展示「VIT 软防承伤」量级，非完整三段数组。
 */
export function computeVitDefLegacyMultiplierApprox(
  input: CharacterBaseInput,
): number {
  const L12 = passiveLevelBySkillId(
    input.formJobId,
    input.passiveSkillLevels,
    12,
  );
  const L256 = passiveLevelBySkillId(
    input.formJobId,
    input.passiveSkillLevels,
    256,
  );
  const L258 = passiveLevelBySkillId(
    input.formJobId,
    input.passiveSkillLevels,
    258,
  );
  if (L258 > 0) return 0;

  let m = 1;
  if (L12 > 0) m *= 0.45;
  else {
    const rap = passSkill6RaptorVitDefLevel(input.holySupport);
    if (rap > 0) m *= 0.95 - 0.05 * rap;
    /** foot StAllCalc 814–816：`PassSkill2[12]`（A2_Skill12 挑衅）→ n_A_VITDEF×0.9 */
    else if (input.buffSupport.provoke) m *= 0.9;
  }

  if (L256 > 0) m *= 1 - 0.05 * L256;

  const magnus = input.buffSupport.magnusLv;
  if (magnus > 0) m *= 1 + 0.05 * magnus;

  return Math.max(0, Math.round(m * 10000) / 10000);
}
