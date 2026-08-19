// The pagination algorithm: a single deterministic forward walk over measured blocks, assigning
// each to a page. Pure and DOM-free — the caller (use-pagination-engine.ts, a later phase) is
// responsible for measuring real block heights and line-boxes and feeding them in.
//
// Design notes (see the plan for the full rationale):
//  - Lists need no dedicated modeling: "a list breaks between items, never splits one" falls out
//    for free from treating each item as an ordinary atomic block in sequence.
//  - Orphan control is one flag (`keepWithNext`) applied uniformly to section headings and entry
//    heads: such a block is never left alone at the bottom of a page if flushing early (leaving
//    leftover room) would let it start together with at least the next block's first chunk.
//  - A block taller than a full usable page can never fit no matter where a page starts. It is
//    placed alone, allowed to overflow visibly (the renderer uses `overflow: visible`), and
//    raises a warning instead of looping forever trying to make it fit.
//  - Incremental re-pagination: pass `startIndex`/`resumeFrom` (from a previous run's
//    `checkpoints[startIndex]`) to only re-walk from a changed block forward, reusing everything
//    before it without remeasuring or reprocessing.
import type {
  MeasuredBlock,
  PageAssignment,
  PaginationCheckpoint,
  PaginationResult,
  PaginationWarning,
} from './block-model';
import { EPSILON_PX } from './page-constants.ts';
import { splitLines, totalHeight } from './line-split.ts';

export interface PaginateOptions {
  epsilon?: number;
  /** Checkpoint captured before `startIndex` in a previous run of the same block sequence. */
  resumeFrom?: PaginationCheckpoint;
  /** First block index to (re)process; blocks before it are assumed already assigned by the
   *  caller from a previous run and are not touched here. */
  startIndex?: number;
}

function firstChunkHeight(block: MeasuredBlock): number {
  if (block.kind === 'paragraph' && block.lines && block.lines.length > 0) {
    return block.lines[0].height;
  }
  return block.height;
}

export function paginate(
  blocks: MeasuredBlock[],
  usableHeight: number,
  opts: PaginateOptions = {},
): PaginationResult {
  const epsilon = opts.epsilon ?? EPSILON_PX;
  const startIndex = opts.startIndex ?? 0;

  if (blocks.length === 0) {
    return {
      pageCount: 1,
      assignments: [],
      warnings: [],
      checkpoint: { blockIndex: 0, pageIndex: 0, remaining: usableHeight },
      checkpoints: [],
    };
  }

  const assignments: PageAssignment[] = [];
  const warnings: PaginationWarning[] = [];
  const checkpoints: PaginationCheckpoint[] = [];

  let pageIndex = opts.resumeFrom?.pageIndex ?? 0;
  let remaining = opts.resumeFrom?.remaining ?? usableHeight;

  for (let i = startIndex; i < blocks.length; i++) {
    checkpoints[i] = { blockIndex: i, pageIndex, remaining };
    const block = blocks[i];
    const onFreshPage = remaining >= usableHeight - epsilon;

    // Orphan control: don't strand a heading/head alone at the bottom of a page. Only relevant
    // when the page already has content — flushing an already-fresh page can't help and would
    // loop forever if the combined height can never fit on any single page. Also a no-op when
    // the next block is itself oversized (taller than a full page): it will need its own page
    // and overflow regardless of where the heading starts, so pushing the heading forward would
    // only strand it on a wasted blank page without ever achieving "heading + some content."
    if (block.keepWithNext && !onFreshPage && i + 1 < blocks.length) {
      const nextChunk = firstChunkHeight(blocks[i + 1]);
      const nextIsOversized = nextChunk > usableHeight + epsilon;
      const combined = block.height + nextChunk;
      if (!nextIsOversized && combined > remaining + epsilon) {
        pageIndex++;
        remaining = usableHeight;
      }
    }

    if (block.kind === 'paragraph' && block.lines && block.lines.length > 0) {
      const lines = block.lines;
      const total = totalHeight(lines);
      if (total <= remaining + epsilon) {
        assignments.push({
          blockKey: block.key,
          pageIndex,
          startOffset: lines[0].startOffset,
          endOffset: lines[lines.length - 1].endOffset,
        });
        remaining -= total;
        continue;
      }

      // Doesn't fit whole — split into one or more page-fragments at line boundaries.
      let cursor = 0;
      while (cursor < lines.length) {
        const remainingLines = lines.slice(cursor);
        let k = splitLines(remainingLines, remaining, epsilon);
        if (k === 0) {
          const isFreshPage = remaining >= usableHeight - epsilon;
          if (!isFreshPage) {
            // No room at all left on this page — flush and retry the same lines on a full page.
            pageIndex++;
            remaining = usableHeight;
            continue;
          }
          // Even a full empty page can't fit this one line: treat it like an oversized atomic —
          // place it alone, warn, and let it overflow rather than looping or clipping.
          k = 1;
          warnings.push({
            blockKey: block.key,
            kind: 'oversized-atomic',
            message: `A line in "${block.key}" is taller than a full page and was placed alone, overflowing visibly.`,
          });
        }
        const fragmentLines = remainingLines.slice(0, k);
        const oversizedLine = fragmentLines.length === 1 && fragmentLines[0].height > usableHeight + epsilon;
        assignments.push({
          blockKey: block.key,
          pageIndex,
          startOffset: fragmentLines[0].startOffset,
          endOffset: fragmentLines[fragmentLines.length - 1].endOffset,
        });
        remaining = oversizedLine ? 0 : remaining - totalHeight(fragmentLines);
        cursor += k;
        if (cursor < lines.length) {
          pageIndex++;
          remaining = usableHeight;
        }
      }
      continue;
    }

    // Atomic block (or an empty-string paragraph with no lines — treated as atomic by height).
    if (block.height <= remaining + epsilon) {
      assignments.push({ blockKey: block.key, pageIndex });
      remaining -= block.height;
      continue;
    }

    const oversized = block.height > usableHeight + epsilon;
    if (!onFreshPage) {
      pageIndex++;
      remaining = usableHeight;
    }
    assignments.push({ blockKey: block.key, pageIndex });
    if (oversized) {
      warnings.push({
        blockKey: block.key,
        kind: 'oversized-atomic',
        message: `"${block.key}" is taller than a full page and was placed alone, overflowing visibly.`,
      });
      remaining = 0;
    } else {
      remaining -= block.height;
    }
  }

  const finalCheckpoint: PaginationCheckpoint = { blockIndex: blocks.length, pageIndex, remaining };
  return {
    pageCount: Math.max(1, pageIndex + 1),
    assignments,
    warnings,
    checkpoint: finalCheckpoint,
    checkpoints,
  };
}
