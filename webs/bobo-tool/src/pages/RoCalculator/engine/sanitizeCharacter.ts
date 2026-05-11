import type {
  BuffSupportState,
  CharacterBaseInput,
  EnemyCombatState,
  EquipmentState,
  FoodConsumableState,
  GuildCommandState,
  GuildLeaderSkillsState,
  HolySupportState,
  PerformanceDanceState,
} from "./types";
import {
  IJYOU_SLOT_COUNT,
  IJYOU_SLOT_SPECS,
  KYOUKA_ELEMENT_OPTIONS,
  KYOUKA_SLOT_COUNT,
  KYOUKA_SLOT_SPECS,
} from "./enemyCombatUi";
import {
  sanitizeAccessoryCard,
  sanitizeBodyArmorCard,
  sanitizeGarmentCard,
  sanitizeHeadgearCard,
  sanitizeShieldCard,
  sanitizeShoesCard,
  sanitizeWeaponCard1,
  sanitizeWeaponCard234,
} from "./cardSlotOptions";
import { MONSTER_OBJ } from "./monster.generated";
import { armorItemOptions, weaponItemOptions } from "./itemLists";
import { clampWeaponType, resolveCombatJob } from "./jobResolve";
import { clampBaseLv, clampJobLv } from "./inputClamp";
import { JOB_PASSIVE_SKILL_IDS } from "./skillBoard.generated";
import { clampPassiveSlotValue } from "./skillBoard";

const ARMOR_SLOTS: { key: keyof EquipmentState; kind: number }[] = [
  { key: "head1Id", kind: 50 },
  { key: "head2Id", kind: 51 },
  { key: "head3Id", kind: 52 },
  { key: "leftId", kind: 61 },
  { key: "bodyId", kind: 60 },
  { key: "shoulderId", kind: 62 },
  { key: "shoesId", kind: 63 },
  { key: "acc1Id", kind: 64 },
  { key: "acc2Id", kind: 64 },
];

export function defaultBuffSupport(): BuffSupportState {
  return {
    blessLv: 0,
    agiUpLv: 0,
    magnusLv: 0,
    fortuneKiss: false,
    kyrieLv: 0,
    gloria: false,
    adrenalineMode: 0,
    weaponSizeIgnore: false,
    overthrustLv: 0,
    windWalkerLv: 0,
    spiritSphereLv: 0,
    berserkState: false,
    provoke: false,
    sacrificePoemLv: 0,
    lightOfLordLv: 0,
  };
}

/** 强化/辅助：各下拉与勾选取允许范围内的最大值 */
export function maxBuffSupport(): BuffSupportState {
  return {
    blessLv: 10,
    agiUpLv: 10,
    magnusLv: 5,
    fortuneKiss: true,
    kyrieLv: 10,
    gloria: true,
    adrenalineMode: 3,
    weaponSizeIgnore: true,
    overthrustLv: 5,
    windWalkerLv: 10,
    spiritSphereLv: 5,
    berserkState: true,
    provoke: true,
    sacrificePoemLv: 3,
    lightOfLordLv: 5,
  };
}

function sanitizeBuffSupport(b: BuffSupportState | undefined): BuffSupportState {
  const d = defaultBuffSupport();
  const x = b ?? d;
  return {
    blessLv: Math.min(10, Math.max(0, Math.floor(x.blessLv))),
    agiUpLv: Math.min(10, Math.max(0, Math.floor(x.agiUpLv))),
    magnusLv: Math.min(5, Math.max(0, Math.floor(x.magnusLv))),
    fortuneKiss: Boolean(x.fortuneKiss),
    kyrieLv: Math.min(10, Math.max(0, Math.floor(x.kyrieLv))),
    gloria: Boolean(x.gloria),
    adrenalineMode: Math.min(3, Math.max(0, Math.floor(x.adrenalineMode))),
    weaponSizeIgnore: Boolean(x.weaponSizeIgnore),
    overthrustLv: Math.min(5, Math.max(0, Math.floor(x.overthrustLv))),
    windWalkerLv: Math.min(10, Math.max(0, Math.floor(x.windWalkerLv))),
    spiritSphereLv: Math.min(5, Math.max(0, Math.floor(x.spiritSphereLv))),
    berserkState: Boolean(x.berserkState),
    provoke: Boolean(x.provoke),
    sacrificePoemLv: Math.min(3, Math.max(0, Math.floor(x.sacrificePoemLv))),
    lightOfLordLv: Math.min(5, Math.max(0, Math.floor(x.lightOfLordLv))),
  };
}

function normalizePassiveSkillLevels(
  formJobId: number,
  levels: number[] | undefined,
): number[] {
  const ids = JOB_PASSIVE_SKILL_IDS[formJobId] ?? [];
  return ids.map((skillId, i) =>
    clampPassiveSlotValue(skillId, levels?.[i] ?? 0),
  );
}

function clampInt(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, Math.floor(Number.isFinite(n) ? n : 0)));
}

export function defaultPerformanceDance(): PerformanceDanceState {
  return {
    lv0: 0,
    lv1: 0,
    lv2: 0,
    lv3: 0,
    lv4: 0,
    lv5: 0,
    lv6: 0,
    lv7: 0,
    lv8: 0,
    lv9: 0,
    lv10: 0,
    puppetTrick: false,
    row0PoetAgi: 100,
    row0Instrument: 10,
    row1PoetAgi: 100,
    row1Instrument: 10,
    row2PoetDex: 130,
    row2PoetInt: 80,
    row2Instrument: 10,
    row3PoetVit: 100,
    row3Instrument: 10,
    row4DancerDex: 130,
    row4Dance: 10,
    row5DancerLuk: 50,
    row5Dance: 10,
    row6DancerInt: 50,
    row6Dance: 10,
    puppetStr: 0,
    puppetAgi: 0,
    puppetVit: 0,
    puppetInt: 0,
    puppetDex: 0,
    puppetLuk: 0,
    puppetFullStatsNoHalf: false,
  };
}

function sanitizePerformanceDance(p?: PerformanceDanceState): PerformanceDanceState {
  const d = defaultPerformanceDance();
  const x = { ...d, ...p };
  return {
    lv0: clampInt(x.lv0, 0, 10),
    lv1: clampInt(x.lv1, 0, 10),
    lv2: clampInt(x.lv2, 0, 10),
    lv3: clampInt(x.lv3, 0, 10),
    lv4: clampInt(x.lv4, 0, 10),
    lv5: clampInt(x.lv5, 0, 10),
    lv6: clampInt(x.lv6, 0, 10),
    lv7: clampInt(x.lv7, 0, 5),
    lv8: clampInt(x.lv8, 0, 5),
    lv9: clampInt(x.lv9, 0, 5),
    lv10: clampInt(x.lv10, 0, 5),
    puppetTrick: Boolean(x.puppetTrick),
    row0PoetAgi: clampInt(x.row0PoetAgi, 1, 150),
    row0Instrument: clampInt(x.row0Instrument, 1, 10),
    row1PoetAgi: clampInt(x.row1PoetAgi, 1, 150),
    row1Instrument: clampInt(x.row1Instrument, 1, 10),
    row2PoetDex: clampInt(x.row2PoetDex, 1, 200),
    row2PoetInt: clampInt(x.row2PoetInt, 1, 150),
    row2Instrument: clampInt(x.row2Instrument, 1, 10),
    row3PoetVit: clampInt(x.row3PoetVit, 1, 150),
    row3Instrument: clampInt(x.row3Instrument, 1, 10),
    row4DancerDex: clampInt(x.row4DancerDex, 1, 180),
    row4Dance: clampInt(x.row4Dance, 1, 10),
    row5DancerLuk: clampInt(x.row5DancerLuk, 1, 180),
    row5Dance: clampInt(x.row5Dance, 1, 10),
    row6DancerInt: clampInt(x.row6DancerInt, 1, 180),
    row6Dance: clampInt(x.row6Dance, 1, 10),
    puppetStr: clampInt(x.puppetStr, 0, 99),
    puppetAgi: clampInt(x.puppetAgi, 0, 99),
    puppetVit: clampInt(x.puppetVit, 0, 99),
    puppetInt: clampInt(x.puppetInt, 0, 99),
    puppetDex: clampInt(x.puppetDex, 0, 99),
    puppetLuk: clampInt(x.puppetLuk, 0, 99),
    puppetFullStatsNoHalf: Boolean(x.puppetFullStatsNoHalf),
  };
}

export function defaultGuildLeader(): GuildLeaderSkillsState {
  return {
    allStats20: false,
    hp100: false,
    sp100: false,
    atk100: false,
    hitFlee50: false,
    damageHalf: false,
  };
}

function sanitizeGuildLeader(g?: GuildLeaderSkillsState): GuildLeaderSkillsState {
  const d = defaultGuildLeader();
  const x = { ...d, ...g };
  return {
    allStats20: Boolean(x.allStats20),
    hp100: Boolean(x.hp100),
    sp100: Boolean(x.sp100),
    atk100: Boolean(x.atk100),
    hitFlee50: Boolean(x.hitFlee50),
    damageHalf: Boolean(x.damageHalf),
  };
}

export function defaultGuildCommand(): GuildCommandState {
  return {
    battleOrder: false,
    greatGuidance: 0,
    gloriousWound: 0,
    coldHeart: 0,
    sharpGaze: 0,
  };
}

function sanitizeGuildCommand(c?: GuildCommandState): GuildCommandState {
  const d = defaultGuildCommand();
  const x = { ...d, ...c };
  return {
    battleOrder: Boolean(x.battleOrder),
    greatGuidance: clampInt(x.greatGuidance, 0, 5),
    gloriousWound: clampInt(x.gloriousWound, 0, 5),
    coldHeart: clampInt(x.coldHeart, 0, 5),
    sharpGaze: clampInt(x.sharpGaze, 0, 5),
  };
}

export function defaultHolySupport(): HolySupportState {
  return {
    elementField: 0,
    slaughterLevel: 0,
    slaughterSystem: 0,
    raptorMind: 0,
    domainSupport: 0,
    provokeSupport: 0,
    holyBodyBless: false,
  };
}

function sanitizeHolySupport(h?: HolySupportState): HolySupportState {
  const d = defaultHolySupport();
  const x = { ...d, ...h };
  return {
    elementField: clampInt(x.elementField, 0, 2),
    slaughterLevel: clampInt(x.slaughterLevel, 0, 5),
    slaughterSystem: clampInt(x.slaughterSystem, 0, 2),
    raptorMind: clampInt(x.raptorMind, 0, 2),
    domainSupport: clampInt(x.domainSupport, 0, 5),
    provokeSupport: clampInt(x.provokeSupport, 0, 10),
    holyBodyBless: Boolean(x.holyBodyBless),
  };
}

export function defaultFoodConsumable(): FoodConsumableState {
  return {
    teaHit: false,
    oilFlee: false,
    coloredCake: false,
    resentmentBox: false,
    sleepBox: false,
    resistWater: false,
    resistEarth: false,
    resistFire: false,
    resistWind: false,
    magicScrollExtra: false,
    strBonus: 0,
    agiBonus: 0,
    vitBonus: 0,
    intBonus: 0,
    dexBonus: 0,
    lukBonus: 0,
  };
}

function sanitizeFoodConsumable(f?: FoodConsumableState): FoodConsumableState {
  const d = defaultFoodConsumable();
  const x = { ...d, ...f };
  return {
    teaHit: Boolean(x.teaHit),
    oilFlee: Boolean(x.oilFlee),
    coloredCake: Boolean(x.coloredCake),
    resentmentBox: Boolean(x.resentmentBox),
    sleepBox: Boolean(x.sleepBox),
    resistWater: Boolean(x.resistWater),
    resistEarth: Boolean(x.resistEarth),
    resistFire: Boolean(x.resistFire),
    resistWind: Boolean(x.resistWind),
    magicScrollExtra: Boolean(x.magicScrollExtra),
    strBonus: clampInt(x.strBonus, 0, 99),
    agiBonus: clampInt(x.agiBonus, 0, 99),
    vitBonus: clampInt(x.vitBonus, 0, 99),
    intBonus: clampInt(x.intBonus, 0, 99),
    dexBonus: clampInt(x.dexBonus, 0, 99),
    lukBonus: clampInt(x.lukBonus, 0, 99),
  };
}

/** 新建角色时的完整默认值（会再经 sanitize） */
const KYOUKA_ELEMENT_VALUE_SET = new Set(KYOUKA_ELEMENT_OPTIONS.map((o) => o.value));

export function defaultEnemyCombat(): EnemyCombatState {
  return {
    monsterIndex: 0,
    attackKind: 2,
    monsterSort: 0,
    abnormalPanelOpen: false,
    defenderPanelOpen: false,
    abnormal: Array.from({ length: IJYOU_SLOT_COUNT }, () => 0),
    defender: Array.from({ length: KYOUKA_SLOT_COUNT }, () => 0),
  };
}

function sanitizeEnemyCombat(e: EnemyCombatState | undefined): EnemyCombatState {
  const d = defaultEnemyCombat();
  const x = e ?? d;
  const maxMon = Math.max(0, MONSTER_OBJ.length - 1);
  const abnormal = IJYOU_SLOT_SPECS.map((spec, i) => {
    const raw = x.abnormal?.[i] ?? 0;
    const n = Math.floor(Number.isFinite(raw) ? raw : 0);
    if (spec.kind === "checkbox") return n ? 1 : 0;
    const hi = spec.max ?? 0;
    return Math.min(hi, Math.max(0, n));
  });
  const defender = KYOUKA_SLOT_SPECS.map((spec, i) => {
    const raw = x.defender?.[i] ?? 0;
    const n = Math.floor(Number.isFinite(raw) ? raw : 0);
    if (spec.kind === "checkbox") return n ? 1 : 0;
    if (spec.kind === "element") {
      return KYOUKA_ELEMENT_VALUE_SET.has(n) ? n : 0;
    }
    if (spec.kind === "select5") return Math.min(5, Math.max(0, n));
    return Math.min(10, Math.max(0, n));
  });
  return {
    monsterIndex: Math.min(maxMon, Math.max(0, Math.floor(x.monsterIndex ?? 0))),
    attackKind: Math.min(2, Math.max(0, Math.floor(x.attackKind ?? 2))),
    monsterSort: Math.min(7, Math.max(0, Math.floor(x.monsterSort ?? 0))),
    abnormalPanelOpen: Boolean(x.abnormalPanelOpen),
    defenderPanelOpen: Boolean(x.defenderPanelOpen),
    abnormal,
    defender,
  };
}

export function defaultCharacterBaseInput(): CharacterBaseInput {
  return {
    baseLv: 99,
    jobLv: 50,
    formJobId: 0,
    baby: false,
    weaponType: 0,
    speedPot: 0,
    stats: { str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1 },
    equipment: defaultEquipment(),
    passiveSkillLevels: [],
    buffSupport: defaultBuffSupport(),
    performanceDance: defaultPerformanceDance(),
    guildLeader: defaultGuildLeader(),
    guildCommand: defaultGuildCommand(),
    holySupport: defaultHolySupport(),
    foodConsumable: defaultFoodConsumable(),
    enemyCombat: defaultEnemyCombat(),
  };
}

export function defaultEquipment(): EquipmentState {
  return {
    weaponId: 0,
    weaponRefine: 0,
    weaponCard1: 0,
    weaponCard2: 0,
    weaponCard3: 0,
    weaponCard4: 0,
    head1Id: 0,
    head1Refine: 0,
    head1Card: 0,
    head2Id: 0,
    head2Card: 0,
    head3Id: 0,
    head3Refine: 0,
    leftId: 0,
    leftRefine: 0,
    leftCard: 0,
    bodyId: 0,
    bodyRefine: 0,
    bodyCard: 0,
    shoulderId: 0,
    shoulderRefine: 0,
    shoulderCard: 0,
    shoesId: 0,
    shoesRefine: 0,
    shoesCard: 0,
    acc1Id: 0,
    acc1Card: 0,
    acc2Id: 0,
    acc2Card: 0,
  };
}

function clampRefine(n: number): number {
  return Math.min(10, Math.max(0, Math.floor(n)));
}

export function sanitizeCharacterInput(input: CharacterBaseInput): CharacterBaseInput {
  const { effectiveJobId, isTensei } = resolveCombatJob(input.formJobId);
  const weaponType = clampWeaponType(effectiveJobId, input.weaponType);
  const baseLv = clampBaseLv(input.baseLv);
  const jobLv = clampJobLv(input.formJobId, input.jobLv);

  let eq: EquipmentState = {
    ...defaultEquipment(),
    ...input.equipment,
    weaponRefine: clampRefine(input.equipment.weaponRefine),
    head1Refine: clampRefine(input.equipment.head1Refine),
    head3Refine: clampRefine(input.equipment.head3Refine),
    leftRefine: clampRefine(input.equipment.leftRefine),
    bodyRefine: clampRefine(input.equipment.bodyRefine),
    shoulderRefine: clampRefine(input.equipment.shoulderRefine),
    shoesRefine: clampRefine(input.equipment.shoesRefine),
  };

  const wIds = weaponItemOptions(effectiveJobId, isTensei, weaponType).map((o) => o.id);
  if (!wIds.includes(eq.weaponId)) {
    eq.weaponId = wIds[0] ?? 0;
    eq.weaponRefine = 0;
  }

  for (const { key, kind } of ARMOR_SLOTS) {
    const ids = armorItemOptions(effectiveJobId, isTensei, kind).map((o) => o.id);
    const cur = eq[key];
    if (typeof cur === "number" && !ids.includes(cur)) {
      eq = { ...eq, [key]: 0 };
    }
  }

  eq = {
    ...eq,
    weaponCard1: sanitizeWeaponCard1(eq.weaponCard1),
    weaponCard2: sanitizeWeaponCard234(eq.weaponCard2),
    weaponCard3: sanitizeWeaponCard234(eq.weaponCard3),
    weaponCard4: sanitizeWeaponCard234(eq.weaponCard4),
    head1Card: sanitizeHeadgearCard(eq.head1Card),
    head2Card: sanitizeHeadgearCard(eq.head2Card),
    leftCard: sanitizeShieldCard(eq.leftCard),
    bodyCard: sanitizeBodyArmorCard(eq.bodyCard),
    shoulderCard: sanitizeGarmentCard(eq.shoulderCard),
    shoesCard: sanitizeShoesCard(eq.shoesCard),
    acc1Card: sanitizeAccessoryCard(eq.acc1Card),
    acc2Card: sanitizeAccessoryCard(eq.acc2Card),
  };

  return {
    ...input,
    baseLv,
    jobLv,
    weaponType,
    equipment: eq,
    passiveSkillLevels: normalizePassiveSkillLevels(input.formJobId, input.passiveSkillLevels),
    buffSupport: sanitizeBuffSupport(input.buffSupport),
    performanceDance: sanitizePerformanceDance(input.performanceDance),
    guildLeader: sanitizeGuildLeader(input.guildLeader),
    guildCommand: sanitizeGuildCommand(input.guildCommand),
    holySupport: sanitizeHolySupport(input.holySupport),
    foodConsumable: sanitizeFoodConsumable(input.foodConsumable),
    enemyCombat: sanitizeEnemyCombat(input.enemyCombat),
  };
}
