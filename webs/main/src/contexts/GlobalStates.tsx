/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";
import * as BaseServices from "@/services/base";

type GlobalStates = {
  user: ReturnType<typeof useUser> | null;
};

export const Context = createContext<GlobalStates>({
  user: null,
});

export function GlobalStatesProvider({ children }: PropsWithChildren) {
  return (
    <Context.Provider
      value={{
        user: useUser(),
      }}
    >
      {children}
    </Context.Provider>
  );
}

function useUser() {
  const [info, setInfo] = useState<DTOs.BoboanNetBase.UserDto | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  // 获取当前用户
  const getCurrentUser = useCallback(async () => {
    const res = await BaseServices.getCurrentUser();
    if (res.code === "000000") {
      setInfo(res.data);
    }
  }, []);

  // 获取当前用户 permission
  const getPermissions = useCallback(async () => {
    const res = await BaseServices.getPermissions();
    if (res.code === "000000") {
      setPermissions(res.data);
    }
  }, []);

  return {
    info,
    permissions,
    getCurrentUser,
    getPermissions,
  } as const;
}

/** 获取 GlobalStates 的 hook */
export function useGlobalStates() {
  const states = useContext(Context);
  return states;
}

/** 获取 user 相关的 hook */
export function useUserSelector() {
  const { user } = useContext(Context);
  return user;
}
