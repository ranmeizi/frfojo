/**
 * 与 refer/item.js `Item_Setumei(nC1,nC2)` 对齐的装备脚本说明（纯文本，无 HTML）。
 * 用于物品资料浮窗等展示。
 */
import { EQUIPMENT_SET_DEFINITIONS } from "./equipmentSetData";
import { getItemRow, itemDisplayName } from "./itemAccessors";
import { MONSTER_OBJ } from "./monster.generated";
import { SIZE_LABELS, SYUZOKU_LABELS, ZOKUSEI_BASE_LABELS } from "./monsterCatalog";
import { SKILL_BY_ID } from "./skillBoard.generated";

/** refer `wNAME1` */
const WNAME1 = [
  "0",
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
  "MHP",
  "MSP",
  "ATK",
  "DEF",
  "MDEF",
] as const;

/** refer head.js `IjyouOBJ` */
const IJYOU_LABELS = [
  "中毒",
  "晕眩",
  "冰冻",
  "诅咒",
  "黑暗",
  "睡眠",
  "沉默",
  "混乱",
  "出血",
  "石化",
  "武器损坏",
  "铠甲损坏",
] as const;

function skillName(skillIdx: number): string {
  return SKILL_BY_ID[skillIdx]?.name ?? `技能#${skillIdx}`;
}

function monsterTableName(tableIdx: number): string {
  const row = MONSTER_OBJ[tableIdx];
  const v = row?.[1];
  return typeof v === "string" ? v : `魔物#${tableIdx}`;
}

/** 套装行 (90, setRowIndex)：与原版 SetEquipName 类似 */
export function formatSetEquipScriptLine(setRowIndex: number): string {
  const def = EQUIPMENT_SET_DEFINITIONS[setRowIndex];
  if (!def) {
    return `【套装】组 #${setRowIndex}`;
  }
  const parts = def.requiredItemIds.map((id) => `【${itemDisplayName(id)}】`);
  return `【套装】${parts.join("+")} 同时装备时生效`;
}

/**
 * 单条 (code, value) → 说明行；无匹配分支时返回「效果码」兜底（与旧 TS 行为一致）。
 */
export function formatItemSetumeiLine(nC1: number, nC2: number): string {
  const wIS = nC2 < 0 ? " " : " + ";
  const lines: string[] = [];

  if (nC1 >= 1 && nC1 <= 11) {
    lines.push(`${WNAME1[nC1] ?? `属性${nC1}`}${wIS}${nC2}`);
  }
  if (nC1 === 12) {
    lines.push(`ASPD${wIS}${nC2}%`);
  }
  if (nC1 >= 13 && nC1 <= 14) {
    lines.push(`${WNAME1[nC1]}${wIS}${nC2}`);
  }
  if (nC1 >= 15 && nC1 <= 16) {
    lines.push(`${WNAME1[nC1]}${wIS}${nC2}%`);
  }
  if (nC1 >= 17 && nC1 <= 19) {
    lines.push(`${WNAME1[nC1]}${wIS}${nC2}`);
  }
  if (nC1 === 20) {
    const z = ZOKUSEI_BASE_LABELS[nC2] ?? `属性${nC2}`;
    lines.push(`${z}属性武器`);
  }
  if (nC1 === 22) {
    lines.push(
      nC2 === 1
        ? "无视防御攻击(Boss属性不能无视)"
        : "无视防御攻击(Boss属性也能无视)",
    );
  }
  if (nC1 === 23) {
    lines.push("敌人的DEF与VIT越高，伤害就越高");
  }
  if (nC1 === 24) {
    lines.push(`自身的防御力减少为1/${nC2}`);
  }
  if (nC1 === 25) {
    lines.push(`远距离物理攻击的伤害增加${nC2}%增加`);
  }
  if (nC1 === 26) {
    lines.push(`对BOSS属性的魔物追加${nC2}%的伤害`);
  }
  if (nC1 >= 27 && nC1 <= 29) {
    lines.push(`${SIZE_LABELS[nC1 - 27] ?? "体型"}的魔物追加${nC2}%的伤害`);
  }
  if (nC1 >= 30 && nC1 <= 39) {
    lines.push(`${SYUZOKU_LABELS[nC1 - 30] ?? "种族"}种族的魔物追加${nC2}%的伤害`);
  }
  if (nC1 >= 40 && nC1 <= 49) {
    lines.push(
      `${ZOKUSEI_BASE_LABELS[nC1 - 40] ?? "属性"}属性的魔物追加${nC2}%的伤害`,
    );
  }
  if (nC1 >= 50 && nC1 <= 59) {
    const race = SYUZOKU_LABELS[nC1 - 50] ?? "种族";
    if (nC2 > 0) {
      lines.push(`${race}种族魔物伤害${nC2}%减少`);
    } else {
      lines.push(`${race}种族魔物伤害${-nC2}%增加`);
    }
  }
  if (nC1 >= 60 && nC1 <= 69) {
    lines.push(
      `${ZOKUSEI_BASE_LABELS[nC1 - 60] ?? "属性"}属性攻击的耐性${wIS}${nC2}%`,
    );
  }
  if (nC1 === 70) {
    lines.push(`暴击伤害 +${nC2}%`);
  }
  if (nC1 === 73) {
    lines.push(`咏唱时间${wIS}${nC2}%`);
  }
  if (nC1 === 74) {
    lines.push(`技能使用后的延迟 ${nC2}%减少`);
  }
  if (nC1 === 75) {
    lines.push(`HP自然回复力${wIS}${nC2}%`);
  }
  if (nC1 === 76) {
    lines.push(`SP自然回复力${wIS}${nC2}%`);
  }
  if (nC1 === 77) {
    lines.push(`Boss属性魔物耐性${wIS}${nC2}%`);
  }
  if (nC1 === 78) {
    lines.push(`被远距离伤害减少${wIS}${nC2}%`);
  }
  if (nC1 === 79) {
    lines.push(`对一般怪物的抗性${wIS}${nC2}%`);
  }
  if (nC1 === 80) {
    lines.push(`物理攻击${wIS}${nC2}%(卡片效果)`);
  }
  if (nC1 === 81) {
    lines.push(`对哥布灵系伤害增加${wIS}${nC2}%`);
  }
  if (nC1 === 82) {
    lines.push(`对犬妖系伤害增加${wIS}${nC2}%`);
  }
  if (nC1 === 83) {
    lines.push(`对兽人系伤害增加${wIS}${nC2}%`);
  }
  if (nC1 === 84) {
    lines.push(`对巨石系伤害增加${wIS}${nC2}%`);
  }
  if (nC1 === 85) {
    lines.push(`自身防御力减少 ${nC2}% 减少`);
  }
  if (nC1 === 86) {
    lines.push(`${nC2}% 的机率必中`);
  }
  if (nC1 === 87) {
    lines.push(`ATK${wIS}${nC2}%`);
  }
  if (nC1 === 88) {
    lines.push(`MATK${wIS}${nC2}%(杖型)`);
  }
  if (nC1 === 89) {
    lines.push(`MATK${wIS}${nC2}%`);
  }
  if (nC1 === 91 || nC1 === 92) {
    lines.push(`治愈术恢复量${wIS}${nC2}%`);
  }
  if (nC1 === 93) {
    lines.push(`不死系治愈伤害${wIS}${nC2}%`);
  }
  if (nC1 === 94 || nC1 === 95) {
    lines.push(`光耀之堂恢复量${wIS}${nC2}%`);
  }
  if (nC1 === 96) {
    lines.push(`十字驱魔伤害${wIS}${nC2}%`);
  }
  if (nC1 >= 110 && nC1 <= 119) {
    lines.push(
      `${SYUZOKU_LABELS[nC1 - 110] ?? "种族"}魔物的暴击伤害${wIS}${nC2}`,
    );
  }
  if (nC1 >= 120 && nC1 <= 129) {
    lines.push(
      `${SYUZOKU_LABELS[nC1 - 120] ?? "种族"}种族魔物击倒时获得的经验增加${wIS}${nC2}%`,
    );
  }
  if (nC1 >= 130 && nC1 <= 149) {
    lines.push(
      `物理攻击时${nC2}%的机率让敌方陷入${IJYOU_LABELS[nC1 - 130] ?? "状态"}状态`,
    );
  }
  if (nC1 >= 150 && nC1 <= 169) {
    lines.push(
      `异常状态 ${IJYOU_LABELS[nC1 - 150] ?? "状态"} 的抗性 +${nC2}%`,
    );
  }
  if (nC1 >= 170 && nC1 <= 179) {
    lines.push(
      `魔法攻击时${SYUZOKU_LABELS[nC1 - 170] ?? "种族"}型魔物${nC2}%追加伤害`,
    );
  }
  if (nC1 >= 180 && nC1 <= 189) {
    lines.push(`${SYUZOKU_LABELS[nC1 - 180] ?? "种族"}型魔物无视防御伤害`);
  }
  if (nC1 >= 190 && nC1 <= 192) {
    const sz = SIZE_LABELS[nC1 - 190] ?? "体型";
    if (nC2 > 0) {
      lines.push(`${sz}从魔物受到的伤害${nC2}%减少`);
    } else {
      lines.push(`${sz}从魔物受到的伤害${-nC2}%增加`);
    }
  }
  if (nC1 === 193) {
    lines.push("无法精炼");
  }
  if (nC1 === 194) {
    lines.push("绝对不会损坏");
  }
  if (nC1 === 195) {
    lines.push("双手杖");
  }
  if (nC1 === 198) {
    lines.push(`赋予铠甲${ZOKUSEI_BASE_LABELS[nC2] ?? "属性"}属性`);
  }
  if (nC1 >= 212 && nC1 <= 215) {
    lines.push(`${WNAME1[nC1 - 210] ?? `属性${nC1}`}${wIS}${nC2}`);
  }
  if (nC1 === 220 || nC1 === 230) {
    const sid = Math.floor((nC2 - 100000) / 100);
    const lv = Math.floor((nC2 - 100000) % 100);
    lines.push(`可以使用[${skillName(sid)}]Lv ${lv} 技能`);
  }
  if (nC1 === 221 || nC1 === 231) {
    const wNAME99 = [
      "",
      "攻击时",
      "近距离攻击时",
      "远距离攻击时",
      "魔法攻击时",
      "攻击时",
      "受到物理攻击时",
      "受到近距离物理攻击时",
      "受到远距离物理攻击时",
      "受到魔法攻击时",
      "受到物理与魔法攻击时",
    ];
    const wNAME98 = ["低", "一定", "高"];
    const head = Math.floor(nC2 / 10000000);
    const rateRaw = Math.floor((nC2 % 10000000) / 100000);
    let rateStr: string;
    if (rateRaw >= 97) {
      rateStr = wNAME98[rateRaw - 97] ?? `${rateRaw}%`;
    } else {
      rateStr = `${rateRaw}%`;
    }
    const skillPart = Math.floor((nC2 % 100000) / 100);
    const skillLv = Math.floor((nC2 % 100000) % 100);
    lines.push(
      `${wNAME99[head] ?? "触发"}有${rateStr}的机率发动${skillName(skillPart)}Lv ${skillLv}发动`,
    );
  }
  if (nC1 >= 300 && nC1 <= 309) {
    lines.push(`${SYUZOKU_LABELS[nC1 - 300] ?? "种族"}型的DEF ${nC2}% 无视`);
  }
  if (nC1 >= 310 && nC1 <= 319) {
    lines.push(`${SYUZOKU_LABELS[nC1 - 310] ?? "种族"}型的MDEF${nC2}% 无视`);
  }
  if (nC1 >= 1000 && nC1 <= 2999) {
    const idx = nC1 - 1000;
    lines.push(`${monsterTableName(idx)}给与伤害${wIS}${nC2}%`);
  }
  if (nC1 >= 3000 && nC1 <= 4999) {
    const idx = nC1 - 3000;
    const name = monsterTableName(idx);
    if (nC2 > 0) {
      lines.push(`${name}受到的伤害${nC2}%减少`);
    } else {
      lines.push(`${name}受到的伤害${-nC2}%增加`);
    }
  }
  if (nC1 >= 5000 && nC1 <= 6999) {
    const sid = nC1 - 5000;
    lines.push(`${skillName(sid)}的伤害${wIS}${nC2}%`);
  }
  if (nC1 >= 7000 && nC1 <= 8999) {
    const sid = nC1 - 7000;
    if (nC2 > 0) {
      lines.push(`${skillName(sid)}的咏唱时间${wIS}${nC2}%减少`);
    } else {
      lines.push(`${skillName(sid)}的咏唱时间${wIS}${nC2}%增加`);
    }
  }

  if (lines.length > 0) {
    return lines.join(" ");
  }
  return `效果码 ${nC1}：${nC2}`;
}

/** ItemOBJ 列 11 起脚本转展示行（与 refer Item_Setumei 同源）；含 (90, 行号) 套装条件行 */
export function getItemScriptDisplay(itemId: number): {
  scriptLines: string[];
  hasSetScript90: boolean;
  setEquipRowIndex: number | null;
} {
  if (itemId <= 0) {
    return { scriptLines: [], hasSetScript90: false, setEquipRowIndex: null };
  }
  const row = getItemRow(itemId);
  if (!row) {
    return { scriptLines: [], hasSetScript90: false, setEquipRowIndex: null };
  }
  const scriptLines: string[] = [];
  let hasSetScript90 = false;
  let setEquipRowIndex: number | null = null;
  for (let i = 11; i < row.length; i += 2) {
    const a = row[i];
    if (a === 0 || a === "NULL") break;
    if (typeof a !== "number") break;
    const b = row[i + 1];
    const bv = typeof b === "number" ? b : 0;
    if (a === 90) {
      hasSetScript90 = true;
      setEquipRowIndex = bv;
      scriptLines.push(formatSetEquipScriptLine(bv));
      continue;
    }
    scriptLines.push(formatItemSetumeiLine(a, bv));
  }
  return { scriptLines, hasSetScript90, setEquipRowIndex };
}

/** 仅脚本行数组（常用于套装虚拟道具 #738 等） */
export function itemObjScriptEffectLines(itemId: number): string[] {
  return getItemScriptDisplay(itemId).scriptLines;
}
