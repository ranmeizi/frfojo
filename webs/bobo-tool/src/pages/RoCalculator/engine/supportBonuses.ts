import { addSix, computeJobBoardBonus } from "./jobBoardBonus";
import { computeMaxHp, computeMaxSp } from "./maxHpSp";
import {
  type SecCtx,
  computeCritBase,
  computeMatk,
} from "./secondaryStats";
import {
  passSkill6DomainLevel,
  passSkill6ProvokeMatkLevel,
} from "./holyPassSkill6";
import { cardSixStatDelta } from "./cardBonuses";
import {
  setSixStatDelta212215Only,
  setSixStatDeltaExcluding212215,
  wornAccessoryEquipSlotsSixStatDeltaExcluding212215,
  wornEquipSixStatDelta212215Only,
  wornEquipSixStatDeltaExcluding212215,
} from "./equipmentSetBonus";
import { customAccessorySlotSixFlat } from "./customEquipmentAggregate";
import { cardDynamicSixStat } from "./cardDynamicSixStat";
import { cardNumSearch, equipNumSearch } from "./equipCardCount";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import { stPlusCalcEquipConditionalSix } from "./stPlusCalcEquipConditionalSix";
import { sanctityCoreSixStatDelta } from "./sanctityCoreSix";
import { legacyJobSearch } from "./legacyJobSearch";
import { resolveCombatJob } from "./jobResolve";
import type { CharacterBaseInput, SixStats } from "./types";

export { passiveLevelBySkillId } from "./passiveSkillLevel";

const ZERO_SIX: SixStats = {
  str: 0,
  agi: 0,
  vit: 0,
  int: 0,
  dex: 0,
  luk: 0,
};

/**
 * legacy `StPlusCalc` 中在心灵(42)/领域% 之前、对 `wSPC_*` 的 `SkillSearch` 平铺六维段（foot.js 约 1630–1647、1722–1733）。
 * 不含 42 的 AGI/DEX%（见 `computeEffectiveSixStats`）；不含卡片/装备条件分支（见 `foot.js` **1573～1590** 相对 **1622+**）。
 */
export function passiveSkillSearchSixStatDelta(
  input: CharacterBaseInput,
): SixStats {
  const d = { ...ZERO_SIX };
  const L = (id: number) =>
    passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, id);

  d.dex += L(38);
  d.str += L(68) * 4;
  d.str += L(146);
  const n404 = L(404);
  d.str += n404;
  d.int += n404;
  const n234 = L(234);
  if (n234) d.int += Math.round(n234 / 2);

  const n286 = L(286);
  if (n286 >= 1) d.str += 1;
  if (n286 >= 2) d.str += 2;
  if (n286 >= 3) d.str += 4;
  if (n286 >= 4) d.str += 8;
  if (n286 >= 5) d.str += 16;

  if (L(422)) {
    d.dex += 4;
    d.agi += 4;
  }

  if (input.formJobId === 24 && L(270)) {
    d.str += 5;
    d.agi += 5;
    d.vit += 5;
    d.dex += 5;
    d.int += 5;
    d.luk += 5;
  }

  if (L(379) && input.weaponType === 0) d.str += 10;

  return d;
}

/** legacy 傀儡：未满级时加半值，STR 等单项封顶 99 */
function addDollHalfCap(totalBefore: number, puppetVal: number, full: boolean): number {
  const add = full ? puppetVal : Math.floor(puppetVal / 2);
  if (full) return add;
  if (totalBefore + add < 99) return add;
  return Math.max(0, 99 - totalBefore);
}

/**
 * 对应 legacy `foot.js` **`StPlusCalc`** 六维链（约 **1540～1720**）：
 * Job 板 + **主装备槽 0～8** / 套装 **`StPlusCalc2(1–7,213,214)`**（**不含 212/215**；**不含饰品 9～10 脚本**）+ `SkillSearch` 被动平铺；
 * **`SkillSearch(42)` / 领域**：与 **`foot.js` 1595～1596** 一致——**`wSPC_* = floor((n_A_* + wSPC_*) * w / 100) - n_A_*`**，等价于总 **`floor((n_A_* + wSPC_*) * w / 100)`**；
 * 再累加 **`StPlusCalc2(212|215)`**（已穿 + 套装附魔类码）、装备条件六维、卡片、支援等。
 *
 * **手动修正六维**（`computeSnapshot` 的 **`playerManualEdits`**）在 **`computeEffectiveSixStats` 之后**相加，**不**进心神 **%**，与 refer **`n_A_*` 仅面板分配**一致。
 */
export function computeEffectiveSixStats(input: CharacterBaseInput): SixStats {
  const { effectiveJobId } = resolveCombatJob(input.formJobId);
  const job = computeJobBoardBonus(input.formJobId, input.jobLv);
  const m = input.stats;
  const eq = input.equipment;
  let s = addSix(m, job);
  s = addSix(s, wornEquipSixStatDeltaExcluding212215(eq, effectiveJobId));
  s = addSix(s, setSixStatDeltaExcluding212215(eq, effectiveJobId));
  s = addSix(s, passiveSkillSearchSixStatDelta(input));

  const mental42 = passiveLevelBySkillId(
    input.formJobId,
    input.passiveSkillLevels,
    42,
  );
  /** refer **`n_A_AGI`/`n_A_DEX`**：仅手选素质（与 **`input.stats`** 同源），与 Job/装备加成 **`wSPC_*`** 分离后进 **`foot.js` 1595～1596**。 */
  const nAAgi = m.agi;
  const nADex = m.dex;
  /**
   * **`foot.js` 1592～1599**：**212/215** 在 **1602～1603** 才加回。
   * 本工具：**主槽 0～8** 的 **code 2/5/7…** 进心神 **%**；**饰品 9～10** 与 **自定义饰品六维** 在心神 **%** **之后**再加（见上文 **`wornAccessoryEquipSlotsSixStatDeltaExcluding212215`** / **`customAccessorySlotSixFlat`**）。
   */
  if (mental42 > 0) {
    const w = 102 + mental42;
    const wSpcAgiPre = s.agi - nAAgi;
    const wSpcDexPre = s.dex - nADex;
    s.agi = nAAgi + Math.floor(((nAAgi + wSpcAgiPre) * w) / 100) - nAAgi;
    s.dex = nADex + Math.floor(((nADex + wSpcDexPre) * w) / 100) - nADex;
  } else if (passSkill6DomainLevel(input.holySupport) > 0) {
    const w = 102 + passSkill6DomainLevel(input.holySupport);
    const wSpcAgiPre = s.agi - nAAgi;
    const wSpcDexPre = s.dex - nADex;
    s.agi = nAAgi + Math.floor(((nAAgi + wSpcAgiPre) * w) / 100) - nAAgi;
    s.dex = nADex + Math.floor(((nADex + wSpcDexPre) * w) / 100) - nADex;
  }

  /** 饰品槽 ItemOBJ 与自定义饰品六维：**不进**心神 **%**（roratorio 源码中二者在心神前，此处按产品口径后置）。 */
  s = addSix(s, wornAccessoryEquipSlotsSixStatDeltaExcluding212215(eq, effectiveJobId));
  s = addSix(s, customAccessorySlotSixFlat(eq));

  s = addSix(s, wornEquipSixStatDelta212215Only(eq, effectiveJobId));
  s = addSix(s, setSixStatDelta212215Only(eq, effectiveJobId));
  s = addSix(s, stPlusCalcEquipConditionalSix(input));
  s = addSix(s, cardSixStatDelta(eq, effectiveJobId));
  s = addSix(s, cardDynamicSixStat(input));

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

  s = addSix(s, sanctityCoreSixStatDelta(input.holySupport.sanctityCoreCode));

  return s;
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

/** `PassSkill3[9]` 战舞：武器 ATK 平铺（foot.js 约 434–435） */
export function performanceDanceWeaponAtkFlat(input: CharacterBaseInput): number {
  const lv = input.performanceDance.lv9;
  if (lv <= 0) return 0;
  return 25 + 25 * lv;
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

/**
 * legacy 速度激发 + 布莱奇之诗等对 ASPD 权重 w 的额外部分（可负）。
 * `SkillSearch(357)` / `(361)` 先置 `ASPDch` 后，原版不再走 `PassSkill2[6]` 与 `PassSkill3[1]`（foot.js 约 1273–1297）。
 */
export function computeAspdExtraWeight(
  input: CharacterBaseInput,
  weaponType: number,
  totalStats: SixStats,
): number {
  let w = 0;
  const L = (id: number) =>
    passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, id);

  let aspdCh = false;
  const n357 = L(357);
  if (n357 > 0) {
    aspdCh = true;
    w += Math.floor((input.baseLv + totalStats.luk + totalStats.dex) / 10);
  }
  const n361 = L(361);
  if (n361 > 0) {
    aspdCh = true;
    w += 3 * n361;
  }

  const b = input.buffSupport;
  const ad = b.adrenalineMode;
  const isBowLike =
    weaponType === 10 || (weaponType >= 17 && weaponType <= 21);

  if (!aspdCh) {
    if (!isBowLike && ad === 2) w += 25;
    else if (ad === 1 && weaponType >= 6 && weaponType <= 8) w += 25;
    else if (ad === 3 && weaponType >= 6 && weaponType <= 8) w += 30;
  }

  const p = input.performanceDance;
  if (p.lv2 > 0) {
    w -= p.lv2 * 3 + p.row2Instrument + Math.floor(p.row2PoetDex / 10);
  }

  if (!aspdCh && p.lv1 > 0 && !isBowLike) {
    w += 5 + p.lv1 + Math.floor(p.row1Instrument / 2) + Math.floor(p.row1PoetAgi / 20);
  }

  return w;
}

/** `refer/foot.js` `Mikiri[SkillSearch(191)]` */
function mikiriFleeFromSkill191(level: number): number {
  const t = [0, 1, 3, 4, 6, 7, 9, 10, 12, 13, 15];
  if (level <= 0) return 0;
  const i = Math.min(level, t.length - 1);
  return t[i] ?? 0;
}

export function computeHitWithSupport(
  input: CharacterBaseInput,
  effective: SixStats,
): number {
  const { effectiveJobId } = resolveCombatJob(input.formJobId);
  const eq = input.equipment;
  const L = (id: number) =>
    passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, id);

  let hit = input.baseLv + effective.dex;
  if (equipNumSearch(eq, 656, effectiveJobId) > 0) hit -= Math.floor(input.stats.dex / 3);
  const wt = input.weaponType;
  if (wt === 3 || wt === 2) hit += cardNumSearch(eq, 464, effectiveJobId) * 5;
  if (wt === 10) hit += cardNumSearch(eq, 465, effectiveJobId) * 5;
  const n492 = cardNumSearch(eq, 492, effectiveJobId);
  if (n492 > 0) hit += Math.floor(input.jobLv / 10) * n492;
  if (input.stats.str >= 90 && equipNumSearch(eq, 442, effectiveJobId) > 0)
    hit += 10 * equipNumSearch(eq, 442, effectiveJobId);
  if (input.stats.str >= 95 && equipNumSearch(eq, 1073, effectiveJobId) > 0) hit += 10;
  if (equipNumSearch(eq, 1074, effectiveJobId) > 0 && L(81) === 10) hit += 10;

  hit += L(39);
  hit += 2 * L(148);
  hit += 3 * L(270);
  hit += 10 * L(256);
  hit += L(426);
  if (L(421) > 0) hit -= 30;
  if (L(422) > 0) hit += 20;
  hit += 2 * L(425);
  if (equipNumSearch(eq, 654, effectiveJobId) > 0) hit += Math.floor(input.stats.agi / 10);

  if (input.guildLeader.hitFlee50) hit += 50;
  if (input.foodConsumable.teaHit) hit += 30;

  /** refer `foot.js` StAllCalc HIT 段：`n_A_ActiveSkill == 324` → +20 */
  if (input.activeSkillId === 324) hit += 20;

  const pd = input.performanceDance;
  if (pd.lv4 > 0) {
    hit +=
      pd.lv4 + Math.floor(pd.row4Dance / 2) + Math.floor(pd.row4DancerDex / 10);
  }
  return hit;
}

export function computeFleeWithSupport(
  input: CharacterBaseInput,
  effective: SixStats,
): number {
  const { effectiveJobId } = resolveCombatJob(input.formJobId);
  const eq = input.equipment;
  const su = input.stats;
  const L = (id: number) =>
    passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, id);

  let flee =
    input.baseLv + effective.agi + Math.floor(effective.luk / 5);

  if (eq.head1Refine >= 7 && equipNumSearch(eq, 1052, effectiveJobId) > 0) flee += 10;
  if (legacyJobSearch(input.formJobId) === 2 && cardNumSearch(eq, 295, effectiveJobId) > 0)
    flee += 20;
  if (eq.shoulderRefine >= 9 && cardNumSearch(eq, 271, effectiveJobId) > 0) flee += 20;
  if (eq.shoulderRefine <= 4 && cardNumSearch(eq, 401, effectiveJobId) > 0) flee += 10;
  if (eq.shoulderRefine >= 9 && cardNumSearch(eq, 403, effectiveJobId) > 0) flee += 5;
  if (su.str >= 90 && equipNumSearch(eq, 442, effectiveJobId) > 0)
    flee += 10 * equipNumSearch(eq, 442, effectiveJobId);

  const h = input.holySupport;
  const body = h.holyBodyBless ? 6 : 0;
  if (h.elementField === 2 && h.slaughterLevel >= 1 && body === 4) {
    flee += h.slaughterLevel * 3;
  }

  if (eq.weaponId === 483) flee -= input.baseLv + su.agi;

  const n14 = L(14);
  if (n14 > 0) {
    const mul =
      input.formJobId === 8 ||
      input.formJobId === 14 ||
      input.formJobId === 22 ||
      input.formJobId === 28
        ? 4
        : 3;
    flee += mul * n14;
  }
  if (L(421) > 0) flee += 30;
  const n433 = L(433);
  if (n433 > 0) flee -= 5 * n433;
  flee += mikiriFleeFromSkill191(L(191));
  if (L(383) > 0) flee += 10;
  if (L(356) > 0) {
    flee += Math.floor(
      (input.baseLv + effective.luk + effective.dex) / 10,
    );
  }

  const L273 = L(273);
  if (input.formJobId === 24) flee += Math.round(L273 / 2);
  else if (input.buffSupport.windWalkerLv > 0 && L273 === 0) {
    flee += Math.round(input.buffSupport.windWalkerLv / 2);
  }

  if (input.guildLeader.hitFlee50) flee += 50;
  if (input.foodConsumable.oilFlee) flee += 30;

  const pd = input.performanceDance;
  if (pd.lv0 > 0) {
    flee +=
      pd.lv0 + Math.floor(pd.row0Instrument / 2) + Math.floor(pd.row0PoetAgi / 10);
  }

  if (L(258) > 0) flee = Math.floor(flee / 2);

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
