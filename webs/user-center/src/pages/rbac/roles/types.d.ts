// request 请求参数类型
declare namespace Params {
  export namespace UserCenterRoles {
    type ListRoles = {
      current?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: Types.UserCenterCommon.SortOrder;
      search?: string;
    };

    type CreateRole = { name: string; description?: string };
    type UpdateRole = { id: string; name?: string; description?: string };
    type DeleteRole = { id: string };

    type GetRolePermissions = { roleId?: string };
    type BindPermission = { roleId: string; permissionId: string };
    type RemovePermission = { roleId: string; permissionId: string };
  }
}

// response 传输对象类型
declare namespace DTOs {
  export namespace UserCenterRoles {
    type QueryRoles = {
      id: string;
      name: string;
      description?: string;
      isSystem: boolean;
      createdAt: string;
      updatedAt: string;
    };

    type QueryPermissions = {
      id: string;
      name: string;
      description?: string;
      resource: string;
      action: string;
      isSystem: boolean;
      createdAt?: string;
      updatedAt?: string;
    };
  }
}

// 公共类型
declare namespace Types {
  export namespace UserCenterRoles {}
}

