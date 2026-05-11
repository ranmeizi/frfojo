/**
 * 对敌 UI 文案与控件规格，对齐 refer/js/head.js `Click_IjyouSW` / `Click_EnemyKyoukaSW`
 * 与 refer/aindex.htm 魔物表、战斗结果行（NameCalc nm052–nm066）。
 */

/** refer/js/foot.js 附近 wkk9w：战斗侧魔物分类 */
export const ATTACK_KIND_LABELS = ["boss级魔物", "远距离攻击", "一般攻击"] as const;

/** refer/aindex.htm ENEMY_SORT 前几项 + 全表（与原版 value 一致便于日后接 EnemySort） */
export const MONSTER_SORT_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "Lv排序" },
  { value: 1, label: "属性排序" },
  { value: 2, label: "种族排序" },
  { value: 3, label: "100%HIT排序" },
  { value: 4, label: "95%回避排序" },
  { value: 5, label: "BaseExp排序" },
  { value: 6, label: "JobExp排序" },
  { value: 7, label: "最大Atk排序" },
];

/** refer/js/head.js Click_IjyouSW：BI0–BI24 使用 name_SKILL[0]–[24]（数组末三项在 refer 中未挂到 BI） */
export const IJYOU_ROW_LABELS: string[] = [
  "挑衅(不死系不可)",
  "泥沼术",
  "中毒",
  "黑暗",
  "冰冻(不死系不可)",
  "天使之赐福(不死/恶魔)",
  "天使之怒",
  "晕眩",
  "睡眠",
  "石化",
  "诅咒",
  "缓速术",
  "天使之光",
  "卸除武器",
  "卸除盾牌",
  "卸除铠甲",
  "卸除头盔",
  "易燃之网",
  "精神憾动",
  "勿忘我(未实装)",
  "永远的浑沌",
  "爆气状态(ATK3倍DEX3倍)",
  "AGI3倍(BOSS用)",
  "艾斯卡(DEF MDEF提升)",
  "艾斯克(攻击力4倍防御1/2)",
];

export type IjyouSlotKind = "select" | "checkbox";

export type IjyouSlotSpec = { kind: IjyouSlotKind; max?: number };

/** 与 head.js html_SKILL / BI0–BI24 一致；checkbox 用 0/1 存 n_B_IJYOU[i] */
export const IJYOU_SLOT_SPECS: IjyouSlotSpec[] = [
  { kind: "select", max: 10 },
  { kind: "select", max: 5 },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "select", max: 10 },
  { kind: "select", max: 10 },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "select", max: 5 },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "select", max: 4 },
  { kind: "select", max: 5 },
];

export const IJYOU_SLOT_COUNT = IJYOU_SLOT_SPECS.length;

/** refer ZoHe：属性变化下拉（B_KYOUKA6） */
const KYOUKA_ELEMENT_LABELS = [
  "无",
  "无1",
  "无2",
  "无3",
  "无4",
  "水1",
  "水2",
  "水3",
  "水4",
  "土1",
  "土2",
  "土3",
  "土4",
  "火1",
  "火2",
  "火3",
  "火4",
  "风1",
  "风2",
  "风3",
  "风4",
  "毒1",
  "毒2",
  "毒3",
  "毒4",
  "圣1",
  "圣2",
  "圣3",
  "圣4",
  "暗1",
  "暗2",
  "暗3",
  "暗4",
  "念1",
  "念2",
  "念3",
  "念4",
  "死1",
  "死2",
  "死3",
  "死4",
];

const KYOUKA_ELEMENT_VALUES = [
  0, 1, 2, 3, 4, 11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43, 44, 51, 52, 53, 54, 61, 62, 63, 64, 71, 72, 73, 74, 81, 82, 83, 84, 91, 92, 93, 94,
];

export const KYOUKA_ELEMENT_OPTIONS = KYOUKA_ELEMENT_LABELS.map((label, i) => ({
  label,
  value: KYOUKA_ELEMENT_VALUES[i] ?? 0,
}));

/** refer head.js Click_EnemyKyoukaSW name_SKILL（Taijin=0 全行，去掉 HTML） */
export const KYOUKA_ROW_LABELS: string[] = [
  "加速术",
  "圣母之祈福",
  "速度激发(暂)",
  "极限攻击",
  "爆气状态(ATK3倍DEX3倍)",
  "速度強化(FLEE2倍)",
  "属性变化",
  "石化外壳",
  "抵抗魔法",
  "防御强化",
];

export type KyoukaSlotKind = "select10" | "checkbox" | "element" | "select5";

export type KyoukaSlotSpec = { kind: KyoukaSlotKind };

export const KYOUKA_SLOT_SPECS: KyoukaSlotSpec[] = [
  { kind: "select10" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "checkbox" },
  { kind: "element" },
  { kind: "select5" },
  { kind: "select5" },
  { kind: "checkbox" },
];

export const KYOUKA_SLOT_COUNT = KYOUKA_SLOT_SPECS.length;

/** refer/js/monster.js NameCalc nm053–nm066（战斗结果表体，不含 nm052 标题） */
export const BATTLE_RESULT_ROW_LABELS: string[] = [
  "命中率",
  "回避率",
  "最小伤害值",
  "平均伤害值",
  "最大伤害值",
  "每秒伤害值",
  "最小攻击次数",
  "平均攻击次数",
  "最大攻击次数",
  "平均战斗时间",
  "每次攻击得到BaseExp",
  "每次攻击得到JobExp",
  "平均被伤害值",
  "平均被伤害值(回避率加入)",
];
