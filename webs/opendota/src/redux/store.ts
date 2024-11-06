import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist-indexeddb-storage";
import { persistReducer, persistStore } from "redux-persist";
import { opendotaApi } from "./queryApis/opendota";
import { sleep } from "@frfojo/common";
import userMemoSlice from "./slices/UserMemo";

const persistConfig = {
  key: "opendota",
  version: 1,
  storage: storage("od-redux-persist-storage"),
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    [opendotaApi.reducerPath]: opendotaApi.reducer,
    [userMemoSlice.reducerPath]: userMemoSlice.reducer,
  })
);

// 创建 store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(opendotaApi.middleware),
});

async function initialize(next: AsyncProcessFn) {
  // 初始化数据是异步的

  await persistStore(store);

  await sleep(2000);

  const rootState = store.getState();

  const heroes = opendotaApi.endpoints.constantsHeroes.select()(rootState);

  if (!heroes.data) {
    await store.dispatch(opendotaApi.endpoints.constantsHeroes.initiate());
  }

  await next();
}

export { initialize, store };

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
