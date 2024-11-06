import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserMemoState = {
  accountId?: string | null;
  vip?: 0 | 1 | 2;
};

const initialState = {
  /** 我的账号 id */
  accountId: null,
  /** vip状态 对应头像框嘿嘿 */
  vip: 0,
} satisfies UserMemoState as UserMemoState;

const userMemoSlice = createSlice({
  name: "userMemo",
  initialState,
  reducers: {
    /** 设置账号 */
    setAccount(state, action: PayloadAction<string>) {
      state.accountId = action.payload;
    },
    /** 设置vip类型 */
    setVip(state, action: PayloadAction<number>) {
      state.vip = [0, 1, 2].includes(action.payload)
        ? (action.payload as 0 | 1 | 2)
        : undefined;
    },
  },
  selectors: {
    root: (state) => state,
  },
});

export default userMemoSlice;
