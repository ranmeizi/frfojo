import type { EquipmentSetDef } from "./equipmentSetData";
import { EQUIPMENT_SET_DEFINITIONS } from "./equipmentSetData";
import { itemDisplayName } from "./itemAccessors";
import { itemObjScriptEffectLines } from "./itemSetumei";

/**
 * 套装虚拟行（如 #738）在 ItemOBJ 常无可用中文名，用 w_SE 反查成员名拼出可读标题。
 */
export function virtualSetBonusLabel(bonusItemId: number): string {
  if (bonusItemId <= 0) return itemDisplayName(bonusItemId);
  const matches: { def: EquipmentSetDef; setRowIndex: number }[] = [];
  EQUIPMENT_SET_DEFINITIONS.forEach((def, setRowIndex) => {
    if (def.bonusItemId === bonusItemId) matches.push({ def, setRowIndex });
  });
  if (matches.length === 0) return itemDisplayName(bonusItemId);

  const fmtPieces = (def: EquipmentSetDef) =>
    def.requiredItemIds.map((id) => itemDisplayName(id)).join("＋");

  if (matches.length === 1) {
    return `套装加成（${fmtPieces(matches[0].def)}）`;
  }
  const variants = matches.map((m) => fmtPieces(m.def)).join("；或 ");
  return `套装加成（${matches.length} 种组合：${variants}）`;
}

/** 某道具作为 w_SE 成员出现时，对应的套装行（行号 = refer 写入 ItemOBJ 的 code90 值） */
export type ItemSetMembership = {
  setRowIndex: number;
  bonusItemId: number;
  requiredItemIds: readonly number[];
};

export function itemSetMemberships(itemId: number): ItemSetMembership[] {
  if (itemId <= 0) return [];
  const out: ItemSetMembership[] = [];
  EQUIPMENT_SET_DEFINITIONS.forEach((def, setRowIndex) => {
    if (!def.requiredItemIds.includes(itemId)) return;
    out.push({
      setRowIndex,
      bonusItemId: def.bonusItemId,
      requiredItemIds: def.requiredItemIds,
    });
  });
  return out;
}

/**
 * 物品资料等用：静态 ItemOBJ 往往不含运行时注入的 (90, 行号)，此处用 w_SE 反查补全套装说明。
 * 与原版「同组道具同时装备 → 追加 bonus 行」一致；例如三角裤 #288 需与 #699（Ｃ衬衫）同穿，不是棉衬衫 #281。
 */
export function formatSetMembershipLines(itemId: number): string[] {
  const out: string[] = [];
  for (const { bonusItemId, requiredItemIds } of itemSetMemberships(itemId)) {
    const names = requiredItemIds.map((id) => `【${itemDisplayName(id)}】`);
    const bonusLabel = virtualSetBonusLabel(bonusItemId);
    out.push(`【套装】${names.join("＋")} 同穿时：${bonusLabel}`);
    const fx = itemObjScriptEffectLines(bonusItemId);
    if (fx.length > 0) {
      out.push("  激活效果：");
      for (const line of fx) out.push(`  · ${line}`);
    }
  }
  return out;
}
