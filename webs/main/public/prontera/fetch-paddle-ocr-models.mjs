#!/usr/bin/env node
/**
 * 下载浏览器端 PaddleOCR（ppu）用的 PP-OCRv4 mobile 模型到本目录：
 *   paddle-ocr-models/
 *
 * 用法：
 *   node fetch-paddle-ocr-models.mjs
 *   node fetch-paddle-ocr-models.mjs --force
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "paddle-ocr-models");
const force = process.argv.includes("--force");

const MIRRORS = [
  "https://hf-mirror.com/snowfluke/ppu-paddle-ocr-models/resolve/main",
  "https://huggingface.co/snowfluke/ppu-paddle-ocr-models/resolve/main",
];

const FILES = [
  {
    remote: "detection/PP-OCRv4_mobile_det_infer.onnx",
    local: "PP-OCRv4_mobile_det.onnx",
  },
  {
    remote: "recognition/PP-OCRv4_mobile_rec_infer.onnx",
    local: "PP-OCRv4_mobile_rec.onnx",
  },
  {
    remote: "recognition/ppocrv4_dict.txt",
    local: "ppocrv4_dict.txt",
  },
];

async function download(url, dest) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "frfojo-paddle-ocr-fetch/1.0",
      Accept: "*/*",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100) throw new Error(`file too small (${buf.length}b)`);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const file of FILES) {
    const dest = path.join(outDir, file.local);
    if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 100) {
      console.log(`· skip ${file.local}`);
      continue;
    }
    let lastErr = null;
    for (const base of MIRRORS) {
      const url = `${base}/${file.remote}`;
      try {
        console.log(`↓ ${file.local} <- ${base}`);
        const bytes = await download(url, dest);
        console.log(`✓ ${file.local} (${bytes} bytes)`);
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        console.warn(`  fail: ${err instanceof Error ? err.message : err}`);
      }
    }
    if (lastErr) throw lastErr;
  }
  console.log(`完成 → ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
