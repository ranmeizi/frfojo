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

/** 各槽位装备 id（0 表示空）与可精炼部位的 +0～10 */
export type EquipmentState = {
  weaponId: number;
  weaponRefine: number;
  head1Id: number;
  head1Refine: number;
  head2Id: number;
  head3Id: number;
  head3Refine: number;
  leftId: number;
  leftRefine: number;
  bodyId: number;
  bodyRefine: number;
  shoulderId: number;
  shoulderRefine: number;
  shoesId: number;
  shoesRefine: number;
  acc1Id: number;
  acc2Id: number;
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
  provoke: boolean;
  sacrificePoemLv: number;
  lightOfLordLv: number;
};

/** 角色基础输入（装备为简化版：无卡片 / 附魔） */
export type CharacterBaseInput = {
  baseLv: number;
  jobLv: number;
  formJobId: FormJobId;
  baby: boolean;
  weaponType: number;
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
};

export type CombatSnapshot = {
  effectiveJobId: number;
  isTensei: boolean;
  /** 含 Job 奖励后的六维 */
  totalStats: SixStats;
  jobBoardBonus: SixStats;
  remainingStatPoints: number;
  maxHp: number;
  maxSp: number;
  hit: number;
  flee: number;
  perfectDodge: number;
  crit: number;
  matkMin: number;
  matkMax: number;
  aspd: number;
  hpr: number;
  spr: number;
  /** 防具槽 DEF + floor(精炼DEF×0.7)，未计卡片 / 技能加成 */
  hardDef: number;
  mdef: number;
  weaponAtkBase: number;
  weaponRefineBonus: number;
  weaponRefineVarianceMin: number;
  weaponRefineVarianceMax: number;
  weaponLevel: number;
  /** 食品等到武器 ATK 展示行追加的平铺值（legacy PassSkill7 等） */
  weaponAtkSupportFlat: number;
  /** 工会「ATK+100%」：伤害倍率段，非武器白字 */
  guildLeaderAtk100: boolean;
};
