import type { CharacterBaseInput, CombatSnapshot } from "./types";
import { computeJobBoardBonus } from "./jobBoardBonus";
import { computeHardDefTotal } from "./equipmentDefense";
import { clampWeaponType, resolveCombatJob } from "./jobResolve";
import { itemAtkOrDef, itemWeaponLevel } from "./itemAccessors";
import { sanitizeCharacterInput } from "./sanitizeCharacter";
import {
  computeAspd,
  computeHpr,
  computePerfectDodge,
  computeSpr,
} from "./secondaryStats";
import {
  buildSecCtx,
  computeAspdExtraWeight,
  computeCritWithSupport,
  computeEffectiveSixStats,
  computeFleeWithSupport,
  computeHardDefWithPerformance,
  computeHitWithSupport,
  computeMatkWithSupport,
  computeSupportAdjustedMaxHp,
  computeSupportAdjustedMaxSp,
  computeWeaponAtkSupportFlat,
} from "./supportBonuses";
import { remainingStatPoints } from "./statPoints";
import {
  weaponRefineFlatAtk,
  weaponRefineVariance,
} from "./weaponRefine";

export function computeCombatSnapshot(raw: CharacterBaseInput): CombatSnapshot {
  const input = sanitizeCharacterInput(raw);
  const { effectiveJobId, isTensei } = resolveCombatJob(input.formJobId);
  const jobBoardBonus = computeJobBoardBonus(input.formJobId, input.jobLv);
  const totalStats = computeEffectiveSixStats(input);

  const weaponType = clampWeaponType(effectiveJobId, input.weaponType);

  const maxHp = computeSupportAdjustedMaxHp(input, totalStats.vit);
  const maxSp = computeSupportAdjustedMaxSp(input, totalStats.int);

  const sec = buildSecCtx(input, totalStats, maxHp, maxSp);

  const matk = computeMatkWithSupport(input, totalStats.int);

  const eq = input.equipment;
  const wLv = itemWeaponLevel(eq.weaponId);
  const weaponAtkBase = itemAtkOrDef(eq.weaponId);
  const weaponRefineBonus = weaponRefineFlatAtk(wLv, eq.weaponRefine);
  const wVar = weaponRefineVariance(wLv, eq.weaponRefine);
  const hardDefBase = computeHardDefTotal(eq);
  const hardDef = computeHardDefWithPerformance(hardDefBase, input);

  const aspdExtra = computeAspdExtraWeight(input, weaponType);

  return {
    effectiveJobId,
    isTensei,
    totalStats,
    jobBoardBonus,
    remainingStatPoints: remainingStatPoints(
      input.baseLv,
      isTensei,
      input.stats,
    ),
    maxHp,
    maxSp,
    hit: computeHitWithSupport(input, totalStats.dex),
    flee: computeFleeWithSupport(input, totalStats.agi),
    perfectDodge: computePerfectDodge(sec),
    crit: computeCritWithSupport(input, totalStats, maxHp, maxSp),
    matkMin: matk.min,
    matkMax: matk.max,
    aspd: computeAspd(sec, aspdExtra),
    hpr: computeHpr(totalStats.vit, maxHp),
    spr: computeSpr(totalStats.int, maxSp),
    hardDef,
    mdef: 0,
    weaponAtkBase,
    weaponRefineBonus,
    weaponRefineVarianceMin: wVar.min,
    weaponRefineVarianceMax: wVar.max,
    weaponLevel: wLv,
    weaponAtkSupportFlat: computeWeaponAtkSupportFlat(input),
    guildLeaderAtk100: input.guildLeader.atk100,
  };
}

export { clampBaseLv, clampJobLv, clampStat } from "./inputClamp";
