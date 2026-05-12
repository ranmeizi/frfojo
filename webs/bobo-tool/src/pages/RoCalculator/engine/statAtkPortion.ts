/**
 * `refer/foot.js` 388–395：近战 / 远程武器下 `n_A_ATK` 的纯素质段（写入武器平铺与乘子之前）。
 */
export function statAtkPortion(
  str: number,
  dex: number,
  luk: number,
  weaponType: number,
): number {
  const rangedLike =
    weaponType === 10 ||
    weaponType === 14 ||
    weaponType === 15 ||
    weaponType === 17 ||
    weaponType === 18 ||
    weaponType === 19 ||
    weaponType === 20 ||
    weaponType === 21;
  if (!rangedLike) {
    const atkW = Math.round(Math.floor(str / 10) * Math.floor(str / 10));
    return str + atkW + Math.floor(dex / 5) + Math.floor(luk / 3);
  }
  const atkW = Math.round(Math.floor(dex / 10) * Math.floor(dex / 10));
  return dex + atkW + Math.floor(str / 5) + Math.floor(luk / 3);
}
