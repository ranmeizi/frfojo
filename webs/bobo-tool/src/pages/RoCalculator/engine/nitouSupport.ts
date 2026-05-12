import type { EquipmentState } from "./types";

/** 原版 `n_A_JOB == 8 || 22`（刺客 / 十字刺客）且 `ClickWeaponType2` 非空手时可 `n_Nitou`（`refer/head.js`） */
export function jobSupportsDualWield(effectiveJobId: number): boolean {
  return effectiveJobId === 8 || effectiveJobId === 22;
}

/** 等同 `refer/foot.js` 读档后 `n_Nitou == 1`：第二武器有 id 且勾选二刀且职业允许 */
export function isNitouActive(
  eq: EquipmentState,
  effectiveJobId: number | undefined,
): boolean {
  if (effectiveJobId === undefined) return false;
  if (!jobSupportsDualWield(effectiveJobId)) return false;
  return Boolean(eq.dualWield && eq.weapon2Id > 0);
}
