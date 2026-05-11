import { JOB_ASPD } from "./jobConstants";
import type { SixStats } from "./types";

export type SecCtx = {
  effectiveJobId: number;
  baseLv: number;
  jobLv: number;
  weaponType: number;
  speedPot: number;
  total: SixStats;
  maxHp: number;
  maxSp: number;
};

export function computeHit(ctx: SecCtx): number {
  return ctx.baseLv + ctx.total.dex;
}

export function computeFlee(ctx: SecCtx): number {
  return ctx.baseLv + ctx.total.agi;
}

export function computePerfectDodge(ctx: SecCtx): number {
  return Math.round((1 + ctx.total.luk * 0.1) * 10) / 10;
}

/** 未计目标种族 / 卡片等（legacy 依赖 n_B） */
export function computeCritBase(ctx: SecCtx): number {
  return Math.round((1 + ctx.total.luk * 0.3) * 10) / 10;
}

export function computeMatk(totalInt: number): { min: number; max: number } {
  const wMin = Math.floor(totalInt / 7);
  let matk0 = totalInt + wMin * wMin;
  const wMax = Math.floor(totalInt / 5);
  let matk2 = totalInt + wMax * wMax;
  matk0 = Math.floor((matk0 * 100) / 100);
  matk2 = Math.floor((matk2 * 100) / 100);
  if (matk0 !== matk2) matk2 -= 1;
  return { min: matk0, max: matk2 > matk0 ? matk2 : matk0 };
}

export function computeAspd(ctx: SecCtx, extraWeight = 0): number {
  const row = JOB_ASPD[ctx.effectiveJobId];
  const wt = ctx.weaponType;
  const baseAspd = row?.[wt] ?? 150;
  const wASPD = 200 - baseAspd;
  let nA_ASPD =
    200 -
    wASPD +
    (Math.floor((wASPD * ctx.total.agi * 4) / 100) +
      Math.floor((wASPD * ctx.total.dex) / 100)) /
      10;

  let w = extraWeight;
  if (ctx.speedPot === 1) w += 10;
  else if (ctx.speedPot === 2) w += 15;
  else if (ctx.speedPot === 3) w += 20;

  nA_ASPD += ((200 - nA_ASPD) * w) / 100;

  if (nA_ASPD > 190) nA_ASPD = 190;
  return Math.round(nA_ASPD * 100) / 100;
}

export function computeHpr(vit: number, maxHp: number): number {
  let hpr = Math.floor(vit / 5) + Math.floor(maxHp / 200);
  if (hpr < 1) hpr = 1;
  return hpr;
}

export function computeSpr(int: number, maxSp: number): number {
  let spr = Math.floor(int / 6) + Math.floor(maxSp / 100) + 1;
  spr = Math.floor((spr * 100) / 100);
  if (int >= 120) {
    spr += Math.floor((int - 120) / 2) + 4;
  }
  return spr;
}
