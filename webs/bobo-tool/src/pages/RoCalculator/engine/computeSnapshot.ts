import type { CharacterBaseInput, CombatSnapshot } from "./types";
import { computeJobBoardBonus } from "./jobBoardBonus";
import {
  applyLegacyTotalDefSkillModifiers,
  computeHardDefTotal,
} from "./equipmentDefense";
import { clampWeaponType, resolveCombatJob } from "./jobResolve";
import { itemAtkOrDef, itemWeaponLevel } from "./itemAccessors";
import {
  cardCritFlat,
  cardFleeFlat,
  cardHardDefFlat,
  cardHitFlat,
  cardMdefFlat,
  cardSixStatDelta,
  cardWeaponAtkFlat,
} from "./cardBonuses";
import {
  setCritFlat,
  setFleeFlat,
  setHardDefFlat,
  setHitFlat,
  setMdefFlat,
  setSixStatDelta,
  setWeaponAtkFlat,
  wornCritFlat,
  wornEquipSixStatDelta,
  wornFleeFlat,
  wornHardDefFlat,
  wornHitFlat,
  wornMdefFlat,
  wornWeaponAtkFlat,
} from "./equipmentSetBonus";
import { sanitizeCharacterInput } from "./sanitizeCharacter";
import {
  computeAspd,
  computeHpr,
  computePerfectDodge,
  computeSpr,
} from "./secondaryStats";
import { additiveTok60to69FromPassSkill3AndFood } from "./legacyTok6069";
import { MONSTER_OBJ, type MonsterRowTuple } from "./monster.generated";
import { parseMonsterRow } from "./monsterCatalog";
import {
  buildSecCtx,
  computeAspdExtraWeight,
  computeCritWithSupport,
  computeEffectiveSixStats,
  passiveSkillSearchSixStatDelta,
  computeFleeWithSupport,
  computeHardDefWithPerformance,
  computeHitWithSupport,
  computeMatkWithSupport,
  computeSupportAdjustedMaxHp,
  computeSupportAdjustedMaxSp,
  computeWeaponAtkSupportFlat,
  performanceDanceWeaponAtkFlat,
} from "./supportBonuses";
import {
  computeVitDefLegacyMultiplierApprox,
  computeVitDefSoftTriplet,
} from "./vitDefLegacyMultiplier";
import { remainingStatPoints } from "./statPoints";
import { computeCastTimeMultiplierApprox } from "./castTimeMultiplier";
import {
  card452Tok56Bonus as computeCard452Tok56Bonus,
  passSkill2Tok56Additive,
  passSkill2Tok66Additive,
} from "./passSkill2ResistTok";
import {
  applyMdefSkillOverrides,
  computeMdefStAllCalcConditionalFlat,
} from "./mdefStAllCalcExtras";
import {
  weaponRefineFlatAtk,
  weaponRefineVariance,
} from "./weaponRefine";
import { buildLegacyNBFromMonsterIndex } from "./buildLegacyNB";
import { computeKakutyouLines } from "./kakutyouPreview";
import { holySlaughterWeaponAtkFlat } from "./legacyBodyZokusei";
import {
  computeAtkBai01PercentApprox,
  passSkill5HighDamageMultiplier,
} from "./atkBai01Preview";
import { computeWeaponAtkPercentChainWApprox } from "./weaponAtkPercentChain";
import { computeBattlePhysicalRoughPreview } from "./battlePhysicalRough";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import { statAtkPortion } from "./statAtkPortion";
import {
  addPlayerManualEdits,
  manualPhysDamageMultiplier,
} from "./playerManualEdits";
import { aggregateCustomEquippedBonuses } from "./customEquipmentAggregate";
import { computeReferNLucky } from "./referPlayerLucky";

export function computeCombatSnapshot(raw: CharacterBaseInput): CombatSnapshot {
  const input = sanitizeCharacterInput(raw);
  const { effectiveJobId, isTensei } = resolveCombatJob(input.formJobId);
  const jobBoardBonus = computeJobBoardBonus(input.formJobId, input.jobLv);
  const sixBonusPassiveSkills = passiveSkillSearchSixStatDelta(input);
  /** 【新功能】玩家手动表 + 已穿自定义装备（同源字段相加） */
  const man = addPlayerManualEdits(
    input.playerManualEdits,
    aggregateCustomEquippedBonuses(input.equipment),
  );
  let totalStats = computeEffectiveSixStats(input);
  totalStats = {
    str: totalStats.str + man.str,
    agi: totalStats.agi + man.agi,
    vit: totalStats.vit + man.vit,
    int: totalStats.int + man.int,
    dex: totalStats.dex + man.dex,
    luk: totalStats.luk + man.luk,
  };

  const weaponType = clampWeaponType(effectiveJobId, input.weaponType);

  /**
   * 【新功能】MaxHP/MaxSP：对齐 refer `foot.js` 547–569 / 696–720（`n_A_MaxHP += w` 后再 `* (100+w)/100`）。
   * 即先与前值相加平铺，再整体乘 `(100 + %)/100` 并 floor，而非先乘 % 再加平铺。
   */
  let maxHp = computeSupportAdjustedMaxHp(input, totalStats.vit);
  maxHp = Math.max(1, Math.floor(((maxHp + man.maxHpFlat) * (100 + man.maxHpPct)) / 100));
  let maxSp = computeSupportAdjustedMaxSp(input, totalStats.int);
  maxSp = Math.max(1, Math.floor(((maxSp + man.maxSpFlat) * (100 + man.maxSpPct)) / 100));

  const sec = buildSecCtx(input, totalStats, maxHp, maxSp);

  let matk = computeMatkWithSupport(input, totalStats.int);
  /** 【新功能】MATK 平铺 + % */
  matk = {
    min: Math.floor(((matk.min + man.matk) * (100 + man.matkPct)) / 100),
    max: Math.floor(((matk.max + man.matk) * (100 + man.matkPct)) / 100),
  };
  if (matk.max < matk.min) matk = { min: matk.min, max: matk.min };
  /** 【新功能】% MATK 类伤害（任意目标），叠在面板 MATK 上作粗近似 */
  if (man.matkDmgPctAny !== 0) {
    matk = {
      min: Math.floor((matk.min * (100 + man.matkDmgPctAny)) / 100),
      max: Math.floor((matk.max * (100 + man.matkDmgPctAny)) / 100),
    };
    if (matk.max < matk.min) matk = { min: matk.min, max: matk.min };
  }

  const eq = input.equipment;
  const wLv = itemWeaponLevel(eq.weaponId);
  const weaponAtkBase = itemAtkOrDef(eq.weaponId);
  const weaponRefineBonus = weaponRefineFlatAtk(wLv, eq.weaponRefine);
  const wVar = weaponRefineVariance(wLv, eq.weaponRefine);
  const hardDefBase =
    computeHardDefTotal(eq, effectiveJobId) +
    cardHardDefFlat(eq, effectiveJobId) +
    setHardDefFlat(eq, effectiveJobId) +
    wornHardDefFlat(eq, effectiveJobId);
  let hardDef = applyLegacyTotalDefSkillModifiers(
    computeHardDefWithPerformance(hardDefBase, input),
    input,
  );
  /** 【新功能】DEF 平铺 */
  hardDef += man.def;

  const aspdExtra = computeAspdExtraWeight(input, weaponType, totalStats);

  const wAtkCard = cardWeaponAtkFlat(eq, effectiveJobId);
  const wAtkSet = setWeaponAtkFlat(eq, effectiveJobId);
  const wAtkWorn = wornWeaponAtkFlat(eq, effectiveJobId);
  const mdefFromCards =
    cardMdefFlat(eq, effectiveJobId) +
    setMdefFlat(eq, effectiveJobId) +
    wornMdefFlat(eq, effectiveJobId);
  const mdefStAllCalcExtraFlat = computeMdefStAllCalcConditionalFlat(input);
  let mdef = applyMdefSkillOverrides(
    input,
    mdefFromCards + mdefStAllCalcExtraFlat,
  );
  /** 【新功能】MDEF 平铺 */
  mdef += man.mdef;
  const hitCard = cardHitFlat(eq, effectiveJobId);
  const hitSet = setHitFlat(eq, effectiveJobId);
  const hitWorn = wornHitFlat(eq, effectiveJobId);
  const fleeCard = cardFleeFlat(eq, effectiveJobId);
  const fleeSet = setFleeFlat(eq, effectiveJobId);
  const fleeWorn = wornFleeFlat(eq, effectiveJobId);
  const critCard = cardCritFlat(eq, effectiveJobId);
  const critSet = setCritFlat(eq, effectiveJobId);
  const critWorn = wornCritFlat(eq, effectiveJobId);

  const tok60to69 = additiveTok60to69FromPassSkill3AndFood(input);
  const pdLv7 = input.performanceDance.lv7;
  const songTok150to159Each = pdLv7 > 0 ? 10 * pdLv7 : 0;
  const monsterRow = MONSTER_OBJ[input.enemyCombat.monsterIndex] as
    | MonsterRowTuple
    | undefined;
  const parsedMonster = parseMonsterRow(monsterRow);
  const enemyCombatMonsterLabel =
    parsedMonster?.name ?? `#${input.enemyCombat.monsterIndex}`;
  /** 【新功能】对敌物伤乘子（种族/属性/体型/MVP 行 + 任意目标 %） */
  const manualPhysDmgMult = manualPhysDamageMultiplier(man, parsedMonster);

  const castTimeMultiplierApprox = computeCastTimeMultiplierApprox(
    input,
    totalStats.dex,
  );
  const fleeCode9ScriptFlat = fleeCard + fleeSet + fleeWorn;
  const passSkill2Tok56FromBarrier = passSkill2Tok56Additive(input);
  const passSkill2Tok66FromBarrier = passSkill2Tok66Additive(input);
  const card452Tok56Bonus = computeCard452Tok56Bonus(input);

  const legacyNB = buildLegacyNBFromMonsterIndex(input.enemyCombat.monsterIndex);
  const weaponAtkHolySlaughterFlat = holySlaughterWeaponAtkFlat(
    input,
    effectiveJobId,
  );
  let atkBai01PercentApprox = computeAtkBai01PercentApprox(
    input,
    effectiveJobId,
  );
  /** 【新功能】% ATK：加在 `head.js` `ATKbai01` 的 wA01 上（与 `StPlusCalc2(87)` 等同为「从 100 起加百分数」）；面板 ATK 展示另用 `atkPanelPercentWApprox`（foot 437–444 段，不含 provoke 等仅伤害段）。 */
  atkBai01PercentApprox += man.atkPct;
  const passSkill5HighDamageMultiplierApprox =
    passSkill5HighDamageMultiplier(input);
  const weaponAtkPercentChainWApprox = computeWeaponAtkPercentChainWApprox(
    input,
    effectiveJobId,
  );
  /** 【新功能】面板 ATK 乘子：foot 437–444 的 w（`weaponAtkPercentChainWApprox`）上再加手动 `% ATK`，与 `n_tok[87]` 同源加算 */
  const atkPanelPercentWApprox = weaponAtkPercentChainWApprox + man.atkPct;

  const weaponAtkSupportFlat = computeWeaponAtkSupportFlat(input);
  const weaponAtkPerformanceDanceFlat = performanceDanceWeaponAtkFlat(input);

  let atkWeaponLineFlat =
    weaponAtkBase +
    wAtkCard +
    wAtkSet +
    wAtkWorn +
    weaponAtkSupportFlat +
    weaponAtkPerformanceDanceFlat +
    weaponAtkHolySlaughterFlat;
  /** 【新功能】武器 ATK 平铺 */
  atkWeaponLineFlat += man.atk;
  const atkStatusPortion = statAtkPortion(
    totalStats.str,
    totalStats.dex,
    totalStats.luk,
    weaponType,
  );

  const hitTotal =
    computeHitWithSupport(input, totalStats) + hitCard + hitSet + hitWorn + man.hit;
  const critTotal =
    computeCritWithSupport(input, totalStats, maxHp, maxSp) +
    critCard +
    critSet +
    critWorn +
    man.criticalRate;

  const battlePhysicalRough = computeBattlePhysicalRoughPreview(input, {
    effectiveJobId,
    weaponType,
    totalStats,
    weaponLevel: wLv,
    weaponAtkBase,
    weaponRefineBonus,
    weaponRefineVarianceMin: wVar.min,
    weaponRefineVarianceMax: wVar.max,
    weaponAtkCardFlat: wAtkCard,
    weaponAtkSetFlat: wAtkSet,
    weaponAtkWornScriptFlat: wAtkWorn,
    weaponAtkSupportFlat,
    weaponAtkPerformanceDanceFlat,
    weaponAtkHolySlaughterFlat,
    atkBai01PercentApprox,
    legacyNB,
    activeSkillId: input.activeSkillId,
    bowArrowIndex: input.bowArrowIndex,
    hitStat: hitTotal,
    critStat: critTotal,
    passSkill5HighDamageMultiplierApprox,
    weaponAtkManualFlat: man.atk,
    /** 【新功能】 */
    manualPhysDmgMult,
    matkMin: matk.min,
    matkMax: matk.max,
  });

  const sk196def = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 196) > 0;
  const sk258def = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 258) > 0;
  const vit = totalStats.vit;
  const defVitStatDisplay =
    sk258def || sk196def ? 0 : Math.floor(vit / 2) + Math.floor((vit * 3) / 10);
  const vitDefSoftTriplet = computeVitDefSoftTriplet(vit, input, effectiveJobId);
  const intv = totalStats.int;
  const mdefIntStatDisplay =
    sk258def || sk196def ? 0 : intv + Math.floor(intv / 2);

  /** 【新功能】% ASPD：与装备/技能 ASPD% 相同，作为 `computeAspd` 的权重 `w` 加在 `aspdExtra` 上（`secondaryStats` 中 `(200-nA_ASPD)*w/100`），不得对最终 ASPD 再乘 `(100+p)/100`。 */
  const aspdVal = computeAspd(sec, aspdExtra + man.aspdPct);
  const refNLuckyDisplay = computeReferNLucky(input, totalStats.luk, effectiveJobId);
  const hprVal = Math.max(
    0,
    Math.floor((computeHpr(totalStats.vit, maxHp) * (100 + man.hpRegenPct)) / 100),
  );
  const sprVal = Math.max(
    0,
    Math.floor((computeSpr(totalStats.int, maxSp) * (100 + man.spRegenPct)) / 100),
  );

  const base: Omit<CombatSnapshot, "kakutyouLines"> = {
    effectiveJobId,
    isTensei,
    totalStats,
    allocatedStats: { ...input.stats },
    sixBonusCards: cardSixStatDelta(eq, effectiveJobId),
    sixBonusSetEquip: setSixStatDelta(eq, effectiveJobId),
    sixBonusWornItemScript: wornEquipSixStatDelta(eq, effectiveJobId),
    sixBonusPassiveSkills,
    jobBoardBonus,
    remainingStatPoints: remainingStatPoints(
      input.baseLv,
      isTensei,
      input.stats,
    ),
    maxHp,
    maxSp,
    hit: hitTotal,
    flee: computeFleeWithSupport(input, totalStats) + fleeCard + fleeSet + fleeWorn + man.flee,
    perfectDodge: computePerfectDodge(sec) + man.perfectDodge,
    refNLuckyDisplay,
    crit: critTotal,
    matkMin: matk.min,
    matkMax: matk.max,
    aspd: aspdVal,
    hpr: hprVal,
    spr: sprVal,
    hardDef,
    defVitStatDisplay,
    vitDefSoftTriplet,
    mdef,
    mdefIntStatDisplay,
    mdefStAllCalcExtraFlat,
    weaponAtkBase,
    atkStatusPortion,
    atkWeaponLineFlat,
    weaponRefineBonus,
    weaponRefineVarianceMin: wVar.min,
    weaponRefineVarianceMax: wVar.max,
    weaponLevel: wLv,
    weaponAtkSupportFlat,
    weaponAtkCardFlat: wAtkCard,
    weaponAtkSetFlat: wAtkSet,
    weaponAtkWornScriptFlat: wAtkWorn,
    guildLeaderAtk100: input.guildLeader.atk100,
    weaponAtkPerformanceDanceFlat,
    weaponAtkHolySlaughterFlat,
    atkBai01PercentApprox,
    passSkill5HighDamageMultiplierApprox,
    weaponAtkPercentChainWApprox,
    atkPanelPercentWApprox,
    tok60to69Additive: [...tok60to69],
    songTok150to159Each: songTok150to159Each,
    vitDefLegacyMultiplierApprox: computeVitDefLegacyMultiplierApprox(input),
    guildLeaderDamageHalf: input.guildLeader.damageHalf,
    enemyCombatMonsterLabel,
    castTimeMultiplierApprox,
    fleeCode9ScriptFlat,
    passSkill2Tok56FromBarrier,
    passSkill2Tok66FromBarrier,
    card452Tok56Bonus,
    activeSkillId: input.activeSkillId,
    activeSkillLv: input.activeSkillLv,
    legacyNB,
    battlePhysicalRough,
  };

  const kakutyouLines = computeKakutyouLines(input, {
    ...base,
    kakutyouLines: [],
  });

  return { ...base, kakutyouLines };
}

export { clampBaseLv, clampJobLv, clampStat } from "./inputClamp";
