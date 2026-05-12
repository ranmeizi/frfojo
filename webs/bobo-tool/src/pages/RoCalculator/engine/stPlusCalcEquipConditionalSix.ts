import { passiveLevelBySkillId } from "./passiveSkillLevel";
import { cardNumSearch, equipNumSearch } from "./equipCardCount";
import { legacyJobSearch } from "./legacyJobSearch";
import { resolveCombatJob } from "./jobResolve";
import type { CharacterBaseInput, SixStats } from "./types";

const ZERO: SixStats = {
  str: 0,
  agi: 0,
  vit: 0,
  int: 0,
  dex: 0,
  luk: 0,
};

/**
 * `StPlusCalc` 中 `EquipNumSearch` / 职业分支 / 精炼 / 被动 234 等装备条件六维（foot.js 约 1661–1682）。
 * 使用左栏手填素质作 `SU_*`（与原版裸值一致）。
 */
export function stPlusCalcEquipConditionalSix(input: CharacterBaseInput): SixStats {
  const { effectiveJobId } = resolveCombatJob(input.formJobId);
  const d = { ...ZERO };
  const eq = input.equipment;
  const su = input.stats;
  const js = legacyJobSearch(input.formJobId);
  const L234 = passiveLevelBySkillId(
    input.formJobId,
    input.passiveSkillLevels,
    234,
  );

  if (eq.head1Refine >= 7 && equipNumSearch(eq, 1086, effectiveJobId) > 0) d.str += 1;
  if (js === 41 && equipNumSearch(eq, 672, effectiveJobId) > 0) d.agi += 1;
  if (js === 41 && equipNumSearch(eq, 673, effectiveJobId) > 0) d.int += 1;
  if (js === 41 && equipNumSearch(eq, 675, effectiveJobId) > 0) d.luk += 2;
  if (js === 41 && equipNumSearch(eq, 676, effectiveJobId) > 0) d.dex += 2;
  if (js === 41 && equipNumSearch(eq, 678, effectiveJobId) > 0) d.luk += 1;
  if (eq.shoesRefine >= 9 && equipNumSearch(eq, 717, effectiveJobId) > 0) d.agi += 2;
  if (equipNumSearch(eq, 649, effectiveJobId) > 0) d.dex -= su.dex;
  if (equipNumSearch(eq, 1064, effectiveJobId) > 0 && eq.weaponRefine >= 6) {
    d.int += eq.weaponRefine - 6;
  }
  if (equipNumSearch(eq, 1067, effectiveJobId) > 0 && L234 === 5) d.int += 3;
  if (input.weaponType === 9) d.int += cardNumSearch(eq, 466, effectiveJobId);

  return d;
}
