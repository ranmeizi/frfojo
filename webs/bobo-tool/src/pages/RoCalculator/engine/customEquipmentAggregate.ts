/**
 * 【新功能】已穿自定义装备：从全局库汇总为一段 `PlayerManualEditsState`，供快照与手动表合并。
 */
import { customEquipmentMap, collectReferencedCustomEquipIds } from "./customEquipmentRegistry";
import { addPlayerManualEdits, defaultPlayerManualEdits } from "./playerManualEdits";
import type { EquipmentState, PlayerManualEditsState, SixStats } from "./types";

export function aggregateCustomEquippedBonuses(eq: EquipmentState): PlayerManualEditsState {
  const m = customEquipmentMap();
  let acc = defaultPlayerManualEdits();
  for (const id of collectReferencedCustomEquipIds(eq)) {
    const r = m.get(id);
    if (r) acc = addPlayerManualEdits(acc, r.bonuses);
  }
  return acc;
}

/** 仅饰品 1/2 槽引用的自定义装备（与 `n_A_Equip[9][10]` 同源） */
export function aggregateCustomEquippedBonusesAccSlotsOnly(
  eq: EquipmentState,
): PlayerManualEditsState {
  const m = customEquipmentMap();
  let acc = defaultPlayerManualEdits();
  for (const id of [eq.acc1CustomEquipId, eq.acc2CustomEquipId] as const) {
    if (typeof id !== "string" || id.length < 1) continue;
    const r = m.get(id);
    if (r) acc = addPlayerManualEdits(acc, r.bonuses);
  }
  return acc;
}

/** 自定义饰品槽六维平铺；在 **`computeEffectiveSixStats`** 中心神 **%** **之后**与 **`wornAccessoryEquipSlotsSixStatDeltaExcluding212215`** 同顺位合并 */
export function customAccessorySlotSixFlat(eq: EquipmentState): SixStats {
  const p = aggregateCustomEquippedBonusesAccSlotsOnly(eq);
  return {
    str: p.str,
    agi: p.agi,
    vit: p.vit,
    int: p.int,
    dex: p.dex,
    luk: p.luk,
  };
}
