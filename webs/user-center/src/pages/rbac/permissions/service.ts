import { ucRequest } from "../../../request";

export async function listPermissions(params: Params.UserCenterPermissions.ListPermissions) {
  return ucRequest<
    Res.data<
      Types.UserCenterCommon.PageList<DTOs.UserCenterPermissions.QueryPermissions>
    >
  >("/permissions/list", { method: "GET", params });
}

export async function createPermission(data: Params.UserCenterPermissions.CreatePermission) {
  return ucRequest<Res.data<DTOs.UserCenterPermissions.QueryPermissions>>(
    "/permissions/create",
    { method: "POST", data },
  );
}

export async function updatePermission(data: Params.UserCenterPermissions.UpdatePermission) {
  return ucRequest<Res.data<DTOs.UserCenterPermissions.QueryPermissions>>(
    "/permissions/update",
    { method: "POST", data },
  );
}

export async function deletePermission(data: Params.UserCenterPermissions.DeletePermission) {
  return ucRequest<Res.data<unknown>>("/permissions/delete", { method: "POST", data });
}

