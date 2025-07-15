// request 请求参数类型
declare namespace Params {
  // 基础功能
  export namespace BoboanNetBase {
    /**
     * 注册
     * POST /auth/signup
     * 参数
     */
    type Signup = {
      /**
       * 邮箱
       */
      email: string;
      /**
       * 姓氏
       */
      firstName?: string;
      /**
       * 名字
       */
      lastName?: string;
      /**
       * 密码
       */
      password: string;
      /**
       * 用户名
       */
      username: string;
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
       * 密码  加密
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
  }
}
// response 传输对象类型
declare namespace DTOs {
  export namespace BoboanNetBase {
    /** 登陆返回值 */
    type Signin = {
      accessToken: string;
      expiresIn: string;
      refreshToken: string;
      tokenType: string;
    };

    /** 注册返回值 */
    type Signup = null;
  }
}
// 公共类型
declare namespace Types {
  export namespace BoboanNetBase {}
}
