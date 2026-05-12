import { EQUIPMENT_SET_DEFINITIONS } from "./equipmentSetData";
import { getItemRow } from "./itemAccessors";
import { sixStatsFromItemScriptCodes } from "./itemScriptSixStats";
import { isNitouActive } from "./nitouSupport";
import type { EquipmentState, SixStats } from "./types";

/** 与 refer foot.js `n_A_Equip[0..10]` 一致：主手、副手、三头、左手、身、披肩、鞋、饰品×2 */
export function legacyEquipIds(
  eq: EquipmentState,
  effectiveJobId?: number,
): number[] {
  const nitou = isNitouActive(eq, effectiveJobId);
  return [
    eq.weaponId,
    nitou ? eq.weapon2Id : 0,
    eq.head1Id,
    eq.head2Id,
    eq.head3Id,
    nitou ? 0 : eq.leftId,
    eq.bodyId,
    eq.shoulderId,
    eq.shoesId,
    eq.acc1Id,
    eq.acc2Id,
  ];
}

/**
 * 与 refer `SetEquip()` 单行逻辑一致：依次确认 w_SE[k][1]、[2]… 各件均在 `n_A_Equip[0..10]` 中出现
 *（含「同 id 占两格」时仍可能匹配同一槽，与原版循环一致）。
 */
function legacySetEquipRowMatches(
  nAEquip0to10: readonly number[],
  pieces: readonly number[],
): boolean {
  if (pieces.length === 0) return false;
  let w_ch = 0;
  for (let j = 0; j < pieces.length; j++) {
    const lj = j + 1;
    if (!(w_ch === 1 || (w_ch === 0 && lj === 1))) break;
    w_ch = 0;
    const target = pieces[j];
    for (let i = 0; i <= 10 && w_ch === 0; i++) {
      if (nAEquip0to10[i] === target) w_ch = 1;
    }
  }
  return w_ch === 1;
}

/** 等同 refer `SetEquip()` 写入 `n_A_Equip[11..]` 的虚拟道具 id 列表（可重复，与原版一致） */
export function activeSetBonusItemIds(
  eq: EquipmentState,
  effectiveJobId?: number,
): number[] {
  const worn = legacyEquipIds(eq, effectiveJobId);
  const out: number[] = [];
  for (const def of EQUIPMENT_SET_DEFINITIONS) {
    if (legacySetEquipRowMatches(worn, def.requiredItemIds)) {
      out.push(def.bonusItemId);
    }
  }
  return out;
}

/** ItemOBJ 尾部 `(code,value)` 从列 11 起直到 `code === 0`，等同 StPlusCalc2 单件 */
export function sumItemScriptStPlus(itemId: number, statCode: number): number {
  if (itemId <= 0 || itemId === 736) return 0;
  const row = getItemRow(itemId);
  if (!row) return 0;
  let sum = 0;
  for (let j = 11; j + 1 < row.length; j += 2) {
    const code = row[j];
    if (code === 0 || code === "NULL") break;
    const value = row[j + 1];
    if (typeof code !== "number" || typeof value !== "number") continue;
    if (code === statCode) sum += value;
  }
  return sum;
}

/** 所有当前激活套装虚拟行上，某 stat code 的合计 */
export function sumSetBonusStPlus(
  eq: EquipmentState,
  statCode: number,
  effectiveJobId?: number,
): number {
  let w = 0;
  for (const id of activeSetBonusItemIds(eq, effectiveJobId)) {
    w += sumItemScriptStPlus(id, statCode);
  }
  return w;
}

/** 套装对六维：code 1～6、7，以及 refer 212～215（与 foot.js StPlusCalc 一致） */
export function setSixStatDelta(eq: EquipmentState, effectiveJobId?: number): SixStats {
  const ids = activeSetBonusItemIds(eq, effectiveJobId);
  const sum = (code: number) => {
    let t = 0;
    for (const id of ids) t += sumItemScriptStPlus(id, code);
    return t;
  };
  return sixStatsFromItemScriptCodes(sum);
}

export function setWeaponAtkFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumSetBonusStPlus(eq, 17, effectiveJobId);
}

export function setHardDefFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumSetBonusStPlus(eq, 18, effectiveJobId);
}

export function setMdefFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumSetBonusStPlus(eq, 19, effectiveJobId);
}

export function setHitFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumSetBonusStPlus(eq, 8, effectiveJobId);
}

export function setFleeFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumSetBonusStPlus(eq, 9, effectiveJobId);
}

export function setCritFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumSetBonusStPlus(eq, 10, effectiveJobId);
}

/** 已穿各槽 ItemOBJ 尾部脚本（列 11+）对某 stat code 之和，等同 legacy 各槽 `StPlusCalc2` 平铺；不含卡片与套装虚拟行 */
export function sumWornEquipItemScriptStPlus(
  eq: EquipmentState,
  statCode: number,
  effectiveJobId?: number,
): number {
  let w = 0;
  for (const id of legacyEquipIds(eq, effectiveJobId)) w += sumItemScriptStPlus(id, statCode);
  return w;
}

/** 已穿装备脚本对六维：含 212～215（与 `setSixStatDelta` 一致） */
export function wornEquipSixStatDelta(eq: EquipmentState, effectiveJobId?: number): SixStats {
  return sixStatsFromItemScriptCodes((code) =>
    sumWornEquipItemScriptStPlus(eq, code, effectiveJobId),
  );
}

/** 等同 `StPlusCalc2(1–7,213,214)` 段，不含 212/215（在心灵% 之后再单独加） */
export function wornEquipSixStatDeltaExcluding212215(
  eq: EquipmentState,
  effectiveJobId?: number,
): SixStats {
  return sixStatsFromItemScriptCodes((code) => {
    if (code === 212 || code === 215) return 0;
    return sumWornEquipItemScriptStPlus(eq, code, effectiveJobId);
  });
}

/** 仅 `StPlusCalc2(212)` / `(215)` 行对 AGI/DEX 的追加 */
export function wornEquipSixStatDelta212215Only(
  eq: EquipmentState,
  effectiveJobId?: number,
): SixStats {
  return {
    str: 0,
    agi: sumWornEquipItemScriptStPlus(eq, 212, effectiveJobId),
    vit: 0,
    int: 0,
    dex: sumWornEquipItemScriptStPlus(eq, 215, effectiveJobId),
    luk: 0,
  };
}

export function wornWeaponAtkFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumWornEquipItemScriptStPlus(eq, 17, effectiveJobId);
}

export function wornHardDefFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumWornEquipItemScriptStPlus(eq, 18, effectiveJobId);
}

export function wornMdefFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumWornEquipItemScriptStPlus(eq, 19, effectiveJobId);
}

export function wornHitFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumWornEquipItemScriptStPlus(eq, 8, effectiveJobId);
}

export function wornFleeFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumWornEquipItemScriptStPlus(eq, 9, effectiveJobId);
}

export function wornCritFlat(eq: EquipmentState, effectiveJobId?: number): number {
  return sumWornEquipItemScriptStPlus(eq, 10, effectiveJobId);
}
