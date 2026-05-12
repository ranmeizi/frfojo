import type { CharacterBaseInput, CustomEquipmentRecord } from "./types";
import { sanitizeCharacterInput } from "./sanitizeCharacter";
import {
  collectEmbeddedCustomEquipsForSave,
  mergeEmbeddedCustomEquips,
} from "./customEquipmentRegistry";

/** 与 refer 存档槽数量一致：1～50 */
export const RO_CALC_SAVE_SLOT_COUNT = 50;

const STORAGE_KEY_PREFIX = "bobo-tool.roCalc.saveSlot.v1.";

function slotKey(slot: number): string {
  return `${STORAGE_KEY_PREFIX}${slot}`;
}

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export type RoCalcStoredSaveV1 = {
  v: 1;
  savedAt: string;
  data: CharacterBaseInput;
};

/** 【新功能】内嵌自定义装备条目，读取时合并进全局库 */
export type RoCalcStoredSaveV2 = {
  v: 2;
  savedAt: string;
  data: CharacterBaseInput;
  embeddedCustomEquips?: CustomEquipmentRecord[];
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export type RoCalcSaveSlotSummary = {
  occupied: boolean;
  savedAt: string | null;
  /** 存档内 `data.formJobId`；损坏或旧档可能为 null */
  formJobId: number | null;
};

const MAX_FORM_JOB_ID = 127;

function tryParseSaveSlotMeta(raw: string): { savedAt: string | null; formJobId: number | null } {
  try {
    const o = JSON.parse(raw) as unknown;
    if (!isRecord(o)) return { savedAt: null, formJobId: null };
    const savedAt = typeof o.savedAt === "string" ? o.savedAt : null;
    const data = o.data;
    if (!isRecord(data)) return { savedAt, formJobId: null };
    const j = data.formJobId;
    if (typeof j === "number" && Number.isFinite(j)) {
      const ji = Math.trunc(j);
      if (ji >= 0 && ji <= MAX_FORM_JOB_ID) return { savedAt, formJobId: ji };
    }
    if (typeof j === "string" && /^\d+$/.test(j)) {
      const ji = Number(j);
      if (ji >= 0 && ji <= MAX_FORM_JOB_ID) return { savedAt, formJobId: ji };
    }
    return { savedAt, formJobId: null };
  } catch {
    return { savedAt: null, formJobId: null };
  }
}

function readSaveSlotSummary(slot: number): RoCalcSaveSlotSummary {
  if (slot < 0 || slot >= RO_CALC_SAVE_SLOT_COUNT) {
    return { occupied: false, savedAt: null, formJobId: null };
  }
  const raw = safeGetItem(slotKey(slot));
  if (!raw) return { occupied: false, savedAt: null, formJobId: null };
  const meta = tryParseSaveSlotMeta(raw);
  return { occupied: true, savedAt: meta.savedAt, formJobId: meta.formJobId };
}

/** 槽位是否已有任意字符串（含损坏 JSON） */
export function saveSlotOccupied(slot: number): boolean {
  return readSaveSlotSummary(slot).occupied;
}

/** 仅读取存档时间，用于下拉展示 */
export function peekSaveSlotSavedAt(slot: number): string | null {
  return readSaveSlotSummary(slot).savedAt;
}

/** 读取并消毒；无效则返回 null */
export function readSaveSlot(slot: number): CharacterBaseInput | null {
  if (slot < 0 || slot >= RO_CALC_SAVE_SLOT_COUNT) return null;
  const raw = safeGetItem(slotKey(slot));
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) return null;
  const v = parsed.v;
  if (v === 2 && Array.isArray(parsed.embeddedCustomEquips)) {
    mergeEmbeddedCustomEquips(parsed.embeddedCustomEquips as CustomEquipmentRecord[]);
  }
  const data = parsed.data;
  if (!isRecord(data)) return null;
  try {
    return sanitizeCharacterInput(data as CharacterBaseInput);
  } catch {
    return null;
  }
}

export function writeSaveSlot(slot: number, input: CharacterBaseInput): boolean {
  if (slot < 0 || slot >= RO_CALC_SAVE_SLOT_COUNT) return false;
  const embedded = collectEmbeddedCustomEquipsForSave(input);
  const payload: RoCalcStoredSaveV2 = {
    v: 2,
    savedAt: new Date().toISOString(),
    data: sanitizeCharacterInput(input),
    embeddedCustomEquips: embedded.length > 0 ? embedded : undefined,
  };
  return safeSetItem(slotKey(slot), JSON.stringify(payload));
}

export function clearSaveSlot(slot: number): void {
  if (slot < 0 || slot >= RO_CALC_SAVE_SLOT_COUNT) return;
  safeRemoveItem(slotKey(slot));
}

export function listSaveSlotSummaries(): RoCalcSaveSlotSummary[] {
  return Array.from({ length: RO_CALC_SAVE_SLOT_COUNT }, (_, i) => readSaveSlotSummary(i));
}
