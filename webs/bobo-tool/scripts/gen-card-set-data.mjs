#!/usr/bin/env node
/**
 * 从 refer/js/card.js 解析 w_SC，生成 engine/cardSetData.generated.ts，
 * 与原版 SetCard / n_A_card[16..25] 追加的奖励卡 id 一致。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cardJs = path.join(root, "src/pages/RoCalculator/refer/js/card.js");
const outTs = path.join(root, "src/pages/RoCalculator/engine/cardSetData.generated.ts");

const text = fs.readFileSync(cardJs, "utf8");
const start = text.indexOf("w_SC = [");
if (start === -1) {
  console.error("w_SC = [ not found in card.js");
  process.exit(1);
}
const slice = text.slice(start);
const end = slice.indexOf("];");
if (end === -1) {
  console.error("w_SC closing ]; not found");
  process.exit(1);
}
const arrLiteral = slice.slice(0, end + 2).replace(/^w_SC = /, "");
let w_SC;
try {
  w_SC = new Function(`"use strict"; return ${arrLiteral}`)();
} catch (e) {
  console.error(e);
  process.exit(1);
}

if (!Array.isArray(w_SC)) {
  console.error("w_SC is not an array");
  process.exit(1);
}

const defs = [];
for (let k = 0; k < w_SC.length; k++) {
  const row = w_SC[k];
  const bonusCardId = row[0];
  const required = [];
  for (let j = 1; j < row.length; j++) {
    const v = row[j];
    if (v === "NULL" || v === null || v === undefined) break;
    required.push(v);
  }
  defs.push({ bonusCardId, requiredCardIds: required });
}

const body = `/** 由 scripts/gen-card-set-data.mjs 从 refer/js/card.js 的 w_SC 生成，勿手改。运行：pnpm gen:ro-card-sets */

export type CardSetDef = {
  readonly bonusCardId: number;
  readonly requiredCardIds: readonly number[];
};

export const CARD_SET_DEFINITIONS: readonly CardSetDef[] = [
${defs
  .map(
    (d) =>
      `  { bonusCardId: ${d.bonusCardId}, requiredCardIds: [${d.requiredCardIds.join(", ")}] },`,
  )
  .join("\n")}
] as const;
`;

fs.writeFileSync(outTs, body, "utf8");
console.log(`Wrote ${defs.length} card-set defs → ${path.relative(root, outTs)}`);
