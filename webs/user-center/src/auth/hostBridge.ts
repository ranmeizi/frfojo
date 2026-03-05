import { getRuntimeMode } from "../runtime/mode";

export type HostAuthBridge = {
  getToken?: () => any;
  getUser?: () => any;
  gotoHostLogin?: (redirectUri?: string) => void;
};

export function getHostAuthBridge(): HostAuthBridge | null {
  if (getRuntimeMode() !== "garfish") return null;
  const w = globalThis as any;
  return (w.__FFJ_AUTH_BRIDGE__ as HostAuthBridge) || null;
}

