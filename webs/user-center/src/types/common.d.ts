namespace Res {
  /** 通用json响应体 */
  type data<T = any> = {
    code: string;
    msg: string;
    data: T;
  };
}

declare namespace Types {
  export namespace UserCenterCommon {
    type SortOrder = "ASC" | "DESC";
    type PageList<T> = {
      total: number;
      current: number;
      pageSize: number;
      list: T[];
    };
  }
}

