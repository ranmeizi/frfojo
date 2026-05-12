import type { EnemyCombatState } from "./types";

/**
 * 与 `refer/head.js` `ClickB_Enemy`（Taijin=0、魔物表）中最终 **`n_B[27]`** 同源子集，
 * 供 `w_HIT = n_A_HIT + 80 - n_B_FLEE` 使用（`calc` 末 `n_B_FLEE = n_B[27]`）。
 *
 * 仅保留 **会改变 AGI 或 `n_B[27]`** 的分支。未接：`StPlusCalc2`、`n_B_KYOUKA[7/8]` 等；**Taijin=1** 未建。
 */
export function computeLegacyMonsterFlee27(
  enemyCombat: EnemyCombatState,
  nB: readonly number[],
): number {
  const ij = enemyCombat.abnormal;
  const kq = enemyCombat.defender;

  const race = Math.floor(Number(nB[2]) || 0);
  const lv = Math.floor(Number(nB[5]) || 0);
  let agi = Math.floor(Number(nB[8]) || 0);
  let dex = Math.floor(Number(nB[10]) || 0);
  const boss = Math.floor(Number(nB[19]) || 0);

  if (kq[0]) agi += 2 + Math.floor(Number(kq[0]) || 0);

  if (ij[1]) {
    const w2 = Math.floor(Number(ij[1]) || 0) * 10;
    let w = Math.floor(agi / 2);
    if (w > w2) agi -= w2;
    else agi -= w;
    w = Math.floor(dex / 2);
    if (w > w2) dex -= w2;
    else dex -= w;
  }

  if (boss === 0 && ij[11]) {
    agi -= Math.floor(Number(ij[11]) || 0) + 2;
    if (agi < 0) agi = 0;
  }

  let n27 = lv + agi;

  if (boss === 0 && ij[3]) {
    n27 -= Math.floor((n27 * 25) / 100);
  }

  if (kq[5]) n27 *= 2;

  if (boss === 0 && ij[17]) {
    n27 -= 50;
    if (n27 < 1) n27 = 1;
  }

  if (boss === 0) {
    if (ij[4] && race !== 1) n27 = -19;
    else if (ij[7] || ij[8]) n27 = -19;
    else if (ij[9] && race !== 1) n27 = -19;
  }

  return Math.floor(n27);
}
