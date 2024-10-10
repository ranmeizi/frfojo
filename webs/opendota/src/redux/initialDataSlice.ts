import type { RootState } from "./store";
import { createAppSlice } from "./tool/createSlice";
import {
  getAbilities,
  getAbilityIds,
  getHeroes,
  getItemIds,
  getItems,
} from "@/services/opendota/constants";

function checkIfNeedUpdate() {}

// Define a type for the slice state
interface InitialDataState {
  /** 英雄 */
  heroes: Record<string, ConstantsHero> | null;
  /** 物品 */
  items: Record<string, ConstantsItem> | null;
  /** 物品 id name 映射 */
  item_ids: Record<string, string> | null;
  /** 技能 */
  abilities: Record<string, ConstantsAbility> | null;
  /** 技能 id name 映射 */
  ability_ids: Record<string, string> | null;
}

// Define the initial state using that type
const initialState: InitialDataState = {
  heroes: null,
  items: null,
  item_ids: null,
  abilities: null,
  ability_ids: null,
};

export const initialDataSlice = createAppSlice({
  name: "initialData",
  initialState,
  reducers: (create) => ({
    /** 更新英雄数据 */
    updateHereosAsync: create.asyncThunk(
      async () => {
        const response = await getHeroes();
        return response.data;
      },
      {
        fulfilled(state, actions) {
          state.heroes = actions.payload;
        },
      }
    ),
    /** 更新物品数据 */
    updateItemsAsync: create.asyncThunk(
      async () => {
        const response = await getItems();
        return response.data;
      },
      {
        fulfilled(state, actions) {
          state.items = actions.payload;
        },
      }
    ),
    /** 更新物品idmap数据 */
    updateItemIdsAsync: create.asyncThunk(
      async () => {
        const response = await getItemIds();
        return response.data;
      },
      {
        fulfilled(state, actions) {
          state.item_ids = actions.payload;
        },
      }
    ),
    /** 更新技能数据 */
    updateAbilitiesAsync: create.asyncThunk(
      async () => {
        const response = await getAbilities();
        return response.data;
      },
      {
        fulfilled(state, actions) {
          state.abilities = actions.payload;
        },
      }
    ),
    /** 更新技能idmap数据 */
    updateAbilityIdsAsync: create.asyncThunk(
      async () => {
        const response = await getAbilityIds();
        return response.data;
      },
      {
        fulfilled(state, actions) {
          state.ability_ids = actions.payload;
        },
      }
    ),
  }),
});

/** actions */
export const { updateHereosAsync } = initialDataSlice.actions;

/** slectors */
export const selectHeroes = (state: RootState) => state.initialData.heroes;
export const selectItems = (state: RootState) => state.initialData.items;
export const selectItemIds = (state: RootState) => state.initialData.item_ids;
export const selectAbilities = (state: RootState) =>
  state.initialData.abilities;
export const selectAbilityIds = (state: RootState) =>
  state.initialData.ability_ids;

/** reducer */
export default initialDataSlice.reducer;
