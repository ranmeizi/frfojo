# RO 计算器：原版 `refer/foot.js` 对照清单（收口版）

> 扫描基准：`webs/bobo-tool/src/pages/RoCalculator/refer/foot.js`（及 `head.js` 中 `SkillSearch` / `BattleCalc*` 等）。  
> 对照实现：`engine/*.ts`、`components/*`。  
> **状态约定（2026-05-11 起）**：主表 **A～L** 一律用 **`[x]`** 表示「**当前产品范围内已接线或可预览**」；与原版逐行字节级差异统一写在 **「残差汇总」**。  
> **附录 A** 为 `pnpm run ro:gap-scan` 自动覆写的 **SkillSearch 索引**（见文末 **`RO_CALC_GAP:SKILLSEARCH_TABLE_*`** 标记之间），不是完成度勾选表。  
> **切勿**在正文其它位置写入与文末相同的 `RO_CALC_GAP:SKILLSEARCH_TABLE_BEGIN` 字符串，否则跑脚本会截断文档。

---

## 开发约定

- **唯一清单**：本文件为对照总表；新主题先在 **残差汇总** 增一行，再改代码。  
- **附录 A**：仅在文末标记区间内由 `pnpm run ro:gap-scan` 更新；命令在 **`webs/bobo-tool`** 根目录执行。

---

## 残差汇总（与原版 `foot.js` / `head.js` 仍可能不一致处）

| 域 | 说明 |
|----|------|
| **VITDEF** | 承伤 **`BattleHiDam`** 已用 **`computeVitDefSoftTriplet`**（`vitDefLegacyMultiplier.ts`，**`775～813`** 与 **`StPlusCalc2(24)`** 除数）；衍生展示 **`defVitStatDisplay`** 仍为单行近似；与原版 **`n_tok` 全量**叠加若有差见 **HIT/FLEE** 行。 |
| **咏唱** | `castTimeMultiplier.ts`：已加 **132/133+1083**、**51+493**、**54+488**、**131+精炼+1047** 及 **script(7000+`activeSkillId`)** 卡/套/穿减成；仍缺完整 `StPlusCalc2` 条件树与其余主动分支（路线图 **H3** 已互链 **`castTimeMultiplier.ts`**）。 |
| **HIT/FLEE `n_tok[8/9]`** | 卡/套/穿 **code8/code9** 已进快照；与 foot **全量 `n_tok` 累加**是否逐字节一致未做总表 diff。 |
| **`n_A_ATK` 前段** | **300–420** 大量 `EquipNumSearch` / 条件 ATK 未迁（路线图 **H1**：`atkBai01Preview.ts` 头注释互链本表）；**437–444** 已由 `weaponAtkPercentChainWApprox` 等近似。 |
| **`n_A_MDEF`** | `mdefStAllCalcExtras.ts` + code19 + 196/258 等已接；**ItemOBJ 若含独立 MDEF 列**与 foot 叠加规则未单独核对。 |
| **工会 [3]/[5] 伤害链** | **`ATKbai01`** 已进 `atkBai01PercentApprox`；**`PassSkill5[5]`** 已对普攻略化最终伤害（含 BC3 期望与 Miss）整体 **`×0.5`**；承伤 **`BattleHiDam`** 工会行亦 **`/2`**（`battleHiDamRefer.ts`）；`BattleHighCalc` 阈值逻辑仍简化。 |
| **Kakutyou** | `kakutyouPreview.ts`：**1～5、10** 可预览；**6～9** 依赖完整 `n_tok`/属抗等，仍为占位说明（路线图 **H3** 已互链本表）。 |
| **BattleCalc 全链** | 对敌物伤预览：**`physicalRoughPreviewPolicy.ts`**（**`w_ActS`** ∪ **394/395**；排除 **272/401/275**）；**423** 期望行含 **759～760** Hit/Miss 混合；**二刀**：**`nitouPhysicalRough.ts`**；**`BattleCalc3left`**：**`battleCalc3Approx.ts`**；**普攻 BC3+998**：**`battleCalc3ExpectedApprox(..., head998)`**（**3877～4312**，含 **`w998D`/`w998E`** 与 **`w998B×六合中档`**，`battlePhysicalRough` 传 **`sixMidSan`**）；**弓猎鹰**：**`battleTakaApprox.ts`**；**`enemyBattleResultRefer`**：**DPS** 用 **`dmgPerSwingExpectedApprox`**，击数 **≥1000** / 战斗时间 / Exp 与 **`head.js` `BattleCalc998`** 展示文案一致。仍缺 **`EDP_DMG`** 全主动 **`w_HIT`** 细枝、**`tPlusDamCut`** 全形态与原版三档 vs **`w_DMG[1]`** 展示行等口径差。 |
| **`n_tok` foot 补丁 → BaiCI** | `baiCINFootNtTokDelta.ts`：**`[25]`**、**`[80]`**、**`[36]`**（神圣箭→魔族乘段）、**`[39]`**（被动 **234**→龙族乘段），经 **`stTokEquipApprox(..., input)`** 并入物伤 BaiCI。`foot` **1440～1526** 等对 **`[51]`～`[59]`、`[60+]`、`[150+]`** 等依路线图 **B2** 不并入本路径（属抗/Kakutyou）。 |
| **主动技** | **324→HIT+20** 已接；咏唱侧已部分 **`n_A_ActiveSkill`**；**78** 已进普攻略化体型乘（`head.js` `calc`）；**78+ASPD**（foot **1216**）与负重等仍在 ASPD/负重链。 |
| **附录 A** | 仅 foot.js 内 **`SkillSearch` 出现索引**；**`head.js`** 内同名调用未纳入该表。 |
| **分阶段补齐** | 见下文 **「分阶段补齐路线图」**；执行中请在对应阶段勾选并同步本表「残差汇总」行。 |

---

## 分阶段补齐路线图（对敌物伤 / BattleCalc / BaiCI 为主轴）

**原则**：对照基准固定为 **`refer/js2`**；每阶段合入前在 **`webs/bobo-tool`** 下跑 **`pnpm exec eslint`**；优先迁「**进入 `BattleCalc4` / `BattleCalc2` / `BaiCI` 物伤乘子**」的公式，避免把 **属抗 / Kakutyou** 链误并进物伤。

### 阶段 A — `BattleCalc2` 收口（`head.js` 4113 后未迁段）

- [x] **A1** 主动 **394**：`SyurikenOBJ[SkillSubNum][0] + 3*SkillSearch(393) + 4*Lv` — 输入 **`activeSkillSubIndex`** + `ninjaAmmoTables.ts` 常量表 + `battleCalc2Approx.ts`（位于卡 **106** 之后）
- [x] **A2** 主动 **395**：`KunaiOBJ[SkillSubNum][0] * 3` — 同上；**395** 时 **`BattleCalc2`** 首段属克用 **`KunaiOBJ[i][1]`**（`battlePhysicalRough` 内 **`bc2WeaponZokuseiIndex`**）
- [x] **A3** **394/395** 与 **`wBCEDPch1`**（无 `wBCEDPch==0` 包裹，内层仍执行加段）、**`not_use_card`**（与 **437** 同走 **`baiCIPhysicalNotUseCardTailOnly`**）及 **4133～4140** 相对 **4114～4130**（423/437 → 卡106 → 394/395）顺序已对齐 refer

**主要落点**：`battleCalc2Approx.ts`、`types.ts`、`sanitizeCharacter.ts`（子项）、新建 `ninjaAmmoTables.ts`（或脚本生成）

### 阶段 B — `foot.js` → `n_tok` 补丁（仅收「进 BaiCI 物伤」下标）

- [x] **B1** 已对照 **`refer/js2/foot.js` 1411～1526**：在本段内进入 **`BaiCI`** **`30+种族`** 的增量除原 **25/80** 外，已补 **1413～1416**（**`n_tok[36]`** 神圣箭、**`n_tok[39]`** `SkillSearch(234)*4`）→ **`baiCINFootNtTokDelta.ts`**；同段 **452/971–977/1445～1456** 等写入 **`[51]`～`[59]`** 及 **1460+** 的 **`[60+]`、`[150+]`** 等见 **B2**，不迁入
- [x] **B2** 上述 **属抗 / 演奏抗歌 / 卡片 176 等** 仍走 **`n_A_zokusei` / Kakutyou** 或后续专链，**不**混入 **`stTokEquipApprox`** 物伤 BaiCI 增量

**主要落点**：`baiCINFootNtTokDelta.ts`、`baiCIPhysical.ts`（必要时）

### 阶段 C — `BaiCI` 尾段与 `not_use_card`

- [x] **C1** **`head.js` `BaiCI` 4264～4296**：已并入 **`baiCIActiveTailBonusPercent`**（**6/76/41/169/264/84**、**1048/1044/1074+81/1066**、**83/388+381** 与 **`wBCEDPch1`** 分支）；**`639`** 在 **`Tyou==-1`** 时于尾乘前 **`+15`**
- [x] **C2** **`not_use_card=1`** 主动清单见 **`baiCINotUseCardActiveSkills.ts`**（含 **423** 及 **394/395/437** 等），**`applyBaiCIPhysicalCore`** 统一走 **`baiCIPhysicalNotUseCardTailOnly`**

**主要落点**：`baiCIPhysical.ts`、`baiCINotUseCardActiveSkills.ts`

### 阶段 D — `EDP_DMG` / `BattleCalc3` / `tPlusLucky` / 展示

- [x] **D1** **`EDP_DMG`**：**`edpDmgHead4443.ts`** — **`BattleCalcEDP` 恒 0 主动（4396）**、**4445～4448** 零段（沿用 **`isEdpAllZeroByHead4444`**）、**4443～4471** 三档（**`w_HIT_EDP`** 钳 **3775**、**num==1** 双分支；**337/432**、**394/395** 的 **`w_HIT_HYOUJI` / `n_PerHIT`** 开关已接）
- [x] **D2** **`BattleCalc3`**：文档化 **`w998B`** 在 **`tyou=0`** 时省略；**`tPlusLucky`** 仍为魔物表恒等 + PvP 可选（`tPlusLucky.ts`）
- [x] **D3** **`enemyBattleResultRefer`**：注明伤害/DPS 等行与 **`battlePhysicalRough`** 同源快照

**主要落点**：`battlePhysicalRough.ts`、`edpDmgHead4443.ts`、`battleCalc3Approx.ts`、`tPlusLucky.ts`、`enemyBattleResultRefer.ts`

### 阶段 E — 主动技扩展与 `n_A_DMG` 同源

- [x] **E1** 清单：**`physicalRoughPreviewPolicy.ts`** 内 **`W_ACTS_HEAD_ACTIVE_IDS`**（与 **`refer/js2/head.js` ~479** `w_ActS` 一致）+ **`ACTIVE_PHYSICAL_PREVIEW_TRIPLET_EXTRA`**（**394/395**）
- [x] **E2** **`computeBattlePhysicalRoughPreview`**：以 **`isPhysicalRoughTripletPreviewSupported`** 放行 **`w_ActS`** ∪ **扩展**；**272 / 401 / 275** 等入 **`ACTIVE_PHYSICAL_PREVIEW_EXCLUDE`** 并返回明确 **`reasonDisabled`**；对敌卡 **`EnemyCombatCard`** 已注明范围与文件名
- [x] **E3** **423**：**752～754** 三 MATK 行仍由 **`matkDamageLineIdx` 0/1/2**；**759～760** 期望行 = **`phys1*w_HIT + Miss×(100−w_HIT)`**（Miss 为 **`BattleCalc(0,1)`** 链，**`battleCalc2ZeroMissApprox`** 在 **423** 时传入 **`matk*`** + **`legacyNB`**）；**暴击行**仍用 **`matkDamageLineIdx:1`** 的 **`battleCalcCritStub`**

**主要落点**：`physicalRoughPreviewPolicy.ts`、`battlePhysicalRough.ts`、`battleCalc2ZeroMiss.ts`、`EnemyCombatCard.tsx`

### 阶段 F — 二刀与副手

- [x] **F1** **`nitouPhysicalRough.ts`**：副手与 refer **左手 / `n_Nitou`**（**247～291**）逐项对齐子集：**`BattleCalc4(...,_,1)`** → **`n_A_Weapon2LV_seirenATK`**；**`259～270`** **`w_left_star`**（三连 **id106** / 槽 **4～6** 首 script **code106** 各 **+5** / 槽 **7** **id106** **+10**）；**`287～291`** **`w_left_Aveatk = tPlusDamCut((Max+Min)/2)`**（非 **`mean(cut Max, cut Min)`**）
- [x] **F2** **`BattleCalc3left`**：**`battleCalc3Approx.ts`** 对齐 **`4318～4334`**（**`wBC3L2`** 用 **`cardOBJ[0].code==106`**；**`tPlusDamCutTaijinZero`** 在 **`tPlusLucky`** 前、与主预览 **`baiCtx`** 同源）；**不经 `BaiCI`** 与原版一致（非「缺链」）

**主要落点**：`nitouPhysicalRough.ts`、`battleCalc3Approx.ts`、`baiCIPhysical.ts`

### 阶段 G — 承伤 `BattleHiDam`（与物伤解耦）

- [x] **G1** **`battleHiDamRefer.ts`**：已接 **`n_tok[50+n_B[2]]`**、**`n_tok[190+n_B[4]]`**、**`n_B[19]/[20]`** 下 **`n_tok[77]～[79]`** 与 **`SkillSearch(165)`**、**`stTokEquipApprox(..., 3000+n_B[0])`**（对齐 **`StPlusCard`+`StPlusCalc2`**）；**`n_A_VITDEF`** 七段扣减改用快照 **`vitDefSoftTriplet`**
- [x] **G2** **`enemyBattleResultRefer.ts`** / **`EnemyCombatCard.tsx`**：承伤 **12～13** 行与上述实现同源说明已更新

**主要落点**：`battleHiDamRefer.ts`、`enemyBattleResultRefer.ts`、`vitDefLegacyMultiplier.ts`、`computeSnapshot.ts`

### 阶段 H — 面板与全局（积差来源，可并行）

- [x] **H1** **`foot.js` 300–420**：`n_A_ATK` 条件链仍以 **`atkBai01Preview.ts` / `weaponAtkPercentChainWApprox`** 等为子集；**未迁段**文档化互链 **`LEGACY_GAP_SCAN`** 残差 **「n_A_ATK 前段」**
- [x] **H2** **VITDEF**：**`computeVitDefSoftTriplet`**（**`775～813`** + **`StPlusCalc2(24)`**）已入快照并驱动 **`BattleHiDam`**；展示行 **`defVitStatDisplay`** 仍为单行近似
- [x] **H3** **Kakutyou 6～9**、**咏唱全树**：**`kakutyouPreview.ts`**、**`castTimeMultiplier.ts`** 头注释与本表残差行互链；实现仍分任务

**建议节奏**：**A+B** 与 **H** 可并行；**D** 与 **E** 强相关时以 **E** 先收窄主动范围再扩 **D**；每 1～2 阶段发一次 PR 便于回滚与对照。

---

## 二次核对纪要（归档）

> 结论已并入 **残差汇总**；保留 foot 行号便于回查。

- **PassSkill2[12]**：`buffSupport.provoke` → VITDEF×0.9（foot **814–816**）与 `ATKbai01` +5（`atkBai01Preview.ts`）。  
- **圣火 / 工会 ATK**：`legacyBodyZokusei.ts`、`atkBai01Preview.ts`；武器 **437–444**：`weaponAtkPercentChain.ts`。  
- **HIT/FLEE**：`supportBonuses.ts` 与 foot **886–998** 已抽样同序对照；**324**、**273**、**258** 已接。

---

## A. `StPlusCalc`（foot.js 约 1597–1880）— 六维加成链

| 状态 | 原版位置 / 内容 | 说明 |
|------|-----------------|------|
| [x] | Job 板 `w2` + `StPlusCalc2(1–7)`、`213`、`214` | `computeJobBoardBonus` + `wornEquipSixStatDelta` / `setSixStatDelta` 等 script 码 |
| [x] | `SkillSearch` 38/68/146/404/234/286/422、270+JOB24、379+徒手 | `passiveSkillSearchSixStatDelta` |
| [x] | 心灵 42 / `PassSkill6[3]` 对 AGI·DEX `%` | `computeEffectiveSixStats` |
| [x] | `StPlusCalc2(212)`、`(215)` 在 `%` **之后**再累加（**已穿 + 套装**） | `wornEquipSixStatDelta212215Only` + **`setSixStatDelta212215Only`** + `computeEffectiveSixStats`（`supportBonuses.ts` / `equipmentSetBonus.ts`） |
| [x] | 装备条件（约 1661–1682） | `stPlusCalcEquipConditionalSix` + `equipNumSearch` / `legacyJobSearch` |
| [x] | 卡片按精炼位 / `SU_*`（约 1693–1714） | `cardDynamicSixStat`（与 `cardSixStatDelta` 叠加） |
| [x] | `A_HSE` 圣域核心素质（约 1785–1799） | `HolySupportState.sanctityCoreCode` + `sanctityCoreSixStatDelta` + `HolySanctityCorePanel` |
| [x] | `PassSkill3[11][12–17][18]` 傀儡（约 1803–1846） | `PerformanceDanceState` + `addDollHalfCap` / `computeEffectiveSixStats` |
| [x] | `PassSkill2[0/1/3]` bless / AGI / 幸运之吻 | `BuffSupportState` → `computeEffectiveSixStats` |
| [x] | `PassSkill3[40–44]`、`PassSkill5[0]`、`PassSkill6[2]` | `guildCommand`、`guildLeader`、`holySupport.slaughterSystem` |
| [x] | `PassSkill7[3–8]` 六维手填 | `FoodConsumableState` |
| [x] | `EquipNumSearch(1067) && SkillSearch(234)==5` → INT+3 | `stPlusCalcEquipConditionalSix` |

---

## B. `n_A_PassSkill2`（强化技能 A2）— 除六维外的衍生

| 状态 | 原版引用（foot.js） | TS |
|------|---------------------|-----|
| [x] | `[4]`：VIT 软防（约 827–829） | `vitDefLegacyMultiplier.ts` → `computeVitDefLegacyMultiplierApprox`（残差见汇总） |
| [x] | `[6]`：速度激发与 ASPD（约 1273–1297） | `computeAspdExtraWeight`（`supportBonuses.ts`） |
| [x] | `[12]`：VITDEF×0.9、`ATKbai01` +5 | `buffSupport.provoke` → `vitDefLegacyMultiplier.ts` + `atkBai01Preview.ts` |
| [x] | `[13]`：`n_A_CAST`（约 1353–1399） | `castTimeMultiplier.ts` + `CombatStatsTable`（残差见汇总） |
| [x] | `[14]`：`n_tok[56]`、`[66]`（约 1498–1530） | `passSkill2ResistTok.ts` + `card452Tok56Bonus` |
| [x] | `[9]` + `SkillSearch(273)`：FLEE | `computeFleeWithSupport` |
| [x] | 其余 `[2]`、`[5]`、`[7]`、`[8]`、`[10]`、`[11]`… | 原版 StAllCalc 无数值分支；伤害链在 `head.js` |

---

## C. `n_A_PassSkill3`（演奏/舞蹈 A3）

| 状态 | 原版下标 / 作用 | TS |
|------|-----------------|-----|
| [x] | `[0]` 箭雨 FLEE、`[30][20]` | `pd.lv0` → `computeFleeWithSupport` |
| [x] | `[1]` ASPD、`[21][31]` | `pd.lv1` → `computeAspdExtraWeight` |
| [x] | `[2]` ASPD 权重负向、`n_tok[74]` | `pd.lv2`（`n_tok[74]` 未完整，见残差） |
| [x] | `[3]` MaxHP 歌 | `pd.lv3` → `computeSupportAdjustedMaxHp` |
| [x] | `[4]` HIT | `pd.lv4` → `computeHitWithSupport` |
| [x] | `[5]` 暴击 | `pd.lv5` → `computeCritWithSupport` |
| [x] | `[6]` MaxSP | `pd.lv6` → `computeSupportAdjustedMaxSp` |
| [x] | `[7]`：`n_tok` 属性抗 | `legacyTok6069.ts` |
| [x] | `[8]`、`[10]` 等 | 存档兼容 |
| [x] | `[9]`：DEF + ATK `w` | `computeHardDefWithPerformance` + `performanceDanceWeaponAtkFlat` |
| [x] | `[11–18]` 傀儡六维 | 见 **A** 表 |

---

## D. `n_A_PassSkill6`（圣音 A6）

| 状态 | 原版含义 | TS |
|------|-----------|-----|
| [x] | `[0][1]` 火领域+虐杀 → 武器 ATK | `legacyBodyZokusei.ts` + `holySlaughterWeaponAtkFlat` |
| [x] | 水领域+虐杀+圣体 → MaxHP% | `computeSupportAdjustedMaxHp` |
| [x] | 风+虐杀+圣体 → FLEE | `computeFleeWithSupport` |
| [x] | `[5]` 虎蜥式 VIT 软防 | `computeVitDefLegacyMultiplierApprox` |
| [x] | `[3]`、`[4]`：AGI/DEX% 与 MATK 挑衅 | `holyPassSkill6.ts` + `supportBonuses` |

---

## E. `n_A_PassSkill7`（食品 A7）

| 状态 | 原版 | TS |
|------|------|-----|
| [x] | `[0]` 茶、`[1]` 油 | `teaHit` / `oilFlee` |
| [x] | `[2]` 彩色糕饼、`[9]` 怨恨箱 | `coloredCake` / `resentmentBox` |
| [x] | `[10]` 睡眠箱 | `sleepBox` |
| [x] | `[11]`–`[14]` 抗药 → `n_tok` | `additiveTok60to69FromPassSkill3AndFood` |
| [x] | `[15]` | `magicScrollExtra`（UI/存档） |

---

## F. HIT / FLEE / 完全回避

| 状态 | 原版 | TS |
|------|------|-----|
| [x] | `n_A_FLEE` 底式（约 938） | `computeFlee` + `computeFleeWithSupport` |
| [x] | `n_A_HIT` / `n_A_FLEE` 装备与被动大段（约 891–1001） | `supportBonuses.ts`（`n_tok[8/9]` 全量 diff 见残差） |
| [x] | `SkillSearch(258)`：FLEE `/= 2` | `computeFleeWithSupport` |
| [x] | `n_tok[9]` 与 code9 | `fleeCode9ScriptFlat` |

---

## G. DEF / MDEF / VITDEF

| 状态 | 原版 | TS |
|------|------|-----|
| [x] | 防具 DEF + 精炼 + `n_tok[18]` | `computeHardDefTotal` + code18 |
| [x] | 256/258、`PassSkill2[4]`、`PassSkill6[5]` | `applyLegacyTotalDefSkillModifiers` + `computeVitDefLegacyMultiplierApprox` + `mdefStAllCalcExtras` + `applyMdefSkillOverrides` |
| [x] | `n_A_MDEF`：839–881 段 + code19 | `mdefStAllCalcExtras.ts`（ItemOBJ MDEF 列见残差） |

---

## H. ATK / 武器 / `n_tok[17]`

| 状态 | 原版 | TS |
|------|------|-----|
| [x] | `n_A_ATK` 300–445 相关 | `weaponAtk*` 系列 + `weaponAtkPercentChainWApprox` + 圣火/食品/演奏（300–420 大量段见残差） |
| [x] | 卡套穿 `code17` | `computeCombatSnapshot` |

---

## I. 工会 `n_A_PassSkill5`

| 状态 | 原版 | TS |
|------|------|-----|
| [x] | `[0]`、`[4]` | `guildLeader` → `supportBonuses` |
| [x] | `[1]`、`[2]` | `computeSupportAdjustedMaxHp` / `MaxSp` |
| [x] | `[3]` ATK+100%、`[5]` 伤害减半 | `atkBai01PercentApprox` + `passSkill5HighDamageMultiplierApprox`（完整伤害链见残差） |

---

## J. 装备数据结构

| 状态 | 原版 | TS |
|------|------|-----|
| [x] | 二刀副手 + 卡 | `EquipmentState.dualWield` + `weapon2*` + `EquipmentPanel` |

---

## K. 扩展函数与战斗

| 状态 | 原版 | TS |
|------|------|-----|
| [x] | `KakutyouKansuu` / `KakutyouKansuu2` | `kakutyouPreview.ts` + `KakutyouCard`（6～9 见残差） |
| [x] | `n_B` / `BattleCalc*` | `buildLegacyNB.ts` + `battlePhysicalRough.ts` + `legacyMonsterFlee27.ts` + `battleCalc2ZeroMiss.ts` + `battleCalc3Approx.ts`（全链见残差） |
| [x] | `n_A_ActiveSkill`、体型种族属克 | **324**、**78** 等见残差；普攻 **体型×/属克×** 已进 `battlePhysicalRough` |

---

## L. 其它 `SkillSearch` / 被动

对照 **文末附录 A** 行号回 `foot.js`，用 `passiveLevelBySkillId` / 装备条件接入 TS。

---

## 建议实现顺序（历史里程碑）

1. FLEE 底式 **`LUK/5`** — `secondaryStats.ts`。  
2. **`StPlusCalc` 装备条件 + 卡片动态六维**。  
3. **六维链顺序**（212/215、心灵%、食品）。  
4. **`PassSkill6[5]`**、**火领域 ATK**。  
5. **BuffSupport / HIT/FLEE 被动**。  
6. **`PassSkill7` 抗药 → `n_tok`**。  
7. **敌方与 `BattleCalc`**：当前已接子集见 **残差汇总**；后续 **`BaiCI`**、**完整 BC2/BC3**。  

---

<!-- RO_CALC_GAP:SKILLSEARCH_TABLE_BEGIN -->

## 附录 A：`refer/foot.js` 中 `SkillSearch(技能ID)` 出现索引（自动生成）

> 仅扫描 **`refer/foot.js`**（不含 `head.js` 等其它文件中的 `SkillSearch`）。`区块` 为按行号的启发式分区。

| 技能 ID | 出现次数 | 区块（行号） | 代码片段（首行截断） |
|---------|----------|--------------|------------------------|
| 9 | 2 | StAllCalc前段(ATK/HP等)（L874, 875） | `if (SkillSearch(9))` |
| 12 | 1 | StAllCalc前段(ATK/HP等)（L805） | `if (SkillSearch(12)) {` |
| 14 | 2 | HIT/FLEE段（L964, 966） | `n_A_FLEE += 4 * SkillSearch(14);` |
| 38 | 1 | StPlusCalc（L1630） | `wSPC_DEX += SkillSearch(38);` |
| 39 | 1 | HIT/FLEE段（L906） | `n_A_HIT += 1 * SkillSearch(39);` |
| 42 | 1 | StPlusCalc（L1649） | `w = SkillSearch(42);` |
| 68 | 1 | StPlusCalc（L1631） | `wSPC_STR += SkillSearch(68) * 4;` |
| 74 | 1 | StAllCalc中段（L1227） | `if (n_A_WeaponType == 3 && SkillSearch(74)) {` |
| 78 | 3 | StAllCalc中段；其它（L1216, 1217, 2321） | `if (SkillSearch(78) && (n_A_ActiveSkill == 0 \|\| n_A_ActiveSkill == 284))` |
| 81 | 1 | HIT/FLEE段（L903） | `if (EquipNumSearch(1074) && SkillSearch(81) == 10)` |
| 89 | 1 | StAllCalc中段（L1081） | `w += SkillSearch(89) * 2;` |
| 146 | 1 | StPlusCalc（L1632） | `wSPC_STR += SkillSearch(146);` |
| 148 | 1 | HIT/FLEE段（L907） | `n_A_HIT += 2 * SkillSearch(148);` |
| 150 | 3 | StAllCalc中段（L1523, 1524, 1525） | `if (SkillSearch(150)) {` |
| 152 | 1 | StAllCalc中段（L1235） | `if (6 <= n_A_WeaponType && n_A_WeaponType <= 8 && SkillSearch(152)) {` |
| 156 | 3 | StAllCalc前段(ATK/HP等)；StAllCalc中段（L520, 1527, 1528） | `n_A_MaxHP += SkillSearch(156) * 200;` |
| 165 | 2 | StAllCalc中段（L1325, 1326） | `if (SkillSearch(165))` |
| 166 | 2 | StAllCalc中段（L1243, 1244） | `if (n_A_WeaponType == 5 && SkillSearch(166)) {` |
| 187 | 1 | StAllCalc中段（L1345） | `if (SkillSearch(187) && n_A_ActiveSkill == 0) {` |
| 191 | 1 | HIT/FLEE段（L974） | `n_A_FLEE += Mikiri[SkillSearch(191)];` |
| 195 | 2 | StAllCalc中段（L1087, 1088） | `if (SkillSearch(195))` |
| 196 | 3 | StAllCalc前段(ATK/HP等)；StAllCalc中段（L785, 878, 1304） | `if (SkillSearch(196))` |
| 224 | 2 | StAllCalc中段（L1221, 1222） | `if (n_A_WeaponType == 12 && SkillSearch(224))` |
| 234 | 7 | StAllCalc中段；StPlusCalc（L1467, 1468, 1500, 1501, 1635, 1636, 1679） | `if (SkillSearch(234))` |
| 253 | 1 | StAllCalc中段（L1089） | `if (SkillSearch(253))` |
| 256 | 6 | StAllCalc前段(ATK/HP等)；HIT/FLEE段（L781, 782, 823, 825, 872, 910） | `if (SkillSearch(256))` |
| 258 | 6 | StAllCalc前段(ATK/HP等)；HIT/FLEE段；StAllCalc中段（L575, 788, 831, 880, 1000, 1266） | `if (SkillSearch(258))` |
| 269 | 2 | StAllCalc前段(ATK/HP等)；StAllCalc中段（L712, 1438） | `w += SkillSearch(269);` |
| 270 | 3 | HIT/FLEE段；StAllCalc中段；StPlusCalc（L908, 1092, 1722） | `n_A_HIT += 3 * SkillSearch(270);` |
| 273 | 2 | HIT/FLEE段（L978, 979） | `n_A_FLEE += Math.round(SkillSearch(273) / 2);` |
| 274 | 1 | StAllCalc前段(ATK/HP等)（L714） | `w += SkillSearch(274) * 2;` |
| 276 | 3 | StAllCalc中段（L1183, 1184, 1185） | `if (SkillSearch(276)) {` |
| 286 | 6 | StPlusCalc（L1637, 1638, 1639, 1640, 1641, 1642） | `if (SkillSearch(286)) {` |
| 301 | 1 | StAllCalc中段（L1347） | `if (SkillSearch(301))` |
| 322 | 1 | StAllCalc中段（L1398） | `if (SkillSearch(322))` |
| 345 | 2 | StAllCalc前段(ATK/HP等)（L516, 659） | `if (SkillSearch(345) && n_A_BaseLV >= 90)` |
| 356 | 1 | HIT/FLEE段（L987） | `if (SkillSearch(356))` |
| 357 | 1 | StAllCalc中段（L1273） | `if (SkillSearch(357)) {` |
| 361 | 2 | StAllCalc中段（L1278, 1280） | `if (SkillSearch(361)) {` |
| 372 | 2 | StAllCalc前段(ATK/HP等)（L677, 678） | `if (SkillSearch(372))` |
| 379 | 1 | StPlusCalc（L1732） | `if (SkillSearch(379) && n_A_WeaponType == 0)` |
| 383 | 1 | HIT/FLEE段（L983） | `if (SkillSearch(383))` |
| 386 | 1 | StAllCalc中段（L1231） | `if (n_A_WeaponType == 2 && SkillSearch(386)) {` |
| 389 | 1 | StAllCalc中段（L1239） | `if (ASPDch == 0 && SkillSearch(389)) {` |
| 404 | 2 | StPlusCalc（L1633, 1634） | `wSPC_STR += SkillSearch(404);` |
| 420 | 2 | StAllCalc前段(ATK/HP等)；StAllCalc中段（L429, 1268） | `if (SkillSearch(420))` |
| 421 | 3 | HIT/FLEE段；StAllCalc中段（L912, 968, 1557） | `if (SkillSearch(421))` |
| 422 | 2 | HIT/FLEE段；StPlusCalc（L914, 1644） | `if (SkillSearch(422))` |
| 425 | 2 | HIT/FLEE段；StAllCalc中段（L916, 1219） | `n_A_HIT += 2 * SkillSearch(425);` |
| 426 | 1 | HIT/FLEE段（L911） | `n_A_HIT += 1 * SkillSearch(426);` |
| 433 | 6 | StAllCalc前段(ATK/HP等)；HIT/FLEE段；StAllCalc中段（L431, 432, 970, 971, 1270, 1271） | `if (SkillSearch(433))` |

<!-- RO_CALC_GAP:SKILLSEARCH_TABLE_END -->

---

*附录 A 由 `pnpm run ro:gap-scan` 根据 `refer/foot.js` 自动生成；「残差汇总」由人工与代码对照维护。*
