import { ENEMY_NUM, MONSTER_OBJ, type MonsterRowTuple } from "./monster.generated";

/** 与 refer/js/head.js SyuzokuOBJ 一致 */
export const SYUZOKU_LABELS = [
  "无形",
  "不死",
  "动物",
  "植物",
  "昆虫",
  "鱼贝",
  "恶魔",
  "人型",
  "天使",
  "龙族",
];

/** 与 refer/js/head.js ZokuseiOBJ 一致 */
export const ZOKUSEI_BASE_LABELS = ["无", "水", "地", "火", "风", "毒", "圣", "暗", "念", "不死"];

/** 与 refer/js/head.js SizeOBJ 一致 */
export const SIZE_LABELS = ["小型", "中型", "大型"];

export type ParsedMonster = {
  id: number;
  name: string;
  race: number;
  raceLabel: string;
  elementCode: number;
  elementLabel: string;
  size: number;
  sizeLabel: string;
  level: number;
  hp: number;
  vit: number;
  agi: number;
  int: number;
  dex: number;
  luk: number;
  minAtk: number;
  maxAtk: number;
  def: number;
  mdef: number;
  baseExp: number;
  jobExp: number;
  isBoss: boolean;
  isRanged: boolean;
  /** refer 脚本：20 + LV + AGI */
  hit: number;
  /** refer 脚本：75 + LV + DEX */
  flee: number;
};

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown, fallback = ""): string {
  return v == null ? fallback : String(v);
}

/** 与 foot.js 展示类似：属性名 + 等级位 */
export function formatElementLabel(code: number): string {
  const tier = Math.floor(code / 10);
  const lv = code % 10;
  const base = ZOKUSEI_BASE_LABELS[tier] ?? `属性${tier}`;
  return lv > 0 ? `${base}${lv}` : base;
}

export function parseMonsterRow(row: MonsterRowTuple | undefined): ParsedMonster | null {
  if (!row || row.length < 23) return null;
  const race = num(row[2]);
  const elementCode = num(row[3]);
  const size = num(row[4]);
  const level = num(row[5]);
  const agi = num(row[8]);
  const dex = num(row[10]);
  return {
    id: num(row[0]),
    name: str(row[1]),
    race,
    raceLabel: SYUZOKU_LABELS[race] ?? `种族${race}`,
    elementCode,
    elementLabel: formatElementLabel(elementCode),
    size,
    sizeLabel: SIZE_LABELS[size] ?? `体型${size}`,
    level,
    hp: num(row[6]),
    vit: num(row[7]),
    agi,
    int: num(row[9]),
    dex,
    luk: num(row[11]),
    minAtk: num(row[12]),
    maxAtk: num(row[13]),
    def: num(row[14]),
    mdef: num(row[15]),
    baseExp: num(row[16]),
    jobExp: num(row[17]),
    isBoss: Boolean(num(row[19])),
    isRanged: Boolean(num(row[20])),
    hit: num(row[21], 20 + level + agi),
    flee: num(row[22], 75 + level + dex),
  };
}

export function monsterOptionList(): { index: number; label: string }[] {
  const out: { index: number; label: string }[] = [];
  const n = Math.min(ENEMY_NUM + 1, MONSTER_OBJ.length);
  for (let i = 0; i < n; i++) {
    const row = MONSTER_OBJ[i];
    out.push({ index: i, label: str(row?.[1], `#${i}`) });
  }
  return out;
}

/**
 * refer `EnemySort` / aindex `ENEMY_SORT`：在原表顺序上按条件重排（仅影响下拉展示顺序）。
 */
export function sortedMonsterOptionList(sortMode: number): { index: number; label: string }[] {
  const base = monsterOptionList();
  type Row = { index: number; label: string; m: ParsedMonster | null };
  const rows: Row[] = base.map((o) => ({
    index: o.index,
    label: o.label,
    m: parseMonsterRow(MONSTER_OBJ[o.index]),
  }));

  const key = (r: Row): number => {
    const m = r.m;
    if (!m) return 0;
    switch (sortMode) {
      case 1:
        return m.elementCode;
      case 2:
        return m.race;
      case 3:
        return m.hit;
      case 4:
        return m.flee;
      case 5:
        return m.baseExp;
      case 6:
        return m.jobExp;
      case 7:
        return m.maxAtk;
      case 0:
      default:
        return m.level;
    }
  };

  const mult = sortMode === 4 || sortMode === 7 ? -1 : 1;
  rows.sort((a, b) => mult * (key(a) - key(b)) || a.index - b.index);
  return rows.map(({ index, label }) => ({ index, label }));
}
