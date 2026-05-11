import type { SixStats } from "./types";

/** legacy StCalc2 */
export function statCostForSingleStep(statValue: number): number {
  return Math.floor((statValue - 2) / 10) + 2;
}

export function totalStatPointsUsed(stats: SixStats): number {
  let pt = 0;
  const vals = [stats.str, stats.agi, stats.vit, stats.int, stats.dex, stats.luk];
  for (const v of vals) {
    for (let i = 2; i <= v; i++) {
      pt += statCostForSingleStep(i);
    }
  }
  return pt;
}

export function earnedStatPoints(baseLv: number, isTensei: boolean): number {
  let w = isTensei ? 100 : 48;
  for (let i = 1; i < baseLv; i++) {
    w += Math.floor(i / 5) + 3;
  }
  return w;
}

export function remainingStatPoints(
  baseLv: number,
  isTensei: boolean,
  stats: SixStats,
): number {
  return earnedStatPoints(baseLv, isTensei) - totalStatPointsUsed(stats);
}
