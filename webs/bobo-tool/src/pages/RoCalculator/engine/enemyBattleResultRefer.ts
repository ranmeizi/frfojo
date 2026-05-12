/**
 * 对敌「战斗结果」表与 refer `head.js` `BattleCalc998` / `foot.js` 末段展示对齐。
 * 仍可能偏差：伤害三档与 `battlePhysicalRough` 全链、`BattleHiDam` 中 `n_tok[50+]`/`StPlus*(3000+)`、
 * `n_tok[11]`、`n_tok[74]` 固定延迟细分、主动技 `wCast` 秒数等。
 */
import {
  clampBattleCritPercent,
  legacyCritRateVsMonster,
  normalizeHitForBattleCalc3,
} from "./battleCalc3Approx";
import { computeBattleHiDamIncomingPair } from "./battleHiDamRefer";
import { computeLegacyMonsterFlee27 } from "./legacyMonsterFlee27";
import { resolveCombatJob } from "./jobResolve";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import { computeReferWDA } from "./referWDA998";
import type { BattlePhysicalRoughPreview, CharacterBaseInput, CombatSnapshot } from "./types";

/** `head.js`：`w_FLEE` 钳 5–95 后，`BattleFLEE` 展示 */
export function referBattleFleeDisplayPercent(params: {
  nAFlee: number;
  monsterHitStat: number;
  nALucky: number;
}): number {
  let w = params.nAFlee + 20 - params.monsterHitStat;
  if (w > 95) w = 95;
  else if (w < 5) w = 5;
  const v = w + ((100 - w) * params.nALucky) / 100;
  return Math.floor(v * 100) / 100;
}

/**
 * `head.js` **3877–3887**：`w998K`；`wDA` 由 `computeReferWDA` 提供（含卡 43、装 570/1035/399、枪 427）。
 */
export function referHitDisplayW998K(params: {
  wHitRaw: number;
  playerCritStat: number;
  monsterLuk: number;
  weaponType: number;
  skill13Lv: number;
  skill187Lv: number;
  wDA: number;
}): number {
  const w_HIT = normalizeHitForBattleCalc3(params.wHitRaw);
  let w_Cri = legacyCritRateVsMonster(params.playerCritStat, params.monsterLuk);
  w_Cri = clampBattleCritPercent(w_Cri);

  const wBC3_3danHatudouRitu = params.skill187Lv > 0 ? 30 - params.skill187Lv : 0;
  const wDA = params.wDA;

  let w_HIT_DA = w_HIT;
  if (wDA !== 0 && params.weaponType !== 17) {
    w_HIT_DA = (w_HIT_DA * (100 + params.skill13Lv)) / 100;
    if (w_HIT_DA >= 100) w_HIT_DA = 100;
  }

  const w998A = 100 - wBC3_3danHatudouRitu;
  const w998B = (wBC3_3danHatudouRitu * w_HIT) / 100;
  const w998D = (w998A * wDA) / 100;
  const w998E = (w998D * w_HIT_DA) / 100;
  const w998G = ((100 - wBC3_3danHatudouRitu - w998D) * w_Cri) / 100;
  const w998H = 100 - wBC3_3danHatudouRitu - w998D - w998G;
  const w998I = (w998H * w_HIT) / 100;
  const w998K = w998B + w998E + w998G + w998I;
  return Math.floor(w998K * 100) / 100;
}

/** `foot.js`：`n_A_ASPD` 展示值 → `n_Delay[1]`（秒） */
export function referAspdDelayFromDisplayAspd(aspd0to190: number): number {
  const work = (200 - aspd0to190) / 50;
  return Math.floor(work * 1000) / 1000;
}

/** `foot.js`：`sandanDelay`（六合拳段） */
export function referSandanDelaySec(agi: number, dex: number, skill301Lv: number): number {
  let d = (1000 - agi * 4 - dex * 2) / 1000;
  if (skill301Lv > 0) d += 0.3;
  return d;
}

/** 普攻：`CastAndDelay` 合成周期（六合拳） */
export function referPassiveAttackPeriodSec(p: {
  aspdDisplay: number;
  agi: number;
  dex: number;
  skill187Lv: number;
  skill301Lv: number;
}): number {
  const nDelay1 = referAspdDelayFromDisplayAspd(p.aspdDisplay);
  if (p.skill187Lv <= 0) return nDelay1;
  const wBC3 = 30 - p.skill187Lv;
  const w998A = 100 - wBC3;
  const sandan = referSandanDelaySec(p.agi, p.dex, p.skill301Lv);
  return (nDelay1 * w998A) / 100 + (sandan * wBC3) / 100;
}

/**
 * DPS/战斗时间用攻击周期：`activeSkillId===0` 走六合拳合成；否则 `max(n_Delay[1], Conf01%)`（284 除外）。
 * 未加主动技 `wCast`（需 head 分支表）。
 */
export function referAttackPeriodForDps(input: CharacterBaseInput, snap: CombatSnapshot): number {
  const ac = input.activeSkillId;
  const agi = snap.totalStats.agi;
  const dex = snap.totalStats.dex;
  const s187 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 187);
  const s301 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 301);
  if (ac === 0) {
    return referPassiveAttackPeriodSec({
      aspdDisplay: snap.aspd,
      agi,
      dex,
      skill187Lv: s187,
      skill301Lv: s301,
    });
  }
  if (ac === 284) return referAspdDelayFromDisplayAspd(snap.aspd);
  const n1 = referAspdDelayFromDisplayAspd(snap.aspd);
  const cap = Math.min(99, Math.max(1, Math.floor(input.enemyCombat.clientDelayCapPercent ?? 33))) / 100;
  return Math.max(n1, cap);
}

/** `BattleCalc998`：`round(100 * w_DMG[1] / (wCast+wDelay)) / 100` */
export function referDpsPerSecond(wDmgAvg: number, periodSec: number, wCast = 0): string {
  if (!(periodSec > 0) || !(wDmgAvg >= 0)) return "—";
  let w = (1 / (wCast + periodSec)) * wDmgAvg;
  w *= 100;
  w = Math.round(w);
  w /= 100;
  return String(w);
}

/** `BattleCalc998`：`floor((wCast+wDelay)*n_AveATKnum*100)/100` + `秒` */
export function referBattleTimeSeconds(periodSec: number, aveHits: number | null): string {
  if (aveHits == null || !Number.isFinite(aveHits) || aveHits <= 0 || !(periodSec > 0)) return "—";
  const w = Math.floor(periodSec * aveHits * 100) / 100;
  return `${w}秒`;
}

/** `BattleCalc998`：`Math.round(n_B[16|17] / i)` */
export function referExpPerHitRounded(exp: number, aveHits: number | null): string {
  if (aveHits == null || !Number.isFinite(aveHits) || aveHits <= 0) return "—";
  return `${Math.round(exp / aveHits)}Exp`;
}

export type EnemyBattleReferRowContext = {
  snap: CombatSnapshot;
  input: CharacterBaseInput;
  bp: BattlePhysicalRoughPreview;
  legacyNB: readonly number[];
};

export function enemyBattleResultReferCell(
  rowIndex: number,
  ctx: EnemyBattleReferRowContext,
  parsed: ParsedMonster | null,
): string {
  const { snap, input, bp, legacyNB } = ctx;
  const nB = legacyNB;
  const { effectiveJobId } = resolveCombatJob(input.formJobId);
  const monsterHit = Math.floor(Number(nB[26]) || 0);
  const monsterLuk = Math.floor(Number(nB[11]) || 0);
  const flee27 = computeLegacyMonsterFlee27(input.enemyCombat, nB);
  const wHitRaw = snap.hit + 80 - flee27;
  const skill13 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 13);
  const skill187 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 187);
  const skill301 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 301);
  const nLucky = snap.refNLuckyDisplay;
  const wDA = computeReferWDA(input, effectiveJobId);
  const period = referAttackPeriodForDps(input, snap);

  const incoming = computeBattleHiDamIncomingPair(
    input,
    snap,
    legacyNB,
    effectiveJobId,
    nLucky,
  );

  const fleeDisplay = `${referBattleFleeDisplayPercent({
    nAFlee: snap.flee,
    monsterHitStat: monsterHit,
    nALucky: nLucky,
  })}%`;

  const zok = Math.floor(Number(nB[3]) || 0);
  const useW998KHit =
    input.activeSkillId === 0 ||
    input.activeSkillId === 272 ||
    input.activeSkillId === 401 ||
    (input.activeSkillId === 86 && zok >= 50 && zok < 60);

  const hitDisplay = `${(useW998KHit
    ? referHitDisplayW998K({
        wHitRaw,
        playerCritStat: snap.crit,
        monsterLuk,
        weaponType: input.weaponType,
        skill13Lv: skill13,
        skill187Lv: skill187,
        wDA,
      })
    : normalizeHitForBattleCalc3(wHitRaw)
  ).toString()}%`;

  if (rowIndex === 0) return hitDisplay;
  if (rowIndex === 1) return fleeDisplay;
  if (rowIndex === 12) {
    return `${incoming.avgCore} (${incoming.minRoll}～${incoming.maxRoll})`;
  }
  if (rowIndex === 13) {
    return `${incoming.avgAfterFleeLuck}伤害`;
  }

  if (!bp.enabled) return "—";

  const aveHits = bp.hitsToKillAvg;

  switch (rowIndex) {
    case 2:
      return String(bp.dmgMin);
    case 3:
      return String(bp.dmgAvg);
    case 4:
      return String(bp.dmgMax);
    case 5:
      return referDpsPerSecond(bp.dmgAvg, period, 0);
    case 6:
      return fmtHitsLocal(bp.hitsToKillMin);
    case 7:
      return fmtHitsLocal(bp.hitsToKillAvg);
    case 8:
      return fmtHitsLocal(bp.hitsToKillMax);
    case 9:
      return referBattleTimeSeconds(period, aveHits);
    case 10:
      return parsed ? referExpPerHitRounded(parsed.baseExp, aveHits) : "—";
    case 11:
      return parsed ? referExpPerHitRounded(parsed.jobExp, aveHits) : "—";
    default:
      return "—";
  }
}

function fmtHitsLocal(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return String(n);
}
