import { stTokEquipApprox } from "./baiCIPhysical";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import type { CharacterBaseInput } from "./types";

/**
 * `refer/js2/head.js` **`BattleCalc4`**（约 **4355～4384**）物伤扣防段：
 * - 主动 **275**、**432**；
 * - **`n_tok[23]`** 非 0 时走 **反转防御** 公式；
 * - 否则 **`n_tok[23]==0`** 时：满足 **`n_tok[180+魔物种族]`**、**`n_tok[22]`**（含 MVP 例外）、**被动 364** 则 **不减防**（`wBC4+wBC4_3`）；
 * - 默认：`⌊ATK×(100−硬防%)/100⌋ − n_B_DEF2[w_2] + 精炼`。
 *
 * `n_tok[*]` 用 **`stTokEquipApprox`**（卡+套+穿+`baiCINFootNtTokDelta`）近似。
 */
export function battleCalc4PhysicalApprox(p: {
  nAdmg: number;
  seirenAtk: number;
  monsterHardDefPercent: number;
  /** 对应 `n_B_DEF2[wBC4_2]`，已与 `w_2` 对齐 */
  softDefSubtract: number;
  /** `BattleCalc(..., w_2)` 的 0/1/2（min/ave/max） */
  softDefIdx: 0 | 1 | 2;
  def2Triplet: readonly [number, number, number];
  input: CharacterBaseInput;
  effectiveJobId: number;
  legacyNB: readonly number[];
}): number {
  const {
    nAdmg,
    seirenAtk,
    monsterHardDefPercent,
    softDefSubtract,
    softDefIdx,
    def2Triplet,
    input,
    effectiveJobId,
    legacyNB,
  } = p;
  const na = Math.floor(nAdmg);
  const sr = Math.floor(seirenAtk);
  const hd = Math.max(0, Math.min(100, Math.floor(monsterHardDefPercent)));
  const eq = input.equipment;
  const aid = Math.floor(Number(input.activeSkillId) || 0);
  const fj = input.formJobId;
  const passive = input.passiveSkillLevels;
  const race = Math.floor(Number(legacyNB[2]) || 0);
  const boss = Math.floor(Number(legacyNB[19]) || 0);

  const tok23 = stTokEquipApprox(eq, 23, effectiveJobId, input);
  const tok22 = stTokEquipApprox(eq, 22, effectiveJobId, input);
  const tok180Race = stTokEquipApprox(eq, 180 + race, effectiveJobId, input);
  const L364 = passiveLevelBySkillId(fj, passive, 364);

  if (aid === 275) {
    return Math.floor((na * (100 - hd)) / 100) - softDefSubtract + sr;
  }

  const [d0, d1, d2] = def2Triplet;
  const iw = softDefIdx;

  if (tok23 !== 0) {
    let w: number;
    if (iw === 0) w = Math.floor((na * (d2 + hd)) / 100) + sr;
    else if (iw === 1) w = Math.floor((na * (d1 + hd)) / 100) + sr;
    else w = Math.floor((na * (d0 + hd)) / 100) + sr;
    return w;
  }

  if (aid === 432) return na + sr;
  if (tok180Race >= 1) return na + sr;
  if (tok22 >= 1 && boss === 0) return na + sr;
  if (tok22 >= 10) return na + sr;
  if (L364 > 0) return na + sr;

  return Math.floor((na * (100 - hd)) / 100) - softDefSubtract + sr;
}
