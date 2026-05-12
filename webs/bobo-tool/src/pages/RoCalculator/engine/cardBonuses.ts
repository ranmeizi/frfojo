import { CARD_STAT_TABLE, CARD_STAT_TABLE_MAX_ID } from "./cardStats.generated";
import { isNitouActive } from "./nitouSupport";
import { sixStatsFromItemScriptCodes } from "./itemScriptSixStats";
import type { EquipmentState, SixStats } from "./types";

/**
 * 与 foot.js `StPlusCard` 相同的槽顺序：主手卡 0～3、`n_Nitou` 时副手卡 4～7、
 * 头上下、左手、身体、披肩、鞋、饰品×2。
 */
function equippedCardIds(eq: EquipmentState, effectiveJobId?: number): number[] {
  const nitou = isNitouActive(eq, effectiveJobId);
  return [
    eq.weaponCard1,
    eq.weaponCard2,
    eq.weaponCard3,
    eq.weaponCard4,
    ...(nitou
      ? [eq.weapon2Card1, eq.weapon2Card2, eq.weapon2Card3, eq.weapon2Card4]
      : [0, 0, 0, 0]),
    eq.head1Card,
    eq.head2Card,
    eq.leftCard,
    eq.bodyCard,
    eq.shoulderCard,
    eq.shoesCard,
    eq.acc1Card,
    eq.acc2Card,
  ];
}

/** 等同 `StPlusCard(nSTP2)`：所有已装卡片上 stat code 与 `nSTP2` 一致的 value 之和 */
export function sumCardStPlus(
  eq: EquipmentState,
  statCode: number,
  effectiveJobId?: number,
): number {
  let w = 0;
  for (const id of equippedCardIds(eq, effectiveJobId)) {
    if (id <= 0 || id > CARD_STAT_TABLE_MAX_ID) continue;
    const row = CARD_STAT_TABLE[id];
    if (!row?.length) continue;
    for (const p of row) {
      if (p.code === statCode) w += p.value;
    }
  }
  return w;
}

/** 卡片对六维：code 1～6、7 与 refer 212～215（与 foot.js StPlusCalc + StPlusCard 一致） */
export function cardSixStatDelta(eq: EquipmentState, effectiveJobId?: number): SixStats {
  return sixStatsFromItemScriptCodes((code) => sumCardStPlus(eq, code, effectiveJobId));
}

/** 仅副手武器卡槽 **4～7**：`statCode` 之和（二刀 `n_Nitou` 时） */
export function sumCardStPlusWeapon2Slots(
  eq: EquipmentState,
  statCode: number,
  effectiveJobId?: number,
): number {
  if (!isNitouActive(eq, effectiveJobId)) return 0;
  let w = 0;
  for (const id of [eq.weapon2Card1, eq.weapon2Card2, eq.weapon2Card3, eq.weapon2Card4]) {
    if (id <= 0 || id > CARD_STAT_TABLE_MAX_ID) continue;
    const row = CARD_STAT_TABLE[id];
    if (!row?.length) continue;
    for (const p of row) {
      if (p.code === statCode) w += p.value;
    }
  }
  return w;
}

/** 仅卡片：ATK 类 code 17（与 n_tok[17] 中的卡片部分同源） */
export function cardWeaponAtkFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumCardStPlus(eq, 17, effectiveJobId);
}

/** 仅卡片：DEF code 18、MDEF code 19（与 n_tok[18]/[19] 的卡片部分同源） */
export function cardHardDefFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumCardStPlus(eq, 18, effectiveJobId);
}

export function cardMdefFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumCardStPlus(eq, 19, effectiveJobId);
}

export function cardHitFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumCardStPlus(eq, 8, effectiveJobId);
}

export function cardFleeFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumCardStPlus(eq, 9, effectiveJobId);
}

export function cardCritFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumCardStPlus(eq, 10, effectiveJobId);
}
