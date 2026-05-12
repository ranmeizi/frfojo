/**
 * 从 refer/foot.js 提取所有 SkillSearch(数字)，更新 LEGACY_GAP_SCAN.md 中
 * <!-- AUTO:SKILLSEARCH_START --> … <!-- AUTO:SKILLSEARCH_END --> 区间。
 *
 * 用法（在 webs/bobo-tool 目录）：
 *   node src/pages/RoCalculator/engine/scripts/extractFootSkillSearch.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const engineDir = path.dirname(__dirname);
const footPath = path.join(engineDir, "../refer/foot.js");
const scanPath = path.join(engineDir, "LEGACY_GAP_SCAN.md");

/** 勿在正文其它处出现相同字符串，否则会被脚本替换掉。 */
const START = "<!-- RO_CALC_GAP:SKILLSEARCH_TABLE_BEGIN -->";
const END = "<!-- RO_CALC_GAP:SKILLSEARCH_TABLE_END -->";

function section(line) {
  if (line >= 1597 && line <= 1880) return "StPlusCalc";
  if (line >= 886 && line <= 1005) return "HIT/FLEE段";
  if (line >= 350 && line <= 900) return "StAllCalc前段(ATK/HP等)";
  if (line >= 1006 && line <= 1600) return "StAllCalc中段";
  if (line >= 1881 && line <= 2262) return "StPlusCalc2后";
  return "其它";
}

function buildAppendixMarkdown() {
  const text = fs.readFileSync(footPath, "utf8");
  const lines = text.split("\n");
  const re = /SkillSearch\s*\(\s*(\d+)\s*\)/g;
  /** @type {{ line: number; id: string; snippet: string }[]} */
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line)) !== null) {
      hits.push({
        line: i + 1,
        id: m[1],
        snippet: line.trim().replace(/\s+/g, " ").slice(0, 140),
      });
    }
  }

  /** @type {Map<string, { line: number; section: string; snippet: string }[]>} */
  const byId = new Map();
  for (const h of hits) {
    const sec = section(h.line);
    const arr = byId.get(h.id) ?? [];
    arr.push({ line: h.line, section: sec, snippet: h.snippet });
    byId.set(h.id, arr);
  }
  const sortedIds = [...byId.keys()].sort((a, b) => Number(a) - Number(b));

  let md = "## 附录 A：`refer/foot.js` 中 `SkillSearch(技能ID)` 出现索引（自动生成）\n\n";
  md +=
    "> 仅扫描 **`refer/foot.js`**（不含 `head.js` 等其它文件中的 `SkillSearch`）。`区块` 为按行号的启发式分区。\n\n";
  md += "| 技能 ID | 出现次数 | 区块（行号） | 代码片段（首行截断） |\n";
  md += "|---------|----------|--------------|------------------------|\n";
  for (const id of sortedIds) {
    const arr = byId.get(id);
    const count = arr.length;
    const regions = [...new Set(arr.map((x) => x.section))].join("；");
    const linesStr = arr.map((x) => x.line).join(", ");
    const snip = arr[0].snippet.replace(/\|/g, "\\|");
    md += `| ${id} | ${count} | ${regions}（L${linesStr}） | \`${snip}\` |\n`;
  }
  return md;
}

function spliceIntoScan(appendixBody) {
  let md = fs.readFileSync(scanPath, "utf8");
  if (!md.includes(START) || !md.includes(END)) {
    throw new Error(
      `${path.basename(scanPath)} 中缺少 ${START} 或 ${END}，请先在本文件附录区加入占位标记。`,
    );
  }
  const i0 = md.indexOf(START);
  const i1 = md.indexOf(END);
  if (i0 === -1 || i1 === -1 || i1 <= i0) throw new Error("标记顺序或内容异常");
  md =
    md.slice(0, i0 + START.length) +
    "\n\n" +
    appendixBody.trim() +
    "\n\n" +
    md.slice(i1);
  fs.writeFileSync(scanPath, md, "utf8");
}

const body = buildAppendixMarkdown();
spliceIntoScan(body);
console.log(`Updated LEGACY_GAP_SCAN.md SkillSearch appendix from ${path.basename(footPath)}.`);
