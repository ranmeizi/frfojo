import type { CharacterBaseInput } from "./types";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import { zokuseiDamageMultiplier } from "./zokuseiDamageTable";
import { card106BonusBattleCalc2FromWeapon } from "./battleCalc2ZeroMiss";
import {
  kunaiBattleCalc395FlatFromSubIndex,
  syurikenFlatAtkFromSubIndex,
} from "./ninjaAmmoTables";

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
 * - 主动 **423**：`+⌊MATK[w_MagiclBulet]*(100−n_B[15])/100⌋ − n_B_MDEF2`（需 **`matkMin`/`matkMax`** 与 **`matkDamageLineIdx`**）
 * - 主动 **437**：`+50*Lv`
 * - 武器槽卡 106：`+5/+40/+10`
 * - 主动 **394**：`SyurikenOBJ[SkillSubNum][0] + 3*SkillSearch(393) + 4*Lv`（**在卡 106 之后**，与 refer **4133～4137** 一致）
 * - 主动 **395**：`KunaiOBJ[SkillSubNum][0]*3`（**4139～4140**）
 *
 * 不含：Taijin=1、**`BaiCI`**（由外层统一处理）。**`wBCEDPch==1`**（`BattleCalcEDP` 内层）见参数 **`wBCEDPch1`**。  
 * **423/437** 加段在 refer 中位于 **4108～4112** 之外，**`wBCEDPch1`** 时仍会执行；**394/395** 亦无 **`wBCEDPch==0`** 包裹，内层同样执行。
 */
export function battleCalc2ApproxNoBaiCI(p: {
  input: CharacterBaseInput;
  w999Start: number;
  monsterElementCode: number;
  weaponZokuseiIndex: number;
  weaponType: number;
  /** `head.js` **`wBCEDPch==1`**：跳过 BC2 **属克乘子**与 **4108～4112** 主动加段 */
  wBCEDPch1?: boolean;
  /** 魔物行：`n_B[15]` MDEF%、`n_B[25]` MDEF2（主动 **423**） */
  legacyNB?: readonly number[];
  /** 与 `head.js` 循环 `w_MagiclBulet` 一致：0=min / 1=中档 / 2=max MATK */
  matkDamageLineIdx?: 0 | 1 | 2;
  matkMin?: number;
  matkMax?: number;
}): number {
  const {
    input,
    w999Start,
    monsterElementCode,
    weaponZokuseiIndex,
    weaponType,
    wBCEDPch1 = false,
    legacyNB,
    matkDamageLineIdx,
    matkMin,
    matkMax,
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

  if (aid === 423 && legacyNB && matkMin !== undefined && matkMax !== undefined && matkDamageLineIdx !== undefined) {
    const mdfPct = Math.max(0, Math.floor(Number(legacyNB[15]) || 0));
    const mdf2 = Math.floor(Number(legacyNB[25]) || 0);
    const idx = matkDamageLineIdx;
    const matkSel =
      idx === 0 ? matkMin : idx === 2 ? matkMax : Math.floor((matkMin + matkMax) / 2);
    w999 += Math.floor((matkSel * (100 - mdfPct)) / 100) - mdf2;
  }
  if (aid === 437) {
    w999 += alv * 50;
  }

  w999 += card106BonusBattleCalc2FromWeapon(input.equipment);

  if (aid === 394) {
    const sub = Math.max(0, Math.floor(input.activeSkillSubIndex));
    w999 +=
      syurikenFlatAtkFromSubIndex(sub) +
      3 * passiveLevelBySkillId(fj, passive, 393) +
      4 * alv;
  }
  if (aid === 395) {
    const sub = Math.max(0, Math.floor(input.activeSkillSubIndex));
    w999 += kunaiBattleCalc395FlatFromSubIndex(sub);
  }

  return Math.floor(w999);
}
