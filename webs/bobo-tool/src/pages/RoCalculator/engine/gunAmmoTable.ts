/**
 * 与 `refer/head.js` 一致：`ClickWeaponType` 在 17–20 枪系时把 `ArrowOBJ[0..2]` 替换为 `BulletOBJ`；
 * `n==21` 榴弹枪时用 `GrenadeOBJ[0..4]`。
 */
export type GunAmmoRow = { readonly atk: number; readonly zok: number; readonly label: string };

export const BULLET_AMMO_ROWS: readonly GunAmmoRow[] = [
  { atk: 10, zok: 0, label: "有声枪" },
  { atk: 15, zok: 6, label: "神圣有声枪" },
  { atk: 30, zok: 0, label: "血波枪" },
];

export const GRENADE_AMMO_ROWS: readonly GunAmmoRow[] = [
  { atk: 50, zok: 3, label: "火焰枪" },
  { atk: 50, zok: 1, label: "冰冻枪" },
  { atk: 50, zok: 4, label: "雷击枪" },
  { atk: 50, zok: 7, label: "失明枪" },
  { atk: 50, zok: 5, label: "毒枪" },
];

export const BULLET_AMMO_INDEX_MAX = BULLET_AMMO_ROWS.length - 1;
export const GRENADE_AMMO_INDEX_MAX = GRENADE_AMMO_ROWS.length - 1;
