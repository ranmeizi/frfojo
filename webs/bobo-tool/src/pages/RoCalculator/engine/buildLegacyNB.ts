import { MONSTER_OBJ, type MonsterRowTuple } from "./monster.generated";

/** 与 refer `head.js` `tPlusEnemyClick` 中 `for(i=0;i<=26;i++) n_B[i]=MonsterOBJ[...][i]` 一致 */
export const LEGACY_NB_LENGTH = 27;

export function buildLegacyNBFromMonsterIndex(monsterIndex: number): readonly number[] {
  const row = MONSTER_OBJ[monsterIndex] as MonsterRowTuple | undefined;
  const out = new Array<number>(LEGACY_NB_LENGTH).fill(0);
  if (!row) return out;
  for (let i = 0; i < LEGACY_NB_LENGTH; i++) {
    const v = row[i];
    out[i] = typeof v === "number" && Number.isFinite(v) ? v : 0;
  }
  return out;
}

/**
 * `head.js` `calc`：`n_B_DEF2[2]=n_B[23]`、`n_B_DEF2[0]=n_B[24]`、`n_B_DEF2[1]` 为二者均值。
 * 与 `BattleCalc(w_atk, w_2)` 第二参 0/1/2（min/ave/max）扣减一致。
 */
export function legacyNBSoftDefTriplet(nB: readonly number[]): readonly [number, number, number] {
  const d2 = Math.floor(Number(nB[23]) || 0);
  const d0 = Math.floor(Number(nB[24]) || 0);
  const d1 = Math.floor((d2 + d0) / 2);
  return [d0, d1, d2];
}
