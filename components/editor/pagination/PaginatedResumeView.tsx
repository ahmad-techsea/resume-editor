'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { PgBlockSpec } from './block-spec';
import { usePaginationEngine } from '@/lib/resume-pagination/use-pagination-engine';
import { groupAssignmentsByPage } from '@/lib/resume-pagination/group-by-page';
import {
  getPageMetrics,
  type PageSizeId,
  type MarginsIn,
} from '@/lib/resume-pagination/page-constants';
import type { PageAssignment } from '@/lib/resume-pagination/block-model';
import PageFrame, { PAGE_GAP_PX } from './PageFrame';
import PrintPageStyle from './PrintPageStyle';

export interface PaginatedResumeViewProps {
  blocks: PgBlockSpec[];
  pageSize: PageSizeId;
  margins: MarginsIn;
  /** 0.5–1.5. Purely a visual CSS transform — pagination math always uses the unscaled page
   *  dimensions, so zoom can never change page count or content distribution. */
  zoom?: number;
  mode?: 'edit' | 'export';
  fontFamily?: string;
  /** Rendered on every page (margins are global, not per-page) — used for the margins-drag
   *  overlay. */
  pageOverlay?: React.ReactNode;
  /** Ref to page 0's frame element, for margin-drag rect math. */
  firstPageFrameRef?: (el: HTMLDivElement | null) => void;
  /** Fires whenever the settled block→page assignments change. The DOCX export mirrors the
   *  on-screen page breaks from these — nothing else exposes them outside this component. */
  onPaginationChange?: (info: { assignments: PageAssignment[]; pageCount: number }) => void;
}

/** Renders the resume as a stack of discrete physical pages that repaginate in real time. This
 *  component owns no content — it's purely presentational over `blocks` (built by the caller from
 *  the single Redux source of truth) and is intentionally Redux-agnostic so the identical
 *  component can render standalone in the headless PDF export route later. */
export default function PaginatedResumeView({
  blocks,
  pageSize,
  margins,
  zoom = 1,
  mode = 'edit',
  fontFamily,
  pageOverlay,
  firstPageFrameRef,
  onPaginationChange,
}: PaginatedResumeViewProps) {
  const metrics = getPageMetrics(pageSize, margins);
  const { setContainerEl, assignments, pageCount, warnings, onCompositionStart, onCompositionEnd } =
    usePaginationEngine({
      blocks: blocks.map((b) => ({ key: b.key, kind: b.kind, keepWithNext: b.keepWithNext })),
      usableHeight: metrics.contentHeightPx,
    });
  const pages = groupAssignmentsByPage(blocks, assignments, pageCount);

  const onPaginationChangeRef = useRef(onPaginationChange);
  onPaginationChangeRef.current = onPaginationChange;
  useEffect(() => {
    onPaginationChangeRef.current?.({ assignments, pageCount });
  }, [assignments, pageCount]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const warnSig = (w: (typeof warnings)[number]) => `${w.blockKey}:${w.kind}:${w.message}`;
  const visibleWarnings = warnings.filter((w) => !dismissed.has(warnSig(w)));

  // Responsive scale-down on narrow viewports: a CSS transform on this wrapper only, computed
  // from the *container's* available width — pagination math above never reads this value, so
  // resizing/zooming can change how big pages look but never how many there are or what's on
  // them. autoFit only ever shrinks (never magnifies past 100%); the user's manual zoom composes
  // multiplicatively on top of it.
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const el = outerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const autoFit = containerWidth > 0 ? Math.min(1, containerWidth / metrics.widthPx) : 1;
  const finalScale = zoom * autoFit;
  // The wrapper's *unscaled* natural height, computed from known page metrics rather than
  // measured — transform:scale doesn't shrink an element's contribution to normal-flow layout, so
  // without compensating the outer container would keep a tall blank gap below the visually
  // shrunk stack.
  const naturalStackHeight = pageCount * metrics.heightPx + Math.max(0, pageCount - 1) * PAGE_GAP_PX;

  return (
    <div className="pg-stack-outer" style={{ position: 'relative' }} ref={outerRef}>
      <PrintPageStyle metrics={metrics} />
      <div
        className="pg-zoom-wrapper"
        style={{
          transform: `scale(${finalScale})`,
          transformOrigin: 'top center',
          // Only compensate when actually scaled down: at finalScale===1 (always true for
          // print/export, which never zooms) the wrapper's natural auto height already exactly
          // matches its content — including print CSS zeroing the inter-page gap, which this
          // fixed pixel formula doesn't know about. Setting an explicit height here unconditionally
          // once caused a phantom blank page in print: the gap this formula assumes is still
          // screen-only, so the export's real content fell 28px short of the height we claimed,
          // and the browser's print engine allocated a whole extra sheet for that leftover sliver.
          height: mode === 'edit' && finalScale < 1 ? `${naturalStackHeight * finalScale}px` : undefined,
        }}
      >
        <div ref={setContainerEl} className="pg-stack" style={{ fontFamily }}>
          {/* Hidden, full-text, full-width measurers for every splittable paragraph — kept
              separate from the visible (possibly fragmented) rendering below so the engine always
              has one stable place to measure a paragraph's complete line-box layout from,
              regardless of how many page-fragments it currently renders as. Not resume content:
              aria-hidden and excluded from the tab order via the browser's native handling of
              visibility:hidden. */}
          <div
            aria-hidden="true"
            className="pg-measurers"
            style={{ position: 'absolute', top: '-99999px', left: 0, width: `${metrics.contentWidthPx}px` }}
          >
            {blocks
              .filter((b) => b.kind === 'paragraph' && b.paragraph)
              .map((b) => (
                <React.Fragment key={b.key}>{b.paragraph!.measurerNode}</React.Fragment>
              ))}
          </div>
          {pages.map((pageFragments, pageIndex) => (
            <PageFrame
              key={pageIndex}
              pageIndex={pageIndex}
              pageCount={pageCount}
              metrics={metrics}
              overlay={mode === 'edit' ? pageOverlay : undefined}
              frameRef={pageIndex === 0 ? firstPageFrameRef : undefined}
            >
              {pageFragments.map((f) =>
                f.block.kind === 'paragraph' && f.block.paragraph ? (
                  <div
                    key={f.fragmentKey}
                    data-pg-keep-with-next={f.block.keepWithNext ? 'true' : undefined}
                    onCompositionStart={onCompositionStart}
                    onCompositionEnd={onCompositionEnd}
                  >
                    {f.block.paragraph.renderFragment({
                      startOffset: f.startOffset ?? 0,
                      endOffset: f.endOffset ?? f.block.paragraph.fullText.length,
                      fragmentIndex: f.fragmentIndex,
                      fragmentCount: f.fragmentCount,
                    })}
                  </div>
                ) : (
                  <div
                    key={f.fragmentKey}
                    data-pg-key={f.fragmentKey}
                    data-pg-atomic="true"
                    data-pg-keep-with-next={f.block.keepWithNext ? 'true' : undefined}
                    onCompositionStart={onCompositionStart}
                    onCompositionEnd={onCompositionEnd}
                  >
                    {f.block.node}
                  </div>
                ),
              )}
            </PageFrame>
          ))}
        </div>
      </div>

      {mode === 'edit' && (
        <div
          className="pg-total-badge no-print"
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: '12px',
            // right is set in styles/inline-resume-editor.css, not here — it depends on the
            // Settings drawer's current collapsed/open extent (see .ire's --settings-extent) and
            // needs its own responsive breakpoints, which are awkward to express as a JS style.
            zIndex: 5,
            padding: '4px 10px',
            borderRadius: '999px',
            background: 'rgba(38,35,31,.78)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 600,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </div>
      )}

      {visibleWarnings.length > 0 && mode === 'edit' && (
        <div
          className="pg-warning-banner no-print"
          role="status"
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 6,
            width: `${metrics.widthPx}px`,
            maxWidth: 'calc(100vw - 32px)',
            padding: '9px 14px',
            borderRadius: '8px',
            background: '#FFF6E9',
            border: '1px solid #F0D9A8',
            color: '#7A5B1E',
            fontSize: '12px',
            lineHeight: 1.5,
            boxShadow: '0 8px 24px -8px rgba(30,27,22,.35)',
          }}
        >
          {visibleWarnings.map((w, i) => (
            <div
              key={i}
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}
            >
              <span>{w.message}</span>
              <button
                type="button"
                aria-label="Dismiss warning"
                onClick={() => setDismissed((prev) => new Set(prev).add(warnSig(w)))}
                style={{
                  flex: 'none',
                  border: 0,
                  background: 'none',
                  color: '#7A5B1E',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: '0 0 0 4px',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
