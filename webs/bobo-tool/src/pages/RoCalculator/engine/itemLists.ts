import { ITEM_MAX } from "./itemObject.generated";
import {
  getItemRow,
  itemDisplayName,
  itemJobReq,
  itemKind,
  itemSortKey,
} from "./itemAccessors";
import { jobCanEquipItem } from "./jobEquipAllowed";
import { customEquipVirtualItemId, listCustomEquipsForKind } from "./customEquipmentRegistry";

export type ItemOption = { id: number; label: string; customEquipId?: string };

function mergeItemOptionsWithCustomEquips(
  base: ItemOption[],
  kind: number,
  weapon2Kinds?: readonly number[],
): ItemOption[] {
  const customs = listCustomEquipsForKind(kind, weapon2Kinds);
  if (!customs.length) return base;
  const extra: ItemOption[] = customs.map((r) => ({
    id: customEquipVirtualItemId(r.id),
    label: `【自定义】${r.name}`,
    customEquipId: r.id,
  }));
  if (base.length === 0) return extra;
  return [base[0], ...extra, ...base.slice(1)];
}

/** 与 legacy sort(work) 相同：按 ItemOBJ[id][9] 升序 */
function sortItemIds(ids: number[]): number[] {
  return [...ids].sort((a, b) => {
    const ka = itemSortKey(a);
    const kb = itemSortKey(b);
    if (ka < kb) return -1;
    if (ka > kb) return 1;
    return a - b;
  });
}

function collectByKind(
  kind: number,
  effectiveJobId: number,
  isTensei: boolean,
): number[] {
  const out: number[] = [];
  for (let i = 0; i <= ITEM_MAX; i++) {
    const row = getItemRow(i);
    if (!row) continue;
    if (itemKind(i) !== kind) continue;
    if (!jobCanEquipItem(effectiveJobId, isTensei, itemJobReq(i))) continue;
    out.push(i);
  }
  return sortItemIds(out);
}

function weaponItemOptionsCore(
  effectiveJobId: number,
  isTensei: boolean,
  weaponType: number,
): ItemOption[] {
  if (weaponType === 0) {
    return [{ id: 0, label: itemDisplayName(0) }];
  }
  const ids = collectByKind(weaponType, effectiveJobId, isTensei);
  const opts = ids.map((id) => ({ id, label: itemDisplayName(id) }));
  return [{ id: 0, label: itemDisplayName(0) }, ...opts];
}

export function weaponItemOptions(
  effectiveJobId: number,
  isTensei: boolean,
  weaponType: number,
): ItemOption[] {
  const base = weaponItemOptionsCore(effectiveJobId, isTensei, weaponType);
  if (weaponType === 0) return base;
  return mergeItemOptionsWithCustomEquips(base, weaponType);
}

/**
 * 原版刺客二刀副手可选手种类：短剑 1、单手剑 2、单手斧 6（`refer/head.js` `A_Weapon2Type`）。
 */
export function dualWieldWeapon2ItemOptions(
  effectiveJobId: number,
  isTensei: boolean,
): ItemOption[] {
  const set = new Set<number>();
  for (const wt of [1, 2, 6] as const) {
    for (const o of weaponItemOptionsCore(effectiveJobId, isTensei, wt)) {
      if (o.id > 0) set.add(o.id);
    }
  }
  const ids = sortItemIds([...set]);
  const base = [{ id: 0, label: itemDisplayName(0) }, ...ids.map((id) => ({ id, label: itemDisplayName(id) }))];
  return mergeItemOptionsWithCustomEquips(base, 0, [1, 2, 6]);
}

export function armorItemOptions(
  effectiveJobId: number,
  isTensei: boolean,
  armorKind: number,
): ItemOption[] {
  const ids = collectByKind(armorKind, effectiveJobId, isTensei);
  const opts = ids.map((id) => ({ id, label: itemDisplayName(id) }));
  const base = [{ id: 0, label: "（无）" }, ...opts];
  return mergeItemOptionsWithCustomEquips(base, armorKind);
}
