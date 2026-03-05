// request 请求参数类型
declare namespace Params {
  export namespace UserCenterLogin {
    type Signin = {
      username: string;
      password: string;
    };
  }
}

// response 传输对象类型
declare namespace DTOs {
  export namespace UserCenterLogin {
    type Signin = {
      access_token: string;
      expires_in: number;
      refresh_token: string;
      token_type: string;
    };

    type UserDto = {
      id: string;
      nickname: string;
      email: string;
      status: string;
      picture: string;
      createdAt: string;
      updatedAt: string;
    };
  }
}

// 公共类型
declare namespace Types {
  export namespace UserCenterLogin {}
}

