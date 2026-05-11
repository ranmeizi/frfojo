import type { FormJobId } from "./types";
import { JOB_ASPD } from "./jobConstants";

/** 与 legacy n_A_JobSet + 后续计算用的 effectiveJobId 一致 */
export function resolveCombatJob(formJobId: FormJobId): {
  effectiveJobId: number;
  isTensei: boolean;
} {
  let effectiveJobId = formJobId;
  let isTensei = false;
  if (formJobId >= 21 && formJobId <= 40) {
    isTensei = true;
    if (formJobId >= 34 && formJobId <= 40) {
      effectiveJobId = formJobId - 34;
    }
  }
  return { effectiveJobId, isTensei };
}

/** legacy ClickJob 中的 JobLV 上限 */
export function maxJobLevel(effectiveJobId: number): number {
  if (effectiveJobId === 0) return 10;
  if (effectiveJobId <= 19 || (effectiveJobId >= 41 && effectiveJobId <= 43)) return 50;
  if (effectiveJobId === 20) return 71;
  return 70;
}

export function weaponTypesForJob(effectiveJobId: number): number[] {
  const row = JOB_ASPD[effectiveJobId];
  if (!row || row.length < 22) return [0];
  const out: number[] = [];
  for (let i = 0; i < 22; i++) {
    if (row[i] !== 0) out.push(i);
  }
  return out.length ? out : [0];
}

export function clampWeaponType(effectiveJobId: number, weaponType: number): number {
  const valid = weaponTypesForJob(effectiveJobId);
  if (valid.includes(weaponType)) return weaponType;
  return valid[0] ?? 0;
}
