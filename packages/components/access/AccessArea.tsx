import React, { PropsWithChildren, ReactElement } from "react";
import { Box } from "@mui/material";
import { useAccess } from "./AccessContext";

type AccessCheck = "any" | "all";
type NoAccessBehavior = "hidden" | "login_confirm";

export type AccessAreaProps = PropsWithChildren<{
  /** 需要的权限值（传入一个或多个） */
  require: string | string[];
  /** 权限匹配规则：任意一个满足 / 全部满足 */
  check?: AccessCheck;
  /** 无权限时：隐藏 或 点击弹窗询问是否要登陆 */
  noAccess?: NoAccessBehavior;
  /** 直接传当前权限（不使用 Provider 时用） */
  permissions?: string[];
  /** 弹窗文案 */
  loginTitle?: string;
  loginContent?: string;
  loginOkText?: string;
  loginCancelText?: string;
}>;

function getPopupBridge(): any {
  const g = globalThis as any;
  return (
    g.__BOCOMP_POPUP_BRIDGE__ ||
    g.__GARFISH__?.props?.popupBridge ||
    g.__GARFISH__?.props?.props?.popupBridge
  );
}

function gotoLogin() {
  const currentPageEncode = encodeURIComponent(location.href);
  const to = `/login?redirect_uri=${currentPageEncode}`;
  const nav = (globalThis as any).__FFJ_NAVIGATE__ as
    | ((to: string, opts?: { replace?: boolean }) => void)
    | undefined;
  if (nav) {
    nav(to, { replace: true });
    return;
  }
  location.replace(`${location.origin}${to}`);
}

async function confirmLogin(opts: {
  title: string;
  content: string;
  okText: string;
  cancelText: string;
}): Promise<boolean> {
  const bridge = getPopupBridge();
  const confirm = bridge?.modal?.confirm;
  if (!confirm) {
    return globalThis.confirm(`${opts.title}\n\n${opts.content}`);
  }

  return new Promise<boolean>((resolve) => {
    try {
      confirm({
        title: opts.title,
        content: opts.content,
        okText: opts.okText,
        cancelText: opts.cancelText,
        onOk: async () => resolve(true),
        onCancel: async () => resolve(false),
      });
    } catch {
      resolve(false);
    }
  });
}

function hasPermission(
  userPermissions: string[],
  require: string[],
  check: AccessCheck,
) {
  if (!require.length) return true;
  if (!userPermissions?.length) return false;
  const has = (p: string) => userPermissions.includes(p);
  return check === "all" ? require.every(has) : require.some(has);
}

export function AccessArea(props: AccessAreaProps): ReactElement | null {
  const {
    require,
    check = "any",
    noAccess = "hidden",
    permissions,
    children,
    loginTitle = "需要登录",
    loginContent = "该功能需要登录或授权，是否前往登录？",
    loginOkText = "去登录",
    loginCancelText = "取消",
  } = props;

  const ctx = useAccess();
  const userPermissions = permissions ?? ctx.permissions ?? [];
  const need = Array.isArray(require) ? require : [require];

  const allowed = hasPermission(userPermissions, need, check);

  if (allowed) return <>{children}</>;
  if (noAccess === "hidden") return null;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        cursor: "not-allowed",
        opacity: 0.65,
      }}
      onClickCapture={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const ok = await confirmLogin({
          title: loginTitle,
          content: loginContent,
          okText: loginOkText,
          cancelText: loginCancelText,
        });
        if (ok) gotoLogin();
      }}
    >
      {children}
    </Box>
  );
}

