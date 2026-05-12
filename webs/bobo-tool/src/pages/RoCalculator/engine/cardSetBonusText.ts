import { CARD_STAT_TABLE, CARD_STAT_TABLE_MAX_ID } from "./cardStats.generated";
import { cardLabel } from "./cardObject.generated";
import { formatItemSetumeiLine } from "./itemSetumei";

/** 将虚拟奖励卡（w_SC 首列 id）的脚本行转为可读说明，与物品资料同源 `formatItemSetumeiLine` */
export function formatCardSetBonusVirtualEffect(cardId: number): string {
  if (cardId <= 0 || cardId > CARD_STAT_TABLE_MAX_ID) return "";
  const row = CARD_STAT_TABLE[cardId];
  if (!row?.length) return cardLabel(cardId);
  const parts: string[] = [];
  for (const p of row) {
    parts.push(formatItemSetumeiLine(p.code, p.value));
  }
  return parts.join("；");
}

/** 多条激活套卡时，每条一行（奖励卡 id + 名称 + 脚本说明） */
export function formatActiveCardSetDescriptions(bonusCardIds: readonly number[]): string {
  if (bonusCardIds.length === 0) return "";
  return bonusCardIds
    .map((id) => {
      const script = formatCardSetBonusVirtualEffect(id);
      const name = cardLabel(id);
      return script ? `#${id} ${name}：${script}` : `#${id} ${name}`;
    })
    .join("\n");
}
