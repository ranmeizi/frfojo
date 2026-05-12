import { sumCardStPlus } from "./cardBonuses";
import { cardNumSearch, equipNumSearch } from "./equipCardCount";
import {
  sumSetBonusStPlus,
  sumWornEquipItemScriptStPlus,
} from "./equipmentSetBonus";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import type { CharacterBaseInput, EquipmentState } from "./types";

/** 卡 + 套装虚拟行 + 已穿装备 ItemOBJ 尾部 script 对某 `statCode` 之和（近似 `StPlusCalc2`+`StPlusCard` 装备段） */
export function stTokEquipApprox(
  eq: EquipmentState,
  statCode: number,
  effectiveJobId: number,
): number {
  return (
    sumCardStPlus(eq, statCode, effectiveJobId) +
    sumSetBonusStPlus(eq, statCode, effectiveJobId) +
    sumWornEquipItemScriptStPlus(eq, statCode, effectiveJobId)
  );
}

export type BaiCIPhysicalCtx = {
  input: CharacterBaseInput;
  effectiveJobId: number;
  /** `buildLegacyNBFromMonsterIndex` 输出 */
  legacyNB: readonly number[];
  weaponType: number;
  /** 普攻在 `BattleCalc999` 中与 `n_Enekyori==1` 同条件（弓 10、枪 17～21） */
  rangedLike: boolean;
  /** 原版 `n_A_Weapon_zokusei`（弹药/拳刃等属性下标） */
  weaponZokuseiIndex: number;
  /**
   * 原版 `TyouEnkakuSousa3dan`；普攻无六合拳时为 0，六合拳演算中途为 -1。
   * 本预览固定 0。
   */
  tyouEnkakuSousa3dan: number;
};

function mul100Floor(w: number, plus: number): number {
  return Math.floor((w * (100 + plus)) / 100);
}

type BaiCIPhysicalMode = "normal" | "crit";

/**
 * `refer/head.js` `BaiCI` 的 **PvE（Taijin=0）可迁子集**：
 * - 假定 **`wBCEDPch==0` 且 `not_use_card==0`**（与普攻预览一致）。
 * - **`n_tok[k]`** 以 **`stTokEquipApprox(..., k)`** 近似（缺被动/其它写入 `n_tok` 的来源）。
 * - **`mode:"crit"`**：在 **`n_tok[80]/[26]`** 之后乘 **`n_tok[70]`**（对齐 **`wCriTyuu==1`** 且主动 **≠272/401**）；普攻预览用于 **BC3 暴伤支**。
 * - **`tPlusDamCut`**：仅 Taijin=0 时 `foot` **4605～4628** 子集（`wBTw1` 视为 0；`wLAch` 视为 0）。
 * - **未接** 4262～4296 中大量 **`EquipNumSearch` / `CardNumSearch` / 主动条件**（仅 `639`+`Tyou==-1` 等极少项）。
 */
function applyBaiCIPhysicalCore(
  wIn: number,
  ctx: BaiCIPhysicalCtx,
  mode: BaiCIPhysicalMode,
): number {
  const { input, effectiveJobId, legacyNB: nB } = ctx;
  const eq = input.equipment;
  const fj = input.formJobId;
  const passive = input.passiveSkillLevels;
  const activeId = input.activeSkillId;
  const activeLv = input.activeSkillLv;

  let w = Math.floor(wIn);
  if (!(w > 0)) return w;

  const race = Math.floor(Number(nB[2]) || 0);
  const elem = Math.floor(Number(nB[3]) || 0);
  const size = Math.floor(Number(nB[4]) || 0);
  const mobId = Math.floor(Number(nB[0]) || 0);
  const mobHp = Math.floor(Number(nB[6]) || 0);
  const bossFlag = Math.floor(Number(nB[19]) || 0);

  const tokRace = stTokEquipApprox(eq, 30 + race, effectiveJobId);
  w = mul100Floor(w, tokRace);

  const tokElemDecade = stTokEquipApprox(eq, 40 + Math.floor(elem / 10), effectiveJobId);
  w = mul100Floor(w, tokElemDecade);

  const tokSize = stTokEquipApprox(eq, 27 + size, effectiveJobId);
  w = mul100Floor(w, tokSize);

  if (ctx.rangedLike && ctx.tyouEnkakuSousa3dan !== -1) {
    const tok25 = stTokEquipApprox(eq, 25, effectiveJobId);
    w = mul100Floor(w, tok25);
  }

  let w1 = stTokEquipApprox(eq, 80, effectiveJobId);
  if (bossFlag === 1) w1 += stTokEquipApprox(eq, 26, effectiveJobId);
  w = mul100Floor(w, w1);

  if (
    mode === "crit" &&
    activeId !== 272 &&
    activeId !== 401
  ) {
    w = mul100Floor(w, stTokEquipApprox(eq, 70, effectiveJobId));
  }

  if (108 <= mobId && mobId <= 115) w = mul100Floor(w, stTokEquipApprox(eq, 81, effectiveJobId));
  else if (mobId === 319) w = mul100Floor(w, stTokEquipApprox(eq, 81, effectiveJobId));

  if (116 <= mobId && mobId <= 120) w = mul100Floor(w, stTokEquipApprox(eq, 82, effectiveJobId));

  if ((49 <= mobId && mobId <= 52) || mobId === 55 || mobId === 221) {
    w = mul100Floor(w, stTokEquipApprox(eq, 83, effectiveJobId));
  }

  if (mobId === 106 || mobId === 152 || mobId === 308 || mobId === 32) {
    w = mul100Floor(w, stTokEquipApprox(eq, 84, effectiveJobId));
  }

  const tokMob = stTokEquipApprox(eq, 1000 + mobId, effectiveJobId);
  w = mul100Floor(w, tokMob);

  const L258 = passiveLevelBySkillId(fj, passive, 258);
  if (L258) w *= 2;

  const L266 = passiveLevelBySkillId(fj, passive, 266);
  if (L266) w = Math.floor((w * (150 + 50 * L266)) / 100);

  if (activeId === 86 && elem >= 50 && elem < 60) {
    w = mul100Floor(w, 30 * activeLv);
  }

  if (ctx.weaponType === 11) {
    const L262 = passiveLevelBySkillId(fj, passive, 262);
    if (L262) w = mul100Floor(w, 110 + 2 * L262);
  }

  const baseLv = input.baseLv;
  const { str, dex, luk } = input.stats;
  w1 = 0;
  const L352 = passiveLevelBySkillId(fj, passive, 352);
  const L353 = passiveLevelBySkillId(fj, passive, 353);
  const L354 = passiveLevelBySkillId(fj, passive, 354);
  const L365 = passiveLevelBySkillId(fj, passive, 365);

  const div354 = Math.max(1, 12 - L354 * 3);
  const div352 = Math.max(1, 12 - L352 * 3);
  const div353 = Math.max(1, 12 - L353 * 3);

  if (L354 && L365) {
    w1 += (baseLv + str + luk + dex) / div354;
  } else if (L354 && size === 2 && mobHp >= 17392) {
    w1 += (baseLv + str + luk + dex) / div354;
  } else if (L352 && size === 0) {
    w1 += (baseLv + luk + dex) / div352;
  } else if (L353 && size === 1 && mobHp >= 5218) {
    w1 += (baseLv + luk + dex) / div353;
  }

  w = mul100Floor(w, w1);

  w = Math.floor(tPlusDamCutTaijinZero(w, ctx));

  w1 = baiCIActiveTailBonusPercent(input, effectiveJobId);
  if (ctx.tyouEnkakuSousa3dan === -1 && equipNumSearch(eq, 639, effectiveJobId)) {
    w1 += 15;
  }

  const tailScript = stTokEquipApprox(eq, 5000 + activeId, effectiveJobId);
  w = Math.floor((w * (100 + tailScript + w1)) / 100);

  return Math.max(1, w);
}

/** 非爆击 `BattleCalc` 线：不含 **`n_tok[70]`**。 */
export function applyBaiCIPhysicalPreview(wIn: number, ctx: BaiCIPhysicalCtx): number {
  return applyBaiCIPhysicalCore(wIn, ctx, "normal");
}

/** 爆击 `BattleCalc(...,10)` 线：含 **`n_tok[70]`**（主动 272/401 除外，与原版一致）。 */
export function applyBaiCIPhysicalCritPreview(wIn: number, ctx: BaiCIPhysicalCtx): number {
  return applyBaiCIPhysicalCore(wIn, ctx, "crit");
}

/**
 * `head.js` **`wBCEDPch==1`** 时 `BaiCI`：跳过 **`n_tok` 大卡段**（4175～4258），从 **`tPlusDamCut`** 起与尾 **`5000+skill`** 一致（约 **4260～4298**）。
 * 供 `BattleCalcEDP` 内层 `BattleCalc` 链使用。
 */
export function applyBaiCIPhysicalEdpCh1Preview(wIn: number, ctx: BaiCIPhysicalCtx): number {
  const { input, effectiveJobId } = ctx;
  const eq = input.equipment;
  let w = Math.floor(wIn);
  if (!(w > 0)) return w;
  w = Math.floor(tPlusDamCutTaijinZero(w, ctx));
  let w1 = baiCIActiveTailBonusPercent(input, effectiveJobId, { wBCEDPch1: true });
  if (ctx.tyouEnkakuSousa3dan === -1 && equipNumSearch(eq, 639, effectiveJobId)) {
    w1 += 15;
  }
  const tailScript = stTokEquipApprox(eq, 5000 + input.activeSkillId, effectiveJobId);
  w = Math.floor((w * (100 + tailScript + w1)) / 100);
  return Math.max(1, w);
}

/** `foot` **4605～4628** 子集（Taijin=0；`wBTw1`/`wLAch` 视为 0），供二刀左段等与主链对齐 */
export function tPlusDamCutTaijinZero(wIn: number, ctx: BaiCIPhysicalCtx): number {
  let wPDC = Math.floor(wIn);
  const ij = ctx.input.enemyCombat.abnormal;
  const kq = ctx.input.enemyCombat.defender;
  const z = ctx.weaponZokuseiIndex;
  const h = ctx.input.holySupport;

  const wBTw1 = 0;
  if (wBTw1 === 0) {
    if (ij[6]) wPDC *= 2;
    if (ij[17] && z === 3) wPDC *= 2;
    const baizok = [110, 114, 117, 119, 120];
    const p60 = h.elementField;
    const p61 = h.slaughterLevel;
    if (p60 === 0 && p61 >= 1 && z === 3) {
      wPDC = Math.floor((wPDC * baizok[p61 - 1]) / 100);
    }
    if (p60 === 1 && p61 >= 1 && z === 1) {
      wPDC = Math.floor((wPDC * baizok[p61 - 1]) / 100);
    }
    if (p60 === 2 && p61 >= 1 && z === 4) {
      wPDC = Math.floor((wPDC * baizok[p61 - 1]) / 100);
    }
  }

  const nEnekyori = ctx.rangedLike ? 1 : 0;

  if (kq[1]) wPDC = Math.floor(wPDC / 2);
  if (kq[7] && nEnekyori !== 2) {
    wPDC -= Math.floor((wPDC * 20 * kq[7]) / 100);
  }
  if (kq[8] && nEnekyori === 2) {
    wPDC -= Math.floor((wPDC * 20 * kq[8]) / 100);
  }

  if (Math.floor(Number(ctx.legacyNB[19]) || 0) === 5) wPDC = 1;

  return wPDC;
}

/** `head.js` `BaiCI` 尾段对主动 **6** 的 `CardNumSearch(362)` 等（供日后主动技链接） */
export function baiCIActiveTailBonusPercent(
  input: CharacterBaseInput,
  effectiveJobId: number,
  opts?: { /** `head.js` `BaiCI` 尾段：`wBCEDPch==1` 时跳过 **83/388+381** 的 +10（约 **4295**） */ wBCEDPch1?: boolean },
): number {
  const eq = input.equipment;
  let w1 = 0;
  const aid = input.activeSkillId;
  const alv = input.activeSkillLv;

  if (aid === 6) {
    if (eq.shoesRefine >= 9 && cardNumSearch(eq, 362, effectiveJobId)) w1 += 10;
  }
  if (aid === 76) {
    const wt = input.weaponType;
    if (wt === 2 || wt === 3) w1 += 25 * cardNumSearch(eq, 464, effectiveJobId);
  }
  if (aid === 41) {
    if (input.weaponType === 10) w1 += 50 * cardNumSearch(eq, 465, effectiveJobId);
  }
  if (aid === 6 || aid === 76) {
    if (alv === 10 && equipNumSearch(eq, 1048, effectiveJobId)) w1 += 50;
  }
  if (aid === 169) w1 += 15;
  if (aid === 40 || aid === 272) {
    if (equipNumSearch(eq, 1044, effectiveJobId)) w1 += 10;
  }
  if (aid === 264) {
    const L81 = passiveLevelBySkillId(
      input.formJobId,
      input.passiveSkillLevels,
      81,
    );
    if (equipNumSearch(eq, 1074, effectiveJobId) && L81 === 10) w1 += 20;
  }
  if (aid === 84) {
    if (equipNumSearch(eq, 1066, effectiveJobId)) w1 += 10;
  }
  if (
    !opts?.wBCEDPch1 &&
    (aid === 83 || aid === 388) &&
    passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 381)
  ) {
    w1 += 10;
  }

  return w1;
}
