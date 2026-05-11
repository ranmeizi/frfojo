import { createContext, useContext, type FC, type ReactNode } from "react";
import type { CharacterBaseInput } from "./engine/types";

export type RoCalcCharacterContextValue = {
  input: CharacterBaseInput;
  applyInput: (next: CharacterBaseInput) => void;
};

const RoCalcCharacterContext = createContext<RoCalcCharacterContextValue | null>(null);

export function useRoCalcCharacter(): RoCalcCharacterContextValue {
  const v = useContext(RoCalcCharacterContext);
  if (!v) throw new Error("useRoCalcCharacter 须在 RoCalcCharacterProvider 内使用");
  return v;
}

export const RoCalcCharacterProvider: FC<{
  value: RoCalcCharacterContextValue;
  children: ReactNode;
}> = ({ value, children }) => (
  <RoCalcCharacterContext.Provider value={value}>{children}</RoCalcCharacterContext.Provider>
);
