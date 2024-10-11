import { FC, PropsWithChildren } from "react";

/**
 * 静态数据守卫
 *
 * 用来守卫一下redux中【必要】的静态数据，必须有这些应用才可以继续
 *
 * 不过并不是所有页面都需要守卫 全部的静态数据
 * 可以通过传入 数据的 key ，去更加针对的守卫
 *
 * 并且通过 key 去在页面上画出 重新请求 对应key 数据的按钮
 * 重新发起 RTKQ 的一个 query 请求。
 */
type DataTypes = "hero" | "item" | "ability";

type InitialDataGuardProps = {
  guardTypes: DataTypes[];
};

const InitialDataGuard: FC<PropsWithChildren<InitialDataGuardProps>> = ({
  children,
}) => {
  return children;
};

export default InitialDataGuard;
