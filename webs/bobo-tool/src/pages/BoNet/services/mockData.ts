import type { ManualGidLink, MomoPlayerGid } from "../types";

/** name ↔ gid 关联表 mock */
export const MOCK_PLAYER_GIDS: MomoPlayerGid[] = [
  { id: 1, name: "波利猎人", gid: "00001000" },
  { id: 2, name: "波利猎人·小号", gid: "00001000" },
  { id: 3, name: "AltKnight", gid: "00002000" },
  { id: 4, name: "AltMage", gid: "00003000" },
  { id: 5, name: "可疑仓鼠", gid: "00004000" },
  { id: 6, name: "NearHexA", gid: "00000ff0" },
  { id: 7, name: "NearHexB", gid: "00001010" },
  { id: 8, name: "路人甲", gid: "00009999" },
];

let manualLinks: ManualGidLink[] = [
  {
    id: 1,
    gidA: "00001000",
    gidB: "00002000",
    type: "confirmed",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: 2,
    gidA: "00001000",
    gidB: "00003000",
    type: "confirmed",
    createdAt: "2026-03-02T11:00:00Z",
  },
  {
    id: 3,
    gidA: "00001000",
    gidB: "00004000",
    type: "suspect",
    createdAt: "2026-03-10T09:00:00Z",
  },
];

let nextManualId = 4;

export function getMockManualLinks(): ManualGidLink[] {
  return [...manualLinks];
}

export function addMockSuspectLink(gidA: string, gidB: string): ManualGidLink {
  const link: ManualGidLink = {
    id: nextManualId++,
    gidA,
    gidB,
    type: "suspect",
    createdAt: new Date().toISOString(),
  };
  manualLinks = [...manualLinks, link];
  return link;
}

export function approveMockSuspectLink(linkId: number): boolean {
  const idx = manualLinks.findIndex((l) => l.id === linkId);
  if (idx < 0 || manualLinks[idx].type !== "suspect") {
    return false;
  }
  manualLinks = manualLinks.map((l) =>
    l.id === linkId ? { ...l, type: "confirmed" } : l,
  );
  return true;
}

export function rejectMockSuspectLink(linkId: number): boolean {
  const before = manualLinks.length;
  manualLinks = manualLinks.filter((l) => l.id !== linkId);
  return manualLinks.length < before;
}
