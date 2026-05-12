import type { CharacterBaseInput } from "./types";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import { zokuseiDamageMultiplier } from "./zokuseiDamageTable";
import { card106BonusBattleCalc2FromWeapon } from "./battleCalc2ZeroMiss";

/**
 * `head.js` `BattleCalc2(w999)` 的 **普攻可迁子集**（Taijin=0）：
 *
 * - `w999_AB = (w999>0)`（用于 254 段）
 * - `w999 += 2*SkillSearch(148)`
 * - **`wBCEDPch==0`**：`w999 *= zokusei[n_B[3]][n_A_Weapon_zokusei]`
 * - `weaponType==0 && SkillSearch(329)` 且主动 **331/333/335/337**：`+10*329`
 * - `job 15/29` → `+3*SkillSearch(185)`，否则 `+3*PassSkill2[10]`（`buffSupport.weaponResearchLv`）
 * - `+3*SkillSearch(416)`
 * - `weaponType!=0 && w999_AB==1` → `+20*SkillSearch(254)`
 * - **`wBCEDPch==0`**：主动 **17/307** `+15*Lv`；主动 **86** 且魔物属非念：`+75`
 * - 武器槽卡 106：`+5/+40/+10`
 *
 * 不含：423/437、394/395、Taijin=1、**`BaiCI`**（由外层统一处理）。**`wBCEDPch==1`**（`BattleCalcEDP` 内层）见参数 **`wBCEDPch1`**。
 */
export function battleCalc2ApproxNoBaiCI(p: {
  input: CharacterBaseInput;
  w999Start: number;
  monsterElementCode: number;
  weaponZokuseiIndex: number;
  weaponType: number;
  /** `head.js` **`wBCEDPch==1`**：跳过 BC2 **属克乘子**与 **4108～4112** 主动加段 */
  wBCEDPch1?: boolean;
}): number {
  const {
    input,
    w999Start,
    monsterElementCode,
    weaponZokuseiIndex,
    weaponType,
    wBCEDPch1 = false,
  } = p;
  const fj = input.formJobId;
  const passive = input.passiveSkillLevels;
  const aid = Math.floor(Number(input.activeSkillId) || 0);
  const alv = Math.max(0, Math.floor(input.activeSkillLv));

  const w999_AB = w999Start > 0 ? 1 : 0;

  const L148 = passiveLevelBySkillId(fj, passive, 148);
  const L416 = passiveLevelBySkillId(fj, passive, 416);
  const L254 = passiveLevelBySkillId(fj, passive, 254);

  let w999 = Math.floor(w999Start) + 2 * L148;
  if (!wBCEDPch1) {
    w999 *= zokuseiDamageMultiplier(monsterElementCode, weaponZokuseiIndex);
  }

  const wt = Math.floor(weaponType);
  if (!wBCEDPch1 && wt === 0 && passiveLevelBySkillId(fj, passive, 329)) {
    if (aid === 331 || aid === 333 || aid === 335 || aid === 337) {
      w999 += 10 * passiveLevelBySkillId(fj, passive, 329);
    }
  }

  if (fj === 15 || fj === 29) {
    const L185 = passiveLevelBySkillId(fj, passive, 185);
    w999 += 3 * L185;
  } else {
    const p2 = Math.min(5, Math.max(0, Math.floor(input.buffSupport.weaponResearchLv ?? 0)));
    w999 += 3 * p2;
  }

  w999 += 3 * L416;

  if (wt !== 0 && w999_AB === 1) {
    w999 += 20 * L254;
  }

  if (!wBCEDPch1) {
    if (aid === 17 || aid === 307) {
      w999 += 15 * alv;
    }
    const elem = Math.floor(monsterElementCode);
    if (aid === 86 && (elem < 50 || elem >= 60)) {
      w999 += 75;
    }
  }

  w999 += card106BonusBattleCalc2FromWeapon(input.equipment);

  return Math.floor(w999);
}
