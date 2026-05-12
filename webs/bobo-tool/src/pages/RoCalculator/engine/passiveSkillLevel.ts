import { JOB_PASSIVE_SKILL_IDS } from "./skillBoard.generated";

/** legacy `SkillSearch`：从当前职业被动槽读取技能等级 */
export function passiveLevelBySkillId(
  formJobId: number,
  levels: readonly number[],
  skillId: number,
): number {
  const ids = JOB_PASSIVE_SKILL_IDS[formJobId] ?? [];
  const idx = ids.indexOf(skillId);
  if (idx === -1) return 0;
  return levels[idx] ?? 0;
}
