/** 由 scripts/gen-card-set-data.mjs 从 refer/js/card.js 的 w_SC 生成，勿手改。运行：pnpm gen:ro-card-sets */

export type CardSetDef = {
  readonly bonusCardId: number;
  readonly requiredCardIds: readonly number[];
};

export const CARD_SET_DEFINITIONS: readonly CardSetDef[] = [
  { bonusCardId: 429, requiredCardIds: [306, 235] },
  { bonusCardId: 430, requiredCardIds: [349, 305] },
  { bonusCardId: 431, requiredCardIds: [254, 259, 356] },
  { bonusCardId: 432, requiredCardIds: [229, 280, 352] },
  { bonusCardId: 433, requiredCardIds: [291, 234] },
  { bonusCardId: 434, requiredCardIds: [322, 320] },
  { bonusCardId: 435, requiredCardIds: [273, 98] },
  { bonusCardId: 436, requiredCardIds: [274, 73] },
  { bonusCardId: 437, requiredCardIds: [245, 40] },
  { bonusCardId: 438, requiredCardIds: [9, 308] },
  { bonusCardId: 439, requiredCardIds: [58, 276] },
  { bonusCardId: 440, requiredCardIds: [50, 344] },
  { bonusCardId: 441, requiredCardIds: [125, 370, 393] },
  { bonusCardId: 442, requiredCardIds: [294, 10] },
  { bonusCardId: 442, requiredCardIds: [341, 88] },
  { bonusCardId: 442, requiredCardIds: [243, 7] },
  { bonusCardId: 442, requiredCardIds: [372, 64] },
  { bonusCardId: 442, requiredCardIds: [369, 68] },
  { bonusCardId: 442, requiredCardIds: [338, 72] },
  { bonusCardId: 448, requiredCardIds: [218, 212] },
  { bonusCardId: 449, requiredCardIds: [248, 247] },
  { bonusCardId: 450, requiredCardIds: [223, 317, 347, 354, 362] },
  { bonusCardId: 451, requiredCardIds: [233, 295, 391, 395, 260] },
  { bonusCardId: 452, requiredCardIds: [253, 383, 307, 301, 270] },
  { bonusCardId: 453, requiredCardIds: [279, 224, 340, 351, 230] },
  { bonusCardId: 454, requiredCardIds: [337, 358, 220, 346, 379, 350] },
  { bonusCardId: 455, requiredCardIds: [326, 376, 281, 388, 216] },
  { bonusCardId: 456, requiredCardIds: [190, 347, 354, 362] },
  { bonusCardId: 457, requiredCardIds: [413, 113, 295, 391, 260] },
  { bonusCardId: 458, requiredCardIds: [253, 383, 181, 270] },
  { bonusCardId: 459, requiredCardIds: [279, 408, 224, 340, 230] },
  { bonusCardId: 460, requiredCardIds: [337, 193, 346, 379, 350] },
  { bonusCardId: 461, requiredCardIds: [326, 175, 281, 388, 104] },
] as const;
