'use client';
// The measurement/re-pagination loop. Pure algorithm (paginate.ts) + real DOM measurement +
// React commit, wired through one debounced/rAF'd trigger funnel so every source (content edits,
// page size/margin/zoom changes, container resize, font/image load) collapses into a single
// batched recompute rather than thrashing layout per event.
//
// Termination is a diff, not a pass counter: the pure algorithm converges in one call, so "the
// new assignment equals the last committed one" is what actually stops the loop. The 3-pass cap
// exists only to bound a *different* problem — post-commit heights still settling slightly (a
// remounted block, sub-pixel rounding) — and is a safety backstop, not the primary mechanism.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { paginate } from './paginate';
import type { MeasuredBlock, PageAssignment, PaginationResult, PaginationWarning } from './block-model';
import { EPSILON_PX } from './page-constants';
import { debounce } from '@/lib/async-utils';
import { captureFocus, captureScroll, restoreFocus, restoreScroll } from './focus-preserve';
import { measureLines } from './flow-paragraph-measure';

export interface PgBlockLike {
  key: string;
  kind: 'atomic' | 'paragraph';
  keepWithNext?: boolean;
}

export interface UsePaginationEngineOptions {
  blocks: PgBlockLike[];
  usableHeight: number;
}

export interface PaginationEngineHandle {
  setContainerEl: (el: HTMLDivElement | null) => void;
  assignments: PageAssignment[];
  pageCount: number;
  warnings: PaginationWarning[];
  /** Call after a large paste or other async content injection to force an immediate (still
   *  debounced-collapsed-with-other-triggers) recompute. */
  schedule: () => void;
  /** Composition (IME) lifecycle — defers recompute until composition ends. */
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
}

const MAX_PASSES_PER_BATCH = 3;
const DEBOUNCE_MS = 24;

const emptyResult = (usableHeight: number): PaginationResult => ({
  pageCount: 1,
  assignments: [],
  warnings: [],
  checkpoint: { blockIndex: 0, pageIndex: 0, remaining: usableHeight },
  checkpoints: [],
});

export function usePaginationEngine({
  blocks,
  usableHeight,
}: UsePaginationEngineOptions): PaginationEngineHandle {
  const containerElRef = useRef<HTMLDivElement | null>(null);
  const [result, setResult] = useState<PaginationResult>(() => emptyResult(usableHeight));

  // Kept in sync via useLayoutEffect (not written during render) so runMeasurePass — a stable
  // useCallback — can always read the latest values without itself depending on `blocks`
  // identity. useLayoutEffect (not useEffect) guarantees the sync commits before paint and
  // therefore strictly before any requestAnimationFrame callback that might read it.
  const blocksRef = useRef(blocks);
  const usableHeightRef = useRef(usableHeight);
  useLayoutEffect(() => {
    blocksRef.current = blocks;
    usableHeightRef.current = usableHeight;
  }, [blocks, usableHeight]);
  const lastAssignmentKeyRef = useRef<string>('');
  const passCountRef = useRef(0);
  const composingRef = useRef(false);
  const pendingAfterCompositionRef = useRef(false);

  const setContainerEl = useCallback((el: HTMLDivElement | null) => {
    containerElRef.current = el;
  }, []);

  const runMeasurePass = useCallback(() => {
    const root = containerElRef.current;
    if (!root) return;
    const currentBlocks = blocksRef.current;
    const height = usableHeightRef.current;

    const heightByKey = new Map<string, number>();
    root.querySelectorAll<HTMLElement>('[data-pg-key]').forEach((el) => {
      const key = el.getAttribute('data-pg-key');
      if (key) heightByKey.set(key, el.getBoundingClientRect().height);
    });

    const measured: MeasuredBlock[] = currentBlocks.map((b) => {
      if (b.kind === 'paragraph') {
        const measurerEl = root.querySelector<HTMLElement>(`[data-pg-measurer="${b.key}"]`);
        const lines = measurerEl ? measureLines(measurerEl, measurerEl.textContent ?? '') : [];
        const height = lines.reduce((sum, l) => sum + l.height, 0);
        return { key: b.key, kind: b.kind, height, keepWithNext: b.keepWithNext, lines };
      }
      return {
        key: b.key,
        kind: b.kind,
        height: heightByKey.get(b.key) ?? 0,
        keepWithNext: b.keepWithNext,
      };
    });

    const next = paginate(measured, height, { epsilon: EPSILON_PX });
    const nextKey = JSON.stringify(next.assignments);
    if (nextKey === lastAssignmentKeyRef.current) {
      passCountRef.current = 0;
      return;
    }
    if (passCountRef.current >= MAX_PASSES_PER_BATCH) {
      next.warnings = [
        ...next.warnings,
        {
          blockKey: '__engine__',
          kind: 'unstable-layout',
          message: 'Pagination did not settle within 3 passes; keeping the last consistent layout.',
        },
      ];
      console.warn('[pagination] hit the 3-pass cap; keeping the last consistent layout.');
      passCountRef.current = 0;
      lastAssignmentKeyRef.current = nextKey;
      const captured = captureFocus(root);
      const scrollTop = captureScroll(root);
      setResult(next);
      requestAnimationFrame(() => {
        restoreFocus(root, captured);
        restoreScroll(root, scrollTop);
      });
      return;
    }

    passCountRef.current++;
    lastAssignmentKeyRef.current = nextKey;
    const captured = captureFocus(root);
    const scrollTop = captureScroll(root);
    setResult(next);
    // Restore after the browser has committed the new DOM (next paint), since the block whose
    // focus we captured may now live under a different page container.
    requestAnimationFrame(() => {
      restoreFocus(root, captured);
      restoreScroll(root, scrollTop);
    });
  }, []);

  // Lazily created and only ever (re)assigned inside an effect, never during render — the rAF
  // gap in `schedule()` below guarantees this has been set by the time it's first invoked, since
  // effects from the mount commit always flush before the next animation frame.
  const debouncedRef = useRef<ReturnType<typeof debounce> | null>(null);
  useEffect(() => {
    const d = debounce(runMeasurePass, DEBOUNCE_MS);
    debouncedRef.current = d;
    return () => d.cancel();
  }, [runMeasurePass]);

  const rafRef = useRef<number | null>(null);
  const schedule = useCallback(() => {
    if (composingRef.current) {
      pendingAfterCompositionRef.current = true;
      return;
    }
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      debouncedRef.current?.();
    });
  }, []);

  const onCompositionStart = useCallback(() => {
    composingRef.current = true;
  }, []);
  const onCompositionEnd = useCallback(() => {
    composingRef.current = false;
    if (pendingAfterCompositionRef.current) {
      pendingAfterCompositionRef.current = false;
      schedule();
    }
  }, [schedule]);

  // Recompute whenever the block list (content) or usable page height (size/margin/zoom-derived)
  // changes.
  useLayoutEffect(() => {
    schedule();
  }, [blocks, usableHeight, schedule]);

  // First pass runs as soon as possible, then again once web fonts finish loading (they may not
  // be ready yet on first paint) so the initial layout self-corrects instead of staying wrong.
  // Deliberately mount-only: runMeasurePass/schedule are useCallback(..., []) and so are already
  // referentially stable — listing them would add nothing but does no harm either; omitted only
  // to make the "runs exactly once on mount" intent explicit at the call site.
  useLayoutEffect(() => {
    runMeasurePass();
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => schedule());
      const onLoadingDone = () => schedule();
      document.fonts.addEventListener('loadingdone', onLoadingDone);
      return () => document.fonts.removeEventListener('loadingdone', onLoadingDone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally mount-only, see above
  }, []);

  // Container resize (not just window resize) — catches viewport/panel width changes.
  useEffect(() => {
    const root = containerElRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => schedule());
    observer.observe(root);
    return () => observer.disconnect();
  }, [schedule]);

  return {
    setContainerEl,
    assignments: result.assignments,
    pageCount: result.pageCount,
    warnings: result.warnings,
    schedule,
    onCompositionStart,
    onCompositionEnd,
  };
}
