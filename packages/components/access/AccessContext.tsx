import React, { PropsWithChildren, createContext, useContext } from "react";

export type AccessContextValue = {
  permissions: string[];
};

const Ctx = createContext<AccessContextValue>({ permissions: [] });

export function AccessProvider({
  permissions,
  children,
}: PropsWithChildren<{ permissions: string[] }>) {
  return <Ctx.Provider value={{ permissions }}>{children}</Ctx.Provider>;
}

export function useAccess() {
  return useContext(Ctx);
}

