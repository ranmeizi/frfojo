/**
 * 【新功能】legacy「Additional Enchants & Manual Edits on Player」：手动平铺与 % 对敌增伤。
 * MaxHP/MSP 顺序、%ATK 面板乘子、%ASPD 权重与 refer foot.js / head.js 段一致，见 `computeSnapshot` 与 `AdditionalManualEditsCard` 说明。
 */
import type { ParsedMonster } from "./monsterCatalog";
import type { PlayerManualEditsState } from "./types";

const CLAMP_FLAT = { lo: -9999, hi: 9999 } as const;
const CLAMP_PCT = { lo: -999, hi: 999 } as const;

function clampInt(n: unknown, lo: number, hi: number): number {
  const v = Math.floor(Number.isFinite(Number(n)) ? Number(n) : 0);
  return Math.min(hi, Math.max(lo, v));
}

export function defaultPlayerManualEdits(): PlayerManualEditsState {
  const z = (): import("./types").ManualVersusPair => ({ pct: 0, versus: 0 });
  return {
    str: 0,
    agi: 0,
    vit: 0,
    int: 0,
    dex: 0,
    luk: 0,
    maxHpFlat: 0,
    maxHpPct: 0,
    maxSpFlat: 0,
    maxSpPct: 0,
    def: 0,
    mdef: 0,
    hit: 0,
    flee: 0,
    atk: 0,
    atkPct: 0,
    perfectDodge: 0,
    criticalRate: 0,
    matk: 0,
    matkPct: 0,
    aspdPct: 0,
    hpRegenPct: 0,
    spRegenPct: 0,
    raceVs: [z(), z(), z(), z()],
    elementVs: [z(), z(), z(), z()],
    sizeVs: [z(), z(), z(), z()],
    mvpVs: [z(), z(), z(), z()],
    atkDmgPctAny: 0,
    matkDmgPctAny: 0,
  };
}

function clampPair(p: import("./types").ManualVersusPair, versusMax: number): import("./types").ManualVersusPair {
  return {
    pct: clampInt(p.pct, CLAMP_PCT.lo, CLAMP_PCT.hi),
    versus: clampInt(p.versus, 0, versusMax),
  };
}

export function sanitizePlayerManualEdits(
  raw: PlayerManualEditsState | undefined,
): PlayerManualEditsState {
  const d = defaultPlayerManualEdits();
  const x = raw ?? d;
  const four = (
    r: import("./types").ManualVersusPair[] | undefined,
    fallback: import("./types").ManualVersusPair[],
    versusMax: number,
  ): PlayerManualEditsState["raceVs"] => {
    const src = r ?? fallback;
    return [0, 1, 2, 3].map((i) =>
      clampPair(src[i] ?? { pct: 0, versus: 0 }, versusMax),
    ) as PlayerManualEditsState["raceVs"];
  };
  return {
    str: clampInt(x.str, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    agi: clampInt(x.agi, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    vit: clampInt(x.vit, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    int: clampInt(x.int, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    dex: clampInt(x.dex, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    luk: clampInt(x.luk, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    maxHpFlat: clampInt(x.maxHpFlat, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    maxHpPct: clampInt(x.maxHpPct, CLAMP_PCT.lo, CLAMP_PCT.hi),
    maxSpFlat: clampInt(x.maxSpFlat, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    maxSpPct: clampInt(x.maxSpPct, CLAMP_PCT.lo, CLAMP_PCT.hi),
    def: clampInt(x.def, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    mdef: clampInt(x.mdef, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    hit: clampInt(x.hit, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    flee: clampInt(x.flee, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    atk: clampInt(x.atk, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    atkPct: clampInt(x.atkPct, CLAMP_PCT.lo, CLAMP_PCT.hi),
    perfectDodge: clampInt(x.perfectDodge, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    criticalRate: clampInt(x.criticalRate, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    matk: clampInt(x.matk, CLAMP_FLAT.lo, CLAMP_FLAT.hi),
    matkPct: clampInt(x.matkPct, CLAMP_PCT.lo, CLAMP_PCT.hi),
    aspdPct: clampInt(x.aspdPct, CLAMP_PCT.lo, CLAMP_PCT.hi),
    hpRegenPct: clampInt(x.hpRegenPct, CLAMP_PCT.lo, CLAMP_PCT.hi),
    spRegenPct: clampInt(x.spRegenPct, CLAMP_PCT.lo, CLAMP_PCT.hi),
    raceVs: four(x.raceVs, d.raceVs, 9),
    elementVs: four(x.elementVs, d.elementVs, 9),
    sizeVs: four(x.sizeVs, d.sizeVs, 2),
    mvpVs: four(x.mvpVs, d.mvpVs, 6),
    atkDmgPctAny: clampInt(x.atkDmgPctAny, CLAMP_PCT.lo, CLAMP_PCT.hi),
    matkDmgPctAny: clampInt(x.matkDmgPctAny, CLAMP_PCT.lo, CLAMP_PCT.hi),
  };
}

function elementTier(elementCode: number): number {
  return Math.min(9, Math.max(0, Math.floor(elementCode / 10)));
}

function addVersusRows(
  a: PlayerManualEditsState["raceVs"],
  b: PlayerManualEditsState["raceVs"],
  versusMax: number,
): PlayerManualEditsState["raceVs"] {
  return [0, 1, 2, 3].map((i) => {
    const p = a[i];
    const q = b[i];
    const pct = clampInt(p.pct + q.pct, CLAMP_PCT.lo, CLAMP_PCT.hi);
    const versus = p.pct !== 0 ? p.versus : q.versus;
    return clampPair({ pct, versus }, versusMax);
  }) as PlayerManualEditsState["raceVs"];
}

/** 【新功能】两段「附魔/手动」类数值按字段相加（用于自定义装备加成叠在玩家手动表上）。 */
export function addPlayerManualEdits(
  a: PlayerManualEditsState,
  b: PlayerManualEditsState,
): PlayerManualEditsState {
  return sanitizePlayerManualEdits({
    str: a.str + b.str,
    agi: a.agi + b.agi,
    vit: a.vit + b.vit,
    int: a.int + b.int,
    dex: a.dex + b.dex,
    luk: a.luk + b.luk,
    maxHpFlat: a.maxHpFlat + b.maxHpFlat,
    maxHpPct: a.maxHpPct + b.maxHpPct,
    maxSpFlat: a.maxSpFlat + b.maxSpFlat,
    maxSpPct: a.maxSpPct + b.maxSpPct,
    def: a.def + b.def,
    mdef: a.mdef + b.mdef,
    hit: a.hit + b.hit,
    flee: a.flee + b.flee,
    atk: a.atk + b.atk,
    atkPct: a.atkPct + b.atkPct,
    perfectDodge: a.perfectDodge + b.perfectDodge,
    criticalRate: a.criticalRate + b.criticalRate,
    matk: a.matk + b.matk,
    matkPct: a.matkPct + b.matkPct,
    aspdPct: a.aspdPct + b.aspdPct,
    hpRegenPct: a.hpRegenPct + b.hpRegenPct,
    spRegenPct: a.spRegenPct + b.spRegenPct,
    raceVs: addVersusRows(a.raceVs, b.raceVs, 9),
    elementVs: addVersusRows(a.elementVs, b.elementVs, 9),
    sizeVs: addVersusRows(a.sizeVs, b.sizeVs, 2),
    mvpVs: addVersusRows(a.mvpVs, b.mvpVs, 6),
    atkDmgPctAny: a.atkDmgPctAny + b.atkDmgPctAny,
    matkDmgPctAny: a.matkDmgPctAny + b.matkDmgPctAny,
  });
}

/** 【新功能】对当前所选魔物，累加「种族 / 属性 / 体型 / MVP」行与「任意目标」% 后的物伤乘子（1 = 无）。 */
export function manualPhysDamageMultiplier(
  m: PlayerManualEditsState,
  parsed: ParsedMonster | null,
): number {
  let p = m.atkDmgPctAny;
  if (parsed) {
    for (const row of m.raceVs) {
      if (row.versus === parsed.race) p += row.pct;
    }
    const et = elementTier(parsed.elementCode);
    for (const row of m.elementVs) {
      if (row.versus === et) p += row.pct;
    }
    for (const row of m.sizeVs) {
      if (row.versus === parsed.size) p += row.pct;
    }
    /** 【新功能】MVP 族行：versus 0=(None)；1～6 暂仅对 Boss 魔物生效（粗近似，待原版表） */
    if (parsed.isBoss) {
      for (const row of m.mvpVs) {
        if (row.versus > 0) p += row.pct;
      }
    }
  }
  return Math.max(0, (100 + p) / 100);
}
