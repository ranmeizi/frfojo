/**
 * `refer/js2/head.js` 中设 **`not_use_card = 1`** 的主动技（`calc()` **`w_ActS`** 分支等），
 * **`BaiCI`** 走 **`wBCEDPch==0 && not_use_card==0`** 外大卡段、仅 **4260～4298** 尾段（与 **437** 同形）。
 *
 * 注：**423** 在 **686～690** 亦设 **`not_use_card=1`**；**394/395** 在展示分支另设。
 */
export const ACTIVE_IDS_NOT_USE_CARD_BAICI = new Set<number>([
  19,
  88,
  111,
  248,
  263,
  264,
  302,
  306,
  326,
  382,
  419,
  423,
  437,
  394,
  395,
]);

export function baiCISkipsFullCardTokBlock(activeSkillId: number): boolean {
  return ACTIVE_IDS_NOT_USE_CARD_BAICI.has(Math.floor(Number(activeSkillId) || 0));
}
