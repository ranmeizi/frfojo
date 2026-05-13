#!/usr/bin/env node
/**
 * 根据 MomoIngameNews/mvp.ts 中的 respawn_map 与 imgUrl，后台拉取
 * https://file5s.ratemyserver.net/maps/{map}.gif 与 .../mobs/{id}.gif，
 * 避免前端并发请求被限流。
 *
 * 用法（在 webs/bobo-tool 目录）：
 *   pnpm fetch:momo-rms-assets
 *   pnpm fetch:momo-rms-assets -- --dry-run
 *   pnpm fetch:momo-rms-assets -- --delay-ms=800 --force
 *
 * 产物：public/momo-ingame-news/rms-assets/{maps,mobs}/*.gif
 * 前端可用：url(\${import.meta.env.BASE_URL}momo-ingame-news/rms-assets/maps/\${mapId}.gif)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const mvpTs = path.join(root, "src/pages/MomoIngameNews/mvp.ts");
const outRoot = path.join(root, "public/momo-ingame-news/rms-assets");

const RMS = "https://file5s.ratemyserver.net";

function parseArgs(argv) {
  let dryRun = false;
  let force = false;
  let delayMs = 600;
  for (const a of argv) {
    if (a === "--dry-run") dryRun = true;
    else if (a === "--force") force = true;
    else if (a.startsWith("--delay-ms=")) delayMs = Math.max(0, Number(a.slice("--delay-ms=".length)) || 0);
  }
  return { dryRun, force, delayMs };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 与 mvp.ts 排版一致：respawn_map 内地图键为 6 空格缩进的 `mapId: {`
 */
function collectMapIdsFromMvpSource(text) {
  const set = new Set();
  const re = /^      ([a-z][a-z0-9_]*): \{$/gm;
  let m;
  while ((m = re.exec(text)) !== null) set.add(m[1]);
  return [...set].sort();
}

function collectMobUrlsFromMvpSource(text) {
  const set = new Set();
  const re = /imgUrl:\s*"(https:\/\/file5s\.ratemyserver\.net\/mobs\/\d+\.gif)"/g;
  let m;
  while ((m = re.exec(text)) !== null) set.add(m[1]);
  return [...set].sort();
}

async function downloadFile(url, destFile, { force, maxRetries = 6 }) {
  if (!force && fs.existsSync(destFile)) {
    const st = fs.statSync(destFile);
    if (st.size > 0) return "skip";
  }

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (compatible; bobo-tool-fetch-momo-rms/1.0; +local cache build)",
    Accept: "image/gif,image/*;q=0.8,*/*;q=0.5",
  };

  let attempt = 0;
  let wait = 2000;
  while (attempt < maxRetries) {
    attempt++;
    const res = await fetch(url, { headers });
    if (res.status === 429 || res.status === 503) {
      console.warn(`  ${res.status} ${url} → 等待 ${wait}ms 后重试 (${attempt}/${maxRetries})`);
      await sleep(wait);
      wait = Math.min(wait * 2, 120_000);
      continue;
    }
    if (!res.ok) {
      return `fail:${res.status}`;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.writeFileSync(destFile, buf);
    return "ok";
  }
  return "fail:retries";
}

async function main() {
  const { dryRun, force, delayMs } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(mvpTs)) {
    console.error(`找不到 mvp.ts: ${mvpTs}`);
    process.exit(1);
  }

  const text = fs.readFileSync(mvpTs, "utf8");
  const mapIds = collectMapIdsFromMvpSource(text);
  const mobUrls = collectMobUrlsFromMvpSource(text);

  const mapTasks = mapIds.map((mapId) => ({
    kind: "map",
    url: `${RMS}/maps/${mapId}.gif`,
    dest: path.join(outRoot, "maps", `${mapId}.gif`),
  }));

  const mobTasks = mobUrls.map((url) => {
    const name = path.basename(new URL(url).pathname);
    return {
      kind: "mob",
      url,
      dest: path.join(outRoot, "mobs", name),
    };
  });

  const tasks = [...mapTasks, ...mobTasks];
  console.log(
    `解析 ${path.relative(root, mvpTs)}：地图 ${mapIds.length} 张（去重后）、怪物 gif ${mobUrls.length} 个；共 ${tasks.length} 次 GET`,
  );
  if (dryRun) {
    for (const t of tasks) console.log(`  [dry-run] ${t.url} → ${path.relative(root, t.dest)}`);
    return;
  }

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    process.stdout.write(`[${i + 1}/${tasks.length}] ${t.kind} ${path.basename(t.dest)} ... `);
    try {
      const r = await downloadFile(t.url, t.dest, { force });
      if (r === "ok") {
        ok++;
        console.log("ok");
      } else if (r === "skip") {
        skipped++;
        console.log("skip (已存在)");
      } else {
        failed++;
        console.log(r);
      }
    } catch (e) {
      failed++;
      console.log(`error: ${e?.message || e}`);
    }
    if (delayMs > 0 && i < tasks.length - 1) await sleep(delayMs);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    publicBase: "/momo-ingame-news/rms-assets",
    mapIds,
    mobGifNames: mobTasks.map((x) => path.basename(x.dest)),
    stats: { ok, skipped, failed, total: tasks.length },
  };
  fs.mkdirSync(outRoot, { recursive: true });
  fs.writeFileSync(path.join(outRoot, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\n完成：ok=${ok} skip=${skipped} fail=${failed} → manifest: ${path.relative(root, path.join(outRoot, "manifest.json"))}`);
  if (failed) process.exitCode = 1;
}

main();
