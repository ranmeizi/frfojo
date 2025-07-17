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
 * 注册
 */
export function signup(params: Params.BoboanNetBase.Signup) {
  return request<Res.data<DTOs.BoboanNetBase.Signup>>("/auth/signup", {
    method: "POST",
    data: params,
  });
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
  return request<Res.data<DTOs.BoboanNetBase.UserDto>>("/user/getCurrentUser", {
    method: "GET",
  });
}

/**
 * 获取当前用户权限
 */
export function getPermissions() {
  return request<Res.data<string[]>>("/users/permissions", {
    method: "GET",
  });
}
