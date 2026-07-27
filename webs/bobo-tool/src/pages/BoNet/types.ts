/** A: 当前账号 | B: 关联账号 | C: 关联账号(待核实) | D: 可能相关账号 | E: 角色 */
export type GidNodeKind = "A" | "B" | "C" | "D" | "E";

export type MomoPlayerGid = {
  id: number;
  name: string;
  gid: string;
};

export type ManualLinkType = "confirmed" | "suspect";

export type ManualGidLink = {
  id: number;
  gidA: string;
  gidB: string;
  type: ManualLinkType;
  applicant?: string | null;
  auditor?: string | null;
  auditMemo?: string | null;
  createdAt: string;
};

export type RuleSuspectHit = {
  id: number;
  sourceGid: string;
  suspectGid: string;
  ruleType: "hex_neighbor" | "name_similarity" | "manual";
  boundary: number | null;
  score: number | null;
  meta: Record<string, unknown> | null;
  /** 与主目标相近的原因（后端生成） */
  memo?: string | null;
  relation: "from_center" | "to_center";
};

export type RuleSuspectItem = {
  gid: string;
  rules: RuleSuspectHit[];
};

export type PlayerGraphData = {
  centerGid: string;
  exactCluster: MomoPlayerGid[];
  confirmedLinks: ManualGidLink[];
  suspectLinks: ManualGidLink[];
  ruleSuspects: RuleSuspectItem[];
  /** @deprecated 兼容字段 */
  nearbyGids: string[];
  namesByGid: Record<string, MomoPlayerGid[]>;
};

export type BoNetApplyListResult = {
  list: ManualGidLink[];
  total: number;
  current: number;
  pageSize: number;
};

export type ManualRuleSuspect = {
  id: number;
  sourceGid: string;
  suspectGid: string;
  ruleType: "hex_neighbor" | "name_similarity" | "manual";
  visible: boolean;
  boundary: number | null;
  score: number | null;
  meta: Record<string, unknown> | null;
  batchNo: string | null;
  extra: Record<string, unknown> | null;
  memo: string | null;
  createdAt: string;
};

export type GraphNode = {
  id: string;
  kind: GidNodeKind;
  label: string;
  gid?: string;
  /** C 类：对应待审核关联 id，用于节点页审核 */
  linkId?: number;
  /** D 类：命中的规则摘要（多种规则） */
  ruleHints?: string[];
  /** 父 GID 节点 id（E 类） */
  parentGidNodeId?: string;
  /** 前端临时插入、尚未落库的 D 类 */
  temporary?: boolean;
  x: number;
  y: number;
  /** 环形布局节点固定坐标 */
  fx?: number;
  fy?: number;
  opacity: number;
};

/** 对照查询后临时插入当前图的可疑 GID */
export type TempSuspectInjection = {
  gid: string;
  names: MomoPlayerGid[];
  /** 对照图的中心 GID */
  fromCenterGid: string;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  /** 怀疑类连线用虚线 */
  dashed?: boolean;
};

export type BoNetGraphData = {
  centerGid: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type BuildGraphOptions = {
  boundary?: number;
};
