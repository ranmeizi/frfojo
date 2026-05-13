/**
 * 对敌「战斗结果」表与 refer `head.js` `BattleCalc998` / `foot.js` 末段展示对齐。
 * **阶段 D3**：伤害/DPS/击杀/时间等行在 **`battlePhysicalRough.enabled`** 时直接取 **`CombatSnapshot.battlePhysicalRough`**（与 `computeBattlePhysicalRoughPreview` 同源），避免与主物伤链分裂。
 * **三档伤害行**（最小/平均/最大）仍为 **`BattleCalc`** 后展示链近似；**`BattleCalc998`** 的 **DPS / 平均击数 / 战斗时间** 以 **`dmgPerSwingExpectedApprox`**（BC3+EDP+二刀 BC3left+弓 **`BattleTAKA`**）为除数，对齐 **`head.js`** **`w_DMG[1]`** 期望口径。
 * **阶段 G2**：承伤 **12～13** 行取 **`computeBattleHiDamIncomingPair`**（与 **`battleHiDamRefer.ts`** 同源；已含 **`n_tok[50+]`/`[190+]`/`[77–79]`**、**`StPlus*(3000+魔物)`**、**`vitDefSoftTriplet`**）。
 * 仍可能偏差：`n_tok[11]`、`n_tok[74]` 固定延迟细分、主动技 **`wCast`** 秒数、**`BattleHighCalc`** 等。
 */
import { computeBattleCalc998Weights, normalizeHitForBattleCalc3 } from "./battleCalc3Approx";
import { computeBattleHiDamIncomingPair } from "./battleHiDamRefer";
import { computeLegacyMonsterFlee27 } from "./legacyMonsterFlee27";
import { resolveCombatJob } from "./jobResolve";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import type { ParsedMonster } from "./monsterCatalog";
import { computeReferWDA } from "./referWDA998";
import type { BattlePhysicalRoughPreview, CharacterBaseInput, CombatSnapshot } from "./types";

/** 与 `head.js` **`SubName[5/6/7]`** 一致，便于与 refer 输出对照 */
export const REFER_BATTLE_HITS_OVER_CAP = "1000回以上";
export const REFER_BATTLE_TIME_UNCALC = "无法计算";
export const REFER_EXP_OUT_OF_RANGE = "计算之外";

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
  const w = computeBattleCalc998Weights({
    wHitRaw: params.wHitRaw,
    playerCritStat: params.playerCritStat,
    monsterLuk: params.monsterLuk,
    weaponType: params.weaponType,
    skill13Lv: params.skill13Lv,
    skill187Lv: params.skill187Lv,
    wDA: params.wDA,
  });
  return Math.floor(w.w998K * 100) / 100;
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

/** `BattleCalc998`：`round(100 * w_DMG[1] / (wCast+wDelay)) / 100`（**`w_DMG[1]`** 用 **`dmgPerSwingExpectedApprox`**） */
export function referDpsPerSecond(wDmgAvg: number, periodSec: number, wCast = 0): string {
  if (!(periodSec > 0) || !(wDmgAvg >= 0)) return "—";
  let w = (1 / (wCast + periodSec)) * wDmgAvg;
  w *= 100;
  w = Math.round(w);
  w /= 100;
  return String(w);
}

/** `BattleCalc998`：击数 **≥1000** 或无效时 **`SubName[6]`** */
export function referBattleTimeSeconds(periodSec: number, aveHits: number | null): string {
  if (aveHits == null || !Number.isFinite(aveHits) || aveHits <= 0 || !(periodSec > 0)) return "—";
  if (aveHits >= 1000) return REFER_BATTLE_TIME_UNCALC;
  const w = Math.floor(periodSec * aveHits * 100) / 100;
  return `${w}秒`;
}

/** `BattleCalc998`：击数 **≥1000** 时 **`SubName[7]`** */
export function referExpPerHitRounded(exp: number, aveHits: number | null): string {
  if (aveHits == null || !Number.isFinite(aveHits) || aveHits <= 0) return "—";
  if (aveHits >= 1000) return REFER_EXP_OUT_OF_RANGE;
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
      return referDpsPerSecond(bp.dmgPerSwingExpectedApprox, period, 0);
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
  if (n >= 1000) return REFER_BATTLE_HITS_OVER_CAP;
  return String(n);
}
