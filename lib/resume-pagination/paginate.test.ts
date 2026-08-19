import test from 'node:test';
import assert from 'node:assert/strict';
import { paginate } from './paginate.ts';
import type { MeasuredBlock, LineRect } from './block-model.ts';

const USABLE = 1000;

function atomic(key: string, height: number, keepWithNext = false): MeasuredBlock {
  return { key, kind: 'atomic', height, keepWithNext };
}

function mkLines(heights: number[]): LineRect[] {
  let offset = 0;
  return heights.map((height, i) => {
    const startOffset = offset;
    offset += 10;
    return { top: i * height, height, startOffset, endOffset: offset };
  });
}

function paragraph(key: string, lineHeights: number[]): MeasuredBlock {
  return { key, kind: 'paragraph', height: lineHeights.reduce((a, b) => a + b, 0), lines: mkLines(lineHeights) };
}

test('empty document: exactly one page, no assignments', () => {
  const result = paginate([], USABLE);
  assert.equal(result.pageCount, 1);
  assert.deepEqual(result.assignments, []);
  assert.deepEqual(result.warnings, []);
});

test('single small block: one page', () => {
  const result = paginate([atomic('a', 100)], USABLE);
  assert.equal(result.pageCount, 1);
  assert.deepEqual(result.assignments, [{ blockKey: 'a', pageIndex: 0 }]);
});

test('blocks that all fit stay on page 0', () => {
  const blocks = [atomic('a', 300), atomic('b', 300), atomic('c', 300)];
  const result = paginate(blocks, USABLE);
  assert.equal(result.pageCount, 1);
  assert.ok(result.assignments.every((a) => a.pageIndex === 0));
});

test('overflow pushes the excess block to page 1', () => {
  const blocks = [atomic('a', 700), atomic('b', 700)];
  const result = paginate(blocks, USABLE);
  assert.equal(result.pageCount, 2);
  assert.equal(result.assignments.find((a) => a.blockKey === 'a')!.pageIndex, 0);
  assert.equal(result.assignments.find((a) => a.blockKey === 'b')!.pageIndex, 1);
});

test('orphan control: a heading with too little room for its content is pushed to the next page', () => {
  // 950 used, 50 left; heading (30) + next block's first chunk (40) = 70 > 50 remaining.
  const blocks = [atomic('filler', 950), atomic('heading', 30, true), atomic('body', 200)];
  const result = paginate(blocks, USABLE);
  const heading = result.assignments.find((a) => a.blockKey === 'heading')!;
  const body = result.assignments.find((a) => a.blockKey === 'body')!;
  assert.equal(heading.pageIndex, 1, 'heading should be pushed forward rather than stranded');
  assert.equal(heading.pageIndex, body.pageIndex, 'heading stays together with its content');
});

test('orphan control does not strand a heading when the next block is itself oversized', () => {
  // Pushing the heading forward can't achieve "heading + some content" here — the entry is
  // taller than a full page and will overflow onto its own page regardless of where the heading
  // starts, so the heading should stay put rather than waste a blank page.
  const blocks = [atomic('filler', 700), atomic('heading', 30, true), atomic('huge', USABLE * 3)];
  const result = paginate(blocks, USABLE);
  const filler = result.assignments.find((a) => a.blockKey === 'filler')!;
  const heading = result.assignments.find((a) => a.blockKey === 'heading')!;
  const huge = result.assignments.find((a) => a.blockKey === 'huge')!;
  assert.equal(heading.pageIndex, filler.pageIndex, 'heading stays on the page with room, not pushed to a blank one');
  assert.equal(huge.pageIndex, heading.pageIndex + 1, 'the oversized block still gets its own page');
});

test('orphan control never fires when the heading already starts a fresh page', () => {
  // Heading + next chunk together exceed a full page — flushing again would loop forever, so the
  // heading must simply render (and overflow/split) starting right where it is.
  const blocks = [atomic('heading', 30, true), atomic('body', USABLE + 500)];
  const result = paginate(blocks, USABLE);
  const heading = result.assignments.find((a) => a.blockKey === 'heading')!;
  assert.equal(heading.pageIndex, 0);
});

test('oversized atomic block: placed alone, overflows, warns', () => {
  const blocks = [atomic('a', 300), atomic('huge', USABLE * 2), atomic('b', 300)];
  const result = paginate(blocks, USABLE);
  const huge = result.assignments.find((a) => a.blockKey === 'huge')!;
  const a = result.assignments.find((a) => a.blockKey === 'a')!;
  const b = result.assignments.find((a) => a.blockKey === 'b')!;
  assert.equal(huge.pageIndex, a.pageIndex + 1, 'oversized block gets its own fresh page');
  assert.equal(b.pageIndex, huge.pageIndex + 1, 'the block after it also starts a fresh page');
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].kind, 'oversized-atomic');
  assert.equal(result.warnings[0].blockKey, 'huge');
});

test('oversized single line inside a paragraph: placed alone, overflows, warns', () => {
  const blocks = [paragraph('p', [USABLE + 200])];
  const result = paginate(blocks, USABLE);
  assert.equal(result.assignments.length, 1);
  assert.equal(result.assignments[0].pageIndex, 0);
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].kind, 'oversized-atomic');
});

test('paragraph splits across 3+ pages at line boundaries', () => {
  // 12 lines of 100 each on a 1000-high page: page 0 fits 10, leaving 2 for page 1.
  const blocks = [paragraph('p', Array(12).fill(100))];
  const result = paginate(blocks, USABLE);
  assert.ok(result.pageCount >= 2);
  const fragments = result.assignments.filter((a) => a.blockKey === 'p');
  assert.ok(fragments.length >= 2, 'paragraph produced multiple page fragments');
  // Fragments partition the text with no overlap and no gap.
  const sorted = [...fragments].sort((x, y) => x.pageIndex - y.pageIndex);
  for (let i = 1; i < sorted.length; i++) {
    assert.equal(sorted[i].startOffset, sorted[i - 1].endOffset, 'fragments are contiguous, nothing duplicated or skipped');
  }
  assert.equal(sorted[0].startOffset, 0);
  assert.equal(sorted[sorted.length - 1].endOffset, 120);
});

test('paragraph split never breaks a line in half: every fragment boundary is a line boundary', () => {
  const lineHeights = [40, 40, 40, 40, 40];
  const blocks = [atomic('filler', 850), paragraph('p', lineHeights)];
  const result = paginate(blocks, USABLE);
  const fragments = result.assignments.filter((a) => a.blockKey === 'p');
  const lines = mkLines(lineHeights);
  const validOffsets = new Set<number>([0, ...lines.map((l) => l.endOffset)]);
  for (const f of fragments) {
    assert.ok(validOffsets.has(f.startOffset!), `startOffset ${f.startOffset} must land on a line boundary`);
    assert.ok(validOffsets.has(f.endOffset!), `endOffset ${f.endOffset} must land on a line boundary`);
  }
});

test('epsilon boundary: a block 0.3px over remaining height still counts as fitting', () => {
  const blocks = [atomic('a', 999.7), atomic('b', 0.3 + 0.2)];
  const result = paginate(blocks, 1000, { epsilon: 0.5 });
  // a leaves 0.3 remaining; b is 0.5 tall, 0.2 over — within epsilon, should still fit on page 0.
  assert.equal(result.assignments.find((x) => x.blockKey === 'b')!.pageIndex, 0);
});

test('epsilon boundary: a block clearly over remaining height (beyond epsilon) moves to the next page', () => {
  const blocks = [atomic('a', 999), atomic('b', 5)];
  const result = paginate(blocks, 1000, { epsilon: 0.5 });
  assert.equal(result.assignments.find((x) => x.blockKey === 'b')!.pageIndex, 1);
});

test('incremental resume from a checkpoint matches a full walk', () => {
  const blocks = [
    atomic('a', 400),
    atomic('b', 400),
    atomic('c', 400),
    atomic('d', 400),
    atomic('e', 400),
  ];
  const full = paginate(blocks, USABLE);
  const resumeIndex = 3;
  const partial = paginate(blocks, USABLE, {
    startIndex: resumeIndex,
    resumeFrom: full.checkpoints[resumeIndex],
  });
  const merged = [...full.assignments.filter((a) => blocks.findIndex((b) => b.key === a.blockKey) < resumeIndex), ...partial.assignments];
  const byKeyFull = new Map(full.assignments.map((a) => [a.blockKey, a.pageIndex]));
  const byKeyMerged = new Map(merged.map((a) => [a.blockKey, a.pageIndex]));
  for (const [key, pageIndex] of byKeyFull) {
    assert.equal(byKeyMerged.get(key), pageIndex, `block ${key} should land on the same page`);
  }
  assert.equal(partial.pageCount, full.pageCount);
});

test('a document with only one small block never produces a runaway page stack', () => {
  const result = paginate([atomic('only', 10)], USABLE);
  assert.equal(result.pageCount, 1);
});
