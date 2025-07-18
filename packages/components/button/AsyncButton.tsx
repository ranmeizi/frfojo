import { Button } from "@mui/material";
import type { PropsWithChildren } from "react";
import React, { useEffect, useState, ComponentProps } from "react";

export type AsyncButtonType<T = any> = {
  onClick?: (e: MouseEvent) => Promise<T>;
} & Omit<ComponentProps<typeof Button>, "onClick">;

export default function AsyncButton<T>({
  children,
  onClick,
  ...btnProps
}: PropsWithChildren<AsyncButtonType<T>>) {
  const [loading, setLoading] = useState(false);

  // 点击事件
  function onClickHandler(e: any) {
    if (!onClick) {
      return;
    }
    const ret = onClick(e);

    if (ret instanceof Promise) {
      setLoading(true);
      ret.finally(() => {
        setLoading(false);
      });
    } else {
      return ret;
    }
  }

  return (
    <Button loading={loading} {...btnProps} onClick={onClickHandler}>
      {children}
    </Button>
  );
}
