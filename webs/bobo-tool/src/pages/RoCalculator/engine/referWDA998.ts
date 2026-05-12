import { cardNumSearch, equipNumSearch } from "./equipCardCount";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import type { CharacterBaseInput } from "./types";

/** `head.js` **3836–3868**：`wDA`（六合拳期望段用） */
export function computeReferWDA(
  input: CharacterBaseInput,
  effectiveJobId: number,
): number {
  const wt = input.weaponType;
  const eq = input.equipment;
  const s13 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 13);
  const s427 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 427);

  if (wt === 17) {
    let wDA = s427 * 5;
    if (cardNumSearch(eq, 43, effectiveJobId) > 0) {
      wDA = s427 * 5 + ((100 - s427 * 5) * 5) / 100;
    }
    if (equipNumSearch(eq, 570, effectiveJobId) > 0) {
      wDA = s427 * 5 + ((100 - s427 * 5) * 10) / 100;
    }
    return wDA;
  }

  let wDA = s13 * 5;
  if (wt !== 1) wDA = 0;
  if (cardNumSearch(eq, 43, effectiveJobId) > 0) {
    if (s13 > 1) wDA = s13 * 5;
    else wDA = 5;
  }
  if (equipNumSearch(eq, 570, effectiveJobId) > 0 && wt !== 0) {
    if (s13 > 1) wDA = s13 * 5;
    else wDA = 10;
  }
  if (equipNumSearch(eq, 1035, effectiveJobId) > 0 && wt !== 0) {
    if (s13 > 5) wDA = s13 * 5;
    else wDA = 25;
  }
  if (equipNumSearch(eq, 399, effectiveJobId) > 0) {
    if (s13 > 5) wDA = s13 * 5;
    else wDA = 25;
  }
  return wDA;
}
