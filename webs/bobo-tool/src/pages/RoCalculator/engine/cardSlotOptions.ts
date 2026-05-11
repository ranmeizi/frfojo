import { cardLabel } from "./cardObject.generated";
import type { ItemOption } from "./itemLists";

/** Auto-extracted from refer/js/card.js CardSortOBJ — 与原版下拉顺序一致 */
export const WEAPON_CARD_SLOT1_IDS = [0,201,202,203,204,1,2,3,106,156,107,223,463,25,11,233,235,10,244,158,27,252,253,254,255,259,26,263,265,15,277,279,39,14,286,287,288,289,290,43,109,22,296,31,428,9,29,16,313,18,162,34,160,38,464,41,319,311,323,427,165,325,326,328,329,28,169,20,215,42,47,343,32,21,462,5,164,466,345,305,24,45,159,46,353,355,171,356,13,37,167,4,110,359,360,19,361,217,33,163,44,366,17,12,465,6,161,166,40,35,23,30,380,398,8,157,36,382,168,363,7,111,170,390,219] as const;
export const WEAPON_CARD_SLOT234_IDS = [0,1,2,3,106,156,107,223,463,25,11,233,235,10,244,158,27,252,253,254,255,259,26,263,265,15,277,279,39,14,286,287,288,289,290,43,109,22,296,31,428,9,29,16,313,18,162,34,160,38,464,41,319,311,323,427,165,325,326,328,329,28,169,20,215,42,47,343,32,21,462,5,164,466,345,305,24,45,159,46,353,355,171,356,13,37,167,4,110,359,360,19,361,217,33,163,44,366,17,12,465,6,161,166,40,35,23,30,380,398,8,157,36,382,168,363,7,111,170,390,219] as const;
export const HEADGEAR_CARD_IDS = [0,221,472,234,471,48,238,239,425,174,49,52,117,177,357,116,273,274,114,284,298,176,213,303,113,309,180,320,51,337,339,342,50,473,347,424,474,120,179,332,426,115,374,118,376,119,175,383,397,387,178] as const;
export const SHIELD_CARD_IDS = [0,154,222,122,231,124,54,55,241,245,126,249,57,61,468,306,307,310,173,396,56,53,272,348,58,358,60,470,172,368,467,62,469,127,375,125,123,63,59] as const;
export const BODY_ARMOR_CARD_IDS = [0,190,420,476,224,225,133,232,193,187,75,189,240,477,282,194,134,191,138,185,132,261,197,264,268,478,334,299,275,276,475,280,281,136,283,285,69,291,293,70,129,301,302,181,333,308,66,195,74,128,317,321,392,214,198,422,330,331,67,131,344,135,421,130,349,65,479,71,364,199,73,367,182,196,64,183,137,184,384,186,192,68,72,220] as const;
export const GARMENT_CARD_IDS = [0,404,86,76,243,405,85,403,482,401,258,267,271,79,294,295,481,82,80,402,327,394,338,340,341,400,346,78,352,393,139,369,83,483,372,84,81,87,77,480] as const;
export const SHOES_CARD_IDS = [0,399,484,227,228,229,140,94,242,95,246,89,486,257,266,408,269,278,407,300,304,91,93,485,318,322,406,88,351,362,92,423,90,377,379,381,388,409,391] as const;
export const ACCESSORY_CARD_IDS = [0,230,188,492,414,493,236,412,237,141,247,248,250,251,152,148,256,260,262,490,212,97,270,146,418,410,489,226,103,292,297,416,395,151,488,491,312,487,314,96,145,315,316,100,98,324,335,336,417,419,149,216,350,354,144,411,413,105,415,365,495,142,147,150,370,371,143,101,378,104,102,494,218,385,386,99,389] as const;

function toOptions(ids: readonly number[]): ItemOption[] {
  return ids.map((id) => ({ id, label: cardLabel(id) }));
}

export function weaponCard1Options(): ItemOption[] {
  return toOptions(WEAPON_CARD_SLOT1_IDS);
}
export function weaponCard234Options(): ItemOption[] {
  return toOptions(WEAPON_CARD_SLOT234_IDS);
}
export function headgearCardOptions(): ItemOption[] {
  return toOptions(HEADGEAR_CARD_IDS);
}
export function shieldCardOptions(): ItemOption[] {
  return toOptions(SHIELD_CARD_IDS);
}
export function bodyArmorCardOptions(): ItemOption[] {
  return toOptions(BODY_ARMOR_CARD_IDS);
}
export function garmentCardOptions(): ItemOption[] {
  return toOptions(GARMENT_CARD_IDS);
}
export function shoesCardOptions(): ItemOption[] {
  return toOptions(SHOES_CARD_IDS);
}
export function accessoryCardOptions(): ItemOption[] {
  return toOptions(ACCESSORY_CARD_IDS);
}

const sets = [
  new Set(WEAPON_CARD_SLOT1_IDS),
  new Set(WEAPON_CARD_SLOT234_IDS),
  new Set(HEADGEAR_CARD_IDS),
  new Set(SHIELD_CARD_IDS),
  new Set(BODY_ARMOR_CARD_IDS),
  new Set(GARMENT_CARD_IDS),
  new Set(SHOES_CARD_IDS),
  new Set(ACCESSORY_CARD_IDS),
] as const;

export function sanitizeWeaponCard1(id: number): number {
  return sets[0].has(id) ? id : 0;
}
export function sanitizeWeaponCard234(id: number): number {
  return sets[1].has(id) ? id : 0;
}
export function sanitizeHeadgearCard(id: number): number {
  return sets[2].has(id) ? id : 0;
}
export function sanitizeShieldCard(id: number): number {
  return sets[3].has(id) ? id : 0;
}
export function sanitizeBodyArmorCard(id: number): number {
  return sets[4].has(id) ? id : 0;
}
export function sanitizeGarmentCard(id: number): number {
  return sets[5].has(id) ? id : 0;
}
export function sanitizeShoesCard(id: number): number {
  return sets[6].has(id) ? id : 0;
}
export function sanitizeAccessoryCard(id: number): number {
  return sets[7].has(id) ? id : 0;
}
