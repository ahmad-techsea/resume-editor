// Groups an ordered block list into per-page buckets given the pure algorithm's raw assignments.
// Pure and DOM-free so it's unit-testable independent of the measurement engine.
//
// Most blocks are atomic and get exactly one PageAssignment. A split paragraph gets one
// PageAssignment per page it spans (same blockKey, different pageIndex/startOffset/endOffset) —
// those expand into one RenderedFragment per page here, each with a unique fragmentKey so React
// (and the DOM data-pg-key each fragment carries) can tell them apart.
//
// A block with no assignment yet (e.g. one just added by the user, before the next measure pass
// has run) inherits whatever page its predecessor in the flat list is on, rather than defaulting
// to page 0 — this avoids a visible jump to the top of the document for new content that's
// actually being added deep into a multi-page resume. The very first block defaults to page 0.
import type { PageAssignment } from './block-model';

export interface PageGroupableBlock {
  key: string;
}

export interface RenderedFragment<T> {
  pageIndex: number;
  fragmentKey: string;
  block: T;
  startOffset?: number;
  endOffset?: number;
  fragmentIndex: number;
  fragmentCount: number;
}

export function groupAssignmentsByPage<T extends PageGroupableBlock>(
  blocks: T[],
  assignments: PageAssignment[],
  pageCount: number,
): RenderedFragment<T>[][] {
  const byKey = new Map<string, PageAssignment[]>();
  for (const a of assignments) {
    const list = byKey.get(a.blockKey);
    if (list) list.push(a);
    else byKey.set(a.blockKey, [a]);
  }

  const pages: RenderedFragment<T>[][] = Array.from({ length: Math.max(1, pageCount) }, () => []);
  let currentPage = 0;

  for (const block of blocks) {
    const own = byKey.get(block.key);
    if (!own || own.length === 0) {
      const page = currentPage;
      pages[page].push({
        pageIndex: page,
        fragmentKey: block.key,
        block,
        fragmentIndex: 0,
        fragmentCount: 1,
      });
      continue;
    }
    own.forEach((a, i) => {
      currentPage = a.pageIndex;
      const bucket = pages[a.pageIndex] ?? (pages[a.pageIndex] = []);
      bucket.push({
        pageIndex: a.pageIndex,
        fragmentKey: own.length > 1 ? `${block.key}#${i}` : block.key,
        block,
        startOffset: a.startOffset,
        endOffset: a.endOffset,
        fragmentIndex: i,
        fragmentCount: own.length,
      });
    });
  }
  return pages;
}
