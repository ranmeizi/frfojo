import { legacyEquipIds } from "./equipmentSetBonus";
import { isNitouActive } from "./nitouSupport";
import type { EquipmentState } from "./types";

/** 与 `refer/foot.js` `EquipNumSearch` 一致：已穿 `n_A_Equip[0..20]` 中 itemId 出现次数（本计算器仅建 0～10 槽） */
export function equipNumSearch(
  eq: EquipmentState,
  itemId: number,
  effectiveJobId?: number,
): number {
  if (itemId <= 0) return 0;
  return legacyEquipIds(eq, effectiveJobId).filter((id) => id === itemId).length;
}

/** 与 `refer/foot.js` `CardNumSearch` 一致：已装卡片槽中 cardId 张数（含二刀 `n_A_card[4..7]`） */
export function cardNumSearch(
  eq: EquipmentState,
  cardId: number,
  effectiveJobId?: number,
): number {
  if (cardId <= 0) return 0;
  const nitou = isNitouActive(eq, effectiveJobId);
  const ids = [
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
  return ids.filter((id) => id === cardId).length;
}
