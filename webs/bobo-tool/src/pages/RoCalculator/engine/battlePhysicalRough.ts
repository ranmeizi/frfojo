import type {
  BattlePhysicalRoughPreview,
  CharacterBaseInput,
  SixStats,
} from "./types";
import { battleCalc2ZeroMissApprox } from "./battleCalc2ZeroMiss";
import {
  battleCalc3ExpectedApprox,
  battleCalc3leftApprox,
  clampBattleCritPercent,
  legacyCritRateVsMonster,
  normalizeHitForBattleCalc3,
} from "./battleCalc3Approx";
import { legacyNBSoftDefTriplet } from "./buildLegacyNB";
import { computeLegacyMonsterFlee27 } from "./legacyMonsterFlee27";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import { resolveRangedAmmo } from "./rangedAmmoResolve";
import { weaponSizeMultiplier } from "./weaponSizeTable";
import { zokuseiDamageMultiplier } from "./zokuseiDamageTable";
import {
  applyBaiCIPhysicalCritPreview,
  applyBaiCIPhysicalEdpCh1Preview,
  applyBaiCIPhysicalPreview,
  type BaiCIPhysicalCtx,
} from "./baiCIPhysical";
import { battleCalc4PhysicalApprox } from "./battleCalc4PhysicalApprox";
import { battleCalc2ApproxNoBaiCI } from "./battleCalc2Approx";
import { isNitouActive } from "./nitouSupport";
import { sumCardStPlusWeapon2Slots } from "./cardBonuses";
import { computeNitouLeftRoughTriplet } from "./nitouPhysicalRough";
import { statAtkPortion } from "./statAtkPortion";
import {
  clampActiveSkillSubIndex,
  kunaiWeaponZokuseiFromSubIndex,
} from "./ninjaAmmoTables";
import {
  ACTIVE_IDS_BATTLE_CALC_EDP_ALWAYS_ZERO,
  edpDmgTripletApplyHead4443,
} from "./edpDmgHead4443";
import {
  isPhysicalRoughTripletPreviewSupported,
  physicalRoughPreviewUnsupportedReason,
} from "./physicalRoughPreviewPolicy";

/** `head.js` 3958、3964～3966：`n_A_CriATK[1]` 的 ATK 段（弓追加 `⌊箭ATK·wCSize⌋`；枪/榴弹不追加）。 */
function criNdmg1FromHead3958(p: {
  nAAtk: number;
  minPlus: number;
  maxPlus: number;
  W: number;
  wImp: number;
  wCSize: number;
  weaponType: number;
  rangedAmmo: { atk: number } | null;
}): number {
  const { nAAtk, minPlus, maxPlus, W, wImp, wCSize, weaponType, rangedAmmo } = p;
  let v = nAAtk + (minPlus + maxPlus) / 2 + Math.floor((W + wImp) * wCSize);
  if (Math.floor(weaponType) === 10 && rangedAmmo) {
    v += Math.floor(rangedAmmo.atk * wCSize);
  }
  return v;
}

type NADmgMode = { kind: "melee" } | { kind: "ranged"; ammoAtk: number };

/** `head.js` 3908–3953：`n_A_DMG[0/1/2]`（弓/枪/榴弹与 `ArrowOBJ` 同源公式段） */
function buildNADmgTriplet(p: {
  W: number;
  wCSize: number;
  wImp: number;
  workDex: number;
  nAAtk: number;
  minPlus: number;
  maxPlus: number;
  mode: NADmgMode;
}): [number, number, number] {
  const { W, wCSize, wImp, workDex, nAAtk, minPlus, maxPlus, mode } = p;
  const isRanged = mode.kind === "ranged";
  const ammoAtk = mode.kind === "ranged" ? mode.ammoAtk : 0;
  const ammoTerm = isRanged ? Math.floor((ammoAtk - 1) * wCSize) : 0;

  let n2: number;
  if (workDex >= W) {
    n2 = nAAtk + maxPlus + Math.floor((W + wImp) * wCSize);
  } else {
    n2 = nAAtk + maxPlus + Math.floor((W - 1 + wImp) * wCSize);
  }
  if (isRanged) {
    n2 += ammoTerm;
    let w1 =
      nAAtk +
      maxPlus +
      Math.floor(((W * W) / 100) * wCSize) +
      Math.floor(wImp * wCSize);
    let w2 =
      nAAtk +
      maxPlus +
      Math.floor(((W * workDex) / 100) * wCSize) +
      Math.floor(wImp * wCSize);
    const wAmmo = Math.floor((ammoAtk - 1) * wCSize);
    w1 += wAmmo;
    w2 += wAmmo;
    if (w1 > w2) w1 = w2;
    if (n2 < w1) n2 = w1;
  }

  let n0: number;
  if (isRanged) {
    n0 = nAAtk + minPlus + Math.floor(((W * W) / 100 + wImp) * wCSize);
    const wAlt = nAAtk + minPlus + Math.floor(((W * workDex) / 100 + wImp) * wCSize);
    if (n0 > wAlt) n0 = wAlt;
  } else if (workDex >= W) {
    n0 = nAAtk + minPlus + Math.floor((W + wImp) * wCSize);
  } else {
    n0 = nAAtk + minPlus + Math.floor((workDex + wImp) * wCSize);
  }

  const n1 = (n0 + n2) / 2;
  return [n0, n1, n2];
}

function battleCalcStub(
  nAdmg: number,
  seirenAtk: number,
  monsterElementCode: number,
  weaponZokuseiIndex: number,
  monsterHardDefPercent: number,
  softDefSubtract: number,
  softDefIdx: 0 | 1 | 2,
  def2Triplet: readonly [number, number, number],
  weaponBonus: BattleWeaponBonusCtx,
  input: CharacterBaseInput,
): number {
  let w = battleCalc4PhysicalApprox({
    nAdmg,
    seirenAtk,
    monsterHardDefPercent,
    softDefSubtract,
    softDefIdx,
    def2Triplet,
    input,
    effectiveJobId: weaponBonus.effectiveJobId,
    legacyNB: weaponBonus.legacyNB,
  });
  if (w < 1) w = 1;
  w = battleWeaponFlatBonusesAfterSeirenHead4035(w, weaponBonus);
  w = battleCalc2ApproxNoBaiCI({
    input,
    w999Start: w,
    monsterElementCode,
    weaponZokuseiIndex,
    weaponType: weaponBonus.weaponType,
    legacyNB: weaponBonus.legacyNB,
    matkDamageLineIdx: softDefIdx,
    matkMin: weaponBonus.matkMin,
    matkMax: weaponBonus.matkMax,
  });
  return Math.floor(w);
}

/** `BattleCalcEDP` 内层：`wBCEDPch==1` 的 **`BattleCalc`**（BC4→4035～4068→`BattleCalc2`→`BaiCI` 尾段）。 */
function battleCalcEdpInnerLine(
  nAdmgAfterBai: number,
  seirenAtk: number,
  monsterHardDefPercent: number,
  softDefSubtract: number,
  softDefIdx: 0 | 1 | 2,
  def2Triplet: readonly [number, number, number],
  monsterElementCode: number,
  weaponZokuseiIndex: number,
  weaponBonus: BattleWeaponBonusCtx,
  input: CharacterBaseInput,
  baiCtx: BaiCIPhysicalCtx,
): number {
  let w = battleCalc4PhysicalApprox({
    nAdmg: nAdmgAfterBai,
    seirenAtk,
    monsterHardDefPercent,
    softDefSubtract,
    softDefIdx,
    def2Triplet,
    input,
    effectiveJobId: weaponBonus.effectiveJobId,
    legacyNB: weaponBonus.legacyNB,
  });
  if (w < 1) w = 1;
  w = battleWeaponFlatBonusesAfterSeirenHead4035(w, weaponBonus);
  w = battleCalc2ApproxNoBaiCI({
    input,
    w999Start: w,
    monsterElementCode,
    weaponZokuseiIndex,
    weaponType: weaponBonus.weaponType,
    wBCEDPch1: true,
    legacyNB: weaponBonus.legacyNB,
    matkDamageLineIdx: softDefIdx,
    matkMin: weaponBonus.matkMin,
    matkMax: weaponBonus.matkMax,
  });
  w = applyBaiCIPhysicalEdpCh1Preview(w, baiCtx);
  const aid = Math.floor(Number(input.activeSkillId) || 0);
  if (aid === 423) {
    w = Math.floor(w * zokuseiDamageMultiplier(monsterElementCode, 8));
  } else if (aid === 437) {
    w = Math.floor(w * zokuseiDamageMultiplier(monsterElementCode, 0));
  } else if (aid === 394) {
    w = Math.floor(w * zokuseiDamageMultiplier(monsterElementCode, 0));
  } else if (aid === 395) {
    w = Math.floor(w * zokuseiDamageMultiplier(monsterElementCode, 0) * 3);
  }
  return w;
}

function computeEdpDmgTripletApprox(p: {
  d0: number;
  d1: number;
  d2: number;
  seiren: number;
  monsterHardDef: number;
  def2: [number, number, number];
  monsterElementCode: number;
  weaponZokuseiIndex: number;
  weaponBonusCtx: BattleWeaponBonusCtx;
  input: CharacterBaseInput;
  baiCtx: BaiCIPhysicalCtx;
  /** `zokusei[n_B[3]][n_A_Weapon_zokusei]`，对齐 `EDP_DMG` 零段条件 */
  elementMultiplierWeapon: number;
}): [number, number, number] {
  const {
    d0,
    d1,
    d2,
    seiren,
    monsterHardDef,
    def2,
    monsterElementCode,
    weaponZokuseiIndex,
    weaponBonusCtx,
    input,
    baiCtx,
    elementMultiplierWeapon,
  } = p;
  const fj = input.formJobId;
  const passive = input.passiveSkillLevels;
  const aid = Math.floor(Number(input.activeSkillId) || 0);
  if (ACTIVE_IDS_BATTLE_CALC_EDP_ALWAYS_ZERO.has(aid)) return [0, 0, 0];
  const L266 = passiveLevelBySkillId(fj, passive, 266);
  const sb = input.buffSupport.soulBreakerEdp;
  if (!L266 && !sb) return [0, 0, 0];
  if (elementMultiplierWeapon <= 0) return [0, 0, 0];
  if (isEdpAllZeroByHead4444(input, monsterElementCode)) return [0, 0, 0];

  const zPoison = zokuseiDamageMultiplier(monsterElementCode, 5);
  const zShadow = zokuseiDamageMultiplier(monsterElementCode, 3);

  const slot = (di: number, idx: 0 | 1 | 2) => {
    const inner = battleCalcEdpInnerLine(
      di,
      seiren,
      monsterHardDef,
      def2[idx],
      idx,
      def2,
      monsterElementCode,
      weaponZokuseiIndex,
      weaponBonusCtx,
      input,
      baiCtx,
    );
    let s = 0;
    if (L266) s += Math.floor((inner * zPoison) / 4);
    if (sb) s += Math.floor((inner * zShadow) / 5);
    return s;
  };

  return [slot(d0, 0), slot(d1, 1), slot(d2, 2)];
}

/** `head.js` **`EDP_DMG`**：若干主动 + 魔物属性格下整段 EDP 为 0（约 **4445～4448**）。 */
function isEdpAllZeroByHead4444(input: CharacterBaseInput, monsterElementCode: number): boolean {
  const aid = Math.floor(Number(input.activeSkillId) || 0);
  const elem = Math.floor(monsterElementCode);
  if (aid === 17 && elem >= 52 && elem <= 59) return true;
  if (
    (aid === 66 || aid === 193 || aid === 197 || aid === 321) &&
    elem >= 83 &&
    elem <= 89
  ) {
    return true;
  }
  return false;
}

/** `head.js` **`BattleCalc2` 末尾**：主动 **169** 弓减半、二刀 **79**；主动 **423/437** 在 **`BaiCI`** 后对 **`zokusei[n_B[3]][8]`/`[0]`** 乘段（`4160～4163`）；主动 **394/395** 在 **`BattleCalc`** 展示链上对整段再 **`×zokusei[n_B[3]][0]`**，**395** 另 **`×3`**（`1288～1321`）。 */
function postBattleCalc2TailAfterBaiCI4145(
  w: number,
  input: CharacterBaseInput,
  weaponType: number,
  monsterElementCode: number,
): number {
  let o = Math.floor(w);
  if (input.activeSkillId === 169 && Math.floor(weaponType) === 10) {
    o = Math.floor(o / 2);
  }
  if (
    input.equipment.dualWield &&
    input.activeSkillId === 0 &&
    Math.floor(weaponType) !== 0
  ) {
    const L79 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 79);
    o = Math.floor((o * (50 + L79 * 10)) / 100);
  }
  const aid = Math.floor(Number(input.activeSkillId) || 0);
  if (aid === 423) {
    o = Math.floor(o * zokuseiDamageMultiplier(monsterElementCode, 8));
  } else if (aid === 437) {
    o = Math.floor(o * zokuseiDamageMultiplier(monsterElementCode, 0));
  } else if (aid === 394) {
    o = Math.floor(o * zokuseiDamageMultiplier(monsterElementCode, 0));
  } else if (aid === 395) {
    o = Math.floor(o * zokuseiDamageMultiplier(monsterElementCode, 0) * 3);
  }
  return o;
}

function katarSkill13Rate(L13: number): number {
  return 0.01 + L13 * 0.02;
}

/** `head.js` **367～370**：展示用 **`w_KATARU`** / **`w_Ave_KATARU`**（`w_DMG+EDP_DMG` 与仅 `w_DMG[1]`）。 */
function katarDisplayBonusFromHead367(physPlusEdp: number, weaponType: number, L13: number): number {
  if (Math.floor(weaponType) !== 11) return 0;
  return Math.floor(physPlusEdp * katarSkill13Rate(L13));
}

/** `head.js` **3993～4000**：拳刃在 **`n_A_CriATK += EDP_DMG`** 之后再乘 **`SkillSearch(13)`**。 */
function katarCritLineAfterEdpHead3996(
  criAfterBai: number,
  edp: number,
  weaponType: number,
  L13: number,
): number {
  if (Math.floor(weaponType) !== 11) return criAfterBai + edp;
  const r = katarSkill13Rate(L13);
  const core = criAfterBai + edp;
  return core + Math.floor(core * r);
}

/** `head.js` `BattleCalc` 在 **`w_2==10`** 之后、`BattleCalc2` 之前的武器/魔物条件平铺（约 4035～4068）。 */
type BattleWeaponBonusCtx = {
  effectiveJobId: number;
  formJobId: number;
  passiveLevels: readonly number[];
  weaponType: number;
  weaponLevel: number;
  legacyNB: readonly number[];
  baseLv: number;
  strStat: number;
  /** `n_A_PassSkill3[10]`（`performanceDance.lv10`） */
  passSkill3Skill10: number;
  /** 面板 MATK min/max（主动 **423** 在 `BattleCalc2`） */
  matkMin: number;
  matkMax: number;
};

function battleWeaponFlatBonusesAfterSeirenHead4035(
  wIn: number,
  ctx: BattleWeaponBonusCtx,
): number {
  let w_atk = Math.floor(wIn);
  const wt = Math.floor(ctx.weaponType);
  const fj = ctx.formJobId;
  const pl = ctx.passiveLevels;
  const nB = ctx.legacyNB;
  const race = Math.floor(Number(nB[2]) || 0);
  const elem = Math.floor(Number(nB[3]) || 0);
  const wLv = Math.max(1, Math.min(4, Math.floor(ctx.weaponLevel) || 1));

  if (wt === 1 || wt === 2) w_atk += 4 * passiveLevelBySkillId(fj, pl, 3);
  else if (wt === 3) w_atk += 4 * passiveLevelBySkillId(fj, pl, 4);
  else if (wt === 4 || wt === 5) {
    const L78 = passiveLevelBySkillId(fj, pl, 78);
    const mult = L78 === 0 ? 4 : 5;
    w_atk += mult * passiveLevelBySkillId(fj, pl, 69);
  } else if (wt === 11) w_atk += 3 * passiveLevelBySkillId(fj, pl, 81);
  else if (wt === 8) w_atk += 3 * passiveLevelBySkillId(fj, pl, 89);
  else if (wt === 13 || wt === 0) w_atk += 3 * passiveLevelBySkillId(fj, pl, 183);
  else if (wt === 14) w_atk += 3 * passiveLevelBySkillId(fj, pl, 198);
  else if (wt === 15) w_atk += 3 * passiveLevelBySkillId(fj, pl, 206);
  else if (wt === 12) w_atk += 3 * passiveLevelBySkillId(fj, pl, 224);
  else if (wt === 6 || wt === 7) w_atk += 3 * passiveLevelBySkillId(fj, pl, 241);

  if (wt === 0 && passiveLevelBySkillId(fj, pl, 329)) {
    w_atk += 10 * passiveLevelBySkillId(fj, pl, 329);
  }

  const p3 = Math.min(5, Math.max(0, Math.floor(ctx.passSkill3Skill10)));
  if (p3 > 0 && wLv === 4) w_atk += 50 + 25 * p3;

  if (race === 6 || (90 <= elem && elem <= 99)) {
    const L24 = passiveLevelBySkillId(fj, pl, 24);
    if (L24) w_atk += Math.floor((3 + (5 / 100) * ctx.baseLv) * L24);
  }
  if (race === 2 || race === 4) {
    w_atk += 4 * passiveLevelBySkillId(fj, pl, 116);
    if (passiveLevelBySkillId(fj, pl, 390)) w_atk += ctx.strStat;
  }

  return w_atk;
}

/** `BattleCalc(...,10)`：`BattleCalc4` 跳过，仅 **`+精炼`** → **`4035～4068`** → **`BattleCalc2`**（含 **423/437** 加段；**423/437** 的 `zokusei` 尾乘在 **`baiPipeCrit` 之后** 于调用处处理）。 */
function battleCalcCritStub(
  nAdmgAfterBai: number,
  seirenAtk: number,
  monsterElementCode: number,
  weaponZokuseiIndex: number,
  wBon: BattleWeaponBonusCtx,
  input: CharacterBaseInput,
): number {
  let w_atk = Math.floor(nAdmgAfterBai + seirenAtk);
  if (w_atk < 1) w_atk = 1;
  w_atk = battleWeaponFlatBonusesAfterSeirenHead4035(w_atk, wBon);
  w_atk = battleCalc2ApproxNoBaiCI({
    input,
    w999Start: w_atk,
    monsterElementCode,
    weaponZokuseiIndex,
    weaponType: wBon.weaponType,
    legacyNB: wBon.legacyNB,
    matkDamageLineIdx: 1,
    matkMin: wBon.matkMin,
    matkMax: wBon.matkMax,
  });
  return Math.floor(w_atk);
}

function hitsToKill(monsterHp: number, dmgPerHit: number): number | null {
  if (monsterHp <= 0) return null;
  if (!(dmgPerHit > 0)) return null;
  return Math.ceil(monsterHp / dmgPerHit);
}

const HINT_TAIL =
  "`n_B[27]` 见 `legacyMonsterFlee27.ts`；**`BattleCalc4`**：`battleCalc4PhysicalApprox.ts`（`n_tok[22/23/180+]`、364、275/432）；`BattleCalc2(0)` 见 `battleCalc2ZeroMiss.ts`；**`BaiCI`**：`baiCIPhysical.ts`；**`BattleCalc2`** 主段：`battleCalc2Approx.ts`（**148/329/416/254/106/423/437/394/395**、**`wBCEDPch1`** 内层）；**BC2 尾**：主动 **169** 弓减半、二刀 **79**；**EDP**：`BattleCalcEDP` 近似（**266** 毒属 `/4`、**PassSkill2[11]**（`soulBreakerEdp`）暗属 `/5`、内层 **`BaiCI` 尾** `applyBaiCIPhysicalEdpCh1Preview`）；**`EDP_DMG` 三档**见 **`edpDmgHead4443.ts`**（**4396** 零段、**4443～4471**）；**BC3**：`w998` 先加 **`w_Ave_KATARU`**（拳刃 **L13**、仅物伤），期望后再 **`+EDP_DMG(1)`**；**二刀**：`nitouPhysicalRough.ts`（**`w_left_*`**、**`259～270`** 星加段、**`287～291`** **`tPlusDamCut`** 顺序；副手 **code17** 仅入左段）；**`BattleCalc3left`**：`battleCalc3Approx.ts`（**`4318～4334`**，**不经 `BaiCI`**（与原版一致）；**`tPlusDamCutTaijinZero`** 在 **`tPlusLucky`** 前）；暴伤支同 **`BattleCalc(10)`** + **`BaiCI`** + **EDP** + 拳刃。`tPlusDamCut` 仅 Taijin=0；**`tPlusLucky`**：`tPlusLucky.ts`；工会减半整体×0.5。其余见 `LEGACY_GAP_SCAN`。";

function emptyPreview(): Omit<
  BattlePhysicalRoughPreview,
  "enabled" | "reasonDisabled" | "hint"
> {
  return {
    weaponZokuseiIndex: 0,
    monsterElementCode: 0,
    elementMultiplier: 1,
    weaponSizeMult: 1,
    dmgMin: 0,
    dmgMax: 0,
    dmgAvg: 0,
    monsterHp: 0,
    hitsToKillMin: null,
    hitsToKillMax: null,
    hitsToKillAvg: null,
    dmgPerSwingExpectedApprox: 0,
    hitsToKillExpectedApprox: null,
    battleHitPercentApprox: 0,
    battleCritPercentApprox: 0,
    enemyFleeForHit27: 0,
    battleCalc2MissDamageApprox: 0,
    enemySoftDefTriplet: [0, 0, 0],
    edpDmgTriplet: [0, 0, 0],
    edpDmgAvgAfterHit: 0,
    nitouLeftRough: null,
  };
}

export function computeBattlePhysicalRoughPreview(
  input: CharacterBaseInput,
  args: {
    effectiveJobId: number;
    weaponType: number;
    totalStats: SixStats;
    weaponLevel: number;
    weaponAtkBase: number;
    weaponRefineBonus: number;
    weaponRefineVarianceMin: number;
    weaponRefineVarianceMax: number;
    weaponAtkCardFlat: number;
    weaponAtkSetFlat: number;
    weaponAtkWornScriptFlat: number;
    weaponAtkSupportFlat: number;
    weaponAtkPerformanceDanceFlat: number;
    weaponAtkHolySlaughterFlat: number;
    atkBai01PercentApprox: number;
    legacyNB: readonly number[];
    activeSkillId: number;
    bowArrowIndex: number;
    /** 面板 HIT 合计（与 `n_A_HIT` 同源段） */
    hitStat: number;
    /** 面板 CRI 合计（与 `n_A_CRI` 同源段） */
    critStat: number;
    /** `head.js` `BattleHighCalc`：`PassSkill5[5]` 高伤乘子（普攻略化整体近似×） */
    passSkill5HighDamageMultiplierApprox: number;
    /** 【新功能】武器 ATK 手动平铺（并入 W） */
    weaponAtkManualFlat?: number;
    /** 面板 MATK（与 `computeMatkWithSupport` 后一致），供主动 **423** */
    matkMin: number;
    matkMax: number;
  },
): BattlePhysicalRoughPreview {
  const disabled = (reason: string): BattlePhysicalRoughPreview => ({
    enabled: false,
    reasonDisabled: reason,
    hint: `未启用。${HINT_TAIL}`,
    ...emptyPreview(),
  });

  const ac = Math.floor(Number(args.activeSkillId) || 0);
  if (!isPhysicalRoughTripletPreviewSupported(ac)) {
    return disabled(physicalRoughPreviewUnsupportedReason(ac));
  }
  if (input.equipment.dualWield && !isNitouActive(input.equipment, args.effectiveJobId)) {
    return disabled("二刀流需刺客/十字刺客且已装备副手武器（等同 `n_Nitou`）");
  }

  const nB = args.legacyNB;
  const monsterElementCode = Math.floor(Number(nB[3]) || 0);
  const monsterSize = Math.floor(Number(nB[4]) || 0);
  const monsterHp = Math.floor(Number(nB[6]) || 0);
  const monsterHardDef = Math.floor(Number(nB[14]) || 0);
  const def2 = legacyNBSoftDefTriplet(nB);

  const wt = args.weaponType;
  const rangedAmmo = resolveRangedAmmo(wt, args.bowArrowIndex);
  const isRanged = rangedAmmo != null;
  const weaponZokuseiIndex = isRanged ? rangedAmmo.zok : 0;
  const previewAc = Math.floor(Number(args.activeSkillId) || 0);
  const skillSubNinja = clampActiveSkillSubIndex(previewAc, input.activeSkillSubIndex);
  const bc2WeaponZokuseiIndex =
    previewAc === 395 ? kunaiWeaponZokuseiFromSubIndex(skillSubNinja) : weaponZokuseiIndex;

  const elementMultiplier = zokuseiDamageMultiplier(
    monsterElementCode,
    bc2WeaponZokuseiIndex,
  );

  const baiCtx = {
    input,
    effectiveJobId: args.effectiveJobId,
    legacyNB: nB,
    weaponType: wt,
    rangedLike: isRanged,
    weaponZokuseiIndex: bc2WeaponZokuseiIndex,
    tyouEnkakuSousa3dan: 0,
  } as const;

  const wCSize = weaponSizeMultiplier(args.weaponType, monsterSize, {
    sizeIgnore: input.buffSupport.weaponSizeIgnore,
    skillSearch78Lv: passiveLevelBySkillId(
      input.formJobId,
      input.passiveSkillLevels,
      78,
    ),
  });

  const wImp = Math.max(0, Math.floor(input.buffSupport.sacrificePoemLv)) * 5;

  const W =
    args.weaponAtkBase +
    args.weaponAtkCardFlat +
    args.weaponAtkSetFlat +
    args.weaponAtkWornScriptFlat +
    args.weaponAtkSupportFlat +
    args.weaponAtkPerformanceDanceFlat +
    args.weaponAtkHolySlaughterFlat +
    (args.weaponAtkManualFlat ?? 0);

  const w2CardAtkStrip = isNitouActive(input.equipment, args.effectiveJobId)
    ? sumCardStPlusWeapon2Slots(input.equipment, 17, args.effectiveJobId)
    : 0;
  const WForNAdmg = Math.max(0, W - w2CardAtkStrip);

  const minPlus = Math.max(0, args.weaponRefineVarianceMin);
  const maxPlus = Math.max(0, args.weaponRefineVarianceMax);
  const wLv = Math.max(1, Math.min(4, Math.floor(args.weaponLevel) || 1));
  const dex = args.totalStats.dex;
  const workDex = Math.floor(dex * (1 + (wLv - 1) * 0.2));

  const nAAtk = statAtkPortion(
    args.totalStats.str,
    dex,
    args.totalStats.luk,
    args.weaponType,
  );

  const mode: NADmgMode = isRanged
    ? { kind: "ranged", ammoAtk: rangedAmmo.atk }
    : { kind: "melee" };

  const [nAdmg0, nAdmg1, nAdmg2] = buildNADmgTriplet({
    W: WForNAdmg,
    wCSize,
    wImp,
    workDex,
    nAAtk,
    minPlus,
    maxPlus,
    mode,
  });

  const bai = Math.max(0, args.atkBai01PercentApprox) / 100;
  const d0 = nAdmg0 * bai;
  const d1 = nAdmg1 * bai;
  const d2 = nAdmg2 * bai;

  const seiren = args.weaponRefineBonus;
  const hiDam = Math.max(0, Math.min(1, args.passSkill5HighDamageMultiplierApprox));

  const baiPipe = (raw: number) => applyBaiCIPhysicalPreview(raw, baiCtx);
  const baiPipeCrit = (raw: number) => applyBaiCIPhysicalCritPreview(raw, baiCtx);

  const weaponBonusCtx: BattleWeaponBonusCtx = {
    effectiveJobId: args.effectiveJobId,
    formJobId: input.formJobId,
    passiveLevels: input.passiveSkillLevels,
    weaponType: wt,
    weaponLevel: wLv,
    legacyNB: nB,
    baseLv: input.baseLv,
    strStat: args.totalStats.str,
    passSkill3Skill10: Math.min(5, Math.max(0, Math.floor(input.performanceDance.lv10))),
    matkMin: args.matkMin,
    matkMax: args.matkMax,
  };

  const dCriRaw = criNdmg1FromHead3958({
    nAAtk,
    minPlus,
    maxPlus,
    W: WForNAdmg,
    wImp,
    wCSize,
    weaponType: wt,
    rangedAmmo: rangedAmmo ? { atk: rangedAmmo.atk } : null,
  });
  const dCri = dCriRaw * bai;

  const monsterLuk = Math.floor(Number(nB[11]) || 0);
  const enemyFleeForHit27 = computeLegacyMonsterFlee27(input.enemyCombat, nB);
  const wHitRaw = args.hitStat + 80 - enemyFleeForHit27;
  const battleHitPercentApprox = normalizeHitForBattleCalc3(wHitRaw);
  const wCriRaw = legacyCritRateVsMonster(args.critStat, monsterLuk);
  const battleCritPercentApprox = clampBattleCritPercent(wCriRaw);
  const L13 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 13);

  const rawPhys0 = battleCalcStub(
    d0,
    seiren,
    monsterElementCode,
    bc2WeaponZokuseiIndex,
    monsterHardDef,
    def2[0],
    0,
    def2,
    weaponBonusCtx,
    input,
  );
  const rawPhys1 = battleCalcStub(
    d1,
    seiren,
    monsterElementCode,
    bc2WeaponZokuseiIndex,
    monsterHardDef,
    def2[1],
    1,
    def2,
    weaponBonusCtx,
    input,
  );
  const rawPhys2 = battleCalcStub(
    d2,
    seiren,
    monsterElementCode,
    bc2WeaponZokuseiIndex,
    monsterHardDef,
    def2[2],
    2,
    def2,
    weaponBonusCtx,
    input,
  );

  const phys0 = postBattleCalc2TailAfterBaiCI4145(baiPipe(rawPhys0), input, wt, monsterElementCode);
  const phys1 = postBattleCalc2TailAfterBaiCI4145(baiPipe(rawPhys1), input, wt, monsterElementCode);
  const phys2 = postBattleCalc2TailAfterBaiCI4145(baiPipe(rawPhys2), input, wt, monsterElementCode);

  /** `head.js` **759～760**：**423** 期望行 = **`w_DMG[1]*w_HIT + BattleCalc2(0)*(100-w_HIT)`**（**`w_MagiclBulet=1`** Miss 段含 **423** MATK 行） */
  let phys1Display = phys1;
  if (previewAc === 423) {
    const rawMiss423 = battleCalcStub(
      0,
      seiren,
      monsterElementCode,
      bc2WeaponZokuseiIndex,
      monsterHardDef,
      def2[1],
      1,
      def2,
      weaponBonusCtx,
      input,
    );
    const miss423 = postBattleCalc2TailAfterBaiCI4145(
      baiPipe(rawMiss423),
      input,
      wt,
      monsterElementCode,
    );
    const hp = battleHitPercentApprox;
    phys1Display = Math.floor((phys1 * hp + miss423 * (100 - hp)) / 100);
  }

  const [e0, e1, e2] = computeEdpDmgTripletApprox({
    d0,
    d1,
    d2,
    seiren,
    monsterHardDef,
    def2,
    monsterElementCode,
    bc2WeaponZokuseiIndex,
    weaponBonusCtx,
    input,
    baiCtx,
    elementMultiplierWeapon: elementMultiplier,
  });

  const [edp0, edp1, edp2] = edpDmgTripletApplyHead4443([e0, e1, e2], wHitRaw, {
    wHitHyoji100: previewAc === 337 || previewAc === 432,
    nPerHitDmgNonZero: previewAc === 394 || previewAc === 395,
  });

  const displayDmgLine = (phys: number, edp: number) =>
    phys + edp + katarDisplayBonusFromHead367(phys + edp, wt, L13);

  let dmgMin = Math.floor(displayDmgLine(phys0, edp0) * hiDam);
  let dmgAvg = Math.floor(displayDmgLine(phys1Display, edp1) * hiDam);
  let dmgMax = Math.floor(displayDmgLine(phys2, edp2) * hiDam);

  let nitouLeftRough: { min: number; avg: number; max: number } | null = null;
  let nitouBc3LeftApprox = 0;
  if (isNitouActive(input.equipment, args.effectiveJobId)) {
    const nL = computeNitouLeftRoughTriplet({
      input,
      eq: input.equipment,
      effectiveJobId: args.effectiveJobId,
      baiCtx,
      nAAtk,
      dex,
      monsterHardDef,
      def2,
      monsterElementCode,
      mainHandWeaponZokuseiIndex: weaponZokuseiIndex,
      wCSize,
      wImp,
      atkBai01PercentApprox: args.atkBai01PercentApprox,
    });
    if (nL) {
      nitouLeftRough = {
        min: Math.floor(nL.wLeftMin * hiDam),
        avg: Math.floor(nL.wLeftAve * hiDam),
        max: Math.floor(nL.wLeftMax * hiDam),
      };
      dmgMin += nitouLeftRough.min;
      dmgAvg += nitouLeftRough.avg;
      dmgMax += nitouLeftRough.max;
      nitouBc3LeftApprox = battleCalc3leftApprox(
        nL.wLeftAve,
        wHitRaw,
        input.equipment,
        args.effectiveJobId,
        { taijin: false, monsterLuk },
        baiCtx,
      );
    }
  }

  const battleCalc2MissDamageApprox = Math.floor(
    baiPipe(
      battleCalc2ZeroMissApprox({
        input,
        monsterElementCode,
        weaponZokuseiIndex: bc2WeaponZokuseiIndex,
        ...(previewAc === 423
          ? {
              legacyNB: nB,
              matkDamageLineIdx: 1 as const,
              matkMin: args.matkMin,
              matkMax: args.matkMax,
            }
          : {}),
      }),
    ) * hiDam,
  );

  let criAfterBai = baiPipeCrit(
    battleCalcCritStub(
      dCri,
      seiren,
      monsterElementCode,
      bc2WeaponZokuseiIndex,
      weaponBonusCtx,
      input,
    ),
  );
  {
    const aid = Math.floor(Number(input.activeSkillId) || 0);
    if (aid === 423) {
      criAfterBai = Math.floor(criAfterBai * zokuseiDamageMultiplier(monsterElementCode, 8));
    } else if (aid === 437) {
      criAfterBai = Math.floor(criAfterBai * zokuseiDamageMultiplier(monsterElementCode, 0));
    } else if (aid === 394) {
      criAfterBai = Math.floor(criAfterBai * zokuseiDamageMultiplier(monsterElementCode, 0));
    } else if (aid === 395) {
      criAfterBai = Math.floor(criAfterBai * zokuseiDamageMultiplier(monsterElementCode, 0) * 3);
    }
  }
  const criAtkApprox = Math.floor(
    katarCritLineAfterEdpHead3996(criAfterBai, edp1, wt, L13) * hiDam,
  );

  const wAveKataru =
    Math.floor(wt) === 11 ? Math.floor(phys1Display * katarSkill13Rate(L13)) : 0;
  const w998ForBc3 = phys1Display + wAveKataru;

  let dmgPerSwingExpectedApprox =
    battleCalc3ExpectedApprox(
      w998ForBc3,
      criAtkApprox,
      wHitRaw,
      wCriRaw,
      battleCalc2MissDamageApprox,
      { taijin: false, monsterLuk },
    ) +
    edp1 +
    nitouBc3LeftApprox;
  let hitsToKillExpectedApprox = hitsToKill(monsterHp, dmgPerSwingExpectedApprox);

  let hkMin = hitsToKill(monsterHp, dmgMax);
  let hkMax = hitsToKill(monsterHp, dmgMin);
  let hkAvg = hitsToKill(monsterHp, dmgAvg);

  /** 【新功能】附加「% 对种族/属性/体型/MVP/任意」物伤乘子（普攻预览整段） */
  const md = args.manualPhysDmgMult ?? 1;
  if (md !== 1) {
    dmgMin = Math.floor(dmgMin * md);
    dmgAvg = Math.floor(dmgAvg * md);
    dmgMax = Math.floor(dmgMax * md);
    dmgPerSwingExpectedApprox = Math.floor(dmgPerSwingExpectedApprox * md);
    hitsToKillExpectedApprox = hitsToKill(monsterHp, dmgPerSwingExpectedApprox);
    hkMin = hitsToKill(monsterHp, dmgMax);
    hkMax = hitsToKill(monsterHp, dmgMin);
    hkAvg = hitsToKill(monsterHp, dmgAvg);
    if (nitouLeftRough) {
      nitouLeftRough = {
        min: Math.floor(nitouLeftRough.min * md),
        avg: Math.floor(nitouLeftRough.avg * md),
        max: Math.floor(nitouLeftRough.max * md),
      };
    }
  }

  const tableHint =
    rangedAmmo == null
      ? "近战等；"
      : rangedAmmo.table === "bow"
        ? `弓「${rangedAmmo.label}」（ArrowOBJ）；`
        : rangedAmmo.table === "bullet"
          ? `枪弹「${rangedAmmo.label}」（BulletOBJ）；`
          : `榴弹「${rangedAmmo.label}」（GrenadeOBJ）；`;
  const hintDef = `BattleCalc4 已扣 n_B_DEF2；**4035～4068**、**BattleCalc2**、**BaiCI**、**169/二刀尾**、**EDP**、拳刃展示已串（仍非 head 全分支）；`;
  const hintBc3 = `BC3 期望一击≈${dmgPerSwingExpectedApprox}（物伤支 w998=${w998ForBc3} + BC3 后再 +EDP≈${edp1}${nitouBc3LeftApprox ? ` +二刀BC3left≈${nitouBc3LeftApprox}` : ""}；n_B[27]=${enemyFleeForHit27} · w_HIT ${battleHitPercentApprox}% · w_Cri ${Math.round(battleCritPercentApprox * 10) / 10}% · 暴伤≈${criAtkApprox} · Miss≈${battleCalc2MissDamageApprox}）；`;
  const hintZok = `属克×${elementMultiplier}（BattleCalc2 用武器属性下标 ${bc2WeaponZokuseiIndex}）；${HINT_TAIL}`;

  return {
    enabled: true,
    hint: `${tableHint}${hintDef}${hintBc3}${hintZok}`,
    weaponZokuseiIndex: bc2WeaponZokuseiIndex,
    monsterElementCode,
    elementMultiplier,
    weaponSizeMult: wCSize,
    dmgMin,
    dmgMax,
    dmgAvg,
    monsterHp,
    hitsToKillMin: hkMin,
    hitsToKillMax: hkMax,
    hitsToKillAvg: hkAvg,
    dmgPerSwingExpectedApprox,
    hitsToKillExpectedApprox,
    battleHitPercentApprox,
    battleCritPercentApprox,
    enemyFleeForHit27,
    battleCalc2MissDamageApprox:
      md !== 1 ? Math.floor(battleCalc2MissDamageApprox * md) : battleCalc2MissDamageApprox,
    enemySoftDefTriplet: def2,
    edpDmgTriplet: [e0, e1, e2],
    edpDmgAvgAfterHit: edp1,
    nitouLeftRough,
    rangedAmmoLabel: rangedAmmo ? rangedAmmo.label : undefined,
  };
}
