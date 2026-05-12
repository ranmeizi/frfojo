/**
 * 【新功能】自定义装备全局库：localStorage 持久化；存档 v2 可内嵌条目以便分享。
 */
import type { CharacterBaseInput, CustomEquipmentRecord, EquipmentState } from "./types";
import { sanitizePlayerManualEdits } from "./playerManualEdits";

const STORAGE_KEY = "bobo-tool.roCalc.customEquips.v1";

export type CustomEquipmentStoreFile = {
  v: 1;
  items: CustomEquipmentRecord[];
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function safeGet(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function sanitizeOne(raw: unknown): CustomEquipmentRecord | null {
  if (!isRecord(raw)) return null;
  const id = raw.id;
  const kind = raw.kind;
  const name = raw.name;
  const description = raw.description;
  const bonuses = raw.bonuses;
  if (typeof id !== "string" || id.length < 1 || id.length > 128) return null;
  if (typeof kind !== "number" || !Number.isFinite(kind)) return null;
  const k = Math.floor(kind);
  if (k < 0 || k > 99) return null;
  const nm = typeof name === "string" ? name.slice(0, 120) : "";
  const desc = typeof description === "string" ? description.slice(0, 2000) : "";
  if (!isRecord(bonuses)) return null;
  return {
    id,
    kind: k,
    name: nm || "未命名",
    description: desc,
    bonuses: sanitizePlayerManualEdits(bonuses as import("./types").PlayerManualEditsState),
  };
}

export function readCustomEquipmentStore(): CustomEquipmentRecord[] {
  const raw = safeGet(STORAGE_KEY);
  if (!raw) return [];
  try {
    const o = JSON.parse(raw) as unknown;
    if (!isRecord(o) || o.v !== 1) return [];
    const items = o.items;
    if (!Array.isArray(items)) return [];
    const out: CustomEquipmentRecord[] = [];
    const seen = new Set<string>();
    for (const it of items) {
      const s = sanitizeOne(it);
      if (!s || seen.has(s.id)) continue;
      seen.add(s.id);
      out.push(s);
    }
    return out;
  } catch {
    return [];
  }
}

export function writeCustomEquipmentStore(items: CustomEquipmentRecord[]): boolean {
  const payload: CustomEquipmentStoreFile = { v: 1, items };
  return safeSet(STORAGE_KEY, JSON.stringify(payload));
}

export function customEquipmentMap(): Map<string, CustomEquipmentRecord> {
  const m = new Map<string, CustomEquipmentRecord>();
  for (const r of readCustomEquipmentStore()) m.set(r.id, r);
  return m;
}

export function upsertCustomEquipment(record: CustomEquipmentRecord): boolean {
  const list = readCustomEquipmentStore().filter((x) => x.id !== record.id);
  list.push(record);
  return writeCustomEquipmentStore(list);
}

export function removeCustomEquipment(id: string): boolean {
  const list = readCustomEquipmentStore().filter((x) => x.id !== id);
  return writeCustomEquipmentStore(list);
}

/** 合并存档内嵌的自定义装备到全局库（同 id 覆盖） */
export function mergeEmbeddedCustomEquips(embedded: CustomEquipmentRecord[] | undefined): void {
  if (!embedded?.length) return;
  const byId = new Map<string, CustomEquipmentRecord>();
  for (const r of readCustomEquipmentStore()) byId.set(r.id, r);
  for (const r of embedded) {
    const s = sanitizeOne(r);
    if (s) byId.set(s.id, s);
  }
  writeCustomEquipmentStore([...byId.values()]);
}

const VIRTUAL_BASE = -2_000_001_000;

/** Autocomplete 用稳定虚拟 id（与 ItemOBJ 正数 id 不重叠） */
export function customEquipVirtualItemId(ceId: string): number {
  let h = 5381;
  for (let i = 0; i < ceId.length; i++) h = ((h << 5) + h) ^ ceId.charCodeAt(i);
  const u = Math.abs(h >>> 0) % 1_000_000_000;
  return VIRTUAL_BASE - u;
}

export function listCustomEquipsForKind(
  kind: number,
  weapon2Kinds?: readonly number[],
): CustomEquipmentRecord[] {
  const k = Math.floor(kind);
  return readCustomEquipmentStore().filter((r) => {
    if (weapon2Kinds?.length) {
      return weapon2Kinds.includes(r.kind);
    }
    return r.kind === k;
  });
}

const CUSTOM_KEYS: (keyof EquipmentState)[] = [
  "weaponCustomEquipId",
  "weapon2CustomEquipId",
  "head1CustomEquipId",
  "head2CustomEquipId",
  "head3CustomEquipId",
  "leftCustomEquipId",
  "bodyCustomEquipId",
  "shoulderCustomEquipId",
  "shoesCustomEquipId",
  "acc1CustomEquipId",
  "acc2CustomEquipId",
];

/** 从角色装备收集当前引用的自定义装备 id */
export function collectReferencedCustomEquipIds(eq: EquipmentState): string[] {
  const out: string[] = [];
  for (const key of CUSTOM_KEYS) {
    const v = eq[key];
    if (typeof v === "string" && v.length > 0) out.push(v);
  }
  return [...new Set(out)];
}

/** 从全局库取出存档应内嵌的条目 */
export function collectEmbeddedCustomEquipsForSave(input: CharacterBaseInput): CustomEquipmentRecord[] {
  const ids = collectReferencedCustomEquipIds(input.equipment);
  const m = customEquipmentMap();
  const out: CustomEquipmentRecord[] = [];
  for (const id of ids) {
    const r = m.get(id);
    if (r) out.push(r);
  }
  return out;
}
