import { ODRequest as request } from "../../utils/request/opendota";

/**
 * 获取英雄静态数据
 */
export function getHeroes() {
  return request.get<Record<string, ConstantsHero>>("/constants/heroes");
}

/**
 * 获取物品静态数据
 */
export function getItems() {
  return request.get<Record<string, ConstantsItem>>("/constants/items");
}

/**
 * 查询物品 id map
 */
export function getItemIds() {
  return request.get<Record<string, string>>("/constants/item_ids");
}

/**
 * 获取技能静态数据
 */
export function getAbilities() {
  return request.get<Record<string, ConstantsAbility>>("/constants/abilities");
}

/**
 * 查询物品 id map
 */
export function getAbilityIds() {
  return request.get<Record<string, string>>("/constants/ability_ids");
}
