import React, { PropsWithChildren, createContext, useContext } from "react";
import { getRuntimeMode } from "../runtime/mode";

export type AuthState = {
  mode: "garfish" | "standalone";
  token: Types.UserCenterAuth.Token | null;
  user: Types.UserCenterAuth.UserInfo | null;
  permissions: string[];
  gotoLogin: (redirectUri?: string) => void;
  setAuth?: (next: {
    token?: Types.UserCenterAuth.Token | null;
    user?: Types.UserCenterAuth.UserInfo | null;
    permissions?: string[];
  }) => void;
  clearAuth?: () => void;
};

const Ctx = createContext<AuthState>({
  mode: getRuntimeMode(),
  token: null,
  user: null,
  permissions: [],
  gotoLogin: () => {},
});

export function AuthProvider({
  value,
  children,
}: PropsWithChildren<{ value: AuthState }>) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}

