/** 表单中的职业 id，0–45，与 legacy JobName 下标一致 */
export type FormJobId = number;

export type SixStats = {
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
};

/** 各槽位装备 id（0 表示空）与可精炼部位的 +0～10；卡片 id 与 refer cardOBJ 下标一致 */
export type EquipmentState = {
  weaponId: number;
  weaponRefine: number;
  weaponCard1: number;
  weaponCard2: number;
  weaponCard3: number;
  weaponCard4: number;
  /** 刺客系二刀：`n_Nitou`；为真时 `n_A_Equip[1]` 为副手武器，盾位不参与套装/已穿脚本 */
  dualWield: boolean;
  /** `n_A_Equip[1]` 副手武器 */
  weapon2Id: number;
  weapon2Refine: number;
  weapon2Card1: number;
  weapon2Card2: number;
  weapon2Card3: number;
  weapon2Card4: number;
  head1Id: number;
  head1Refine: number;
  head1Card: number;
  head2Id: number;
  head2Card: number;
  head3Id: number;
  head3Refine: number;
  leftId: number;
  leftRefine: number;
  leftCard: number;
  bodyId: number;
  bodyRefine: number;
  bodyCard: number;
  shoulderId: number;
  shoulderRefine: number;
  shoulderCard: number;
  shoesId: number;
  shoesRefine: number;
  shoesCard: number;
  acc1Id: number;
  acc1Card: number;
  acc2Id: number;
  acc2Card: number;
  /** 【新功能】各槽选中「自定义装备」时非 null；与对应 *Id 互斥（自定义时 *Id 应为 0） */
  weaponCustomEquipId: string | null;
  weapon2CustomEquipId: string | null;
  head1CustomEquipId: string | null;
  head2CustomEquipId: string | null;
  head3CustomEquipId: string | null;
  leftCustomEquipId: string | null;
  bodyCustomEquipId: string | null;
  shoulderCustomEquipId: string | null;
  shoesCustomEquipId: string | null;
  acc1CustomEquipId: string | null;
  acc2CustomEquipId: string | null;
};

/** legacy n_A_PassSkill3：演奏/舞蹈（Click_Skill3SW） */
export type PerformanceDanceState = {
  lv0: number;
  lv1: number;
  lv2: number;
  lv3: number;
  lv4: number;
  lv5: number;
  lv6: number;
  lv7: number;
  lv8: number;
  lv9: number;
  lv10: number;
  puppetTrick: boolean;
  row0PoetAgi: number;
  row0Instrument: number;
  row1PoetAgi: number;
  row1Instrument: number;
  row2PoetDex: number;
  row2PoetInt: number;
  row2Instrument: number;
  row3PoetVit: number;
  row3Instrument: number;
  row4DancerDex: number;
  row4Dance: number;
  row5DancerLuk: number;
  row5Dance: number;
  row6DancerInt: number;
  row6Dance: number;
  puppetStr: number;
  puppetAgi: number;
  puppetVit: number;
  puppetInt: number;
  puppetDex: number;
  puppetLuk: number;
  puppetFullStatsNoHalf: boolean;
};

/**
 * legacy n_A_PassSkill5 / Click_Skill5SW（A5_Skill0～5）。
 * 原版 monster 表记为「会长专属工会技能」，与游戏内「下达战斗命令」等会长技（PassSkill3[40–44]）不是同一组。
 */
export type GuildLeaderSkillsState = {
  allStats20: boolean;
  hp100: boolean;
  sp100: boolean;
  atk100: boolean;
  hitFlee50: boolean;
  damageHalf: boolean;
};

/** legacy Click_Skill4SW / n_A_PassSkill3[40..44]（A3_Skill40 + A3_Skill41～44，Lv 0～5） */
export type GuildCommandState = {
  /** [40] 下达战斗命令：勾选时 STR/DEX/INT 各 +5 */
  battleOrder: boolean;
  /** [41] 伟大的指导力 → 平铺 STR */
  greatGuidance: number;
  /** [42] 光荣的伤口 → VIT */
  gloriousWound: number;
  /** [43] 冷漠之心 → AGI */
  coldHeart: number;
  /** [44] 尖锐的视线 → DEX */
  sharpGaze: number;
};

/**
 * legacy n_A_PassSkill6 / Click_Skill6SW「圣音支援」
 *
 * 注意：后三项在 **foot.js 公式** 中的含义与原版 HTML **表头文字** 不一致（见 `holyPassSkill6.ts`）。
 * 为与存档/原版控件顺序一致，保留下列命名；演算请用 `passSkill6*` getter。
 */
export type HolySupportState = {
  /** 0 火 · 1 水 · 2 风 → PassSkill6[0] */
  elementField: number;
  /** 虐杀 Lv 0～5 → PassSkill6[1] */
  slaughterLevel: number;
  /** 0 无 · 1 ALL+3 · 2 ALL+5 → PassSkill6[2] */
  slaughterSystem: number;
  /** 存 PassSkill6[3]；原版表头「虎蜥人…」，脚本实际作 DEX/AGI% 段 */
  raptorMind: number;
  /** 存 PassSkill6[4]；原版表头「领域支援」，脚本实际作 MATK 挑衅段 */
  domainSupport: number;
  /** 存 PassSkill6[5]；原版表头「挑衅支援」，脚本实际作虎蜥式 VIT 软防段 */
  provokeSupport: number;
  /** PassSkill6[6] */
  holyBodyBless: boolean;
  /** 原版 `A_HSE`：0 关；1–9 / 11–19 / … / 51–59 见 `sanctityCoreSix.ts` */
  sanctityCoreCode: number;
};

/**
 * 对敌区块输入（refer `B_Enemy` / `B_IJYOU*` / `B_KYOUKA*` / `ENEMY_SORT`）。
 * 伤害与命中率等仍由 foot.js `BattleCalc998` 等演算；此处先存 UI 状态以便与 aindex 表结构对齐。
 */
export type EnemyCombatState = {
  /** MonsterOBJ 下标 */
  monsterIndex: number;
  /** refer wkk9w：0 boss / 1 远距离 / 2 一般 */
  attackKind: number;
  /** refer ENEMY_SORT */
  monsterSort: number;
  /** B_IJYOUSW */
  abnormalPanelOpen: boolean;
  /** B_KYOUKASW */
  defenderPanelOpen: boolean;
  /** n_B_IJYOU[0..24] */
  abnormal: number[];
  /** n_B_KYOUKA[0..9]；[6] 为 ZoHe 属性值 */
  defender: number[];
  /**
   * 原版 `Conf01`：主动技 CastAndDelay「限制延迟」用（百分数 ÷100 秒）；默认 33。
   * 与 ASPD 延迟取 max（`activeSkillId !== 0 && !== 284` 时）。
   */
  clientDelayCapPercent: number;
};

/** legacy n_A_PassSkill7：食品/箱等 */
export type FoodConsumableState = {
  teaHit: boolean;
  oilFlee: boolean;
  coloredCake: boolean;
  resentmentBox: boolean;
  sleepBox: boolean;
  resistWater: boolean;
  resistEarth: boolean;
  resistFire: boolean;
  resistWind: boolean;
  magicScrollExtra: boolean;
  strBonus: number;
  agiBonus: number;
  vitBonus: number;
  intBonus: number;
  dexBonus: number;
  lukBonus: number;
};

/** 对应 legacy A2_Skill*「强化技能/辅助技能」 */
export type BuffSupportState = {
  blessLv: number;
  agiUpLv: number;
  magnusLv: number;
  fortuneKiss: boolean;
  kyrieLv: number;
  gloria: boolean;
  /** 0 OFF · 1 普通状态 · 2 灵魂状态 · 3 速度激发 Lv5 卷轴 */
  adrenalineMode: number;
  weaponSizeIgnore: boolean;
  /** 凶砍 */
  overthrustLv: number;
  windWalkerLv: number;
  spiritSphereLv: number;
  berserkState: boolean;
  /** 原版 `A2_Skill12` / `PassSkill2[12]`（挑衅）；foot `n_A_VITDEF`×0.9 段，非仅文案 */
  provoke: boolean;
  sacrificePoemLv: number;
  lightOfLordLv: number;
  /** `PassSkill2[13]` 圣母之祈福·诵经（Suffragium），影响咏唱乘子 */
  suffragiumLv: number;
  /** `PassSkill2[14]` 元素领域（贤者系以外职业写入 n_tok[56]/[66]） */
  elementalBarrierLv: number;
  /**
   * 原版 `A2_Skill10` / `n_A_PassSkill2[10]`（0～5）；`head.js` `BattleCalc2` 非弓手系时 `+3*此项`。
   * 弓手/游侠（formJobId 15/29）原版 UI 为「-」，此处不参与 BC2。
   */
  weaponResearchLv: number;
  /** 原版 `A2_Skill11` / `n_A_PassSkill2[11]`（勾选）；`head.js` `BattleCalcEDP` 第二支 `×zokusei[..][3]/5` */
  soulBreakerEdp: boolean;
};

/**
 * 略化普攻预览（`battlePhysicalRough.ts`）：`n_A_DMG` + ATKbai01 + **`BattleCalc4` + head `4035～4068`** + **`BattleCalc2`** + **`BaiCI`** + **BC2 尾（169/二刀79）** + **EDP** + 拳刃展示 + **`BattleCalc3`** + **二刀 `BattleCalc3left`**（`nitouPhysicalRough.ts`）+ **`tPlusLucky`**（`w998` 先 **`w_Ave_KATARU`**，再 **`+EDP_DMG(1)`** 简化）。
 */
export type BattlePhysicalRoughPreview = {
  enabled: boolean;
  reasonDisabled?: string;
  hint: string;
  weaponZokuseiIndex: number;
  monsterElementCode: number;
  elementMultiplier: number;
  weaponSizeMult: number;
  dmgMin: number;
  dmgMax: number;
  dmgAvg: number;
  monsterHp: number;
  hitsToKillMin: number | null;
  hitsToKillMax: number | null;
  hitsToKillAvg: number | null;
  /** `BattleCalc3` 期望一击近似（含 **`tPlusLucky`**，魔物表恒等）；暴伤支为 **`BattleCalc(10)`** 链 + **`BaiCI`（含 `n_tok[70]`）** + 拳刃 L13 */
  dmgPerSwingExpectedApprox: number;
  hitsToKillExpectedApprox: number | null;
  /** `w_HIT`：`n_A_HIT+80-n_B_FLEE` 后经 5–100 钳位与 `floor(w_HIT*100)/100`（`n_B_FLEE` 近似见引擎） */
  battleHitPercentApprox: number;
  /** `w_Cri`：`n_A_CRI - n_B[11]*0.2 - 0.1` 钳在 0–100 */
  battleCritPercentApprox: number;
  /** `ClickB_Enemy` 子集算出的 **`n_B[27]`**，用于 `w_HIT` */
  enemyFleeForHit27: number;
  /** `BattleCalc2(0)` 近似后再乘 **`BaiCI` 子集**（`baiCIPhysical.ts`） */
  battleCalc2MissDamageApprox: number;
  /** `head.js`：`n_B_DEF2[0/1/2]`，与 min/ave/max 一击扣减对应 */
  enemySoftDefTriplet: readonly [number, number, number];
  /**
   * 近似 **`n_A_EDP_DMG[0/1/2]`**（`BattleCalcEDP`：266 毒 `/4`、PassSkill2[11] 暗 `/5`）。
   * 全 0：无 266 且未勾选 `soulBreakerEdp`，或物伤属克≤0，或 **`EDP_DMG`** 主动+魔物属性格挡。
   */
  edpDmgTriplet: readonly [number, number, number];
  /** 近似 **`EDP_DMG(1)`** 的 `w_HIT` 支：`floor(edpDmgTriplet[1] * w_HIT%)`（`w_HIT_EDP` 恒 100 简化） */
  edpDmgAvgAfterHit: number;
  /** 弓/枪/榴弹当前弹药名称（普攻预览） */
  rangedAmmoLabel?: string;
  /**
   * 二刀 **`n_Nitou`**：`head.js` **`w_left_*`** 近似（已×工会高伤乘子）；尾 **`tPlusDamCutTaijinZero`**；副手槽 **code17** 与主 **`W`** 剥离避免双计。
   * **`null`**：非刺客系二刀或未装副手。
   */
  nitouLeftRough: { min: number; avg: number; max: number } | null;
};

/** legacy「A9」表：一行 % + 下拉「对 …」 */
export type ManualVersusPair = { pct: number; versus: number };

/**
 * 【新功能】附加附魔与手动修正（refer HTML ARG_RC* / A9_Skill*）。
 * 仅经 Full Save 类持久化由上层保证；演算见 `playerManualEdits.ts` + `computeSnapshot` 标注段。
 */
export type PlayerManualEditsState = {
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
  maxHpFlat: number;
  /** 与 foot `n_tok[15]` 同源：在平铺之后再参与 `* (100+w)/100` */
  maxHpPct: number;
  maxSpFlat: number;
  /** 与 foot `n_tok[16]` 同源：在平铺之后再参与 `* (100+w)/100` */
  maxSpPct: number;
  def: number;
  mdef: number;
  hit: number;
  flee: number;
  atk: number;
  /** 与 `n_tok[87]` / `ATKbai01` 同源：从 100 起加百分数；面板用 `atkPanelPercentWApprox`，普攻链用 `atkBai01PercentApprox` */
  atkPct: number;
  perfectDodge: number;
  criticalRate: number;
  matk: number;
  matkPct: number;
  /** 【新功能】ASPD% 权重，与 `computeAspd(..., extraWeight)` 同源加算，非对最终 ASPD 做百分比乘法 */
  aspdPct: number;
  hpRegenPct: number;
  spRegenPct: number;
  raceVs: [ManualVersusPair, ManualVersusPair, ManualVersusPair, ManualVersusPair];
  elementVs: [ManualVersusPair, ManualVersusPair, ManualVersusPair, ManualVersusPair];
  sizeVs: [ManualVersusPair, ManualVersusPair, ManualVersusPair, ManualVersusPair];
  mvpVs: [ManualVersusPair, ManualVersusPair, ManualVersusPair, ManualVersusPair];
  atkDmgPctAny: number;
  matkDmgPctAny: number;
};

/**
 * 【新功能】自定义装备：按 ItemOBJ `kind`（武器=当前武器类型 1～21；防具 50～64）存库，加成字段与 `PlayerManualEditsState` 同源。
 */
export type CustomEquipmentRecord = {
  id: string;
  /** 与 `itemKind` / `armorItemOptions` 的 kind 一致 */
  kind: number;
  name: string;
  description: string;
  bonuses: PlayerManualEditsState;
};

/** 角色基础输入（装备为简化版：无卡片 / 附魔） */
export type CharacterBaseInput = {
  baseLv: number;
  jobLv: number;
  formJobId: FormJobId;
  baby: boolean;
  weaponType: number;
  /**
   * 远程普攻弹药下标（与原版 `A_Arrow` / `n_A_Arrow` 一致）：
   * 弓 10 → `ArrowOBJ`；手枪等 17–20 → `BulletOBJ`（3 种）；榴弹枪 21 → `GrenadeOBJ`（5 种）。
   */
  bowArrowIndex: number;
  speedPot: number;
  stats: SixStats;
  equipment: EquipmentState;
  /** 与当前职业 `JOB_PASSIVE_SKILL_IDS` 槽位一一对应 */
  passiveSkillLevels: number[];
  buffSupport: BuffSupportState;
  performanceDance: PerformanceDanceState;
  /** PassSkill5 工会六勾选 */
  guildLeader: GuildLeaderSkillsState;
  /** PassSkill3[40–44] 会长技能（CS4） */
  guildCommand: GuildCommandState;
  holySupport: HolySupportState;
  foodConsumable: FoodConsumableState;
  enemyCombat: EnemyCombatState;
  /** 【新功能】手动修正与附加附魔（legacy A9 表） */
  playerManualEdits: PlayerManualEditsState;
  /** 0 表示无；与原版 `A_ActiveSkill` 数值一致（如 324 为某主动技） */
  activeSkillId: number;
  /** 主动技等级；0 关 */
  activeSkillLv: number;
  /**
   * 主动技子下拉（原版 **`SkillSubNum`**）：仅 **394/395**（手里剑 / 苦无种类，下标 0～4）使用；其它主动固定为 **0**。
   */
  activeSkillSubIndex: number;
  /** 扩展函数模式 `A_Kakutyou`：0 关，1～10 见 `kakutyouPreview.ts` */
  kakutyouMode: number;
  /** 扩展函数子下拉（快速恢复/禅心/运气调息/商人负重等） */
  kakutyouSelNum: number;
};

export type CombatSnapshot = {
  effectiveJobId: number;
  isTensei: boolean;
  /** 含 Job 奖励、卡片、套装与已穿装备 ItemOBJ 脚本后的运算用六维 */
  totalStats: SixStats;
  /** 左栏手填六维（素质点），与 total 之差为各类加成 */
  allocatedStats: SixStats;
  /** 仅 UI：卡片平铺六维 */
  sixBonusCards: SixStats;
  /** 仅 UI：套装虚拟行平铺六维 */
  sixBonusSetEquip: SixStats;
  /** 仅 UI：已穿装备 ItemOBJ 脚本平铺六维 */
  sixBonusWornItemScript: SixStats;
  /** 仅 UI：`SkillSearch` 被动槽平铺六维（不含心灵 42 的 AGI/DEX%） */
  sixBonusPassiveSkills: SixStats;
  jobBoardBonus: SixStats;
  remainingStatPoints: number;
  maxHp: number;
  maxSp: number;
  hit: number;
  flee: number;
  perfectDodge: number;
  /** `foot.js` `n_A_LUCKY` 展示值（回避率/承伤用；缺 `n_tok[11]` 等全链） */
  refNLuckyDisplay: number;
  crit: number;
  matkMin: number;
  matkMax: number;
  aspd: number;
  hpr: number;
  spr: number;
  /** 防具槽 DEF + floor(精炼DEF×0.7) + 卡片/套装/装备脚本 code18 + 技能等 */
  hardDef: number;
  /** 衍生属性展示：VIT 段（`foot.js` `n_A_VITDEF[0]` 初值；196/258 时与硬 DEF 展示一致为 0） */
  defVitStatDisplay: number;
  /** `foot.js` **`n_A_VITDEF[0/1/2]`** 全链（**775～813**；**`BattleHiDam`** **2075～2081** 分段扣减） */
  vitDefSoftTriplet: readonly [number, number, number];
  /** 卡片 + 套装 + 已穿 script code19 + foot 841–876 条件段 + 196/258 覆盖 */
  mdef: number;
  /** 衍生属性展示：INT 段（常见 `INT+⌊INT/2⌋`；196/258 覆盖 MDEF 时为 0） */
  mdefIntStatDisplay: number;
  /** foot.js 约 841–876 写入 `n_A_MDEF` 的装备/卡/被动增量（不含 196/258） */
  mdefStAllCalcExtraFlat: number;
  weaponAtkBase: number;
  /** 面板 ATK 素质段（foot 388–395，依武器类型用运算用 STR/DEX/LUK） */
  atkStatusPortion: number;
  /** 面板 ATK 武器段平铺：武器 Item ATK + code17/食品/战舞/圣火等，不含精炼 */
  atkWeaponLineFlat: number;
  weaponRefineBonus: number;
  weaponRefineVarianceMin: number;
  weaponRefineVarianceMax: number;
  weaponLevel: number;
  /** 食品等到武器 ATK 展示行追加的平铺值（legacy PassSkill7 等） */
  weaponAtkSupportFlat: number;
  /** 卡片 code 17 之和（与 foot.js n_tok[17] 中卡片段同源） */
  weaponAtkCardFlat: number;
  /** 套装虚拟道具 code 17 之和（refer `w_SE` + ItemOBJ 套装行） */
  weaponAtkSetFlat: number;
  /** 已穿装备 ItemOBJ 脚本 code 17 之和 */
  weaponAtkWornScriptFlat: number;
  /** 工会「ATK+100%」：伤害倍率段，非武器白字 */
  guildLeaderAtk100: boolean;
  /** 战舞 `PassSkill3[9]`：武器 ATK 平铺 `25 + 25*lv`（foot.js 约 434–435） */
  weaponAtkPerformanceDanceFlat: number;
  /** 圣域火+虐杀+火甲：`PassSkill6[0]==0` 且 `[1]*10`（foot.js 约 421–422；`legacyBodyZokusei.ts`） */
  weaponAtkHolySlaughterFlat: number;
  /** `head.js` `ATKbai01` 的 `wA01` 百分近似（含工会 ATK+100%、被动 256/270 等） */
  atkBai01PercentApprox: number;
  /** `head.js` `BattleHighCalc`：`PassSkill5[5]` 时对高伤段 `×0.5` */
  passSkill5HighDamageMultiplierApprox: number;
  /** foot **437–444** 武器 ATK 乘子分子 `w`（`floor(ATK * w/100)` 中的 w；`n_tok[87]` 以 script87 近似）；不含手动 % */
  weaponAtkPercentChainWApprox: number;
  /**
   * foot **437–444** 同源：在 `weaponAtkPercentChainWApprox` 上再叠手动 `% ATK`（与 `n_tok[87]` 类 **加进同一 w**）。
   * 衍生属性「ATK」：`floor((atkStatusPortion + atkWeaponLineFlat + weaponRefineBonus) * 本字段 / 100)`。
   */
  atkPanelPercentWApprox: number;
  /** 仅含演奏 Lv7 抗歌 + 四属性抗药写入的 `n_tok[60+k]` 增量（与 `n_A_zokusei` 用下标对齐） */
  tok60to69Additive: readonly number[];
  /** `PassSkill3[7]`：原版对 `n_tok[150]～[159]` 各加 `10*lv`（foot.js 约 1534–1535） */
  songTok150to159Each: number;
  /** `n_A_VITDEF` 乘段近似合并（不含 `StPlusCalc2(24)` 等） */
  vitDefLegacyMultiplierApprox: number;
  /** 工会「伤害减半」勾选 */
  guildLeaderDamageHalf: boolean;
  /** 对敌所选魔物名（便于确认 `enemyCombat` 已进快照） */
  enemyCombatMonsterLabel: string;
  /** 不含 `n_A_ActiveSkill` 等分支的咏唱乘子近似（`castTimeMultiplier.ts`） */
  castTimeMultiplierApprox: number;
  /** 卡片 + 套装 + 已穿装备 script code9 之和（与 `n_tok[9]` 装备片段同源子集） */
  fleeCode9ScriptFlat: number;
  /** `PassSkill2[14]` → `n_tok[56]` 增量（不含卡片 452 段） */
  passSkill2Tok56FromBarrier: number;
  /** `PassSkill2[14]` → `n_tok[66]` */
  passSkill2Tok66FromBarrier: number;
  /** 卡片 452 + JobSearch==3 → `n_tok[56]` +30（展示） */
  card452Tok56Bonus: number;
  activeSkillId: number;
  activeSkillLv: number;
  /** 与 refer `MonsterOBJ[B_Enemy][0..26]` → `n_B` 对齐的只读数组 */
  legacyNB: readonly number[];
  /** 普攻略化：BattleCalc4+2 与 `BattleCalc998` 击打次数思路 */
  battlePhysicalRough: BattlePhysicalRoughPreview;
  /** `KakutyouKansuu` 等价预览行（纯文本，无 HTML） */
  kakutyouLines: readonly string[];
};
