import React from 'react';
import type { PageMetrics } from '@/lib/resume-pagination/page-constants';

/** Visual gap between stacked pages, in px. Exported so PaginatedResumeView's zoom-wrapper height
 *  compensation (which must know the stack's natural, unscaled total height) doesn't duplicate
 *  this as a second magic number. */
export const PAGE_GAP_PX = 28;

export interface PageFrameProps {
  pageIndex: number;
  pageCount: number;
  metrics: PageMetrics;
  children: React.ReactNode;
  /** Rendered as a sibling of `.pg-content`, positioned relative to this frame's border box (like
   *  `.pg-content` itself) — used for the margins-drag overlay, whose `top`/`left` offsets are
   *  measured from the frame's edge, matching its own padding values. */
  overlay?: React.ReactNode;
  /** Attached to the frame's own (border-box) element where provided — used to get
   *  getBoundingClientRect() for margin-drag math (any page works since margins are global; the
   *  caller only wires this up for page 0). */
  frameRef?: (el: HTMLDivElement | null) => void;
}

/** One physical page: fixed size, white background, shadow, a gap before the next page (via
 *  margin-bottom), and a decorative "Page X of Y" indicator. All chrome here is aria-hidden,
 *  non-selectable, and hidden in print (`.no-print`, matching the app's existing print
 *  convention) — only `.pg-content`'s children are real resume content. `overflow: visible` on
 *  both the frame and its content box is what lets an oversized unbreakable block spill past a
 *  page's boundary instead of being clipped. */
export default function PageFrame({
  pageIndex,
  pageCount,
  metrics,
  children,
  overlay,
  frameRef,
}: PageFrameProps) {
  return (
    <div
      className="pg-frame"
      data-pg-page-index={pageIndex}
      ref={frameRef}
      style={{
        position: 'relative',
        width: metrics.widthPx,
        height: metrics.heightPx,
        maxWidth: '100%',
        background: '#fff',
        boxShadow: '0 1px 2px rgba(30,27,22,.05),0 16px 40px -18px rgba(30,27,22,.22)',
        marginBottom: PAGE_GAP_PX,
        overflow: 'visible',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="pg-content"
        style={{
          position: 'absolute',
          inset: 0,
          padding: `${metrics.marginsPx.top}px ${metrics.marginsPx.right}px ${metrics.marginsPx.bottom}px ${metrics.marginsPx.left}px`,
          boxSizing: 'border-box',
          overflow: 'visible',
        }}
      >
        {children}
      </div>
      {overlay}
      <div
        className="pg-chrome no-print"
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-20px',
          right: '2px',
          fontSize: '10.5px',
          color: '#9A948A',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        Page {pageIndex + 1} of {pageCount}
      </div>
    </div>
  );
}
