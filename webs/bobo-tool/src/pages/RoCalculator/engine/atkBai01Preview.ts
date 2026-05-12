import { sumCardStPlus } from "./cardBonuses";
import {
  sumSetBonusStPlus,
  sumWornEquipItemScriptStPlus,
} from "./equipmentSetBonus";
import {
  passSkill6RaptorVitDefLevel,
} from "./holyPassSkill6";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import type { CharacterBaseInput } from "./types";

/** `head.js` `ATKbai01`：上述主动技时跳过整段 */
const ATKBAI01_SKIP_ACTIVE_SKILLS = new Set([193, 197, 321]);

function sumStPlusCode(
  input: CharacterBaseInput,
  effectiveJobId: number,
  code: number,
): number {
  const eq = input.equipment;
  return (
    sumCardStPlus(eq, code, effectiveJobId) +
    sumSetBonusStPlus(eq, code, effectiveJobId) +
    sumWornEquipItemScriptStPlus(eq, code, effectiveJobId)
  );
}

/**
 * 近似 `refer/head.js` `ATKbai01` 的 **`wA01` 百分底**（从 100 起加算）。
 * 含：`SkillSearch(12)` / `PassSkill6[5]` / `PassSkill2[12]` 互斥前三项、`256`/`270`、**`PassSkill5[3]`**、**`PassSkill6[2]`**、script **87**。
 */
export function computeAtkBai01PercentApprox(
  input: CharacterBaseInput,
  effectiveJobId: number,
): number {
  if (ATKBAI01_SKIP_ACTIVE_SKILLS.has(input.activeSkillId)) return 100;

  const L = (id: number) =>
    passiveLevelBySkillId(input.formJobId, input.passiveSkillLevels, id);

  let wA01 = 100;
  const L12 = L(12);
  if (L12 > 0) wA01 += 32;
  else {
    const rap = passSkill6RaptorVitDefLevel(input.holySupport);
    if (rap > 0) wA01 += 2 + 3 * rap;
    else if (input.buffSupport.provoke) wA01 += 5;
  }
  const L256 = L(256);
  if (L256 > 0) wA01 += L256 * 5;
  const L270 = L(270);
  if (L270 > 0) wA01 += L270 * 2;
  if (input.guildLeader.atk100) wA01 += 100;
  if (input.holySupport.slaughterSystem > 0) wA01 += 10;
  wA01 += sumStPlusCode(input, effectiveJobId, 87);
  return wA01;
}

/** `head.js` `BattleHighCalc`：**`PassSkill5[5]`** 时对 `w_HiDam` 再 `×0.5` */
export function passSkill5HighDamageMultiplier(input: CharacterBaseInput): number {
  return input.guildLeader.damageHalf ? 0.5 : 1;
}
