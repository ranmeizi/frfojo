import { request } from "@frfojo/common/request";

/** 查询当前用户加入的服务器列表 */
export function listServers(params?: Params.Bc.ListServers) {
  return request<Res.data<DTOs.Bc.Pagination<DTOs.Bc.Server>>>(
    "/bc/servers/list",
    {
      method: "GET",
      params,
    }
  );
}

/** 创建服务器 */
export function createServer(params: Params.Bc.CreateServer) {
  return request<Res.data<DTOs.Bc.Server>>("/bc/servers/create", {
    method: "POST",
    data: params,
  });
}

/** 按 ID 查询服务器详情 */
export function getServerById(params: Params.Bc.GetServerById) {
  return request<Res.data<DTOs.Bc.Server>>("/bc/servers/getById", {
    method: "GET",
    params,
  });
}

/** 搜索服务器（用于“发现/加入服务器”） */
export function searchServers(params: Params.Bc.SearchServers) {
  return request<Res.data<DTOs.Bc.Pagination<DTOs.Bc.Server>>>(
    "/bc/servers/search",
    {
      method: "GET",
      params,
    }
  );
}

/** 加入服务器 */
export function joinServer(params: Params.Bc.JoinServer) {
  return request<Res.data<DTOs.Bc.Server>>("/bc/servers/join", {
    method: "POST",
    data: params,
  });
}

/** 退出服务器 */
export function leaveServer(params: Params.Bc.LeaveServer) {
  return request<Res.data<null>>("/bc/servers/leave", {
    method: "POST",
    data: params,
  });
}

/** 查询服务器下的频道列表（侧边栏） */
export function listChannels(params: Params.Bc.ListChannels) {
  return request<Res.data<DTOs.Bc.Channel[]>>("/bc/channels/list", {
    method: "GET",
    params,
  });
}

/** 修改频道信息 */
export function updateChannel(params: Params.Bc.UpdateChannel) {
  return request<Res.data<DTOs.Bc.Channel>>("/bc/channels/update", {
    method: "POST",
    data: params,
  });
}

/** 删除频道 */
export function deleteChannel(params: Params.Bc.DeleteChannel) {
  return request<Res.data<null>>("/bc/channels/delete", {
    method: "POST",
    data: params,
  });
}

/** 查询频道消息列表（聊天记录） */
export function listMessages(params: Params.Bc.ListMessages) {
  return request<Res.data<DTOs.Bc.Pagination<DTOs.Bc.Message>>>(
    "/bc/messages/list",
    {
      method: "GET",
      params,
    }
  );
}

/** 发送频道消息 */
export function sendMessage(params: Params.Bc.SendMessage) {
  return request<Res.data<DTOs.Bc.Message>>("/bc/messages/send", {
    method: "POST",
    data: params,
  });
}

/** 编辑消息 */
export function updateMessage(params: Params.Bc.UpdateMessage) {
  return request<Res.data<DTOs.Bc.Message>>("/bc/messages/update", {
    method: "POST",
    data: params,
  });
}

/** 删除消息 */
export function deleteMessage(params: Params.Bc.DeleteMessage) {
  return request<Res.data<null>>("/bc/messages/delete", {
    method: "POST",
    data: params,
  });
}

/** 查询服务器成员列表（右侧成员栏） */
export function listMembers(params: Params.Bc.ListMembers) {
  return request<Res.data<DTOs.Bc.Pagination<DTOs.Bc.Member>>>(
    "/bc/members/list",
    {
      method: "GET",
      params,
    }
  );
}

