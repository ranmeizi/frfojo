import { configureStore, combineSlices } from "@reduxjs/toolkit";
import storage from "redux-persist-indexeddb-storage";
import { initialDataSlice } from "./initialDataSlice";
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
  key: "opendota",
  version: 1,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storage: storage as any,
};

const rootReducer = combineSlices(initialDataSlice);

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 创建 store
const store = configureStore({
  reducer: persistedReducer,
});

async function initialize(next: AsyncProcessFn) {
  // 初始化数据是异步的

  await persistStore(store);

  await next();
}

export { initialize, store };

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
