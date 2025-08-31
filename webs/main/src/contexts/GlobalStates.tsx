/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
} from "react";
import * as BaseServices from "@/services/base";
import { clearToken } from "@frfojo/common/request";
import { useAppRxDBState } from "@/db/hook/useAppRXDBState";

type GlobalStates = {
  user: ReturnType<typeof useUser>;
};

export const Context = createContext<GlobalStates>({
  user: {
    info: null,
    permissions: [],
    getCurrentUser: () => Promise.reject(),
    getPermissions: () => Promise.reject(),
    clearUser: () => {},
  },
});

export function GlobalStatesProvider({ children }: PropsWithChildren) {
  const user = useUser();

  const value = { user };

  useEffect(() => {
    // 一开始去请求一下
    user.getCurrentUser();
    user.getPermissions();
  }, []);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

function useUser() {
  const [info = null, setInfo] =
    useAppRxDBState<DTOs.BoboanNetBase.UserDto | null>("app_state_user");
  const [permissions = [], setPermissions] = useAppRxDBState<string[]>(
    "app_state_permissions"
  );

  // 获取当前用户
  const getCurrentUser = useCallback(async () => {
    const res = await BaseServices.getCurrentUser();
    if (res.code === "000000") {
      setInfo(res.data);
      return res.data;
    }
  }, []);

  // 获取当前用户 permission
  const getPermissions = useCallback(async () => {
    const res = await BaseServices.getPermissions();
    if (res.code === "000000") {
      setPermissions(res.data);
      return res.data;
    }
  }, []);

  // 清空状态
  const clearUser = useCallback(() => {
    setInfo(null);
    setPermissions([]);
    clearToken();
  }, []);

  return {
    info,
    permissions,
    getCurrentUser,
    getPermissions,
    clearUser,
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
