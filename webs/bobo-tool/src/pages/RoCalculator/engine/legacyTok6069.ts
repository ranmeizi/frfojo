import type { CharacterBaseInput } from "./types";

/** 与 `n_A_zokusei` 计算中使用的 `n_tok[60 + i]` 下标对齐：`out[k]` ≡ `n_tok[60 + k]` 的增量（仅本文件实现的来源） */
export const LEGACY_TOK60TO69_LEN = 10;

/**
 * `refer/foot.js` 中写入 `n_tok[61–69]` 的片段：`PassSkill3[7]` 抗歌、`PassSkill7[11–14]` 四抗药（约 1531–1552）。
 * 不含卡片/装备/其它 `n_tok` 来源。
 */
export function additiveTok60to69FromPassSkill3AndFood(
  input: CharacterBaseInput,
): number[] {
  const a = Array.from({ length: LEGACY_TOK60TO69_LEN }, () => 0);
  const pd = input.performanceDance;
  if (pd.lv7 > 0) {
    const v = 55 + 5 * pd.lv7;
    for (let i = 61; i <= 69; i++) a[i - 60] += v;
  }
  const f = input.foodConsumable;
  if (f.resistWater) {
    a[61 - 60] += 20;
    a[64 - 60] -= 15;
  }
  if (f.resistEarth) {
    a[62 - 60] += 20;
    a[63 - 60] -= 15;
  }
  if (f.resistFire) {
    a[63 - 60] += 20;
    a[61 - 60] -= 15;
  }
  if (f.resistWind) {
    a[64 - 60] += 20;
    a[62 - 60] -= 15;
  }
  return a;
}
