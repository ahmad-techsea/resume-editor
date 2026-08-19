'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Provider } from 'react-redux';
import { makeStore } from '@/lib/store';
import { editorResumeActions } from '@/lib/store/editor-resume-slice';
import InlineResumeEditor from '@/components/InlineResumeEditor';
import type { EditorResumeDocument } from '@/lib/resume-data/editor-resume-data';
import type { MarginsIn } from '@/lib/resume-pagination/page-constants';

interface ExportPayload {
  document: EditorResumeDocument;
  margins: MarginsIn;
  accent?: string;
}

declare global {
  interface Window {
    __pgExportReady?: boolean;
    /** Injected by the export route via addInitScript — the primary payload handoff. The token
     *  fetch below is only a fallback (dev debugging / opening the URL by hand): on serverless
     *  the in-memory token store may live on a different instance than the one serving the
     *  payload GET. */
    __pgExportPayload?: ExportPayload;
  }
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; accent?: string; margins: MarginsIn }
  | { status: 'error'; message: string };

/** Renders the *same* InlineResumeEditor the user edits in, seeded via a fresh Redux store from
 *  a one-time export payload, so the headless PDF snapshot (app/api/export-pdf/route.ts) is
 *  guaranteed byte-identical in layout to what's on screen — no separate export rendering path to
 *  keep in sync. The existing @media print rules (PrintPageStyle.tsx) already hide all editor
 *  chrome once page.pdf() is called, exactly as they would for a user's own browser print. */
export default function PdfPrintClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [store] = useState(() => makeStore());
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    const injected = window.__pgExportPayload;
    if (injected) {
      store.dispatch(editorResumeActions.resetData({ data: injected.document, nextId: 1_000_000 }));
      setState({ status: 'ready', accent: injected.accent, margins: injected.margins });
      return;
    }
    if (!token) return; // handled by the direct render-time check below, no state needed
    let cancelled = false;
    fetch(`/api/export-pdf/payload?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Export payload not found or already used.');
        return res.json() as Promise<ExportPayload>;
      })
      .then((payload) => {
        if (cancelled) return;
        store.dispatch(editorResumeActions.resetData({ data: payload.document, nextId: 1_000_000 }));
        setState({ status: 'ready', accent: payload.accent, margins: payload.margins });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ status: 'error', message: err instanceof Error ? err.message : String(err) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, store]);

  if (!token && state.status === 'loading' && (typeof window === 'undefined' || !window.__pgExportPayload)) {
    return <div style={{ padding: 24, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>Missing export token.</div>;
  }
  if (state.status === 'error') {
    return <div style={{ padding: 24, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{state.message}</div>;
  }
  if (state.status !== 'ready') return null;

  return (
    <Provider store={store}>
      <InlineResumeEditor
        sampleData={false}
        accent={state.accent}
        initialMargins={state.margins}
        skipInitialFetch
      />
      <ExportReadySignal />
    </Provider>
  );
}

/** Signals window.__pgExportReady once layout has genuinely settled, not after a fixed delay:
 *  waits for web fonts, then polls the rendered page count until it stops changing across a few
 *  consecutive checks (the pagination engine's own multi-pass convergence can take a moment on a
 *  long resume's first render), capped at a safety timeout so a stuck layout doesn't hang the
 *  export forever — the API route also has its own waitForFunction timeout as a second backstop. */
function ExportReadySignal() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof document !== 'undefined' && 'fonts' in document) {
        await document.fonts.ready;
      }
      let lastSignature = '';
      let stableCount = 0;
      const maxIterations = 100; // ~100 * 50ms = 5s safety cap
      for (let i = 0; i < maxIterations && !cancelled; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const pageCount = document.querySelectorAll('.pg-frame').length;
        // fonts.status is part of the signature because fonts.ready above can resolve before
        // layout first *uses* a face (e.g. an @font-face that only starts loading once the
        // template's stack references it) — a late load must reset the stability count so the
        // engine's post-font repagination is what gets snapshotted.
        const signature = `${pageCount}:${document.fonts ? document.fonts.status : 'n/a'}`;
        if (signature === lastSignature && pageCount > 0) {
          stableCount++;
          if (stableCount >= 3) break;
        } else {
          stableCount = 0;
          lastSignature = signature;
        }
      }
      if (!cancelled) window.__pgExportReady = true;
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
