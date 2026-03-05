import { ucRequest } from "../../../request";

export async function listRoles(params: Params.UserCenterRoles.ListRoles) {
  return ucRequest<
    Res.data<Types.UserCenterCommon.PageList<DTOs.UserCenterRoles.QueryRoles>>
  >("/roles/list", { method: "GET", params });
}

export async function createRole(data: Params.UserCenterRoles.CreateRole) {
  return ucRequest<Res.data<DTOs.UserCenterRoles.QueryRoles>>("/roles/create", {
    method: "POST",
    data,
  });
}

export async function updateRole(data: Params.UserCenterRoles.UpdateRole) {
  return ucRequest<Res.data<DTOs.UserCenterRoles.QueryRoles>>("/roles/update", {
    method: "POST",
    data,
  });
}

export async function deleteRole(data: Params.UserCenterRoles.DeleteRole) {
  return ucRequest<Res.data<unknown>>("/roles/delete", { method: "POST", data });
}

export async function getRolePermissions(
  params: Params.UserCenterRoles.GetRolePermissions,
) {
  return ucRequest<Res.data<DTOs.UserCenterRoles.QueryPermissions[]>>(
    "/roles/getPermissions",
    { method: "GET", params },
  );
}

export async function bindPermission(data: Params.UserCenterRoles.BindPermission) {
  return ucRequest<Res.data<unknown>>("/roles/bindPermission", {
    method: "POST",
    data,
  });
}

export async function removePermission(
  data: Params.UserCenterRoles.RemovePermission,
) {
  return ucRequest<Res.data<unknown>>("/roles/removePromission", {
    method: "POST",
    data,
  });
}

export async function listPermissions(params: {
  current?: number;
  pageSize?: number;
  search?: string;
  resource?: string;
  action?: string;
}) {
  return ucRequest<
    Res.data<Types.UserCenterCommon.PageList<DTOs.UserCenterRoles.QueryPermissions>>
  >("/permissions/list", { method: "GET", params });
}

