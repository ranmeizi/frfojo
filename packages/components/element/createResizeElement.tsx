import React, { useLayoutEffect, useRef, createElement } from "react";

type ResizeObserverProps = {
  onResize?: (el: HTMLElement) => void;
};

const createResizeElement = function <T extends keyof React.ReactHTML>(
  element: T
) {
  return ({
    children,
    onResize,
    ...props
  }: ResizeObserverProps & Omit<React.HTMLAttributes<T>, "onResize">) => {
    const ref = useRef<HTMLElement>();

    const observer = useRef<ResizeObserver>();

    useLayoutEffect(() => {
      observer.current = new ResizeObserver((_) => {
        onResize?.(ref.current!);
      });

      observer.current.observe(ref.current!);

      return () => {
        observer.current?.disconnect();
      };
    }, [onResize]);

    return createElement(element, { ...props, ref }, children);
  };
};

export default createResizeElement;
