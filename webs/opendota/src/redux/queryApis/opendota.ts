// Import the RTK Query methods from the React-specific entry point
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define our single API slice object
export const opendotaApi = createApi({
  reducerPath: "opendotaApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.opendota.com/api" }),
  // The "endpoints" represent operations and requests for this server
  endpoints: (builder) => ({
    /**
     * 查询常量 heroes 英雄
     */
    constantsHeroes: builder.query<
      Record<string, DTOs.Opendota.ConstantsHero>,
      void
    >({
      query: () => "/constants/heroes",
      keepUnusedDataFor: Infinity,
    }),
    /**
     * 查询常量 items 道具
     */
    constantsItems: builder.query<
      Record<string, DTOs.Opendota.ConstantsItem>,
      void
    >({
      query: () => "/constants/items",
      keepUnusedDataFor: Infinity,
    }),
    /**
     * 查询常量 item_ids 道具 id/name
     */
    constantsItemIds: builder.query<Record<string, string>, void>({
      query: () => "/constants/item_ids",
      keepUnusedDataFor: Infinity,
    }),
    /**
     * 查询常量 abilities 技能
     */
    constantsAbilities: builder.query<
      Record<string, DTOs.Opendota.ConstantsAbility>,
      void
    >({
      query: () => "/constants/abilities",
      keepUnusedDataFor: Infinity,
    }),
    /**
     * 查询常量 ability_ids 技能 id/name
     */
    constantsAbilityIds: builder.query<Record<string, string>, void>({
      query: () => "/constants/ability_ids",
      keepUnusedDataFor: Infinity,
    }),
    /**
     * 模糊查询玩家列表
     * q: 关键词
     */
    serach: builder.query<
      DTOs.Opendota.SearchResListItem[],
      Params.Opendota.SearchParams
    >({
      query: (params) => ({ url: "/search", params }),
      keepUnusedDataFor: 60 * 30,
    }),

    /**
     *
     */
    playerMatches: builder.query<
      DTOs.Opendota.PlayerMatches[],
      Params.Opendota.PlayerMatchesParams
    >({
      query: ({ account_id, ...params }) => ({
        url: `/players/${account_id}/matches`,
        params,
      }),
      keepUnusedDataFor: 60 * 30,
    }),
  }),
});
