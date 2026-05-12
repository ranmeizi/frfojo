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
import { sanitizeEquipmentCardId } from "./cardSlotOptions";
import { maxRangedAmmoIndex } from "./rangedAmmoResolve";
import { MONSTER_OBJ } from "./monster.generated";
import { armorItemOptions, dualWieldWeapon2ItemOptions, weaponItemOptions } from "./itemLists";
import { customEquipmentMap } from "./customEquipmentRegistry";
import { jobSupportsDualWield } from "./nitouSupport";
import { clampSanctityCoreCode } from "./sanctityCoreSix";
import { clampWeaponType, resolveCombatJob } from "./jobResolve";
import { defaultPlayerManualEdits, sanitizePlayerManualEdits } from "./playerManualEdits";
import { clampBaseLv, clampJobLv } from "./inputClamp";
import { JOB_PASSIVE_SKILL_IDS } from "./skillBoard.generated";
import { clampPassiveSlotValue } from "./skillBoard";

const ARMOR_EQUIP_CUSTOM: {
  idKey: keyof EquipmentState;
  customKey: keyof EquipmentState;
  refineKey: keyof EquipmentState | null;
  cardKey: keyof EquipmentState | null;
  kind: number;
}[] = [
  { idKey: "head1Id", customKey: "head1CustomEquipId", refineKey: "head1Refine", cardKey: "head1Card", kind: 50 },
  { idKey: "head2Id", customKey: "head2CustomEquipId", refineKey: null, cardKey: "head2Card", kind: 51 },
  { idKey: "head3Id", customKey: "head3CustomEquipId", refineKey: "head3Refine", cardKey: null, kind: 52 },
  { idKey: "leftId", customKey: "leftCustomEquipId", refineKey: "leftRefine", cardKey: "leftCard", kind: 61 },
  { idKey: "bodyId", customKey: "bodyCustomEquipId", refineKey: "bodyRefine", cardKey: "bodyCard", kind: 60 },
  { idKey: "shoulderId", customKey: "shoulderCustomEquipId", refineKey: "shoulderRefine", cardKey: "shoulderCard", kind: 62 },
  { idKey: "shoesId", customKey: "shoesCustomEquipId", refineKey: "shoesRefine", cardKey: "shoesCard", kind: 63 },
  { idKey: "acc1Id", customKey: "acc1CustomEquipId", refineKey: null, cardKey: "acc1Card", kind: 64 },
  { idKey: "acc2Id", customKey: "acc2CustomEquipId", refineKey: null, cardKey: "acc2Card", kind: 64 },
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
    suffragiumLv: 0,
    elementalBarrierLv: 0,
    weaponResearchLv: 0,
    soulBreakerEdp: false,
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
    suffragiumLv: 5,
    elementalBarrierLv: 10,
    weaponResearchLv: 5,
    soulBreakerEdp: true,
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
    suffragiumLv: Math.min(5, Math.max(0, Math.floor(x.suffragiumLv ?? 0))),
    elementalBarrierLv: Math.min(10, Math.max(0, Math.floor(x.elementalBarrierLv ?? 0))),
    weaponResearchLv: Math.min(5, Math.max(0, Math.floor(x.weaponResearchLv ?? 0))),
    soulBreakerEdp: Boolean(x.soulBreakerEdp),
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

function clampRangedAmmoIndex(weaponType: number, n: unknown): number {
  const maxI = maxRangedAmmoIndex(weaponType);
  const def = weaponType === 10 ? 3 : 0;
  const x = Math.floor(Number(n));
  const base = Number.isFinite(x) ? x : def;
  if (maxI == null) return base;
  return Math.min(maxI, Math.max(0, base));
}

function clampActiveSkillId(n: unknown): number {
  const v = Math.floor(Number.isFinite(Number(n)) ? Number(n) : 0);
  return Math.min(999999, Math.max(0, v));
}

function clampActiveSkillLv(n: unknown): number {
  if (n === undefined || n === null || n === "") return 1;
  return clampInt(Number(n), 0, 50);
}

function clampKakutyouMode(n: unknown): number {
  return clampInt(Number(n), 0, 10);
}

function clampKakutyouSelNum(n: unknown): number {
  return clampInt(Number(n), 0, 10);
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
    sanctityCoreCode: 0,
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
    sanctityCoreCode: clampSanctityCoreCode(x.sanctityCoreCode ?? 0),
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
    clientDelayCapPercent: 33,
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
  const capRaw = x.clientDelayCapPercent ?? d.clientDelayCapPercent;
  const clientDelayCapPercent = Math.min(99, Math.max(1, Math.floor(Number(capRaw) || 33)));

  return {
    monsterIndex: Math.min(maxMon, Math.max(0, Math.floor(x.monsterIndex ?? 0))),
    attackKind: Math.min(2, Math.max(0, Math.floor(x.attackKind ?? 2))),
    monsterSort: Math.min(7, Math.max(0, Math.floor(x.monsterSort ?? 0))),
    abnormalPanelOpen: Boolean(x.abnormalPanelOpen),
    defenderPanelOpen: Boolean(x.defenderPanelOpen),
    abnormal,
    defender,
    clientDelayCapPercent,
  };
}

export function defaultCharacterBaseInput(): CharacterBaseInput {
  return {
    baseLv: 99,
    jobLv: 50,
    formJobId: 0,
    baby: false,
    weaponType: 0,
    bowArrowIndex: 3,
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
    playerManualEdits: defaultPlayerManualEdits(),
    activeSkillId: 0,
    activeSkillLv: 1,
    kakutyouMode: 0,
    kakutyouSelNum: 10,
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
    dualWield: false,
    weapon2Id: 0,
    weapon2Refine: 0,
    weapon2Card1: 0,
    weapon2Card2: 0,
    weapon2Card3: 0,
    weapon2Card4: 0,
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
    weaponCustomEquipId: null,
    weapon2CustomEquipId: null,
    head1CustomEquipId: null,
    head2CustomEquipId: null,
    head3CustomEquipId: null,
    leftCustomEquipId: null,
    bodyCustomEquipId: null,
    shoulderCustomEquipId: null,
    shoesCustomEquipId: null,
    acc1CustomEquipId: null,
    acc2CustomEquipId: null,
  };
}

/** 【新功能】校验自定义装备 id、kind 与槽位一致；合法则清空对应 Item id / 精炼 / 卡 */
function sanitizeEquipmentCustomBindings(eq: EquipmentState, weaponType: number): EquipmentState {
  const cm = customEquipmentMap();
  let e: EquipmentState = { ...eq };

  let wC = typeof e.weaponCustomEquipId === "string" ? e.weaponCustomEquipId.trim() : "";
  if (wC.length > 128 || !cm.has(wC)) wC = "";
  if (wC && weaponType > 0) {
    const r = cm.get(wC)!;
    if (r.kind === weaponType) {
      e = {
        ...e,
        weaponCustomEquipId: wC,
        weaponId: 0,
        weaponRefine: 0,
        weaponCard1: 0,
        weaponCard2: 0,
        weaponCard3: 0,
        weaponCard4: 0,
      };
    } else {
      e = { ...e, weaponCustomEquipId: null };
    }
  } else {
    e = { ...e, weaponCustomEquipId: null };
  }

  let w2c = typeof e.weapon2CustomEquipId === "string" ? e.weapon2CustomEquipId.trim() : "";
  if (w2c.length > 128 || !cm.has(w2c)) w2c = "";
  if (w2c) {
    const r = cm.get(w2c)!;
    if ([1, 2, 6].includes(r.kind)) {
      e = {
        ...e,
        weapon2CustomEquipId: w2c,
        weapon2Id: 0,
        weapon2Refine: 0,
        weapon2Card1: 0,
        weapon2Card2: 0,
        weapon2Card3: 0,
        weapon2Card4: 0,
      };
    } else {
      e = { ...e, weapon2CustomEquipId: null };
    }
  } else {
    e = { ...e, weapon2CustomEquipId: null };
  }

  for (const row of ARMOR_EQUIP_CUSTOM) {
    let cid = typeof e[row.customKey] === "string" ? (e[row.customKey] as string).trim() : "";
    if (cid.length > 128 || !cm.has(cid)) cid = "";
    if (cid) {
      const r = cm.get(cid)!;
      if (r.kind === row.kind) {
        const patch: Partial<EquipmentState> = {
          [row.customKey]: cid,
          [row.idKey]: 0,
        };
        if (row.refineKey) (patch as Record<string, number>)[row.refineKey] = 0;
        if (row.cardKey) (patch as Record<string, number>)[row.cardKey] = 0;
        e = { ...e, ...patch };
      } else {
        e = { ...e, [row.customKey]: null } as EquipmentState;
      }
    } else {
      e = { ...e, [row.customKey]: null } as EquipmentState;
    }
  }

  return e;
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

  eq = sanitizeEquipmentCustomBindings(eq, weaponType);

  const wIds = weaponItemOptions(effectiveJobId, isTensei, weaponType).map((o) => o.id);
  if (!eq.weaponCustomEquipId && !wIds.includes(eq.weaponId)) {
    eq.weaponId = wIds[0] ?? 0;
    eq.weaponRefine = 0;
  }

  for (const row of ARMOR_EQUIP_CUSTOM) {
    if (eq[row.customKey]) continue;
    const ids = armorItemOptions(effectiveJobId, isTensei, row.kind).map((o) => o.id);
    const cur = eq[row.idKey];
    if (typeof cur === "number" && !ids.includes(cur)) {
      eq = { ...eq, [row.idKey]: 0 };
    }
  }

  const canNitou = jobSupportsDualWield(effectiveJobId);
  const w2Ids = dualWieldWeapon2ItemOptions(effectiveJobId, isTensei).map((o) => o.id);
  const dualWield = canNitou && Boolean(eq.dualWield);
  let weapon2Id = 0;
  if (dualWield) {
    if (eq.weapon2CustomEquipId) weapon2Id = 0;
    else if (w2Ids.includes(eq.weapon2Id)) weapon2Id = eq.weapon2Id;
  }
  if (weapon2Id === 0 && !eq.weapon2CustomEquipId) {
    eq = { ...eq, weapon2Refine: 0, weapon2Card1: 0, weapon2Card2: 0, weapon2Card3: 0, weapon2Card4: 0 };
  }

  eq = {
    ...eq,
    dualWield,
    weapon2Id,
    weapon2Refine: weapon2Id === 0 && !eq.weapon2CustomEquipId ? 0 : clampRefine(eq.weapon2Refine),
    weaponCard1: sanitizeEquipmentCardId(eq.weaponCard1),
    weaponCard2: sanitizeEquipmentCardId(eq.weaponCard2),
    weaponCard3: sanitizeEquipmentCardId(eq.weaponCard3),
    weaponCard4: sanitizeEquipmentCardId(eq.weaponCard4),
    weapon2Card1: sanitizeEquipmentCardId(eq.weapon2Card1),
    weapon2Card2: sanitizeEquipmentCardId(eq.weapon2Card2),
    weapon2Card3: sanitizeEquipmentCardId(eq.weapon2Card3),
    weapon2Card4: sanitizeEquipmentCardId(eq.weapon2Card4),
    head1Card: sanitizeEquipmentCardId(eq.head1Card),
    head2Card: sanitizeEquipmentCardId(eq.head2Card),
    leftCard: sanitizeEquipmentCardId(eq.leftCard),
    bodyCard: sanitizeEquipmentCardId(eq.bodyCard),
    shoulderCard: sanitizeEquipmentCardId(eq.shoulderCard),
    shoesCard: sanitizeEquipmentCardId(eq.shoesCard),
    acc1Card: sanitizeEquipmentCardId(eq.acc1Card),
    acc2Card: sanitizeEquipmentCardId(eq.acc2Card),
  };

  return {
    ...input,
    baseLv,
    jobLv,
    weaponType,
    bowArrowIndex: clampRangedAmmoIndex(weaponType, input.bowArrowIndex),
    equipment: eq,
    passiveSkillLevels: normalizePassiveSkillLevels(input.formJobId, input.passiveSkillLevels),
    buffSupport: sanitizeBuffSupport(input.buffSupport),
    performanceDance: sanitizePerformanceDance(input.performanceDance),
    guildLeader: sanitizeGuildLeader(input.guildLeader),
    guildCommand: sanitizeGuildCommand(input.guildCommand),
    holySupport: sanitizeHolySupport(input.holySupport),
    foodConsumable: sanitizeFoodConsumable(input.foodConsumable),
    enemyCombat: sanitizeEnemyCombat(input.enemyCombat),
    playerManualEdits: sanitizePlayerManualEdits(input.playerManualEdits),
    activeSkillId: clampActiveSkillId(input.activeSkillId),
    activeSkillLv: clampActiveSkillLv(input.activeSkillLv),
    kakutyouMode: clampKakutyouMode(input.kakutyouMode),
    kakutyouSelNum: clampKakutyouSelNum(input.kakutyouSelNum),
  };
}
