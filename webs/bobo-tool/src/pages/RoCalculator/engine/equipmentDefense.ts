import type { EquipmentState } from "./types";
import { itemAtkOrDef } from "./itemAccessors";

/** 防具与饰品槽位 [3] 之和（对应 legacy n_A_Equip[2..10]） */
export function sumArmorSlotDef(eq: EquipmentState): number {
  return (
    itemAtkOrDef(eq.head1Id) +
    itemAtkOrDef(eq.head2Id) +
    itemAtkOrDef(eq.head3Id) +
    itemAtkOrDef(eq.leftId) +
    itemAtkOrDef(eq.bodyId) +
    itemAtkOrDef(eq.shoulderId) +
    itemAtkOrDef(eq.shoesId) +
    itemAtkOrDef(eq.acc1Id) +
    itemAtkOrDef(eq.acc2Id)
  );
}

/** 参与精炼 DEF 加成的部位（legacy A_HEAD_DEF_PLUS 等） */
export function sumDefPlus(eq: EquipmentState): number {
  return (
    eq.head1Refine +
    eq.bodyRefine +
    eq.leftRefine +
    eq.shoulderRefine +
    eq.shoesRefine +
    eq.head3Refine
  );
}

/** 未计 n_tok[18] / 卡片 / 技能；与裸技能时 legacy 主公式一致 */
export function computeHardDefTotal(eq: EquipmentState): number {
  const fromItems = sumArmorSlotDef(eq);
  const plus = sumDefPlus(eq);
  return fromItems + Math.floor((plus * 7) / 10);
}
