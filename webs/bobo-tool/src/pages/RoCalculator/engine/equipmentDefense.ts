import { passiveLevelBySkillId } from "./passiveSkillLevel";
import { isNitouActive } from "./nitouSupport";
import type { CharacterBaseInput, EquipmentState } from "./types";
import { itemAtkOrDef } from "./itemAccessors";

/** 防具与饰品槽位 [3] 之和（对应 legacy n_A_Equip[2..10]） */
export function sumArmorSlotDef(eq: EquipmentState, effectiveJobId?: number): number {
  const nitou = isNitouActive(eq, effectiveJobId);
  return (
    itemAtkOrDef(eq.head1Id) +
    itemAtkOrDef(eq.head2Id) +
    itemAtkOrDef(eq.head3Id) +
    (nitou ? 0 : itemAtkOrDef(eq.leftId)) +
    itemAtkOrDef(eq.bodyId) +
    itemAtkOrDef(eq.shoulderId) +
    itemAtkOrDef(eq.shoesId) +
    itemAtkOrDef(eq.acc1Id) +
    itemAtkOrDef(eq.acc2Id)
  );
}

/** 参与精炼 DEF 加成的部位（legacy A_HEAD_DEF_PLUS 等） */
export function sumDefPlus(eq: EquipmentState, effectiveJobId?: number): number {
  const nitou = isNitouActive(eq, effectiveJobId);
  return (
    eq.head1Refine +
    eq.bodyRefine +
    (nitou ? 0 : eq.leftRefine) +
    eq.shoulderRefine +
    eq.shoesRefine +
    eq.head3Refine
  );
}

/** 未计 n_tok[18] / 卡片 / 技能；与裸技能时 legacy 主公式一致 */
export function computeHardDefTotal(eq: EquipmentState, effectiveJobId?: number): number {
  const fromItems = sumArmorSlotDef(eq, effectiveJobId);
  const plus = sumDefPlus(eq, effectiveJobId);
  return fromItems + Math.floor((plus * 7) / 10);
}

/** `StAllCalc` 中对 `n_A_totalDEF` 的 `SkillSearch(256/196/258)`（foot.js 约 781–789） */
export function applyLegacyTotalDefSkillModifiers(
  totalDef: number,
  input: CharacterBaseInput,
): number {
  const L256 = passiveLevelBySkillId(
    input.formJobId,
    input.passiveSkillLevels,
    256,
  );
  let d = totalDef;
  if (L256 > 0) d = Math.floor(d * (1 - 0.05 * L256));
  if (passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 196) > 0)
    d = 90;
  if (passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, 258) > 0)
    d = 0;
  return d;
}
