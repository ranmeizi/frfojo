import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist-indexeddb-storage";
import { persistReducer, persistStore } from "redux-persist";
import { opendotaApi } from "./queryApis/opendota";
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

  const rootState = store.getState();

  const heroes = opendotaApi.endpoints.constantsHeroes.select()(rootState);
  const items = opendotaApi.endpoints.constantsItems.select()(rootState);
  const itemIds = opendotaApi.endpoints.constantsItemIds.select()(rootState);
  const abilities =
    opendotaApi.endpoints.constantsAbilities.select()(rootState);
  const abilityIds =
    opendotaApi.endpoints.constantsAbilityIds.select()(rootState);

  if (!heroes.data) {
    await store.dispatch(opendotaApi.endpoints.constantsHeroes.initiate());
  }

  if (!items.data) {
    await store.dispatch(opendotaApi.endpoints.constantsItems.initiate());
  }

  if (!itemIds.data) {
    await store.dispatch(opendotaApi.endpoints.constantsItemIds.initiate());
  }

  if (!abilities.data) {
    await store.dispatch(opendotaApi.endpoints.constantsAbilities.initiate());
  }

  if (!abilityIds.data) {
    await store.dispatch(opendotaApi.endpoints.constantsAbilityIds.initiate());
  }

  await next();
}

export { initialize, store };

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
