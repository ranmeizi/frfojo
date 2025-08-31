// request 请求参数类型
declare namespace Params {
  // 基础功能
  export namespace BoboanNetBase {
    /**
     * 注册
     * POST /auth/signup
     * 参数
     */
    type EmailSignup = {
      /**
       * 邮箱
       */
      email: string;
      /**
       * 密码
       */
      password: string;
      /**
       * 验证码
       */
      verifyCode: string;
    };

    /**
     * 登陆
     * POST /auth/login
     * 参数
     */
    type Signin = {
      /**
       * 密码
       */
      password: string;
      /**
       * 用户名
       */
      username: string;
    };

    /**
     * 发送短信验证码
     * POST /auth/sendEmailCode
     */
    type SendEmailCode = {
      /**
       * 邮箱
       */
      email: string;
    };

    /** 修改密码(输入旧密码) */
    type ChangePassword = {
      /**
       * 新密码
       */
      newPassword: string;
      /**
       * 旧密码
       */
      oldPassword: string;
    };

    /** 忘记密码 */
    type ForgotChangePassword = {
      code: string;
      /**
       * 邮箱
       */
      email: string;
      /**
       * 密码
       */
      password: string;
    };
  }
}
// response 传输对象类型
declare namespace DTOs {
  export namespace BoboanNetBase {
    /** 登陆返回值 */
    type Signin = {
      access_token: string;
      expires_in: number;
      refresh_token: string;
      token_type: string;
    };

    /** 注册返回值 */
    type EmailSignup = null;

    /** 用户对象 */
    type UserDto = {
      id: string;
      nickname: string;
      email: string;
      status: string;
      picture: string;
      createdAt: string;
      updatedAt: string;
    };

    // 当前用户信息
    type CurrentUser = {
      user: UserDto;
      permissions: string[];
    };
  }
}
// 公共类型
declare namespace Types {
  export namespace BoboanNetBase {}
}
