import { createContext, useCallback, useContext, useMemo, useState, type FC, type ReactNode } from "react";
import type { CustomEquipmentRecord } from "./engine/types";
import { readCustomEquipmentStore, removeCustomEquipment, upsertCustomEquipment } from "./engine/customEquipmentRegistry";

export type RoCalcCustomEquipmentContextValue = {
  list: CustomEquipmentRecord[];
  refresh: () => void;
  upsert: (r: CustomEquipmentRecord) => boolean;
  remove: (id: string) => boolean;
};

const RoCalcCustomEquipmentContext = createContext<RoCalcCustomEquipmentContextValue | null>(null);

export function useRoCalcCustomEquipment(): RoCalcCustomEquipmentContextValue {
  const v = useContext(RoCalcCustomEquipmentContext);
  if (!v) throw new Error("useRoCalcCustomEquipment 须在 RoCalcCustomEquipmentProvider 内使用");
  return v;
}

export const RoCalcCustomEquipmentProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const list = useMemo(() => readCustomEquipmentStore(), [tick]);
  const upsert = useCallback(
    (r: CustomEquipmentRecord) => {
      const ok = upsertCustomEquipment(r);
      if (ok) refresh();
      return ok;
    },
    [refresh],
  );
  const remove = useCallback(
    (id: string) => {
      const ok = removeCustomEquipment(id);
      if (ok) refresh();
      return ok;
    },
    [refresh],
  );
  const value = useMemo(
    () => ({ list, refresh, upsert, remove }),
    [list, refresh, upsert, remove],
  );
  return (
    <RoCalcCustomEquipmentContext.Provider value={value}>{children}</RoCalcCustomEquipmentContext.Provider>
  );
};
