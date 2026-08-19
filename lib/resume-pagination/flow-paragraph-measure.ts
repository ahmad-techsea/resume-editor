// DOM measurement for a paragraph's line boxes, used to decide where a paragraph may split across
// a page break. A single text node's Range.getClientRects() already yields one rect per visual
// line — no per-character walking of the rendered text needed for the height/position half of the
// problem.
//
// Mapping each line rect back to a character-offset range uses a binary search over zero-width
// Range.getClientRects() probes (not caretPositionFromPoint/caretRangeFromPoint): those hit-testing
// APIs only resolve points within the current viewport, but the measurer this runs against is
// deliberately positioned far off-screen (so it never flashes visibly or intercepts clicks) and a
// long paragraph's rendered height can exceed the viewport regardless — so a viewport-relative API
// would silently fail (return null) for most lines. Pure geometry via getClientRects has no such
// constraint: it reflects layout, not what's currently scrolled into view.
import type { LineRect } from './block-model';

function offsetRectTop(textNode: Node, offset: number): number {
  const range = document.createRange();
  range.setStart(textNode, offset);
  range.setEnd(textNode, offset);
  const rects = range.getClientRects();
  // A collapsed (zero-width) range at a valid text offset always has a well-defined bounding
  // rect reflecting where the caret would render, even on lines with no visible glyph rects.
  return rects.length > 0 ? rects[0].top : range.getBoundingClientRect().top;
}

/** Measures the visual line boxes of `text` as rendered inside `measurerEl` (expected to contain
 *  exactly one text node, full width matching where the paragraph is actually displayed). Returns
 *  one LineRect per visual line in reading order. */
export function measureLines(measurerEl: HTMLElement, text: string): LineRect[] {
  if (!text) return [];
  const textNode = measurerEl.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return [];

  const fullRange = document.createRange();
  fullRange.setStart(textNode, 0);
  fullRange.setEnd(textNode, text.length);
  const lineRects = Array.from(fullRange.getClientRects()).filter((r) => r.width > 0 || r.height > 0);
  if (lineRects.length === 0) return [];

  const starts: number[] = [0];
  for (let i = 1; i < lineRects.length; i++) {
    const targetTop = lineRects[i].top;
    let lo = starts[i - 1];
    let hi = text.length;
    // Smallest offset whose caret has reached this line's top — i.e. this line's first character.
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (offsetRectTop(textNode, mid) >= targetTop - 0.5) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    starts.push(lo);
  }

  return lineRects.map((rect, i) => ({
    top: rect.top,
    height: rect.height,
    startOffset: starts[i],
    endOffset: i + 1 < starts.length ? starts[i + 1] : text.length,
  }));
}
