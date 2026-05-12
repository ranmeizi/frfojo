/**
 * 【新功能】已穿自定义装备：从全局库汇总为一段 `PlayerManualEditsState`，供快照与手动表合并。
 */
import { customEquipmentMap, collectReferencedCustomEquipIds } from "./customEquipmentRegistry";
import { addPlayerManualEdits, defaultPlayerManualEdits } from "./playerManualEdits";
import type { EquipmentState, PlayerManualEditsState } from "./types";

export function aggregateCustomEquippedBonuses(eq: EquipmentState): PlayerManualEditsState {
  const m = customEquipmentMap();
  let acc = defaultPlayerManualEdits();
  for (const id of collectReferencedCustomEquipIds(eq)) {
    const r = m.get(id);
    if (r) acc = addPlayerManualEdits(acc, r.bonuses);
  }
  return acc;
}
