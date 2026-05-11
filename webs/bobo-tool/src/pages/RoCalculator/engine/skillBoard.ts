import { SKILL_BY_ID } from "./skillBoard.generated";

/** 能量外套：legacy 为 0～5 档减伤说明 */
export function passiveSlotMaxLevel(skillId: number): number {
  if (skillId === 58) return 5;
  if (skillId === 78) return 6;
  return SKILL_BY_ID[skillId]?.maxLv ?? 0;
}

export function clampPassiveSlotValue(skillId: number, v: number): number {
  const m = passiveSlotMaxLevel(skillId);
  return Math.min(m, Math.max(0, Math.floor(Number.isFinite(v) ? v : 0)));
}

export function skillName(skillId: number): string {
  return SKILL_BY_ID[skillId]?.name ?? `#${skillId}`;
}
