import { CARD_SET_DEFINITIONS } from "./cardSetData";
import { isNitouActive } from "./nitouSupport";
import type { EquipmentState } from "./types";

/** 与 `CardNumSearch` / 套卡匹配一致：统一为有限正整数，避免存档里字符串 id 导致无法命中 w_SC */
export function slotCardId(raw: number | string | undefined | null): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n);
}

/** 与 foot.js `n_A_card[0..15]` 一致：主手卡 0～3、二刀时副手 4～7、否则 0、头上下、左手、身、披肩、鞋、饰品×2 */
export function legacyEquippedCardIds0to15(
  eq: EquipmentState,
  effectiveJobId?: number,
): number[] {
  const nitou = isNitouActive(eq, effectiveJobId);
  return [
    slotCardId(eq.weaponCard1),
    slotCardId(eq.weaponCard2),
    slotCardId(eq.weaponCard3),
    slotCardId(eq.weaponCard4),
    ...(nitou
      ? [
          slotCardId(eq.weapon2Card1),
          slotCardId(eq.weapon2Card2),
          slotCardId(eq.weapon2Card3),
          slotCardId(eq.weapon2Card4),
        ]
      : [0, 0, 0, 0]),
    slotCardId(eq.head1Card),
    slotCardId(eq.head2Card),
    slotCardId(eq.leftCard),
    slotCardId(eq.bodyCard),
    slotCardId(eq.shoulderCard),
    slotCardId(eq.shoesCard),
    slotCardId(eq.acc1Card),
    slotCardId(eq.acc2Card),
  ];
}

/**
 * 与 refer `SetCard()` 单行逻辑一致：依次确认 w_SC[k][1]、[2]… 各卡 id 均在 `n_A_card[0..15]` 中出现
 *（含「同 id 占两格」时仍可能匹配同一槽，与原版循环一致）。
 */
function legacySetCardRowMatches(
  nACard0to15: readonly number[],
  pieces: readonly number[],
): boolean {
  if (pieces.length === 0) return false;
  let w_ch = 0;
  for (let j = 0; j < pieces.length; j++) {
    const lj = j + 1;
    if (!(w_ch === 1 || (w_ch === 0 && lj === 1))) break;
    w_ch = 0;
    const target = slotCardId(pieces[j]);
    if (target <= 0) break;
    for (let i = 0; i <= 15 && w_ch === 0; i++) {
      if (slotCardId(nACard0to15[i]) === target) w_ch = 1;
    }
  }
  return w_ch === 1;
}

/** 等同 refer `SetCard()` 写入 `n_A_card[16..25]` 的奖励卡 id 列表（顺序与 k 递增一致） */
export function activeCardSetBonusCardIds(
  eq: EquipmentState,
  effectiveJobId?: number,
): number[] {
  const worn = legacyEquippedCardIds0to15(eq, effectiveJobId);
  const out: number[] = [];
  for (const def of CARD_SET_DEFINITIONS) {
    if (legacySetCardRowMatches(worn, def.requiredCardIds)) {
      out.push(def.bonusCardId);
    }
  }
  return out;
}
