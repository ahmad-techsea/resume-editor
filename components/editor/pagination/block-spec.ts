import type { ReactNode } from 'react';
import type { BlockKind } from '@/lib/resume-pagination/block-model';

export interface ParagraphFragmentInfo {
  startOffset: number;
  endOffset: number;
  fragmentIndex: number;
  fragmentCount: number;
}

export interface ParagraphBlockData {
  fullText: string;
  /** Hidden, full-text, full-width element the engine measures for line boxes — kept separate
   *  from the visible (possibly split-into-fragments) rendering; see PaginatedResumeView's
   *  measurers container. */
  measurerNode: ReactNode;
  /** Produces the visible, editable node for one page's slice of the paragraph. Called once per
   *  page the paragraph currently spans. */
  renderFragment: (fragment: ParagraphFragmentInfo) => ReactNode;
}

/** A single pagination-flow unit: a rendered React node plus the metadata the engine needs to
 *  measure and place it. `kind: 'paragraph'` blocks can additionally be split across pages at a
 *  line boundary (see `paragraph`); everything else is atomic — it moves to the next page as a
 *  whole and is rendered via `node`. */
export interface PgBlockSpec {
  key: string;
  kind: BlockKind;
  keepWithNext?: boolean;
  node?: ReactNode;
  paragraph?: ParagraphBlockData;
}

export function atomicBlock(key: string, node: ReactNode, keepWithNext = false): PgBlockSpec {
  return { key, kind: 'atomic', keepWithNext, node };
}

/** Wraps a block's rendered content — e.g. to inject section-level hover controls, or the
 *  30px inter-section spacing that used to live on a shared wrapper. Kind-aware: an atomic
 *  block's `node` is wrapped directly; a paragraph block has no single `node` (it renders via
 *  `paragraph.renderFragment`, once per page it currently spans), so the wrap is applied only to
 *  the first page's fragment — exactly where a heading or chrome would visually belong. */
export function decorateBlock(block: PgBlockSpec, wrap: (node: ReactNode) => ReactNode): PgBlockSpec {
  if (block.kind === 'paragraph' && block.paragraph) {
    const original = block.paragraph.renderFragment;
    return {
      ...block,
      paragraph: {
        ...block.paragraph,
        renderFragment: (fragment) =>
          fragment.fragmentIndex === 0 ? wrap(original(fragment)) : original(fragment),
      },
    };
  }
  return { ...block, node: wrap(block.node) };
}
