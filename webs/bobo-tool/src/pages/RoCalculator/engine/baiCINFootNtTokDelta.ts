import { BOW_ARROW_HOLY_SACRED_INDEX } from "./bowArrowTable";
import { cardNumSearch, equipNumSearch } from "./equipCardCount";
import { passiveLevelBySkillId } from "./passiveSkillLevel";
import type { CharacterBaseInput } from "./types";

/**
 * `refer/foot.js` **`StAllCalc` 末段**（约 **1411～1526**，`KakutyouKansuu` 前）对 **`n_tok`** 的补丁中，
 * 会进入 **`head.js` `BaiCI`** 物伤乘段（**`30+种族`…`39`**、**`25`**、**`80`** 等）的部分。
 *
 * 已迁：**`[25]`**、**`[80]`**；**`[36]`**（`n_A_Arrow` 为神圣箭下标）、**`[39]`**（被动 **234×4**，龙族 **30+9**）。
 *
 * **阶段 B 边界**：**`[51]`～`[59]`**（452/屏障/971–977 等）、**`[60]`～`[69]`、`[150]`～`[159]`**（属抗/抗歌）、**`[191]`**、**`[78]`**、**534/828/176** 等**不**写入本函数，避免混入 `stTokEquipApprox` 物伤路径（见路线图 **B2**）。
 */
export function footNtTokDeltaForBaiCI(
  input: CharacterBaseInput,
  effectiveJobId: number,
  statCode: number,
): number {
  const eq = input.equipment;
  const fj = Math.floor(Number(input.formJobId) || 0);
  const arrow = Math.floor(Number(input.bowArrowIndex) || 0);
  const passive = input.passiveSkillLevels;

  if (statCode === 36) {
    /** 与 refer **`ArrowOBJ[n_A_Arrow][2]=="聖なる矢"`** 一致，仅看下标（原版不校验当前是否持弓） */
    if (arrow === BOW_ARROW_HOLY_SACRED_INDEX) return 5;
    return 0;
  }

  if (statCode === 39) {
    return 4 * passiveLevelBySkillId(fj, passive, 234);
  }

  if (statCode === 25) {
    let w = 0;
    if (equipNumSearch(eq, 628, effectiveJobId) && arrow === 4) w += 25;
    if (equipNumSearch(eq, 626, effectiveJobId) && arrow === 2) w += 25;
    if (equipNumSearch(eq, 627, effectiveJobId) && arrow === 5) w += 25;
    if (equipNumSearch(eq, 629, effectiveJobId) && arrow === 6) w += 25;
    if (equipNumSearch(eq, 630, effectiveJobId) && arrow === 10) w += 50;
    return w;
  }

  if (statCode === 80) {
    let w = 0;
    if (fj === 14 || fj === 28) {
      w += 10 * cardNumSearch(eq, 479, effectiveJobId);
    }
    if (
      equipNumSearch(eq, 987, effectiveJobId) > 0 &&
      (equipNumSearch(eq, 616, effectiveJobId) > 0 ||
        equipNumSearch(eq, 617, effectiveJobId) > 0 ||
        equipNumSearch(eq, 618, effectiveJobId) > 0)
    ) {
      w += 4;
    }
    return w;
  }

  return 0;
}
