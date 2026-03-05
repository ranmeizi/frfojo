// request 请求参数类型
declare namespace Params {
  export namespace UserCenterUsers {
    type UserStatus = "active" | "inactive" | "locked";

    type ListUsers = {
      current?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: Types.UserCenterCommon.SortOrder;
      status?: UserStatus;
      search?: string;
    };

    type CreateUser = {
      username: string;
      email?: string;
      password: string;
      nickname?: string;
      picture?: string;
    };

    type UpdateUser = {
      id: string;
      status?: UserStatus;
      picture?: string;
      nickname?: string;
    };

    type DeleteUser = { id: string };
    type GetUserRoles = { userId?: string };
    type BindRole = { userId: string; roleId: string };
    type RemoveRole = { userId: string; roleId: string };
  }
}

// response 传输对象类型
declare namespace DTOs {
  export namespace UserCenterUsers {
    type QueryUsers = {
      id: string;
      username: string;
      nickname?: string | null;
      email: string;
      emailVerified: boolean;
      picture?: string | null;
      status: Params.UserCenterUsers.UserStatus;
      createdAt?: string;
      updatedAt?: string;
    };

    type QueryRoles = {
      id: string;
      name: string;
      description?: string;
      isSystem: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }
}

// 公共类型
declare namespace Types {
  export namespace UserCenterUsers {}
}

