import test from 'node:test';
import assert from 'node:assert/strict';
import { splitLines, totalHeight } from './line-split.ts';

function mkLines(heights: number[]) {
  let offset = 0;
  return heights.map((height, i) => {
    const startOffset = offset;
    offset += 10; // arbitrary per-line character span
    return { top: i * height, height, startOffset, endOffset: offset };
  });
}

test('splitLines: all lines fit', () => {
  const lines = mkLines([20, 20, 20]);
  assert.equal(splitLines(lines, 100, 0.5), 3);
});

test('splitLines: none fit', () => {
  const lines = mkLines([20, 20, 20]);
  assert.equal(splitLines(lines, 10, 0.5), 0);
});

test('splitLines: partial prefix fits', () => {
  const lines = mkLines([20, 20, 20]);
  assert.equal(splitLines(lines, 45, 0.5), 2);
});

test('splitLines: epsilon lets a line exactly at the boundary count as fitting', () => {
  const lines = mkLines([20, 20]);
  // Second line would end at 40.3, over the 40 available by 0.3 — within the 0.5 epsilon.
  lines[1].height = 20.3;
  assert.equal(splitLines(lines, 40, 0.5), 2);
});

test('splitLines: just over epsilon does not count as fitting', () => {
  const lines = mkLines([20, 20]);
  lines[1].height = 20.6;
  assert.equal(splitLines(lines, 40, 0.5), 1);
});

test('totalHeight: sums line heights', () => {
  assert.equal(totalHeight(mkLines([10, 15, 7.5])), 32.5);
});

test('totalHeight: empty array is zero', () => {
  assert.equal(totalHeight([]), 0);
});
