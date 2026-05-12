/**
 * 与 `refer/foot.js` 中 `n_A_JobSearch()` 一致（`n_A_JOB` 为表单职业 id）。
 */
export function legacyJobSearch(formJobId: number): number {
  const n = formJobId;
  if (n <= 6) return n;
  if (n === 20) return 0;
  if (n === 7 || n === 13 || n === 21 || n === 27) return 1;
  if (n === 8 || n === 14 || n === 22 || n === 28) return 2;
  if (n === 9 || n === 15 || n === 23 || n === 29) return 3;
  if (n === 10 || n === 16 || n === 17 || n === 24 || n === 30 || n === 31) return 4;
  if (n === 11 || n === 18 || n === 25 || n === 32) return 5;
  if (n === 12 || n === 19 || n === 26 || n === 33) return 6;
  if (n === 41 || n === 42 || n === 43) return 41;
  return 7;
}
