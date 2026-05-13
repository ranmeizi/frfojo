/**
 * `refer/js2/head.js` **`SyurikenOBJ`** / **`KunaiOBJ`**（手里剑 / 苦无）。
 * 下标与原版 **`SkillSubNum`** 选项 0～4 一致。
 */
export const SYURIKEN_ATK_BY_INDEX = [10, 30, 45, 70, 100] as const;

/** `KunaiOBJ[i][0]`（原版各行为 30） */
export const KUNAI_ATK0_BY_INDEX = [30, 30, 30, 30, 30] as const;

/** `KunaiOBJ[i][1]` → 写入 **`n_A_Weapon_zokusei`**，影响 **`BattleCalc2`** 首段属克 */
export const KUNAI_WEAPON_ZOKUSEI_BY_INDEX = [3, 1, 4, 2, 5] as const;

export const SYURIKEN_MAX_INDEX = SYURIKEN_ATK_BY_INDEX.length - 1;
export const KUNAI_MAX_INDEX = KUNAI_ATK0_BY_INDEX.length - 1;

export function clampSyurikenSubIndex(n: number): number {
  return Math.min(SYURIKEN_MAX_INDEX, Math.max(0, Math.floor(Number(n) || 0)));
}

export function clampKunaiSubIndex(n: number): number {
  return Math.min(KUNAI_MAX_INDEX, Math.max(0, Math.floor(Number(n) || 0)));
}

export function syurikenFlatAtkFromSubIndex(subIndex: number): number {
  return SYURIKEN_ATK_BY_INDEX[clampSyurikenSubIndex(subIndex)];
}

/** `head.js` **395**：`KunaiOBJ[sub][0] * 3`（BC2 加段） */
export function kunaiBattleCalc395FlatFromSubIndex(subIndex: number): number {
  return KUNAI_ATK0_BY_INDEX[clampKunaiSubIndex(subIndex)] * 3;
}

export function kunaiWeaponZokuseiFromSubIndex(subIndex: number): number {
  return KUNAI_WEAPON_ZOKUSEI_BY_INDEX[clampKunaiSubIndex(subIndex)];
}

/** 与 **`sanitizeCharacter`** 一致：仅 **394/395** 使用子下标，其余归零 */
export function clampActiveSkillSubIndex(activeSkillId: number, sub: number): number {
  const id = Math.floor(Number(activeSkillId) || 0);
  if (id === 394) return clampSyurikenSubIndex(sub);
  if (id === 395) return clampKunaiSubIndex(sub);
  return 0;
}
