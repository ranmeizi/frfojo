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
| **VITDEF** | `vitDefLegacyMultiplier.ts` 已覆盖 Magnes/虎蜥/256/258/挑衅 等主段；原版 **`n_A_VITDEF` 三档数组**与装备 **`StPlusCalc2(24)`** 等未全量迁。 |
| **咏唱** | `castTimeMultiplier.ts`：已加 **132/133+1083**、**51+493**、**54+488**、**131+精炼+1047** 及 **script(7000+`activeSkillId`)** 卡/套/穿减成；仍缺完整 `StPlusCalc2` 条件树与其余主动分支。 |
| **HIT/FLEE `n_tok[8/9]`** | 卡/套/穿 **code8/code9** 已进快照；与 foot **全量 `n_tok` 累加**是否逐字节一致未做总表 diff。 |
| **`n_A_ATK` 前段** | **300–420** 大量 `EquipNumSearch` / 条件 ATK 未迁；**437–444** 已由 `weaponAtkPercentChainWApprox` 等近似。 |
| **`n_A_MDEF`** | `mdefStAllCalcExtras.ts` + code19 + 196/258 等已接；**ItemOBJ 若含独立 MDEF 列**与 foot 叠加规则未单独核对。 |
| **工会 [3]/[5] 伤害链** | **`ATKbai01`** 已进 `atkBai01PercentApprox`；**`PassSkill5[5]`** 已对普攻略化最终伤害（含 BC3 期望与 Miss）整体 **`×0.5`**；`BattleHighCalc` 阈值逻辑仍简化。 |
| **Kakutyou** | `kakutyouPreview.ts`：**1～5、10** 可预览；**6～9** 依赖完整 `n_tok`/属抗等，仍为占位说明。 |
| **BattleCalc 全链** | 普攻略化已接 **`BattleCalc2`** 主段（`battleCalc2Approx.ts`）、**`BaiCI`** 子集、**BC2 尾**（169/二刀 79）、**`BattleCalcEDP`** 近似（266/PassSkill2[11]、`wBCEDPch1` 内层）；**BC3** + **`tPlusLucky`**。仍缺 **423/437**、六合拳、二刀副手完整链、**`EDP_DMG`** 全部分支（`w_HIT_EDP`/`n_PerHIT_DMG` 等）。 |
| **主动技** | **324→HIT+20** 已接；咏唱侧已部分 **`n_A_ActiveSkill`**；**78** 已进普攻略化体型乘（`head.js` `calc`）；**78+ASPD**（foot **1216**）与负重等仍在 ASPD/负重链。 |
| **附录 A** | 仅 foot.js 内 **`SkillSearch` 出现索引**；**`head.js`** 内同名调用未纳入该表。 |

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
| [x] | `StPlusCalc2(212)`、`(215)` 在 `%` **之后** 再累加 | `wornEquipSixStatDeltaExcluding212215` / `wornEquipSixStatDelta212215Only` + `computeEffectiveSixStats`（`supportBonuses.ts`） |
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
