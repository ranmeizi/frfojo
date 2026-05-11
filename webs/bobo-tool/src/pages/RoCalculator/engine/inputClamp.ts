import { maxJobLevel, resolveCombatJob } from "./jobResolve";

export function clampJobLv(formJobId: number, jobLv: number): number {
  const { effectiveJobId } = resolveCombatJob(formJobId);
  const max = maxJobLevel(effectiveJobId);
  return Math.min(Math.max(1, jobLv), max);
}

export function clampBaseLv(v: number): number {
  return Math.min(Math.max(1, v), 99);
}

export function clampStat(v: number): number {
  return Math.min(Math.max(1, v), 99);
}
