declare namespace Types {
  export namespace UserCenterAuth {
    type Token = {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
    };

    type UserInfo = {
      id: string;
      nickname?: string;
      email?: string;
      picture?: string;
      permissions?: string[];
    };
  }
}

