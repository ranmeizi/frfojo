import { addSix, computeJobBoardBonus } from "./jobBoardBonus";
import { computeMaxHp, computeMaxSp } from "./maxHpSp";
import {
  type SecCtx,
  computeCritBase,
  computeHpr,
  computeMatk,
  computePerfectDodge,
  computeSpr,
} from "./secondaryStats";
import { JOB_PASSIVE_SKILL_IDS } from "./skillBoard.generated";
import {
  passSkill6DomainLevel,
  passSkill6ProvokeMatkLevel,
} from "./holyPassSkill6";
import { cardSixStatDelta } from "./cardBonuses";
import { resolveCombatJob } from "./jobResolve";
import type { CharacterBaseInput, SixStats } from "./types";

/** legacy SkillSearch：从当前职业被动槽读取技能等级 */
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

/** legacy 傀儡：未满级时加半值，STR 等单项封顶 99 */
function addDollHalfCap(totalBefore: number, puppetVal: number, full: boolean): number {
  const add = full ? puppetVal : Math.floor(puppetVal / 2);
  if (full) return add;
  if (totalBefore + add < 99) return add;
  return Math.max(0, 99 - totalBefore);
}

/**
 * 对应 legacy StPlusCalc 末尾六维加成（装备 StPlus 以外：领域/辅助/演奏/工会/圣音/食品/傀儡）。
 * 另含卡片 `StPlusCard(1～7)` 平铺六维；不含 ItemOBJ 装备随机属性。
 */
export function computeEffectiveSixStats(input: CharacterBaseInput): SixStats {
  const job = computeJobBoardBonus(input.formJobId, input.jobLv);
  const m = input.stats;
  let s = addSix(m, job);

  const mental42 = passiveLevelBySkillId(
    input.formJobId,
    input.passiveSkillLevels,
    42,
  );
  if (mental42 > 0) {
    const fac = 102 + mental42;
    s.agi = Math.floor((m.agi + job.agi) * fac / 100);
    s.dex = Math.floor((m.dex + job.dex) * fac / 100);
  } else if (passSkill6DomainLevel(input.holySupport) > 0) {
    const fac = 102 + passSkill6DomainLevel(input.holySupport);
    s.agi = Math.floor((m.agi + job.agi) * fac / 100);
    s.dex = Math.floor((m.dex + job.dex) * fac / 100);
  }

  const b = input.buffSupport;
  s.str += b.blessLv;
  s.int += b.blessLv;
  s.dex += b.blessLv;
  if (b.agiUpLv > 0) s.agi += b.agiUpLv + 2;
  if (b.fortuneKiss) s.luk += 30;

  const p = input.performanceDance;
  if (p.puppetTrick) {
    s.str += 5;
    s.dex += 5;
    s.int += 5;
    s.str += addDollHalfCap(s.str, p.puppetStr, p.puppetFullStatsNoHalf);
    s.agi += addDollHalfCap(s.agi, p.puppetAgi, p.puppetFullStatsNoHalf);
    s.vit += addDollHalfCap(s.vit, p.puppetVit, p.puppetFullStatsNoHalf);
    s.int += addDollHalfCap(s.int, p.puppetInt, p.puppetFullStatsNoHalf);
    s.dex += addDollHalfCap(s.dex, p.puppetDex, p.puppetFullStatsNoHalf);
    s.luk += addDollHalfCap(s.luk, p.puppetLuk, p.puppetFullStatsNoHalf);
  }

  const gc = input.guildCommand;
  if (gc.battleOrder) {
    s.str += 5;
    s.dex += 5;
    s.int += 5;
  }
  s.str += gc.greatGuidance;
  s.vit += gc.gloriousWound;
  s.agi += gc.coldHeart;
  s.dex += gc.sharpGaze;

  if (input.guildLeader.allStats20) {
    s.str += 20;
    s.agi += 20;
    s.vit += 20;
    s.int += 20;
    s.dex += 20;
    s.luk += 20;
  }

  const sl = input.holySupport.slaughterSystem;
  if (sl === 1) {
    s.str += 3;
    s.agi += 3;
    s.vit += 3;
    s.int += 3;
    s.dex += 3;
    s.luk += 3;
  } else if (sl === 2) {
    s.str += 5;
    s.agi += 5;
    s.vit += 5;
    s.int += 5;
    s.dex += 5;
    s.luk += 5;
  }

  const f = input.foodConsumable;
  s.str += f.strBonus;
  s.agi += f.agiBonus;
  s.vit += f.vitBonus;
  s.int += f.intBonus;
  s.dex += f.dexBonus;
  s.luk += f.lukBonus;

  return addSix(s, cardSixStatDelta(input.equipment));
}

function hpSpCtx(
  input: CharacterBaseInput,
  vit: number,
  int: number,
): {
  effectiveJobId: number;
  isTensei: boolean;
  baby: boolean;
  baseLv: number;
  vit: number;
  int: number;
} {
  const { effectiveJobId, isTensei } = resolveCombatJob(input.formJobId);
  return {
    effectiveJobId,
    isTensei,
    baby: input.baby,
    baseLv: input.baseLv,
    vit,
    int,
  };
}

/** MaxHP：工会%、水领域×水甲、依登的苹果（bkHP 取基础公式值，与 legacy 近似） */
export function computeSupportAdjustedMaxHp(
  input: CharacterBaseInput,
  effectiveVit: number,
): number {
  const ctx = hpSpCtx(input, effectiveVit, 0);
  let maxHp = computeMaxHp(ctx);
  const bkHp = maxHp;

  let pct = 0;
  if (input.guildLeader.hp100) pct += 100;
  maxHp = Math.floor((maxHp * (100 + pct)) / 100);

  const body = input.holySupport.holyBodyBless ? 6 : 0;
  const h = input.holySupport;
  if (h.elementField === 1 && h.slaughterLevel >= 1 && body === 1) {
    const dHP = [5, 9, 12, 14, 15];
    const idx = Math.min(h.slaughterLevel, 5) - 1;
    maxHp = Math.floor((maxHp * (100 + dHP[idx])) / 100);
  }

  const pd = input.performanceDance;
  if (pd.lv3 > 0) {
    const songPct =
      105 + pd.lv3 * 2 + pd.row3Instrument + Math.floor(pd.row3PoetVit / 10);
    maxHp += Math.floor((bkHp * songPct) / 100) - bkHp;
  }

  return Math.max(1, maxHp);
}

export function computeSupportAdjustedMaxSp(
  input: CharacterBaseInput,
  effectiveInt: number,
): number {
  const ctx = hpSpCtx(input, 0, effectiveInt);
  let maxSp = computeMaxSp(ctx);
  const bkSp = maxSp;

  let pct = 0;
  if (input.guildLeader.sp100) pct += 100;
  maxSp = Math.floor((maxSp * (100 + pct)) / 100);

  const pd = input.performanceDance;
  if (pd.lv6 > 0) {
    const songPct =
      100 + pd.lv6 * 2 + pd.row6Dance + Math.floor(pd.row6DancerInt / 10);
    maxSp += Math.floor((bkSp * songPct) / 100) - bkSp;
  }

  return Math.max(1, maxSp);
}

export function computeWeaponAtkSupportFlat(input: CharacterBaseInput): number {
  let w = 0;
  const f = input.foodConsumable;
  if (f.coloredCake) w += 10;
  if (f.resentmentBox) w += 20;
  return w;
}

export function computeMatkWithSupport(
  input: CharacterBaseInput,
  effectiveInt: number,
): { min: number; max: number } {
  let m = computeMatk(effectiveInt);
  let w = 100;
  if (input.holySupport.slaughterSystem) w += 10;
  m = {
    min: Math.floor((m.min * w) / 100),
    max: Math.floor((m.max * w) / 100),
  };

  const prov = passSkill6ProvokeMatkLevel(input.holySupport);
  if (prov > 0) {
    const w2 = 100 + 20 * prov;
    m = {
      min: Math.floor((m.min * w2) / 100),
      max: Math.floor((m.max * w2) / 100),
    };
  }

  if (input.foodConsumable.coloredCake) {
    m.min += 10;
    m.max += 10;
  }
  if (input.foodConsumable.sleepBox) {
    m.min += 20;
    m.max += 20;
  }

  if (m.min !== m.max) m.max -= 1;
  if (m.max < m.min) m.max = m.min;
  return m;
}

/** legacy 速度激发 + 布莱奇之诗等对 ASPD 权重 w 的额外部分（可负） */
export function computeAspdExtraWeight(input: CharacterBaseInput, weaponType: number): number {
  let w = 0;
  const b = input.buffSupport;
  const ad = b.adrenalineMode;
  const isBowLike =
    weaponType === 10 || (weaponType >= 17 && weaponType <= 21);

  if (!isBowLike && ad === 2) w += 25;
  else if (ad === 1 && weaponType >= 6 && weaponType <= 8) w += 25;
  else if (ad === 3 && weaponType >= 6 && weaponType <= 8) w += 30;

  const p = input.performanceDance;
  if (p.lv2 > 0) {
    w -= p.lv2 * 3 + p.row2Instrument + Math.floor(p.row2PoetDex / 10);
  }

  if (p.lv1 > 0 && !isBowLike) {
    w += 5 + p.lv1 + Math.floor(p.row1Instrument / 2) + Math.floor(p.row1PoetAgi / 20);
  }

  return w;
}

export function computeHitWithSupport(
  input: CharacterBaseInput,
  effectiveDex: number,
): number {
  let hit = input.baseLv + effectiveDex;
  if (input.guildLeader.hitFlee50) hit += 50;
  if (input.foodConsumable.teaHit) hit += 30;

  const pd = input.performanceDance;
  if (pd.lv4 > 0) {
    hit +=
      pd.lv4 + Math.floor(pd.row4Dance / 2) + Math.floor(pd.row4DancerDex / 10);
  }
  return hit;
}

export function computeFleeWithSupport(
  input: CharacterBaseInput,
  effectiveAgi: number,
): number {
  let flee = input.baseLv + effectiveAgi;
  if (input.guildLeader.hitFlee50) flee += 50;
  if (input.foodConsumable.oilFlee) flee += 30;

  const h = input.holySupport;
  const body = h.holyBodyBless ? 6 : 0;
  if (h.elementField === 2 && h.slaughterLevel >= 1 && body === 4) {
    flee += h.slaughterLevel * 3;
  }

  const pd = input.performanceDance;
  if (pd.lv0 > 0) {
    flee +=
      pd.lv0 + Math.floor(pd.row0Instrument / 2) + Math.floor(pd.row0PoetAgi / 10);
  }

  const wwPassive = passiveLevelBySkillId(
    input.formJobId,
    input.passiveSkillLevels,
    273,
  );
  if (input.buffSupport.windWalkerLv > 0 && wwPassive === 0) {
    flee += Math.round(input.buffSupport.windWalkerLv / 2);
  }

  return flee;
}

/** 衍生属性用上下文（与 secondaryStats SecCtx 一致） */
export function buildSecCtx(
  input: CharacterBaseInput,
  effective: SixStats,
  maxHp: number,
  maxSp: number,
): SecCtx {
  const { effectiveJobId } = resolveCombatJob(input.formJobId);
  return {
    effectiveJobId,
    baseLv: input.baseLv,
    jobLv: input.jobLv,
    weaponType: input.weaponType,
    speedPot: input.speedPot,
    total: effective,
    maxHp,
    maxSp,
  };
}

export function computeCritWithSupport(
  input: CharacterBaseInput,
  effective: SixStats,
  maxHp: number,
  maxSp: number,
): number {
  const ctx = buildSecCtx(input, effective, maxHp, maxSp);
  let c = computeCritBase(ctx);

  const pd = input.performanceDance;
  if (pd.lv5 > 0) {
    c += 10 + pd.lv5 + Math.floor(pd.row5Dance / 2) + Math.floor(pd.row5DancerLuk / 10);
  }
  return Math.round(c * 10) / 10;
}

export function computeHardDefWithPerformance(
  baseHardDef: number,
  input: CharacterBaseInput,
): number {
  let d = baseHardDef;
  const pd = input.performanceDance;
  if (pd.lv9 > 0) d += 2 + 2 * pd.lv9;
  return d;
}
