/**
 * `refer/head.js` **`tPlusLucky(wPL)`**（约 **4702～4712**）：
 * - **`Taijin==0`**（魔物表）：**恒等**，`return wPL`。
 * - **`Taijin==1`**（玩家对战）：`wPL * (100 - w) / 100`，其中 **`w = B_TAISEI6 + n_B[11] / 10`**（表单 + 魔物 LUK）。
 *
 * 本计算器主流程为 **魔物**（`Taijin=0`），期望一击与原版一致为 **不缩放**；传入 **`taijin: true`** 时可接 PvP 近似。
 */
export type TPlusLuckyBattleCalc3Input = {
  taijin: boolean;
  /** 对齐 `document.calcForm.B_TAISEI6`；仅 `taijin` 时读取 */
  taisei6Percent?: number;
  /** `n_B[11]` 魔物 LUK；仅 `taijin` 时参与 `+ luk/10` */
  monsterLuk?: number;
};

export function applyTPlusLuckyBattleCalc3(
  wPL: number,
  input: TPlusLuckyBattleCalc3Input,
): number {
  if (!Number.isFinite(wPL)) return 0;
  if (!input.taijin) return wPL;

  const t6 = Number(input.taisei6Percent ?? 0);
  const mluk = Math.max(0, Number(input.monsterLuk ?? 0));
  const w = (Number.isFinite(t6) ? t6 : 0) + mluk / 10;
  const clamped = Math.min(99.999, Math.max(0, w));
  return (wPL * (100 - clamped)) / 100;
}
