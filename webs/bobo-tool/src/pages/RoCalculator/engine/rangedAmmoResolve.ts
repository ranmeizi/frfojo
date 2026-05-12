import { BOW_ARROW_INDEX_MAX, bowArrowRow } from "./bowArrowTable";
import {
  BULLET_AMMO_INDEX_MAX,
  BULLET_AMMO_ROWS,
  GRENADE_AMMO_INDEX_MAX,
  GRENADE_AMMO_ROWS,
} from "./gunAmmoTable";

export type RangedAmmoTableKind = "bow" | "bullet" | "grenade" | "none";

export type ResolvedRangedAmmo = {
  atk: number;
  zok: number;
  label: string;
  table: RangedAmmoTableKind;
};

/** 原版 `n_A_Arrow` 下拉：弓用 ArrowOBJ；枪 17–20 用 BulletOBJ；21 用 GrenadeOBJ。 */
export function resolveRangedAmmo(
  weaponType: number,
  ammoIndex: number,
): ResolvedRangedAmmo | null {
  const wt = Math.floor(weaponType);
  if (wt === 10) {
    const i = Math.min(BOW_ARROW_INDEX_MAX, Math.max(0, Math.floor(ammoIndex)));
    const r = bowArrowRow(i);
    return { atk: r.atk, zok: r.zok, label: r.label, table: "bow" };
  }
  if (wt >= 17 && wt <= 20) {
    const i = Math.min(BULLET_AMMO_INDEX_MAX, Math.max(0, Math.floor(ammoIndex)));
    const r = BULLET_AMMO_ROWS[i] ?? BULLET_AMMO_ROWS[0];
    return { atk: r.atk, zok: r.zok, label: r.label, table: "bullet" };
  }
  if (wt === 21) {
    const i = Math.min(GRENADE_AMMO_INDEX_MAX, Math.max(0, Math.floor(ammoIndex)));
    const r = GRENADE_AMMO_ROWS[i] ?? GRENADE_AMMO_ROWS[0];
    return { atk: r.atk, zok: r.zok, label: r.label, table: "grenade" };
  }
  return null;
}

export function maxRangedAmmoIndex(weaponType: number): number | null {
  const wt = Math.floor(weaponType);
  if (wt === 10) return BOW_ARROW_INDEX_MAX;
  if (wt >= 17 && wt <= 20) return BULLET_AMMO_INDEX_MAX;
  if (wt === 21) return GRENADE_AMMO_INDEX_MAX;
  return null;
}
