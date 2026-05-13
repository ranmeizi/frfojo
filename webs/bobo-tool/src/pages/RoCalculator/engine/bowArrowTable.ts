/**
 * 与 `refer/head.js` `ArrowOBJ` 0..17 共 18 项一致：`[ATK, 武器属性下标 n_A_Weapon_zokusei, 名称]`。
 * 普攻略化仅弓（weaponType===10）使用；手枪等仍用 BulletOBJ，另接。
 */
export type BowArrowRow = { readonly atk: number; readonly zok: number; readonly label: string };

export const BOW_ARROW_ROWS: readonly BowArrowRow[] = [
  { atk: 25, zok: 0, label: "箭矢" },
  { atk: 30, zok: 6, label: "银箭矢" },
  { atk: 30, zok: 3, label: "火箭矢" },
  { atk: 30, zok: 0, label: "铁箭矢" },
  { atk: 30, zok: 2, label: "地灵箭矢" },
  { atk: 30, zok: 1, label: "水灵箭矢" },
  { atk: 30, zok: 4, label: "风灵箭矢" },
  { atk: 30, zok: 7, label: "影子箭矢" },
  { atk: 30, zok: 8, label: "无形箭矢" },
  { atk: 30, zok: 5, label: "铁锈箭矢" },
  { atk: 40, zok: 0, label: "钢铁箭矢" },
  { atk: 50, zok: 0, label: "神之金属箭矢" },
  { atk: 50, zok: 6, label: "破魔箭矢" },
  { atk: 1, zok: 1, label: "霜冻箭矢" },
  { atk: 1, zok: 5, label: "毒箭矢" },
  { atk: 10, zok: 0, label: "锐利箭矢" },
  { atk: 50, zok: 6, label: "神圣箭矢" },
  { atk: 1, zok: 0, label: "Atk1的箭矢" },
];

export const BOW_ARROW_INDEX_MAX = BOW_ARROW_ROWS.length - 1;

/** 与 refer `ArrowOBJ` **「聖なる矢」** 同一下标；`foot.js` **1413～1414** → **`n_tok[36]+=5`**（对魔族 **30+6** 乘段） */
export const BOW_ARROW_HOLY_SACRED_INDEX = 14;

export function bowArrowRow(index: number): BowArrowRow {
  const i = Math.min(BOW_ARROW_INDEX_MAX, Math.max(0, Math.floor(index)));
  return BOW_ARROW_ROWS[i] ?? BOW_ARROW_ROWS[0];
}
