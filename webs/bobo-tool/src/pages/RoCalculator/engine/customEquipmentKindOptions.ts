/** 【新功能】自定义装备「分类」= ItemOBJ kind（武器 1～21；防具 50～64） */
import { WEAPON_TYPE_NAMES } from "./jobConstants";

export type CustomEquipKindOption = { kind: number; label: string };

export const CUSTOM_EQUIP_KIND_OPTIONS: CustomEquipKindOption[] = [
  ...WEAPON_TYPE_NAMES.map((n, i) => ({ kind: i, label: `武器：${n}` })).filter((x) => x.kind > 0),
  { kind: 50, label: "头饰（上）" },
  { kind: 51, label: "头饰（中）" },
  { kind: 52, label: "头饰（下）" },
  { kind: 61, label: "左手（盾）" },
  { kind: 60, label: "身体" },
  { kind: 62, label: "披肩" },
  { kind: 63, label: "鞋子" },
  { kind: 64, label: "饰品" },
];
