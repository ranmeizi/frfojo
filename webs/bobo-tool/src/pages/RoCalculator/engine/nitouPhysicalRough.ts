import { battleCalc4PhysicalApprox } from "./battleCalc4PhysicalApprox";
import { tPlusDamCutTaijinZero, type BaiCIPhysicalCtx } from "./baiCIPhysical";
import { cardScriptFirstCode, sumCardStPlusWeapon2Slots } from "./cardBonuses";
import { CARD_STAT_TABLE, CARD_STAT_TABLE_MAX_ID } from "./cardStats.generated";
import { itemAtkOrDef, itemScriptFirstValueForCode, itemWeaponLevel } from "./itemAccessors";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import { zokuseiDamageMultiplier } from "./zokuseiDamageTable";
import type { CharacterBaseInput, EquipmentState } from "./types";
import { weaponRefineFlatAtk, weaponRefineVariance } from "./weaponRefine";

/** 副手卡 **slot1** 在 `card.js` 首字段 **201～204** 时赋予武器属性（`foot.js` **227～228** 子集） */
function weapon2ZokuseiFromCard4(eq: EquipmentState): number | null {
  const c = eq.weapon2Card1;
  if (!(c > 0 && c <= CARD_STAT_TABLE_MAX_ID)) return null;
  const row = CARD_STAT_TABLE[c];
  const code0 = row?.[0]?.code;
  if (typeof code0 !== "number") return null;
  if (code0 >= 201 && code0 <= 204) return code0 - 200;
  return null;
}

/** 与 `foot.js` **`n_A_Weapon2_zokusei`** 可迁子集：ItemOBJ **code20** 或卡首字段 **201～204**，否则跟主手属性下标 */
export function resolveWeapon2ZokuseiIndex(
  eq: EquipmentState,
  mainHandWeaponZokuseiIndex: number,
): number {
  const wid = eq.weapon2Id;
  if (wid <= 0) return mainHandWeaponZokuseiIndex;
  const fromItem = itemScriptFirstValueForCode(wid, 20);
  if (fromItem != null) {
    return Math.max(0, Math.min(9, Math.floor(fromItem)));
  }
  const fromCard = weapon2ZokuseiFromCard4(eq);
  if (fromCard != null) return Math.max(0, Math.min(9, fromCard));
  return mainHandWeaponZokuseiIndex;
}

/** `head.js` **259～270**：槽 **4～6** 三连 **卡 id 106** → **40**；否则 **4～6** 按 **`cardOBJ[0].code==106`** 各 **+5**；槽 **7** 仅 **`n_A_card[7]==106`** → **+10** */
function weapon2Slot106Bonus(eq: EquipmentState): number {
  const a = eq.weapon2Card1;
  const b = eq.weapon2Card2;
  const c = eq.weapon2Card3;
  const d = eq.weapon2Card4;
  if (a === 106 && b === 106 && c === 106) {
    let s = 40;
    if (d === 106) s += 10;
    return s;
  }
  let s = 0;
  for (const id of [a, b, c]) {
    if (cardScriptFirstCode(id) === 106) s += 5;
  }
  if (d === 106) s += 10;
  return s;
}

function battleCalc4NitouLeft(
  wAtkAfterBai: number,
  monsterHardDefPercent: number,
  softDefIndex: 0 | 1 | 2,
  def2: readonly [number, number, number],
  seirenWeapon2: number,
  input: CharacterBaseInput,
  effectiveJobId: number,
  legacyNB: readonly number[],
): number {
  return battleCalc4PhysicalApprox({
    nAdmg: wAtkAfterBai,
    seirenAtk: seirenWeapon2,
    monsterHardDefPercent,
    softDefSubtract: def2[softDefIndex],
    softDefIdx: softDefIndex,
    def2Triplet: def2,
    input,
    effectiveJobId,
    legacyNB,
  });
}

export type NitouLeftRoughTriplet = {
  /** 对应 `head.js` **`w_left_Minatk`**（已 **`tPlusDamCutTaijinZero`**；副手槽 **code17** 仅入左段） */
  wLeftMin: number;
  wLeftMax: number;
  wLeftAve: number;
};

/**
 * `head.js` **`n_Nitou`** 分支 **`w_left_*`**（约 **247～291**）可迁子集：
 * 共用 **`n_A_ATK`**（此处 **`nAAtk`**）、**`wCSize`**、**`wImp`**、**`wbairitu`**（**`atkBai01PercentApprox`**）；副手精炼与 **`ItemOBJ`** ATK；**`zokusei`** 用副手属性下标；**106** 星加段对齐 **`259～270`**（三连 id **106** / 首 script **code106** / 第 **4** 槽 id **106**）；**`SkillSearch(80)`** 二刀倍率；副手卡 **code17** 平铺；**`BattleCalc4(...,_,1)`** 用 **`n_A_Weapon2LV_seirenATK`**（见 **`battleCalc4PhysicalApprox`**）；**`tPlusDamCutTaijinZero`** 顺序对齐 **`287～291`**（**`w_left_Aveatk`** 为 **`cut((Max+Min)/2)`**）。
 */
export function computeNitouLeftRoughTriplet(p: {
  input: CharacterBaseInput;
  eq: EquipmentState;
  effectiveJobId: number;
  baiCtx: BaiCIPhysicalCtx;
  nAAtk: number;
  dex: number;
  monsterHardDef: number;
  def2: readonly [number, number, number];
  monsterElementCode: number;
  mainHandWeaponZokuseiIndex: number;
  wCSize: number;
  wImp: number;
  atkBai01PercentApprox: number;
}): NitouLeftRoughTriplet | null {
  const { input, eq, nAAtk, dex, monsterHardDef, def2, monsterElementCode, wCSize, wImp, baiCtx } = p;
  if (eq.weapon2Id <= 0) return null;

  const w2CardAtk = sumCardStPlusWeapon2Slots(eq, 17, p.effectiveJobId);

  const w2Lv = Math.max(1, Math.min(4, itemWeaponLevel(eq.weapon2Id)));
  const w2Atk = itemAtkOrDef(eq.weapon2Id);
  const seiren2 = weaponRefineFlatAtk(w2Lv, eq.weapon2Refine);
  const v2 = weaponRefineVariance(w2Lv, eq.weapon2Refine);
  const minPlus2 = Math.max(0, v2.min);
  const maxPlus2 = Math.max(0, v2.max);

  const workDex2 = Math.floor(dex * (1 + (w2Lv - 1) * 0.2));
  const w2Z = resolveWeapon2ZokuseiIndex(eq, p.mainHandWeaponZokuseiIndex);
  const z2 = zokuseiDamageMultiplier(monsterElementCode, w2Z);

  const wStar = weapon2Slot106Bonus(eq);
  const L80 = passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 80);
  const scaleMax = (3 + L80) / 10;
  const scaleMin = 0.3 + L80 / 10;

  const bai = Math.max(0, p.atkBai01PercentApprox) / 100;

  let wMax =
    nAAtk +
    w2CardAtk +
    maxPlus2 +
    (workDex2 >= w2Atk
      ? Math.floor((w2Atk + wImp) * wCSize)
      : Math.floor((w2Atk - 1 + wImp) * wCSize));
  wMax = battleCalc4NitouLeft(
    wMax * bai,
    monsterHardDef,
    2,
    def2,
    seiren2,
    input,
    p.effectiveJobId,
    baiCtx.legacyNB,
  );
  if (wMax < 1) wMax = 1;
  wMax = Math.floor(wMax * z2);
  wMax += wStar;
  wMax = Math.floor(wMax * scaleMax);

  let workDexForMin = workDex2;
  if (workDexForMin > w2Atk) workDexForMin = w2Atk;
  let wMin =
    nAAtk + w2CardAtk + minPlus2 + Math.floor((workDexForMin + wImp) * wCSize);
  wMin = battleCalc4NitouLeft(
    wMin * bai,
    monsterHardDef,
    0,
    def2,
    seiren2,
    input,
    p.effectiveJobId,
    baiCtx.legacyNB,
  );
  if (wMin < 1) wMin = 1;
  wMin = Math.floor(wMin * z2);
  wMin += wStar;
  wMin = Math.floor(wMin * scaleMin);

  /** `head.js` **287～291**：先 **`(Max+Min)/2`** 再分别 **`tPlusDamCut`**，与 **`⌊(cut(Max)+cut(Min))/2⌋`** 不同 */
  const wAveRaw = (wMax + wMin) / 2;
  wMax = Math.floor(tPlusDamCutTaijinZero(wMax, baiCtx));
  wMin = Math.floor(tPlusDamCutTaijinZero(wMin, baiCtx));
  const wAve = Math.floor(tPlusDamCutTaijinZero(wAveRaw, baiCtx));

  return { wLeftMin: wMin, wLeftMax: wMax, wLeftAve: wAve };
}
