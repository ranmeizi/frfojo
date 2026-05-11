import { JOB_BOARD_ROWS } from "./jobBoardData";
import type { FormJobId, SixStats } from "./types";
import { resolveCombatJob } from "./jobResolve";

function accumulateRow(
  row: readonly (number | "n")[],
  jobLv: number,
  acc: number[],
): void {
  for (let i = 0; i < row.length; i += 2) {
    const lv = row[i];
    if (lv === "n") break;
    if (typeof lv !== "number") break;
    const statIdx = row[i + 1];
    if (typeof statIdx !== "number") break;
    if (lv <= jobLv) acc[statIdx] += 1;
  }
}

/**
 * JobLV 面板奖励（不含装备 / 被动技能），对应 legacy StPlusCalc 中 w2 部分。
 */
export function computeJobBoardBonus(
  formJobId: FormJobId,
  jobLv: number,
): SixStats {
  const { effectiveJobId, isTensei } = resolveCombatJob(formJobId);
  const acc = [0, 0, 0, 0, 0, 0];

  const mainRow = JOB_BOARD_ROWS[effectiveJobId] ?? ["n"];
  accumulateRow(mainRow, jobLv, acc);

  if (effectiveJobId === 0 && isTensei) {
    const ex = JOB_BOARD_ROWS[34] ?? ["n"];
    accumulateRow(ex, jobLv, acc);
  }

  if (effectiveJobId === 20 && jobLv === 71) {
    for (let i = 0; i < 6; i++) acc[i] += 10;
  }

  return {
    str: acc[0],
    agi: acc[1],
    vit: acc[2],
    int: acc[3],
    dex: acc[4],
    luk: acc[5],
  };
}

export function addSix(a: SixStats, b: SixStats): SixStats {
  return {
    str: a.str + b.str,
    agi: a.agi + b.agi,
    vit: a.vit + b.vit,
    int: a.int + b.int,
    dex: a.dex + b.dex,
    luk: a.luk + b.luk,
  };
}
