import { useLayoutEffect, useRef, useState } from "react";
import { debounce } from "../utils/delay";

export function useResizeableListener(
  selector: string | React.RefObject<HTMLElement>
) {
  const ref = useRef<HTMLElement>();

  const observer = useRef<ResizeObserver>();

  const [rect, setRect] = useState<DOMRect>();

  const setWH = debounce(() => {
    setRect(ref.current?.getBoundingClientRect());
  }, 1000);

  useLayoutEffect(() => {
    ref.current =
      typeof selector === "string"
        ? document.querySelector<HTMLElement>(selector)!
        : selector.current!;

    observer.current = new ResizeObserver((_) => {
      setWH();
    });

    observer.current.observe(ref.current!);

    return () => {
      observer.current?.disconnect();
    };
  }, []);

  return rect;
}
