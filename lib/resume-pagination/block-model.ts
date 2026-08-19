// Pure types shared by the pagination algorithm (paginate.ts), the line-splitting helper
// (line-split.ts), and the DOM measurement engine (use-pagination-engine.ts, added in a later
// phase). No React/DOM here — these are plain data shapes so the algorithm stays unit-testable.

export type BlockKind = 'atomic' | 'paragraph';

/** One visual line of a paragraph block, as measured via Range.getClientRects(). Offsets are
 *  character indices into the paragraph's full text. */
export interface LineRect {
  top: number;
  height: number;
  startOffset: number;
  endOffset: number;
}

export interface MeasuredBlock {
  /** Reuses the field's own `data-path` string (e.g. "sections.2.entries.0.desc") when the block
   *  is a single field; group blocks with no single path (an entry's head) use a synthetic key
   *  like `${entryPathPrefix}.head`. Must be stable across re-pagination passes. */
  key: string;
  kind: BlockKind;
  /** Float px, unrounded. */
  height: number;
  /** Orphan control: true for section headings and entry heads — such a block must not be
   *  stranded alone at the bottom of a page, separated from at least the start of its content. */
  keepWithNext?: boolean;
  /** Paragraph blocks only: one entry per visual line, in reading order. */
  lines?: LineRect[];
}

export interface PageAssignment {
  blockKey: string;
  pageIndex: number;
  /** Paragraph fragments only: the inclusive/exclusive character range (into the block's full
   *  text) rendered on this page. Absent for atomic blocks and whole (unsplit) paragraphs. */
  startOffset?: number;
  endOffset?: number;
}

export interface PaginationWarning {
  blockKey: string;
  kind: 'oversized-atomic' | 'unstable-layout';
  message: string;
}

export interface PaginationCheckpoint {
  /** Index into the blocks array this checkpoint describes the state *before*. */
  blockIndex: number;
  pageIndex: number;
  remaining: number;
}

export interface PaginationResult {
  pageCount: number;
  assignments: PageAssignment[];
  warnings: PaginationWarning[];
  /** Final checkpoint, i.e. the state after the last block was placed. */
  checkpoint: PaginationCheckpoint;
  /** One checkpoint per block index (the state right before that block was processed) — lets a
   *  caller resume from any block index without re-walking from 0. */
  checkpoints: PaginationCheckpoint[];
}
