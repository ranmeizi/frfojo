import type { CharacterBaseInput, CombatSnapshot } from "./types";
import { computeJobBoardBonus } from "./jobBoardBonus";
import { computeHardDefTotal } from "./equipmentDefense";
import { clampWeaponType, resolveCombatJob } from "./jobResolve";
import { itemAtkOrDef, itemWeaponLevel } from "./itemAccessors";
import {
  cardCritFlat,
  cardFleeFlat,
  cardHardDefFlat,
  cardHitFlat,
  cardMdefFlat,
  cardWeaponAtkFlat,
} from "./cardBonuses";
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
  const hardDefBase = computeHardDefTotal(eq) + cardHardDefFlat(eq);
  const hardDef = computeHardDefWithPerformance(hardDefBase, input);

  const aspdExtra = computeAspdExtraWeight(input, weaponType);

  const wAtkCard = cardWeaponAtkFlat(eq);
  const mdefFromCards = cardMdefFlat(eq);
  const hitCard = cardHitFlat(eq);
  const fleeCard = cardFleeFlat(eq);
  const critCard = cardCritFlat(eq);

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
    hit: computeHitWithSupport(input, totalStats.dex) + hitCard,
    flee: computeFleeWithSupport(input, totalStats.agi) + fleeCard,
    perfectDodge: computePerfectDodge(sec),
    crit: computeCritWithSupport(input, totalStats, maxHp, maxSp) + critCard,
    matkMin: matk.min,
    matkMax: matk.max,
    aspd: computeAspd(sec, aspdExtra),
    hpr: computeHpr(totalStats.vit, maxHp),
    spr: computeSpr(totalStats.int, maxSp),
    hardDef,
    mdef: mdefFromCards,
    weaponAtkBase,
    weaponRefineBonus,
    weaponRefineVarianceMin: wVar.min,
    weaponRefineVarianceMax: wVar.max,
    weaponLevel: wLv,
    weaponAtkSupportFlat: computeWeaponAtkSupportFlat(input),
    weaponAtkCardFlat: wAtkCard,
    guildLeaderAtk100: input.guildLeader.atk100,
  };
}

export { clampBaseLv, clampJobLv, clampStat } from "./inputClamp";
