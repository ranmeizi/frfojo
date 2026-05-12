import type { SixStats } from "./types";

const ZERO: SixStats = {
  str: 0,
  agi: 0,
  vit: 0,
  int: 0,
  dex: 0,
  luk: 0,
};

/** 与 `refer/foot.js` `StPlusCalc` 中 `A_HSE` 段一致（约 1785–1799） */
export function sanctityCoreSixStatDelta(code: number): SixStats {
  if (!code) return { ...ZERO };
  const w = code % 10;
  if (w < 1) return { ...ZERO };
  const d = { ...ZERO };
  if (code >= 1 && code <= 9) d.str += w;
  else if (code >= 11 && code <= 19) d.agi += w;
  else if (code >= 21 && code <= 29) d.vit += w;
  else if (code >= 31 && code <= 39) d.int += w;
  else if (code >= 41 && code <= 49) d.dex += w;
  else if (code >= 51 && code <= 59) d.luk += w;
  return d;
}

/** 合法 `A_HSE` 取值：0 关，或各段个位数 1～9 */
export function clampSanctityCoreCode(raw: number): number {
  const n = Math.floor(raw);
  if (n === 0) return 0;
  const ranges: [number, number][] = [
    [1, 9],
    [11, 19],
    [21, 29],
    [31, 39],
    [41, 49],
    [51, 59],
  ];
  for (const [lo, hi] of ranges) {
    if (n >= lo && n <= hi) return n;
  }
  return 0;
}

export const SANCTITY_CORE_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "无" },
  ...Array.from({ length: 9 }, (_, i) => ({
    value: i + 1,
    label: `STR +${i + 1}（A_HSE=${i + 1}）`,
  })),
  ...Array.from({ length: 9 }, (_, i) => ({
    value: i + 11,
    label: `AGI +${i + 1}（A_HSE=${i + 11}）`,
  })),
  ...Array.from({ length: 9 }, (_, i) => ({
    value: i + 21,
    label: `VIT +${i + 1}（A_HSE=${i + 21}）`,
  })),
  ...Array.from({ length: 9 }, (_, i) => ({
    value: i + 31,
    label: `INT +${i + 1}（A_HSE=${i + 31}）`,
  })),
  ...Array.from({ length: 9 }, (_, i) => ({
    value: i + 41,
    label: `DEX +${i + 1}（A_HSE=${i + 41}）`,
  })),
  ...Array.from({ length: 9 }, (_, i) => ({
    value: i + 51,
    label: `LUK +${i + 1}（A_HSE=${i + 51}）`,
  })),
];
