import { CARD_STAT_TABLE, CARD_STAT_TABLE_MAX_ID } from "./cardStats.generated";
import type { EquipmentState, SixStats } from "./types";

/**
 * 与 foot.js `StPlusCard` 相同的槽顺序：武器 1～4、双手武器卡 5～8（本计算器未建第二武器，恒 0）、
 * 头上下、左手、身体、披肩、鞋、饰品×2。
 */
function equippedCardIds(eq: EquipmentState): number[] {
  return [
    eq.weaponCard1,
    eq.weaponCard2,
    eq.weaponCard3,
    eq.weaponCard4,
    0,
    0,
    0,
    0,
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
export function sumCardStPlus(eq: EquipmentState, statCode: number): number {
  let w = 0;
  for (const id of equippedCardIds(eq)) {
    if (id <= 0 || id > CARD_STAT_TABLE_MAX_ID) continue;
    const row = CARD_STAT_TABLE[id];
    if (!row?.length) continue;
    for (const p of row) {
      if (p.code === statCode) w += p.value;
    }
  }
  return w;
}

/** 卡片对六维的平铺加成：code 1～6 + code 7 加到六项（与 foot.js wSPCall 一致） */
export function cardSixStatDelta(eq: EquipmentState): SixStats {
  const c7 = sumCardStPlus(eq, 7);
  return {
    str: sumCardStPlus(eq, 1) + c7,
    agi: sumCardStPlus(eq, 2) + c7,
    vit: sumCardStPlus(eq, 3) + c7,
    int: sumCardStPlus(eq, 4) + c7,
    dex: sumCardStPlus(eq, 5) + c7,
    luk: sumCardStPlus(eq, 6) + c7,
  };
}

/** 仅卡片：ATK 类 code 17（与 n_tok[17] 中的卡片部分同源） */
export function cardWeaponAtkFlat(eq: EquipmentState): number {
  return sumCardStPlus(eq, 17);
}

/** 仅卡片：DEF code 18、MDEF code 19（与 n_tok[18]/[19] 的卡片部分同源） */
export function cardHardDefFlat(eq: EquipmentState): number {
  return sumCardStPlus(eq, 18);
}

export function cardMdefFlat(eq: EquipmentState): number {
  return sumCardStPlus(eq, 19);
}

export function cardHitFlat(eq: EquipmentState): number {
  return sumCardStPlus(eq, 8);
}

export function cardFleeFlat(eq: EquipmentState): number {
  return sumCardStPlus(eq, 9);
}

export function cardCritFlat(eq: EquipmentState): number {
  return sumCardStPlus(eq, 10);
}
