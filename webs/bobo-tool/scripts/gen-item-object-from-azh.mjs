#!/usr/bin/env node
/**
 * 生成 engine/itemObject.generated.ts。
 *
 * 默认：从 data/a.zh.js 的 m_Item 为主，缺 id 时回退 refer/js/item.js 的 ItemOBJ。
 * 还原：pnpm gen:ro-itemobj:refer（仅 refer，等同合并 a.zh 之前的主表范围）
 *
 * 运行：pnpm gen:ro-itemobj | pnpm gen:ro-itemobj:refer
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const referItem = path.join(root, "src/pages/RoCalculator/refer/js/item.js");
const azhPath = path.join(root, "src/pages/RoCalculator/data/a.zh.js");
const outTs = path.join(root, "src/pages/RoCalculator/engine/itemObject.generated.ts");

function loadBaselineItemObj() {
  const text = fs.readFileSync(referItem, "utf8");
  const start = text.indexOf("ItemOBJ = [");
  const endMatch = text.match(/\];\r?\n\/\/id,/);
  const end = endMatch ? endMatch.index : -1;
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("ItemOBJ array bounds not found in refer/js/item.js");
  }
  const literal = text.slice(start + "ItemOBJ = ".length, end + 2);
  return new Function(`"use strict"; return ${literal}`)();
}

function loadMItemFromAzh() {
  const code = fs.readFileSync(azhPath, "utf8");
  const sandbox = {
    m_Item: undefined,
    /** 与 a.zh.js 中 v_Race[n] 占位一致（下标依常见计算器表），仅用于展开说明文字 */
    v_Race: [
      "无形",
      "不死",
      "动物",
      "昆虫",
      "鱼贝",
      "植物",
      "恶魔",
      "人形",
      "天使",
      "龙",
    ],
    /** v_Element[i]：无/水/地/火/风/毒/圣/暗/念/不死… */
    v_Element: [
      "无",
      "水",
      "地",
      "火",
      "风",
      "毒",
      "圣",
      "暗",
      "念",
      "不死",
    ],
    skillName(id) {
      return `【技能${id}】`;
    },
    SRV: 0,
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "a.zh.js" });
  if (!Array.isArray(sandbox.m_Item)) {
    throw new Error("m_Item is not an array after evaluating a.zh.js");
  }
  return sandbox.m_Item;
}

/** m_Item[5] 常用 "/"，refer ItemOBJ 用 "?"，与旧 foot 习惯一致 */
function normalizeSlotString(v) {
  if (typeof v === "string" && v.includes("/")) return v.replace(/\//g, "?");
  return v;
}

/**
 * m_Item: [8]=名, [9] 常为 0, [10]=说明或 ""; ItemOBJ: [8][9] 双名, [10]=说明或 0, [11]+ 脚本对
 */
function mItemRowToItemObjRow(row) {
  const out = [...row];
  out[5] = normalizeSlotString(out[5]);
  const name = typeof out[8] === "string" ? out[8] : "";
  if (typeof out[9] !== "string" || out[9] === "") {
    out[9] = name;
  }
  if (typeof out[10] === "string" && out[10] === "") {
    out[10] = 0;
  }
  return out;
}

function main() {
  const referOnly = process.argv.includes("--refer-only");
  const baseline = loadBaselineItemObj();

  let merged;
  let maxId;
  let headerLine;
  let logExtra = "";

  if (referOnly) {
    merged = baseline.map((row) => (Array.isArray(row) ? [...row] : row));
    maxId = baseline.length - 1;
    headerLine =
      "/** 由 scripts/gen-item-object-from-azh.mjs 生成：仅 refer/js/item.js 的 ItemOBJ（还原用）。运行：pnpm gen:ro-itemobj:refer */";
    logExtra = " (refer-only)";
  } else {
    const mItem = loadMItemFromAzh();
    const byId = new Map();
    for (const row of mItem) {
      if (!Array.isArray(row) || row.length < 9) continue;
      const id = row[0];
      if (typeof id !== "number" || id < 0) continue;
      byId.set(id, mItemRowToItemObjRow(row));
    }

    maxId = baseline.length - 1;
    for (const id of byId.keys()) {
      if (id > maxId) maxId = id;
    }

    merged = [];
    for (let i = 0; i <= maxId; i++) {
      merged[i] = byId.get(i) ?? baseline[i] ?? [i, 999, 0, 0, 0, 0, 0, 0, `#${i}`, `#${i}`, 0, 0];
    }
    headerLine =
      "/** 由 scripts/gen-item-object-from-azh.mjs 生成：以 data/a.zh.js 的 m_Item 为主，缺 id 时回退 refer/js/item.js。运行：pnpm gen:ro-itemobj */";
    logExtra = ` (${byId.size} ids from a.zh.js)`;
  }

  const serialized = JSON.stringify(merged);
  const body = `/* eslint-disable */
${headerLine}
export const ITEM_OBJ = ${serialized} as readonly (readonly (string|number)[])[];
export const ITEM_MAX = ${maxId};
`;

  fs.writeFileSync(outTs, body, "utf8");
  console.log(`Wrote ITEM_MAX=${maxId}${logExtra} → ${path.relative(root, outTs)}`);
}

main();
