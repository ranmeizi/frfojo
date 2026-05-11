import { getItemRow, itemAtkOrDef, itemKind, itemWeaponLevel } from "./itemAccessors";

/** 与 legacy Item_Setumei 前段一致的基础属性码（其余显示为「效果码」行） */
const STAT_NAMES = [
  "",
  "STR",
  "AGI",
  "VIT",
  "INT",
  "DEX",
  "LUK",
  "全素质",
  "HIT",
  "FLEE",
  "CRI",
  "完全回避",
  "ASPD",
  "MHP",
  "MSP",
  "MHP%",
  "MSP%",
  "ATK",
  "DEF",
  "MDEF",
];

function formatScriptPair(c1: number, c2: number): string {
  const wIS = c2 < 0 ? " " : " + ";
  if (c1 >= 1 && c1 <= 11) {
    return `${STAT_NAMES[c1] ?? `属性${c1}`}${wIS}${c2}`;
  }
  if (c1 === 12) return `ASPD${wIS}${c2}%`;
  if (c1 === 13 || c1 === 14) return `${STAT_NAMES[c1]}${wIS}${c2}`;
  if (c1 === 15 || c1 === 16) return `${STAT_NAMES[c1]}${wIS}${c2}%`;
  if (c1 >= 17 && c1 <= 19) return `${STAT_NAMES[c1]}${wIS}${c2}`;
  if (c1 === 70) return `暴击伤害 +${c2}%`;
  if (c1 === 73) return `咏唱时间${wIS}${c2}%`;
  if (c1 === 74) return `技能延迟 ${c2}% 减少`;
  if (c1 === 87) return `ATK${wIS}${c2}%`;
  if (c1 === 88) return `MATK${wIS}${c2}%（杖型）`;
  if (c1 === 89) return `MATK${wIS}${c2}%`;
  if (c1 === 193) return "无法精炼";
  if (c1 === 194) return "绝对不会损坏";
  if (c1 === 195) return "双手杖";
  return `效果码 ${c1}：${c2}`;
}

function stripHtmlBr(s: string): string {
  return s
    .replace(/<BR\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export type ItemDetailModel = {
  id: number;
  name: string;
  kind: number;
  isWeapon: boolean;
  atkOrDefLabel: string;
  atkOrDef: number;
  /** 原版仅 kind&lt;50 时显示武器 Lv；防具对应列为 "-"，此处直接不展示该行 */
  showWeaponLevel: boolean;
  weaponLevelDisplay: string;
  slotsDisplay: string;
  weightDisplay: string;
  reqLvDisplay: string;
  /** ItemOBJ[10] 文本说明（已去简单 HTML） */
  flavorText: string;
  /** ItemOBJ[11] 起成对脚本，直至 0 */
  scriptLines: string[];
};

export function buildItemDetailModel(id: number): ItemDetailModel {
  const row = getItemRow(id);
  const kind = itemKind(id);
  /** legacy：ItemOBJ[][1] < 50 为武器（含空手 kind 0） */
  const isWeapon = kind < 50;
  const atkOrDef = itemAtkOrDef(id);
  const wLv = itemWeaponLevel(id);

  if (!row) {
    return {
      id,
      name: id === 0 ? "无 / 空手" : `#${id}`,
      kind,
      isWeapon,
      atkOrDefLabel: isWeapon ? "ATK" : "DEF",
      atkOrDef,
      showWeaponLevel: isWeapon,
      weaponLevelDisplay: isWeapon ? String(wLv) : "",
      slotsDisplay: "—",
      weightDisplay: "—",
      reqLvDisplay: "—",
      flavorText: "",
      scriptLines: [],
    };
  }

  const slotV = row[5];
  const weightV = row[6];
  const reqV = row[7];
  const nameV = row[8];
  const descV = row[10];

  const slotsDisplay =
    slotV === 0 || slotV === "0"
      ? "0"
      : typeof slotV === "string" || typeof slotV === "number"
        ? String(slotV)
        : "—";

  const weightDisplay =
    typeof weightV === "number" ? String(weightV) : weightV != null ? String(weightV) : "—";

  const reqLvDisplay =
    typeof reqV === "number" ? String(reqV) : reqV != null ? String(reqV) : "—";

  let flavorText = "";
  if (typeof descV === "string" && descV.length > 0) {
    flavorText = stripHtmlBr(descV);
  }

  const scriptLines: string[] = [];
  for (let i = 11; i < row.length; i += 2) {
    const a = row[i];
    const b = row[i + 1];
    if (a === 0 && (b === 0 || b === undefined)) break;
    if (typeof a !== "number") break;
    const bv = typeof b === "number" ? b : 0;
    scriptLines.push(formatScriptPair(a, bv));
  }

  return {
    id,
    name: typeof nameV === "string" ? nameV : `#${id}`,
    kind,
    isWeapon,
    atkOrDefLabel: isWeapon ? "ATK" : "DEF",
    atkOrDef,
    showWeaponLevel: isWeapon,
    weaponLevelDisplay: isWeapon ? String(wLv) : "",
    slotsDisplay,
    weightDisplay,
    reqLvDisplay,
    flavorText,
    scriptLines,
  };
}
