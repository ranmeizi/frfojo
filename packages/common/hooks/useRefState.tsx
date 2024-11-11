import { useRef, useState } from "react";

export default function useRefState<T>(initialValue?: T) {
  const [v, setV] = useState<T | undefined>(initialValue);
  const refV = useRef(initialValue);

  const set = function (v: T) {
    refV.current = v;
    setV(v);
  };

  return [v, set, refV] as const;
}
