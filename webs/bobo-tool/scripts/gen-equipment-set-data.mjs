#!/usr/bin/env node
/**
 * 从 refer/item.js 解析 w_SE，生成 engine/equipmentSetData.generated.ts，
 * 与原版 SetEquip / ItemOBJ 尾部写入的 (90, 行号) 下标一致。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const itemJs = path.join(root, "src/pages/RoCalculator/refer/item.js");
const outTs = path.join(root, "src/pages/RoCalculator/engine/equipmentSetData.generated.ts");

const text = fs.readFileSync(itemJs, "utf8");
const start = text.indexOf("w_SE = [");
if (start === -1) {
  console.error("w_SE = [ not found in item.js");
  process.exit(1);
}
const slice = text.slice(start);
const end = slice.indexOf("];");
if (end === -1) {
  console.error("w_SE closing ]; not found");
  process.exit(1);
}
const arrLiteral = slice.slice(0, end + 2).replace(/^w_SE = /, "");
let w_SE;
try {
  w_SE = new Function(`"use strict"; return ${arrLiteral}`)();
} catch (e) {
  console.error(e);
  process.exit(1);
}

if (!Array.isArray(w_SE)) {
  console.error("w_SE is not an array");
  process.exit(1);
}

const defs = [];
for (let k = 0; k < w_SE.length; k++) {
  const row = w_SE[k];
  const bonusItemId = row[0];
  const required = [];
  for (let j = 1; j < row.length; j++) {
    const v = row[j];
    if (v === "NULL" || v === null || v === undefined) break;
    required.push(v);
  }
  defs.push({ bonusItemId, requiredItemIds: required });
}

const body = `/** 由 scripts/gen-equipment-set-data.mjs 从 refer/item.js 的 w_SE 生成，勿手改。运行：pnpm gen:ro-sets */

export type EquipmentSetDef = {
  readonly bonusItemId: number;
  readonly requiredItemIds: readonly number[];
};

export const EQUIPMENT_SET_DEFINITIONS: readonly EquipmentSetDef[] = [
${defs
  .map(
    (d) =>
      `  { bonusItemId: ${d.bonusItemId}, requiredItemIds: [${d.requiredItemIds.join(", ")}] },`,
  )
  .join("\n")}
] as const;
`;

fs.writeFileSync(outTs, body, "utf8");
console.log(`Wrote ${defs.length} set defs → ${path.relative(root, outTs)}`);
