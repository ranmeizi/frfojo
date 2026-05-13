import { stTokEquipApprox } from "./baiCIPhysical";
import { equipNumSearch } from "./equipCardCount";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import type { CharacterBaseInput, CombatSnapshot } from "./types";

const W_AG_157 = [100, 95, 90, 86, 82, 79, 76, 74, 72, 71, 70];

/**
 * `head.js` **2061～2187** `BattleHiDam` 子集 + **2043～2055** 承伤后处理。
 * 已接：七段物攻、`n_A_totalDEF`（`hardDef` 近似）、**`n_A_VITDEF[0/1/2]`** 分段（**`2075～2081`**，取 **`snap.vitDefSoftTriplet`**）、
 * SkillSearch **23/355/58**、**957**、`n_tok[60]`、`n_tok[50+种族]`、`n_tok[190+体型]`、**`n_B[19]/[20]`** 下 **`n_tok[77]～[79]`**、**`StPlusCalc2+StPlusCard(3000+n_B[0])`**（**`stTokEquipApprox`**）、`Kyrie`/`工会减半`、**157/255/287**。
 * 未接或仍近似：`n_tok[11]`/`[74]` 等全链、`BattleHighCalc` 阈值、与 **`tPlusDamCut`** 全形态等。
 */
export function computeBattleHiDamIncomingPair(
  input: CharacterBaseInput,
  snap: CombatSnapshot,
  legacyNB: readonly number[],
  effectiveJobId: number,
  nLucky: number,
): {
  avgCore: number;
  minRoll: number;
  maxRoll: number;
  avgAfterFleeLuck: number;
} {
  const nB = legacyNB;
  const minM = Math.floor(Number(nB[12]) || 0);
  const maxAtk = Math.floor(Number(nB[13]) || 0);
  const race = Math.floor(Number(nB[2]) || 0);
  const zok = Math.floor(Number(nB[3]) || 0);
  const size = Math.floor(Number(nB[4]) || 0);
  const mobId = Math.floor(Number(nB[0]) || 0);
  const n19 = Math.floor(Number(nB[19]) || 0);
  const n20 = Math.floor(Number(nB[20]) || 0);

  const totalDef = Math.min(100, Math.max(0, Math.floor(snap.hardDef)));
  const [vd0, vd1, vd2] = snap.vitDefSoftTriplet;

  const hi: number[] = new Array(7);
  hi[0] = minM;
  hi[1] = (minM * 5 + maxAtk) / 6;
  hi[2] = (minM * 4 + maxAtk * 2) / 6;
  hi[3] = (minM + maxAtk) / 2;
  hi[4] = (minM * 2 + maxAtk * 4) / 6;
  hi[5] = (minM + maxAtk * 5) / 6;
  hi[6] = maxAtk;
  if (minM === maxAtk) hi[6] = maxAtk - 1;

  hi[0] = hi[0] * ((100 - totalDef) / 100) - vd2;
  hi[1] = hi[1] * ((100 - totalDef) / 100) - vd2;
  hi[2] = hi[2] * ((100 - totalDef) / 100) - vd2;
  hi[3] = hi[3] * ((100 - totalDef) / 100) - vd1;
  hi[4] = hi[4] * ((100 - totalDef) / 100) - vd0;
  hi[5] = hi[5] * ((100 - totalDef) / 100) - vd0;
  hi[6] = hi[6] * ((100 - totalDef) / 100) - vd0;

  const applyPct = (pctRaw: number) => {
    const pct = Math.floor(pctRaw);
    if (!pct) return;
    for (let i = 0; i <= 6; i++) {
      hi[i] -= Math.floor((hi[i] * pct) / 100);
    }
  };

  const L23 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 23);
  if (L23 > 0 && (zok >= 90 || race === 6)) {
    const sub = Math.floor((3 + (4 / 100) * input.baseLv) * L23);
    for (let i = 0; i <= 6; i++) hi[i] -= sub;
  }

  const L355 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 355);
  if (L355 > 0) {
    const sub = Math.floor((input.baseLv + snap.totalStats.luk + snap.totalStats.dex) / 2);
    for (let i = 0; i <= 6; i++) hi[i] -= sub;
  }

  if (equipNumSearch(input.equipment, 957, effectiveJobId) > 0) {
    applyPct(30);
  }

  const tok60 = Math.floor(snap.tok60to69Additive[0] ?? 0);
  applyPct(tok60);

  const L58 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 58);
  if (L58 > 0) {
    applyPct(6 * L58);
  }

  const eq = input.equipment;
  applyPct(stTokEquipApprox(eq, 50 + race, effectiveJobId, input));
  applyPct(stTokEquipApprox(eq, 190 + size, effectiveJobId, input));

  if (n19 === 0) {
    applyPct(stTokEquipApprox(eq, 79, effectiveJobId, input));
  }

  if (n20 !== 0) {
    applyPct(stTokEquipApprox(eq, 78, effectiveJobId, input));
    const L165 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 165);
    if (L165 > 0) {
      applyPct(5 + 15 * L165);
    }
  }

  if (n19 === 1) {
    applyPct(stTokEquipApprox(eq, 77, effectiveJobId, input));
  }

  applyPct(stTokEquipApprox(eq, 3000 + mobId, effectiveJobId, input));

  for (let i = 0; i <= 6; i++) {
    if (hi[i] < 1) hi[i] = 1;
  }

  if (input.buffSupport.kyrieLv > 0) {
    for (let i = 0; i <= 6; i++) hi[i] = Math.floor(hi[i] / 2);
  }
  if (input.guildLeader.damageHalf) {
    for (let i = 0; i <= 6; i++) hi[i] = Math.floor(hi[i] / 2);
  }

  hi[0] = Math.floor(hi[0]);
  hi[6] = Math.floor(hi[6]);

  let sum = 0;
  for (let i = 0; i <= 6; i++) sum += hi[i];
  const avgCore = Math.round(sum / 7);
  const minRoll = hi[0];
  const maxRoll = hi[6];

  let w = avgCore;
  w = Math.round((w * (100 - nLucky)) / 100);

  let wFlee = snap.flee + 20 - Math.floor(Number(nB[26]) || 0);
  if (wFlee > 95) wFlee = 95;
  else if (wFlee < 5) wFlee = 5;
  w = Math.round((w * (100 - wFlee)) / 100);

  const L157 = Math.min(
    10,
    Math.max(0, passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 157)),
  );
  w = Math.round((w * W_AG_157[L157]) / 100);

  const L255 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 255);
  if (input.weaponType === 3 && L255 > 0) {
    w = Math.round((w * (80 - L255 * 3)) / 100);
  }

  const L287 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 287);
  if (L287 > 0) {
    w = Math.round((w * (100 - L287 * 7.5)) / 100);
  }

  return { avgCore, minRoll, maxRoll, avgAfterFleeLuck: Math.max(0, w) };
}
