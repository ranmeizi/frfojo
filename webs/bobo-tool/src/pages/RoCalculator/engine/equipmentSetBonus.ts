import { EQUIPMENT_SET_DEFINITIONS } from "./equipmentSetData";
import { getItemRow } from "./itemAccessors";
import { addSix } from "./jobBoardBonus";
import { sixStatsFromItemScriptCodes } from "./itemScriptSixStats";
import { isNitouActive } from "./nitouSupport";
import type { EquipmentState, SixStats } from "./types";

/**
 * 与 refer `foot.js` **`n_A_Equip[0..10]`**（约 **169～181**）一致：
 * **0** 主手、**1** 副手（二刀）、**2～4** 三头、**5** 左手、**6** 身、**7** 披肩、**8** 鞋、**9～10** 饰品 1/2。
 *
 * **注意**：roratorio 源码里 **`StPlusCalc2`**（`foot.js` **1806～1817**）对 **0～20** 槽一起扫，饰品 **9、10** 的 **code 2/5/7…** 会进 **`SkillSearch(42)`** 前的 **`wSPC_*`**。
 * 本工具在 **`computeEffectiveSixStats`** 中把 **9～10** 与「自定义饰品六维」放在心神 **%** **之后**再加（见 **`wornAccessoryEquipSlotsSixStatDeltaExcluding212215`**），**与 refer literal 不同**，按需求避免饰品吃心神 **%**。
 */
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

/**
 * 套装虚拟行对六维，**不含** script **212/215**（与 `wornEquipSixStatDeltaExcluding212215` 同理）。
 * `foot.js` **`StPlusCalc`**：心神凝聚 **%** 只对 **`StPlusCalc2(2|5)`** 等与 **`n_A_*` 同批之和**；**212/215** 在 **`SkillSearch(42)`** 之后再 **`+=`**（约 **1602～1603**）。
 */
export function setSixStatDeltaExcluding212215(
  eq: EquipmentState,
  effectiveJobId?: number,
): SixStats {
  const ids = activeSetBonusItemIds(eq, effectiveJobId);
  const sum = (code: number) => {
    let t = 0;
    for (const id of ids) t += sumItemScriptStPlus(id, code);
    return t;
  };
  return sixStatsFromItemScriptCodes((code) => {
    if (code === 212 || code === 215) return 0;
    return sum(code);
  });
}

/** 套装虚拟行上仅 **212（AGI）/215（DEX）**，在心灵 **%** 之后与已穿 **212/215** 同顺位相加。 */
export function setSixStatDelta212215Only(
  eq: EquipmentState,
  effectiveJobId?: number,
): SixStats {
  const ids = activeSetBonusItemIds(eq, effectiveJobId);
  let agi212 = 0;
  let dex215 = 0;
  for (const id of ids) {
    agi212 += sumItemScriptStPlus(id, 212);
    dex215 += sumItemScriptStPlus(id, 215);
  }
  return { str: 0, agi: agi212, vit: 0, int: 0, dex: dex215, luk: 0 };
}

/** 套装对六维全量（分解面板等）；**`computeEffectiveSixStats`** 须用 **`setSixStatDeltaExcluding212215` + `setSixStatDelta212215Only`** 分在心神 **%** 两侧。 */
export function setSixStatDelta(eq: EquipmentState, effectiveJobId?: number): SixStats {
  return addSix(
    setSixStatDeltaExcluding212215(eq, effectiveJobId),
    setSixStatDelta212215Only(eq, effectiveJobId),
  );
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

/** 已穿 **`legacyEquipIds[slotFrom..slotTo]`** 各槽 ItemOBJ 脚本对某 stat code 之和（含空 id 视为 0）。 */
export function sumWornEquipItemScriptStPlusSlotInclusiveRange(
  eq: EquipmentState,
  statCode: number,
  effectiveJobId: number | undefined,
  slotFrom: number,
  slotTo: number,
): number {
  const ids = legacyEquipIds(eq, effectiveJobId);
  let w = 0;
  const lo = Math.max(0, Math.floor(slotFrom));
  const hi = Math.min(ids.length - 1, Math.floor(slotTo));
  for (let i = lo; i <= hi; i++) w += sumItemScriptStPlus(ids[i], statCode);
  return w;
}

/** 已穿各槽 ItemOBJ 尾部脚本（列 11+）对某 stat code 之和，等同 legacy 各槽 `StPlusCalc2` 平铺；不含卡片与套装虚拟行 */
export function sumWornEquipItemScriptStPlus(
  eq: EquipmentState,
  statCode: number,
  effectiveJobId?: number,
): number {
  return sumWornEquipItemScriptStPlusSlotInclusiveRange(
    eq,
    statCode,
    effectiveJobId,
    0,
    legacyEquipIds(eq, effectiveJobId).length - 1,
  );
}

/** 已穿装备脚本对六维：含 212～215（与 `setSixStatDelta` 一致） */
export function wornEquipSixStatDelta(eq: EquipmentState, effectiveJobId?: number): SixStats {
  return sixStatsFromItemScriptCodes((code) =>
    sumWornEquipItemScriptStPlus(eq, code, effectiveJobId),
  );
}

/**
 * 等同 **`StPlusCalc2(1–7,213,214)`** 中 **仅主装备槽 `n_A_Equip[0..8]`**（本数组下标 **0～8**），**不含**饰品 **9～10**。
 * 饰品脚本见 **`wornAccessoryEquipSlotsSixStatDeltaExcluding212215`**（在心神 **%** 之后加）。
 */
export function wornEquipSixStatDeltaExcluding212215(
  eq: EquipmentState,
  effectiveJobId?: number,
): SixStats {
  return sixStatsFromItemScriptCodes((code) => {
    if (code === 212 || code === 215) return 0;
    return sumWornEquipItemScriptStPlusSlotInclusiveRange(eq, code, effectiveJobId, 0, 8);
  });
}

/** 仅饰品 1/2（`legacyEquipIds` **9～10**）上 **code 1～7、213、214**（**不含 212/215**），在心神 **%** 之后与 **`wornEquipSixStatDelta212215Only`** 同顺位前叠加。 */
export function wornAccessoryEquipSlotsSixStatDeltaExcluding212215(
  eq: EquipmentState,
  effectiveJobId?: number,
): SixStats {
  return sixStatsFromItemScriptCodes((code) => {
    if (code === 212 || code === 215) return 0;
    return sumWornEquipItemScriptStPlusSlotInclusiveRange(eq, code, effectiveJobId, 9, 10);
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
