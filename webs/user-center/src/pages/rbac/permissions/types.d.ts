// request 请求参数类型
declare namespace Params {
  export namespace UserCenterPermissions {
    type ListPermissions = {
      current?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: Types.UserCenterCommon.SortOrder;
      resource?: string;
      action?: string;
      search?: string;
    };

    type CreatePermission = {
      name: string;
      description?: string;
      resource: string;
      action: string;
    };

    type UpdatePermission = {
      id: string;
      name?: string;
      description?: string;
      resource?: string;
      action?: string;
    };

    type DeletePermission = { id: string };
  }
}

// response 传输对象类型
declare namespace DTOs {
  export namespace UserCenterPermissions {
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
  export namespace UserCenterPermissions {}
}

