import { ITEM_OBJ } from "./itemObject.generated";

export type ItemRow = readonly (string | number)[];

export function getItemRow(id: number): ItemRow | undefined {
  return ITEM_OBJ[id] as ItemRow | undefined;
}

/** ItemOBJ[i][1] 类别：武器为 0–21，防具 50–52,60–64 等 */
export function itemKind(id: number): number {
  const v = getItemRow(id)?.[1];
  return typeof v === "number" ? v : 0;
}

export function itemJobReq(id: number): number {
  const v = getItemRow(id)?.[2];
  return typeof v === "number" ? v : 0;
}

/** 面板 ATK 或防具 DEF */
export function itemAtkOrDef(id: number): number {
  const v = getItemRow(id)?.[3];
  return typeof v === "number" ? v : 0;
}

export function itemWeaponLevel(id: number): number {
  const v = getItemRow(id)?.[4];
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const m = /^(\d+)/.exec(v);
    if (m) return parseInt(m[1], 10);
  }
  return 1;
}

export function itemSortKey(id: number): string | number {
  const v = getItemRow(id)?.[9];
  if (typeof v === "string" || typeof v === "number") return v;
  return "";
}

export function itemDisplayName(id: number): string {
  if (id === 0) return "无 / 空手";
  const row = getItemRow(id);
  const a = row?.[8];
  if (typeof a === "string") return a;
  return `#${id}`;
}
