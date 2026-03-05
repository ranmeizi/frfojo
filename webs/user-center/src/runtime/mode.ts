export type RuntimeMode = "garfish" | "standalone";

export function getRuntimeMode(): RuntimeMode {
  return (globalThis as any).__GARFISH__ ? "garfish" : "standalone";
}

