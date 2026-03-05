import { ucRequest } from "../../../request";

export async function listUsers(params: Params.UserCenterUsers.ListUsers) {
  return ucRequest<
    Res.data<Types.UserCenterCommon.PageList<DTOs.UserCenterUsers.QueryUsers>>
  >("/users/list", { method: "GET", params });
}

export async function createUser(data: Params.UserCenterUsers.CreateUser) {
  return ucRequest<Res.data<DTOs.UserCenterUsers.QueryUsers>>("/users/create", {
    method: "POST",
    data,
  });
}

export async function updateUser(data: Params.UserCenterUsers.UpdateUser) {
  return ucRequest<Res.data<DTOs.UserCenterUsers.QueryUsers>>("/users/update", {
    method: "POST",
    data,
  });
}

export async function deleteUser(data: Params.UserCenterUsers.DeleteUser) {
  return ucRequest<Res.data<unknown>>("/users/delete", {
    method: "POST",
    data,
  });
}

export async function listRoles(params: { current?: number; pageSize?: number }) {
  return ucRequest<
    Res.data<Types.UserCenterCommon.PageList<DTOs.UserCenterUsers.QueryRoles>>
  >("/roles/list", { method: "GET", params });
}

export async function getUserRoles(params: Params.UserCenterUsers.GetUserRoles) {
  return ucRequest<Res.data<DTOs.UserCenterUsers.QueryRoles[]>>("/users/getRoles", {
    method: "GET",
    params,
  });
}

export async function bindRole(data: Params.UserCenterUsers.BindRole) {
  return ucRequest<Res.data<unknown>>("/users/bindRole", {
    method: "POST",
    data,
  });
}

export async function removeRole(data: Params.UserCenterUsers.RemoveRole) {
  return ucRequest<Res.data<unknown>>("/users/removeRole", {
    method: "POST",
    data,
  });
}

