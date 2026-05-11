import { JOB_EQUIP_ITEM_OBJ } from "./jobEquipItem.generated";

/**
 * 与 legacy JobEquipItemSearch 一致；effectiveJobId 为 n_A_JobSet 之后的职业下标。
 */
export function jobCanEquipItem(
  effectiveJobId: number,
  isTensei: boolean,
  jobReq: number,
): boolean {
  let req = jobReq;
  if (req >= 1000) {
    if (isTensei) req -= 1000;
    else return false;
  }
  const row = JOB_EQUIP_ITEM_OBJ[effectiveJobId];
  if (!row?.length) return false;
  for (let j = 0; j < row.length; j++) {
    const cell = row[j];
    if (cell === 999) break;
    if (cell === req) return true;
  }
  return false;
}
