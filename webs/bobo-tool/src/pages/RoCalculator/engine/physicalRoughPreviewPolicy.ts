/**
 * 对敌物伤预览（`computeBattlePhysicalRoughPreview`）与 **`refer/js2/head.js` `calc()`** 的 **`w_ActS`** 主链对齐策略（阶段 **E**）。
 *
 * **E1**：`w_ActS` 列表（**~479**，与原版顺序一致，至 **437**）。
 * **E2**：在 **`W_ACTS`** ∪ **扩展集** 内的主动，允许沿用 **普攻同源 `n_A_DMG` 三档** + `BattleCalc` 近似链；**排除集**走独立分支或未接预览。
 */

/** `head.js` `w_ActS=[...,"NULL"]` 中数值段（不含占位） */
export const W_ACTS_HEAD_ACTIVE_IDS: readonly number[] = [
  6, 7, 19, 41, 44, 65, 71, 72, 73, 83, 84, 158, 161, 169, 171, 176, 188, 189, 199, 207, 248, 260, 261, 264, 288, 289, 290, 292, 302, 303, 305, 306, 326, 317, 318, 331, 333, 335, 337, 339, 382, 388, 398, 400, 419, 423, 428, 429, 430, 431, 432, 434, 435, 436, 437,
];

const W_ACTS_SET = new Set<number>(W_ACTS_HEAD_ACTIVE_IDS);

/** 不在 `w_ActS` 内、但已单独接 **`BattleCalc2`** / 展示尾乘的物伤预览 */
export const ACTIVE_PHYSICAL_PREVIEW_TRIPLET_EXTRA = new Set<number>([394, 395]);

/**
 * 不复用「普攻 **`n_A_DMG` 三档 + `BattleCalc`**」近似（另有 **`n_A_MATK`** / 暴击专支等）。
 * 与 refer **`calc()`** 中 **`272/401`** 早退、**`275`** MATK 支一致。
 */
export const ACTIVE_PHYSICAL_PREVIEW_EXCLUDE = new Set<number>([272, 401, 275]);

export function isPhysicalRoughTripletPreviewSupported(activeSkillId: number): boolean {
  const id = Math.floor(Number(activeSkillId) || 0);
  if (ACTIVE_PHYSICAL_PREVIEW_EXCLUDE.has(id)) return false;
  if (id === 0) return true;
  if (ACTIVE_PHYSICAL_PREVIEW_TRIPLET_EXTRA.has(id)) return true;
  return W_ACTS_SET.has(id);
}

/** 供 **`computeBattlePhysicalRoughPreview`** 的 `reasonDisabled`；已支持时返回空串 */
export function physicalRoughPreviewUnsupportedReason(activeSkillId: number): string {
  if (isPhysicalRoughTripletPreviewSupported(activeSkillId)) return "";
  const id = Math.floor(Number(activeSkillId) || 0);
  if (ACTIVE_PHYSICAL_PREVIEW_EXCLUDE.has(id)) {
    if (id === 275) return "主动 275 为 MATK 段，未接普攻型三档物伤预览";
    return "主动 272 / 401 走暴击专支，未接普攻型三档物伤预览";
  }
  return `主动 ${id} 未纳入物伤三档预览（非 refer「w_ActS」主链及已扩展项）`;
}
