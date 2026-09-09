#!/usr/bin/env node
/**
 * 从 ro321 悬浮图同源 CDN 拉取集卡所需封面：
 *   https://file5s.ratemyserver.net/items/large/{itemId}.gif
 *
 * 用法（本目录）：
 *   node fetch-ro321-card-image.mjs --id=4005
 *   node fetch-ro321-card-image.mjs --all
 *   node fetch-ro321-card-image.mjs --all --force --delay-ms=200
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "card-images");
const catalogPath = path.join(__dirname, "card-groups.json");
const LARGE_BASE = "https://file5s.ratemyserver.net/items/large";

function parseArgs(argv) {
  let id = null;
  let all = false;
  let force = false;
  let delayMs = 180;
  for (const a of argv) {
    if (a === "--all") all = true;
    else if (a === "--force") force = true;
    else if (a.startsWith("--id=")) id = String(a.slice("--id=".length)).trim();
    else if (a.startsWith("--delay-ms=")) {
      delayMs = Math.max(0, Number(a.slice("--delay-ms=".length)) || 0);
    }
  }
  if (!all && !id) id = "4005";
  if (id && !/^\d{3,5}$/.test(id)) throw new Error(`无效物品 ID：${id}`);
  return { id, all, force, delayMs };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadAllIds() {
  const data = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const ids = [...new Set((data.cards || []).map((c) => String(c.id)))];
  ids.sort((a, b) => Number(a) - Number(b));
  return ids;
}

async function downloadOne(id, { force }) {
  const dest = path.join(outDir, `${id}.gif`);
  const url = `${LARGE_BASE}/${id}.gif`;
  if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    return { id, status: "skip", dest, url };
  }

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; frfojo-card-image-fetch/1.0; local cache)",
      Accept: "image/gif,image/*;q=0.8,*/*;q=0.5",
      Referer: "https://ro321.com/",
    },
  });
  if (!res.ok) {
    return { id, status: "fail", dest, url, error: `HTTP ${res.status}` };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100 || buf.subarray(0, 3).toString("ascii") !== "GIF") {
    return {
      id,
      status: "fail",
      dest,
      url,
      error: `not gif (${buf.length}b)`,
    };
  }
  fs.writeFileSync(dest, buf);
  return { id, status: "ok", dest, url, bytes: buf.length };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  fs.mkdirSync(outDir, { recursive: true });
  const ids = opts.all ? loadAllIds() : [opts.id];
  console.log(`共 ${ids.length} 张 → ${outDir}`);

  let ok = 0;
  let skip = 0;
  let fail = 0;
  const failed = [];

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const result = await downloadOne(id, opts);
    if (result.status === "ok") {
      ok += 1;
      console.log(`[${i + 1}/${ids.length}] ✓ ${id} (${result.bytes}b)`);
    } else if (result.status === "skip") {
      skip += 1;
      console.log(`[${i + 1}/${ids.length}] · ${id} skip`);
    } else {
      fail += 1;
      failed.push(`${id}: ${result.error}`);
      console.warn(`[${i + 1}/${ids.length}] ✗ ${id} ${result.error}`);
    }
    if (opts.delayMs > 0 && i < ids.length - 1 && result.status === "ok") {
      await sleep(opts.delayMs);
    }
  }

  console.log(`完成：ok=${ok} skip=${skip} fail=${fail}`);
  if (failed.length) {
    console.warn("失败列表：");
    for (const line of failed) console.warn(" ", line);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
