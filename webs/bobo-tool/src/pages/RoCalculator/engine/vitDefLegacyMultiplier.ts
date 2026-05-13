import { stTokEquipApprox } from "./baiCIPhysical";
import { passSkill6RaptorVitDefLevel } from "./holyPassSkill6";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import type { CharacterBaseInput } from "./types";

/**
 * `refer/js2/foot.js` **775～813** `n_A_VITDEF[0/1/2]` 初值与乘段（**`258`** 末段清零；**`StPlusCalc2(24)`** 以 **`stTokEquipApprox(..., 24)`** 为除数，仅当 **>0** 时整除三档）。
 * 供 **`BattleHiDam`**（`head.js` **2075～2081**）按段扣减；**`computeVitDefLegacyMultiplierApprox`** 仍为不含 **24** 的标量展示用合并。
 */
export function computeVitDefSoftTriplet(
  vit: number,
  input: CharacterBaseInput,
  effectiveJobId: number,
): readonly [number, number, number] {
  const v = Math.max(0, Math.floor(vit));
  let n0 = Math.floor(v * 0.5) + Math.floor(v * 0.3);
  let n2 = Math.floor(v * 0.5) + Math.floor((v * v) / 150) - 1;
  let n1: number;
  if (n2 > n0) {
    n1 = (n0 + n2) / 2;
  } else {
    n1 = n0;
    n2 = n0;
  }

  const fj = input.formJobId;
  const passive = input.passiveSkillLevels;

  if (passiveLevelBySkillId(fj, passive, 258) > 0) {
    return [0, 0, 0];
  }

  if (passiveLevelBySkillId(fj, passive, 12) > 0) {
    n0 = Math.floor(n0 * 0.45);
    n1 = Math.floor(n1 * 0.45);
    n2 = Math.floor(n2 * 0.45);
  } else {
    const rap = passSkill6RaptorVitDefLevel(input.holySupport);
    if (rap > 0) {
      const f = 0.95 - 0.05 * rap;
      n0 = Math.floor(n0 * f);
      n1 = Math.floor(n1 * f);
      n2 = Math.floor(n2 * f);
    } else if (input.buffSupport.provoke) {
      n0 = Math.floor(n0 * 0.9);
      n1 = Math.floor(n1 * 0.9);
      n2 = Math.floor(n2 * 0.9);
    }
  }

  const d24 = stTokEquipApprox(input.equipment, 24, effectiveJobId, input);
  if (d24 > 0) {
    n0 = Math.floor(n0 / d24);
    n1 = Math.floor(n1 / d24);
    n2 = Math.floor(n2 / d24);
  }

  const L256 = passiveLevelBySkillId(fj, passive, 256);
  if (L256 > 0) {
    const f = 1 - 0.05 * L256;
    n0 = Math.floor(n0 * f);
    n1 = Math.floor(n1 * f);
    n2 = Math.floor(n2 * f);
  }

  const magnus = input.buffSupport.magnusLv;
  if (magnus > 0) {
    const f = 1 + 0.05 * magnus;
    n0 = Math.floor(n0 * f);
    n1 = Math.floor(n1 * f);
    n2 = Math.floor(n2 * f);
  }

  return [Math.max(0, n0), Math.max(0, n1), Math.max(0, n2)];
}

/**
 * 与 `refer/foot.js` 中 `n_A_VITDEF` 乘段同序的**近似**合并系数（不含 **`StPlusCalc2(24)`** 等装备项）。
 * 用于展示「VIT 软防承伤」量级；**承伤七段**请用 **`computeVitDefSoftTriplet`**。
 */
export function computeVitDefLegacyMultiplierApprox(
  input: CharacterBaseInput,
): number {
  const L12 = passiveLevelBySkillId(
    input.formJobId,
    input.passiveSkillLevels,
    12,
  );
  const L256 = passiveLevelBySkillId(
    input.formJobId,
    input.passiveSkillLevels,
    256,
  );
  const L258 = passiveLevelBySkillId(
    input.formJobId,
    input.passiveSkillLevels,
    258,
  );
  if (L258 > 0) return 0;

  let m = 1;
  if (L12 > 0) m *= 0.45;
  else {
    const rap = passSkill6RaptorVitDefLevel(input.holySupport);
    if (rap > 0) m *= 0.95 - 0.05 * rap;
    /** foot StAllCalc 814–816：`PassSkill2[12]`（A2_Skill12 挑衅）→ n_A_VITDEF×0.9 */
    else if (input.buffSupport.provoke) m *= 0.9;
  }

  if (L256 > 0) m *= 1 - 0.05 * L256;

  const magnus = input.buffSupport.magnusLv;
  if (magnus > 0) m *= 1 + 0.05 * magnus;

  return Math.max(0, Math.round(m * 10000) / 10000);
}
