import type { HolySupportState } from "./types";

/**
 * legacy `n_A_PassSkill6` 与原版表单 A6_Skill 的对应关系（以 foot.js 为准）：
 * - [3]：StPlusCalc 里 DEX/AGI 乘段 `(102 + n) / 100`（原版 EN62 控件名 A6_Skill3，表头写作「虎蜥人…」）
 * - [4]：MATK 乘段 `100 + 20 * n`（原版 EN63「领域支援」行 → A6_Skill4）
 * - [5]：VIT 软防段 `0.95 - 0.05 * n`（原版 EN64「挑衅支援」行 → A6_Skill5）
 *
 * React 状态字段名沿用了「表头语义」，与数组下标不一致，演算时必须用本文件的 getter。
 */

export function passSkill6DomainLevel(h: HolySupportState): number {
  return h.raptorMind;
}

export function passSkill6ProvokeMatkLevel(h: HolySupportState): number {
  return h.domainSupport;
}

export function passSkill6RaptorVitDefLevel(h: HolySupportState): number {
  return h.provokeSupport;
}
