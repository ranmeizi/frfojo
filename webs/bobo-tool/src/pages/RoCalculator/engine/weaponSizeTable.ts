/**
 * 与 `refer/weaponsize.js` 一致：`weaponsize[n_A_WeaponType][n_B[4]]`（0 小 1 中 2 大）。
 */
export const WEAPON_SIZE_MULT_TABLE: readonly (readonly number[])[] = [
  [1, 1, 1],
  [1, 0.75, 0.5],
  [0.75, 1, 0.75],
  [0.75, 0.75, 1],
  [0.75, 0.75, 1],
  [0.75, 0.75, 1],
  [0.5, 0.75, 1],
  [0.5, 0.75, 1],
  [0.75, 1, 0.75],
  [1, 1, 1],
  [1, 1, 0.75],
  [0.75, 1, 0.75],
  [1, 1, 0.5],
  [1, 0.75, 0.5],
  [0.75, 1, 0.75],
  [0.75, 1, 0.5],
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
];

export function weaponSizeMultiplier(
  weaponType: number,
  monsterSize: number,
  opts?: { sizeIgnore?: boolean; /** `head.js` `calc`：SkillSearch(78) 时枪/矛对中型魔物体型乘视为 1 */ skillSearch78Lv?: number },
): number {
  if (opts?.sizeIgnore) return 1;
  const L78 = Math.max(0, Math.floor(opts?.skillSearch78Lv ?? 0));
  if (L78 > 0 && (weaponType === 4 || weaponType === 5) && monsterSize === 1) {
    return 1;
  }
  const row = WEAPON_SIZE_MULT_TABLE[weaponType];
  if (!row) return 1;
  const s = monsterSize >= 0 && monsterSize <= 2 ? monsterSize : 1;
  const m = row[s];
  return typeof m === "number" && Number.isFinite(m) ? m : 1;
}
