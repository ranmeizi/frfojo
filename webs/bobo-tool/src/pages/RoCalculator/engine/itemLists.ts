import { ITEM_MAX } from "./itemObject.generated";
import {
  getItemRow,
  itemDisplayName,
  itemJobReq,
  itemKind,
  itemSortKey,
} from "./itemAccessors";
import { jobCanEquipItem } from "./jobEquipAllowed";

export type ItemOption = { id: number; label: string };

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

export function weaponItemOptions(
  effectiveJobId: number,
  isTensei: boolean,
  weaponType: number,
): ItemOption[] {
  if (weaponType === 0) {
    return [{ id: 0, label: itemDisplayName(0) }];
  }
  const ids = collectByKind(weaponType, effectiveJobId, isTensei);
  return ids.map((id) => ({ id, label: itemDisplayName(id) }));
}

export function armorItemOptions(
  effectiveJobId: number,
  isTensei: boolean,
  armorKind: number,
): ItemOption[] {
  const ids = collectByKind(armorKind, effectiveJobId, isTensei);
  const opts = ids.map((id) => ({ id, label: itemDisplayName(id) }));
  return [{ id: 0, label: "（无）" }, ...opts];
}
