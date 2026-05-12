import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from "react";

export const FLOAT_STACK_KEYS = {
  itemInfo: "item-info",
  guildLeader: "guild-leader",
  holySanctity: "holy-sanctity",
  holyDomain: "holy-domain",
} as const;

type FloatStackValue = {
  /** 当前鼠标悬停在其上的浮窗 key；null 表示无，各窗用各自默认 zIndex */
  raisedKey: string | null;
  raise: (key: string) => void;
  lower: (key: string) => void;
};

const FloatStackContext = createContext<FloatStackValue | null>(null);

export function useRoCalcFloatStack(): FloatStackValue | null {
  return useContext(FloatStackContext);
}

export const RoCalcFloatStackProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [raisedKey, setRaisedKey] = useState<string | null>(null);
  const raise = useCallback((key: string) => {
    setRaisedKey(key);
  }, []);
  const lower = useCallback((key: string) => {
    setRaisedKey((cur) => (cur === key ? null : cur));
  }, []);
  const value = useMemo(
    () => ({ raisedKey, raise, lower }),
    [raisedKey, raise, lower],
  );
  return (
    <FloatStackContext.Provider value={value}>{children}</FloatStackContext.Provider>
  );
};
