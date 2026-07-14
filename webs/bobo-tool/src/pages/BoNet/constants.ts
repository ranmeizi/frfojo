import type { GidNodeKind } from "./types";

/** D 类：GID 十六进制 ± 默认边界 */
export const DEFAULT_GID_BOUNDARY = 16;

/** 规范化为 8 位大写十六进制 GID */
export function normalizeGid(gid: string): string {
  return gid.trim().toUpperCase().padStart(8, "0");
}

/** 节点类型业务名称（A–E 为开发代号，界面展示用此表） */
export const NODE_KIND_LABELS: Record<GidNodeKind, string> = {
  A: "当前账号",
  B: "关联账号",
  C: "关联账号(待核实)",
  D: "可能相关账号",
  E: "角色",
};

export function getNodeKindLabel(kind: GidNodeKind): string {
  return NODE_KIND_LABELS[kind];
}

export const NODE_COLORS: Record<GidNodeKind, string> = {
  A: "#1976d2",
  B: "#2e7d32",
  C: "#ed6c02",
  D: "#7b1fa2",
  E: "#546e7a",
};

export const NODE_RADIUS: Record<GidNodeKind, number> = {
  A: 22,
  B: 20,
  C: 18,
  D: 18,
  E: 14,
};

/** AB 与对应 E：1；CD 与对应 E：0.5 */
export function opacityForKind(kind: GidNodeKind): number {
  return kind === "C" || kind === "D" ? 0.5 : 1;
}

/** BoNet 申请（拖拽提交核实）权限 */
export const PERM_BONET_APPLY = "A_WEB_BONET_APPLY";

/** BoNet 审核 / 删除关联权限 */
export const PERM_BONET_AUDIT = "A_WEB_BONET_AUDIT";

/** BoNet 入口试用 / 访问权限 */
export const PERM_BONET_TRIAL = "F_WEB_BONET_TRIAL";

/** 读取主应用下发的权限列表 */
export function getUserPermissions(): string[] {
  const g = globalThis as {
    /** SubApp 从 Garfish props 同步过来的权威来源 */
    __FFJ_PERMISSIONS__?: string[];
    __FFJ_USER__?: { permissions?: string[] };
    __GARFISH__?: {
      props?: {
        permissions?: string[];
        user?: { permissions?: string[] };
        props?: {
          permissions?: string[];
          user?: { permissions?: string[] };
        };
      };
    };
  };

  if (Array.isArray(g.__FFJ_PERMISSIONS__)) {
    return g.__FFJ_PERMISSIONS__;
  }

  const fromProps =
    g.__GARFISH__?.props?.permissions ??
    g.__GARFISH__?.props?.props?.permissions;
  if (Array.isArray(fromProps)) return fromProps;

  const user =
    g.__FFJ_USER__ ??
    g.__GARFISH__?.props?.user ??
    g.__GARFISH__?.props?.props?.user;
  if (Array.isArray(user?.permissions)) return user.permissions;
  return [];
}

export function hasPermission(need: string | string[]): boolean {
  const permissions = getUserPermissions();
  const list = Array.isArray(need) ? need : [need];
  if (!list.length) return true;
  return list.some((p) => permissions.includes(p));
}
