/**
 * public 下资源的根 URL（含尾部的 `/`）。
 * Garfish 微前端下地址栏是主应用前缀，若写 `/momo-...` 会从主域根取资源而 404；
 * 用当前 bundle 所在 origin（子应用 dev server / 部署源）+ Vite BASE_URL，单独启动与微应用均可。
 */
export function boboToolPublicOriginBase(): string {
  const origin = new URL(import.meta.url).origin;
  const base = import.meta.env.BASE_URL;
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${origin}${normalized}`;
}

export function rmsMapGifUrl(mapId: string): string {
  return `${boboToolPublicOriginBase()}momo-ingame-news/rms-assets/maps/${encodeURIComponent(mapId)}.gif`;
}

export function rmsMobGifUrl(mobId: string): string {
  return `${boboToolPublicOriginBase()}momo-ingame-news/rms-assets/mobs/${encodeURIComponent(mobId)}.gif`;
}
