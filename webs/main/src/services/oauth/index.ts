import { request } from "@frfojo/common/request";

export function googleFastSignIn({ code }: Params.OAuth2.Code) {
  return request<Res.data<DTOs.BoboanNetBase.Signin>>("/auth/google-login", {
    method: "POST",
    data: {
      code,
    },
  });
}

/**
 * 使用 code 登录
 * code 有效期只有30秒
 */
export function codeLogin({ code }: Params.OAuth2.Code) {
  return request<Res.data<DTOs.BoboanNetBase.Signin>>("/auth/codeLogin", {
    method: "POST",
    data: {
      code,
    },
  });
}
