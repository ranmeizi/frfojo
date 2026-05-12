import type { SixStats } from "./types";

/**
 * refer item.js `Item_Setumei`：212～215 的说明与 2～5 相同（STR/AGI/VIT/INT/DEX 平铺）。
 * foot.js `StPlusCalc` 在加完 `StPlusCalc2(2..6)` 后，再分别 `+= StPlusCalc2(212..215)`。
 * 套装等脚本常用 212 写 AGI，漏计则 ASPD（依赖运算用 AGI）也会偏。
 */
export function sixStatsFromItemScriptCodes(sumCode: (statCode: number) => number): SixStats {
  const c7 = sumCode(7);
  return {
    str: sumCode(1) + c7,
    agi: sumCode(2) + sumCode(212) + c7,
    vit: sumCode(3) + sumCode(213) + c7,
    int: sumCode(4) + sumCode(214) + c7,
    dex: sumCode(5) + sumCode(215) + c7,
    luk: sumCode(6) + c7,
  };
}
