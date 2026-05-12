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

/** ItemOBJ[i][6]：重量（原版扩展函数负重合计用） */
export function itemWeight(id: number): number {
  const v = getItemRow(id)?.[6];
  return typeof v === "number" && !Number.isNaN(v) ? v : 0;
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

function oneLineItemTitle(s: string): string {
  return s
    .replace(/<BR\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function itemDisplayName(id: number): string {
  if (id === 0) return "无 / 空手";
  const row = getItemRow(id);
  if (!row) return `#${id}`;
  const kind = typeof row[1] === "number" ? row[1] : 0;
  for (const idx of [8, 9] as const) {
    const v = row[idx];
    if (typeof v === "string" && v.trim().length > 0) return oneLineItemTitle(v);
  }
  const d10 = row[10];
  if (typeof d10 === "string" && d10.trim().length > 0) {
    const t = oneLineItemTitle(d10);
    /** 套装虚拟行 [10] 常为整段脚本说明，不宜作短标题 */
    if (kind !== 100 && t.length <= 48) return t;
  }
  return `#${id}`;
}

/** ItemOBJ 脚本对：自 **[11]** 起两列一组 `(code, value)`，遇 **0** 结束（与 `foot.js` 扫描一致） */
export function itemScriptFirstValueForCode(itemId: number, statCode: number): number | null {
  const row = getItemRow(itemId);
  if (!row) return null;
  for (let j = 0; j + 11 < row.length; j += 2) {
    const code = row[j + 11];
    if (code === 0 || code === undefined) break;
    if (code === statCode) {
      const v = row[j + 12];
      return typeof v === "number" && !Number.isNaN(v) ? v : null;
    }
  }
  return null;
}
