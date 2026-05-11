/** 武器精炼固定 ATK 与波动（legacy StAllCalc 片段） */
export function weaponRefineFlatAtk(weaponLevel: number, plus: number): number {
  const p = Math.max(0, Math.floor(plus));
  if (p <= 0) return 0;
  if (weaponLevel === 1) return p * 2;
  if (weaponLevel === 2) return p * 3;
  if (weaponLevel === 3) return p * 5;
  if (weaponLevel === 4) return p * 7;
  return 0;
}

export function weaponRefineVariance(
  weaponLevel: number,
  plus: number,
): { min: number; max: number } {
  const p = Math.max(0, Math.floor(plus));
  let min = 0;
  let max = 0;
  if (weaponLevel === 1 && p >= 8) {
    min = 1;
    max = 3 * (p - 7);
  } else if (weaponLevel === 2 && p >= 7) {
    min = 1;
    max = 5 * (p - 6);
  } else if (weaponLevel === 3 && p >= 6) {
    min = 1;
    max = 8 * (p - 5);
  } else if (weaponLevel === 4 && p >= 5) {
    min = 1;
    max = 14 * (p - 4);
  }
  return { min, max };
}
