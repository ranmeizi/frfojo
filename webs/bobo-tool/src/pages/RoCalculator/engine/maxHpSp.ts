import {
  GUN_HP_TABLE,
  JOB_HP_A,
  JOB_HP_B,
  JOB_SP_A,
  KENSEI_HP_90_99,
  NIN_HP_TABLE,
} from "./jobConstants";

type HpSpCtx = {
  effectiveJobId: number;
  isTensei: boolean;
  baby: boolean;
  baseLv: number;
  vit: number;
  int: number;
};

function computeWHP_SL_43(baseLv: number): number {
  if (baseLv < 70) return 0;
  if (baseLv <= 79) return (baseLv - 70) * 40;
  if (baseLv <= 84) return (baseLv - 80) * 50;
  if (baseLv <= 89) return (baseLv - 80) * 50 - 10;
  if (baseLv <= 92) return (baseLv - 90) * 50;
  if (baseLv <= 97) return (baseLv - 90) * 50 - 10;
  if (baseLv === 98) return 375;
  return 4;
}

function computeWSP_SL_43(baseLv: number): number {
  if (baseLv < 70) return 0;
  if (baseLv < 80) return (baseLv - 70) * 4 + 5;
  if (baseLv < 90) return (baseLv - 80) * 4;
  if (baseLv < 93) return (baseLv - 90) * 4;
  if (baseLv < 99) return (baseLv - 90) * 4 - 10;
  return 1;
}

export function computeMaxHp(ctx: HpSpCtx): number {
  const { effectiveJobId, isTensei, baby, baseLv, vit } = ctx;
  const wHPSL = effectiveJobId === 43 ? computeWHP_SL_43(baseLv) : 0;

  let w = 0;
  for (let i = 2; i <= baseLv; i++) {
    w += Math.round((JOB_HP_A[effectiveJobId] ?? 0) * i) / 100;
  }

  let maxHp = Math.floor((JOB_HP_B[effectiveJobId] ?? 0) * baseLv + 35 + w);

  if (effectiveJobId === 44) {
    maxHp = NIN_HP_TABLE[baseLv - 1] ?? maxHp;
  }

  if (effectiveJobId === 45 && baseLv >= 10) {
    maxHp = GUN_HP_TABLE[baseLv - 10] ?? maxHp;
  }

  if (effectiveJobId === 20 && baseLv === 99) {
    maxHp += 2000;
  }

  if (isTensei) maxHp = Math.floor((maxHp * 125) / 100);
  if (baby) maxHp = Math.floor((maxHp * 70) / 100);

  maxHp = Math.floor(((maxHp - wHPSL) * (100 + vit)) / 100);

  if (effectiveJobId === 41 && baseLv >= 70) {
    if (baseLv <= 79)
      maxHp = Math.floor((2127 + 10 * (baseLv - 70)) * (100 + vit) / 100);
    else if (baseLv <= 89)
      maxHp = Math.floor((2200 + 50 * (baseLv - 80)) * (100 + vit) / 100);
    else if (baseLv <= 99)
      maxHp = Math.floor((2700 + 50 * (baseLv - 90)) * (100 + vit) / 100);
  }

  if (effectiveJobId === 42 && baseLv >= 70) {
    if (baseLv <= 79)
      maxHp = Math.floor((2670 + 10 * (baseLv - 70)) * (100 + vit) / 100);
    else if (baseLv <= 89)
      maxHp = Math.floor((3000 + 20 * (baseLv - 80)) * (100 + vit) / 100);
    else if (baseLv <= 99) {
      const k = KENSEI_HP_90_99[baseLv - 90] ?? 4500;
      maxHp = Math.floor(k * (100 + vit) / 100);
    }
  }

  return Math.floor(maxHp);
}

export function computeMaxSp(ctx: HpSpCtx): number {
  const { effectiveJobId, isTensei, baby, baseLv, int } = ctx;
  const wSPSL = effectiveJobId === 43 ? computeWSP_SL_43(baseLv) : 0;

  let maxSp = Math.floor(10 + baseLv * (JOB_SP_A[effectiveJobId] ?? 0) - wSPSL);

  if (effectiveJobId === 44) {
    if (baseLv <= 20) maxSp = 11 + baseLv * 3;
    else if (baseLv <= 40) maxSp = 71 + (baseLv - 20) * 4;
    else if (baseLv <= 60) maxSp = 151 + (baseLv - 40) * 5;
    else if (baseLv <= 80) maxSp = 251 + (baseLv - 60) * 6;
    else maxSp = 370 + (baseLv - 80) * 8;
  }

  if (effectiveJobId === 45) {
    if (baseLv <= 25) maxSp = 10 + baseLv * 3;
    else if (baseLv <= 35) maxSp = 85 + (baseLv - 25) * 4;
    else if (baseLv <= 40) maxSp = 126 + (baseLv - 35) * 3;
    else if (baseLv <= 50) maxSp = 141 + (baseLv - 40) * 4;
    else if (baseLv <= 75) maxSp = 181 + (baseLv - 50) * 5;
    else if (baseLv <= 78) maxSp = 306 + (baseLv - 75) * 6;
    else maxSp = 330 + (baseLv - 78) * 6;
  }

  if (isTensei) maxSp = Math.floor((maxSp * 125) / 100);
  if (baby) maxSp = Math.floor((maxSp * 70) / 100);
  maxSp = Math.floor((maxSp * (100 + int)) / 100);

  if (effectiveJobId === 41 && baseLv >= 70) {
    if (baseLv <= 79)
      maxSp = Math.floor((150 + 1 * (baseLv - 70)) * (100 + int) / 100);
    else if (baseLv <= 89)
      maxSp = Math.floor((160 + 1 * (baseLv - 70)) * (100 + int) / 100);
    else if (baseLv <= 99)
      maxSp = Math.floor((170 + 1 * (baseLv - 70)) * (100 + int) / 100);
  }

  if (effectiveJobId === 42 && baseLv >= 70) {
    if (baseLv <= 79)
      maxSp = Math.floor((339 + 2 * (baseLv - 70)) * (100 + int) / 100);
    else if (baseLv <= 89)
      maxSp = Math.floor((386 + 2 * (baseLv - 80)) * (100 + int) / 100);
    else if (baseLv <= 99)
      maxSp = Math.floor((430 + 3 * (baseLv - 90)) * (100 + int) / 100);
  }

  return Math.floor(maxSp);
}
