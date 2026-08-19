import type { LineRect } from './block-model';

/** Sum of a run of line heights. */
export function totalHeight(lines: LineRect[]): number {
  return lines.reduce((sum, line) => sum + line.height, 0);
}

/** Largest prefix of `lines` whose cumulative height fits within `availableHeight` (within
 *  `epsilon`, so float rounding can never make a line flip sides on successive passes). Returns
 *  0 if even the first line doesn't fit — the caller decides what that means (flush to a new
 *  page and retry, or — if `availableHeight` was already a full page — treat the line itself as
 *  oversized). Never splits a line itself: the return value is always a whole number of lines. */
export function splitLines(lines: LineRect[], availableHeight: number, epsilon: number): number {
  let consumed = 0;
  let count = 0;
  for (const line of lines) {
    const next = consumed + line.height;
    if (next > availableHeight + epsilon) break;
    consumed = next;
    count++;
  }
  return count;
}
