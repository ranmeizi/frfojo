import { useMemo } from "react";
import { opendotaApi } from "../queryApis/opendota";

export function useHeroMap() {
  const { data } = opendotaApi.useConstantsHeroesQuery();

  const byId = useMemo(() => {
    const map = new Map<number, DTOs.Opendota.ConstantsHero>();
    if (!data) return map;
    Object.values(data).forEach((hero) => {
      map.set(hero.id, hero);
    });
    return map;
  }, [data]);

  return byId;
}

export function useItemMaps() {
  const { data: items } = opendotaApi.useConstantsItemsQuery();
  const { data: itemIds } = opendotaApi.useConstantsItemIdsQuery();

  const { keyById, itemByKey } = useMemo(() => {
    const keyById = new Map<number, string>();
    const itemByKey = new Map<string, DTOs.Opendota.ConstantsItem>();

    if (items) {
      Object.entries(items).forEach(([key, value]) => {
        itemByKey.set(key, value);
      });
    }

    if (itemIds) {
      Object.entries(itemIds).forEach(([idStr, key]) => {
        const id = Number(idStr);
        if (!Number.isNaN(id)) {
          keyById.set(id, key as string);
        }
      });
    }

    return { keyById, itemByKey };
  }, [items, itemIds]);

  return { keyById, itemByKey };
}

