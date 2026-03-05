import { ucRequest } from "../../../request";

export async function signin(data: Params.UserCenterLogin.Signin) {
  return ucRequest<Res.data<DTOs.UserCenterLogin.Signin>>("/auth/login", {
    method: "POST",
    data,
    // standalone/garfish 都可能走到这里；如果是 garfish，主工程 request 会自动带 token（但登录不需要）
    headers: { "Content-Type": "application/json" },
  });
}

export async function getCurrentUser() {
  return ucRequest<Res.data<DTOs.UserCenterLogin.UserDto>>("/users/getCurrentUser", {
    method: "GET",
  });
}

export async function getPermissions() {
  return ucRequest<Res.data<string[]>>("/users/permissions", {
    method: "GET",
  });
}

