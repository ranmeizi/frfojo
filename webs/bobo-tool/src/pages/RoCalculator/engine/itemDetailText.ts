import { getItemRow, itemAtkOrDef, itemKind, itemWeaponLevel } from "./itemAccessors";
import { EQUIPMENT_SET_DEFINITIONS } from "./equipmentSetData";
import { formatSetMembershipLines } from "./equipmentSetMembership";
import { getItemScriptDisplay } from "./itemSetumei";

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
  /** 静态表无 refer 运行时写入的 (90,i) 时，由 w_SE 反查得到的套装说明 */
  setMembershipLines: string[];
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
      setMembershipLines: formatSetMembershipLines(id),
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

  const disp = getItemScriptDisplay(id);
  const { hasSetScript90, setEquipRowIndex } = disp;
  const bonusScriptTail: string[] = [];
  if (hasSetScript90 && setEquipRowIndex != null) {
    const def = EQUIPMENT_SET_DEFINITIONS[setEquipRowIndex];
    if (def) {
      const bonusFx = getItemScriptDisplay(def.bonusItemId).scriptLines;
      if (bonusFx.length > 0) {
        bonusScriptTail.push("套装激活效果：");
        bonusScriptTail.push(...bonusFx.map((x) => `· ${x}`));
      }
    }
  }
  const scriptLines = [...disp.scriptLines, ...bonusScriptTail];

  const setMembershipLines = hasSetScript90 ? [] : formatSetMembershipLines(id);

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
    setMembershipLines,
  };
}
