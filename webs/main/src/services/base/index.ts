import { request } from "@frfojo/common/request";

/**
 * 登陆
 */
export function signin(params: Params.BoboanNetBase.Signin) {
  return request<Res.data<DTOs.BoboanNetBase.Signin>>("/auth/login", {
    method: "POST",
    data: params,
  });
}

/**
 * 邮箱注册
 */
export function emailsignup(params: Params.BoboanNetBase.EmailSignup) {
  return request<Res.data<DTOs.BoboanNetBase.EmailSignup>>(
    "/auth/emailsignup",
    {
      method: "POST",
      data: params,
    }
  );
}

/**
 * 发送邮箱验证码
 */
export function sendEmailCode(params: Params.BoboanNetBase.SendEmailCode) {
  return request<Res.data<null>>("/auth/sendEmailCode", {
    method: "POST",
    data: params,
  });
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return request<Res.data<DTOs.BoboanNetBase.UserDto>>(
    "/users/getCurrentUser",
    {
      method: "GET",
    }
  );
}

/**
 * 获取当前用户权限
 */
export function getPermissions() {
  return request<Res.data<string[]>>("/users/permissions", {
    method: "GET",
  });
}

/**
 * 修改密码
 */
export function changePassword(params: Params.BoboanNetBase.ChangePassword) {
  return request<Res.data<{}>>("/auth/changePassword", {
    method: "POST",
    data: params,
  });
}

/**
 * 忘记密码
 */
export function forgotChangePassword(
  params: Params.BoboanNetBase.ForgotChangePassword
) {
  return request<Res.data<null>>("/auth/forgotChangePassword", {
    method: "POST",
    data: params,
  });
}
