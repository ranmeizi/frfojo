import { DEFAULT_GID_BOUNDARY, normalizeGid, opacityForKind } from "../constants";
import { LAYOUT_ANCHOR_X, LAYOUT_ANCHOR_Y } from "../utils/forceLayout";
import type { BoNetGraphData, GraphEdge, GraphNode, GidNodeKind, PlayerGraphData, RuleSuspectHit } from "../types";
import { getPlayerGraphByGid } from "./api";

function gidNodeId(gid: string) {
  return `gid:${gid}`;
}

function nameNodeId(gid: string, name: string) {
  return `name:${gid}:${name}`;
}

function formatRuleHint(
  centerGid: string,
  hit: RuleSuspectHit,
): string {
  if (hit.ruleType === 'name_similarity') {
    const meta = hit.meta as {
      nameA?: string;
      nameB?: string;
      algorithm?: string;
      score?: number;
    } | null;
    const score =
      hit.score != null
        ? hit.score.toFixed(2)
        : meta?.score != null
          ? Number(meta.score).toFixed(2)
          : '?';
    const names =
      meta?.nameA && meta?.nameB
        ? `${meta.nameA} ~ ${meta.nameB}`
        : 'name match';
    return `name ${names} (${meta?.algorithm ?? 'sim'} ${score})`;
  }

  const boundary = hit.boundary ?? 16;
  if (hit.relation === 'from_center') {
    return `hex ±${boundary} from ${centerGid}`;
  }
  return `hex ±${boundary} ${hit.sourceGid} → ${centerGid}`;
}

export function graphFromPlayerData(data: PlayerGraphData): BoNetGraphData {
  const normalized = normalizeGid(data.centerGid);
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const gidKinds = new Map<string, "A" | "B" | "C" | "D">();

  gidKinds.set(normalized, "A");

  for (const link of data.confirmedLinks) {
    const other = link.gidA === normalized ? link.gidB : link.gidA;
    gidKinds.set(other, "B");
    edges.push({
      id: `link-b-${link.id}`,
      source: gidNodeId(normalized),
      target: gidNodeId(other),
    });
  }

  const suspectLinkByGid = new Map<string, number>();

  for (const link of data.suspectLinks) {
    const other = link.gidA === normalized ? link.gidB : link.gidA;
    suspectLinkByGid.set(other, link.id);
    if (!gidKinds.has(other)) {
      gidKinds.set(other, "C");
    }
    edges.push({
      id: `link-c-${link.id}`,
      source: gidNodeId(normalized),
      target: gidNodeId(other),
      dashed: true,
    });
  }

  const ruleHintsByGid = new Map<string, string[]>();

  for (const item of data.ruleSuspects ?? []) {
    if (gidKinds.has(item.gid)) continue;
    gidKinds.set(item.gid, "D");
    ruleHintsByGid.set(
      item.gid,
      item.rules.map((hit) => formatRuleHint(normalized, hit)),
    );
    edges.push({
      id: `link-d-${item.gid}`,
      source: gidNodeId(normalized),
      target: gidNodeId(item.gid),
      dashed: true,
    });
  }

  // 兼容旧字段 nearbyGids
  for (const gid of data.nearbyGids ?? []) {
    if (gidKinds.has(gid)) continue;
    gidKinds.set(gid, "D");
    edges.push({
      id: `link-d-${gid}`,
      source: gidNodeId(normalized),
      target: gidNodeId(gid),
      dashed: true,
    });
  }

  const ringKinds = new Set<GidNodeKind>(["C", "D"]);
  const ringGids: string[] = [];
  const centerGids: string[] = [];

  for (const [gid, kind] of gidKinds) {
    if (ringKinds.has(kind)) {
      ringGids.push(gid);
    } else {
      centerGids.push(gid);
    }
  }

  const cx = LAYOUT_ANCHOR_X;
  const cy = LAYOUT_ANCHOR_Y;
  const ringR = 220;

  ringGids.forEach((gid, i) => {
    const kind = gidKinds.get(gid)!;
    const angle = (i / Math.max(ringGids.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * ringR;
    const y = cy + Math.sin(angle) * ringR;
    nodes.push({
      id: gidNodeId(gid),
      kind,
      label: gid,
      gid,
      linkId: kind === "C" ? suspectLinkByGid.get(gid) : undefined,
      ruleHints: kind === "D" ? ruleHintsByGid.get(gid) : undefined,
      x,
      y,
      fx: x,
      fy: y,
      opacity: opacityForKind(kind),
    });
  });

  centerGids.forEach((gid, i) => {
    const kind = gidKinds.get(gid)!;
    const angle = (i / Math.max(centerGids.length, 1)) * Math.PI * 2;
    nodes.push({
      id: gidNodeId(gid),
      kind,
      label: gid,
      gid,
      linkId: kind === "C" ? suspectLinkByGid.get(gid) : undefined,
      x: cx + Math.cos(angle) * 40,
      y: cy + Math.sin(angle) * 40,
      opacity: opacityForKind(kind),
    });
  });

  for (const [gid] of gidKinds) {
    const parentId = gidNodeId(gid);
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) continue;

    const names = data.namesByGid[gid] ?? [];
    const kind = parent.kind;
    names.forEach((p, idx) => {
      const angle =
        (idx / Math.max(names.length, 1)) * Math.PI * 2 + Math.PI / 6;
      const dist = 78 + idx * 16;
      const id = nameNodeId(gid, p.name);
      nodes.push({
        id,
        kind: "E",
        label: p.name,
        gid,
        parentGidNodeId: parentId,
        x: parent.x + Math.cos(angle) * dist,
        y: parent.y + Math.sin(angle) * dist,
        opacity: opacityForKind(kind),
      });
      edges.push({
        id: `e-${id}`,
        source: parentId,
        target: id,
      });
    });
  }

  return {
    centerGid: normalized,
    nodes,
    edges,
  };
}

export async function buildBoNetGraph(
  centerGid: string,
  boundary = DEFAULT_GID_BOUNDARY,
): Promise<BoNetGraphData> {
  const raw = await getPlayerGraphByGid(centerGid, boundary);
  return graphFromPlayerData(raw);
}
