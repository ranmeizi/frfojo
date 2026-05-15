/**
 * 与游戏 / libs/grid 一致的「仅滑动合并」，不生成随机新块（用于乐观 UI）。
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Grid } from "./grid";
import { Tile } from "./tile";

export function parseGridCsvText(text: string): number[][] {
  return (
    text
      ?.split(/\r\n/)
      .filter((row) => row)
      .map((row) => row.split(",").map((item) => Number(item))) ?? []
  );
}

export function maxTileInMatrix(grid: number[][]): number {
  let m = 0;
  for (const row of grid) {
    for (const v of row) {
      if (v > m) m = v;
    }
  }
  return m;
}

/** 从 CSV 矩阵构造与 setGrid 相同坐标的 Grid */
export function gridFromNumberMatrix(nums: number[][]) {
  const g = new Grid(4);
  g.eachCell(function (x: number, y: number, tile: unknown) {
    if (tile) g.removeTile(tile);
  });
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const v = nums[y]?.[x];
      if (v) {
        g.insertTile(new Tile({ x, y }, v));
      }
    }
  }
  return g;
}

export function exportGridFromGrid(g: {
  cells: ({ value: number } | null)[][];
}) {
  const out: number[][] = [];
  for (let y = 0; y < 4; y++) {
    const row: number[] = [];
    for (let x = 0; x < 4; x++) {
      const t = g.cells[x][y];
      row.push(t ? t.value : 0);
    }
    out.push(row);
  }
  return out;
}

export function exportGridFromManager(gm: { grid: { cells: unknown[][] } }) {
  return exportGridFromGrid(gm.grid);
}

export function applyMoveWithoutSpawn(nums: number[][], direction: number) {
  const g = gridFromNumberMatrix(nums);
  const result = g.move(direction);
  return {
    board: exportGridFromGrid(g),
    moved: result.moved,
    score: result.score,
  };
}
