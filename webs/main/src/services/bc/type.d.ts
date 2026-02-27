// request 请求参数类型
declare namespace Params {
  export namespace Bc {
    type ListServers = {
      /** 当前页码，从 1 开始 */
      current?: number;
      /** 每页数量 */
      pageSize?: number;
      /** 按服务器名称 / 描述模糊搜索 */
      search?: string;
    };

    type CreateServer = {
      /** 服务器名称 */
      name: string;
      /** 服务器描述 */
      description?: string | null;
      /** 服务器图标 URL */
      icon?: string | null;
      /** 是否公开可搜索 */
      isPublic?: boolean;
    };

    type GetServerById = {
      /** 服务器 ID */
      id: string;
    };

    type SearchServers = {
      /** 搜索关键字（名称 / 描述） */
      keyword: string;
      /** 当前页码，从 1 开始 */
      current?: number;
      /** 每页数量 */
      pageSize?: number;
    };

    type JoinServer = {
      /** 服务器 ID */
      serverId: string;
      /** 邀请码（若服务器为仅邀请） */
      inviteCode?: string | null;
    };

    type LeaveServer = {
      /** 服务器 ID */
      serverId: string;
    };

    type ListChannels = {
      /** 服务器 ID */
      serverId: string;
    };

    type UpdateChannel = {
      /** 频道 ID */
      id: string;
      /** 频道名称 */
      name?: string;
      /** 频道主题 / 描述 */
      topic?: string | null;
      /** 频道类型 text|voice|category */
      type?: "text" | "voice" | "category";
      /** 父级频道 ID（分类） */
      parentId?: string | null;
      /** 排序位置 */
      position?: number;
    };

    type DeleteChannel = {
      /** 频道 ID */
      id: string;
    };

    type ListMessages = {
      /** 服务器 ID */
      serverId: string;
      /** 频道 ID */
      channelId: string;
      /** 查询某条消息 ID 之前的历史消息，用于上滑加载 */
      before?: string;
      /** 查询某条消息 ID 之后的新消息，用于向下加载 */
      after?: string;
      /** 每次拉取数量，默认 50 */
      limit?: number;
    };

    type SendMessage = {
      /** 服务器 ID */
      serverId: string;
      /** 频道 ID */
      channelId: string;
      /** 消息内容 */
      content: string;
      /** 回复的消息 ID */
      replyTo?: string | null;
    };

    type UpdateMessage = {
      /** 消息 ID */
      id: string;
      /** 新的消息内容 */
      content: string;
    };

    type DeleteMessage = {
      /** 消息 ID */
      id: string;
    };

    type ListMembers = {
      /** 服务器 ID */
      serverId: string;
      /** 按昵称 / 用户名模糊搜索 */
      search?: string;
      /** 当前页码，从 1 开始 */
      current?: number;
      /** 每页数量 */
      pageSize?: number;
    };
  }
}

// response 传输对象类型
declare namespace DTOs {
  export namespace Bc {
    type User = {
      id: string;
      username: string;
      nickname?: string | null;
      avatar?: string | null;
    };

    type Server = {
      id: string;
      name: string;
      description?: string | null;
      icon?: string | null;
      ownerId: string;
      isPublic: boolean;
      memberCount: number;
      createdAt: string;
    };

    type Channel = {
      id: string;
      serverId: string;
      name: string;
      topic?: string | null;
      type: "text" | "voice" | "category";
      parentId?: string | null;
      position?: number;
    };

    type Message = {
      id: string;
      serverId: string;
      channelId: string;
      author: User;
      content: string;
      replyTo?: string | null;
      createdAt: string;
      editedAt?: string | null;
    };

    type Member = {
      user: User;
      roles?: string[];
      joinedAt: string;
      status: "online" | "offline" | "idle" | "dnd";
    };

    type Pagination<T> = {
      total: number;
      current: number;
      pageSize: number;
      list: T[];
    };
  }
}

// 公共类型
declare namespace Types {
  export namespace Bc {}
}

