// Short-lived server-side storage for export payloads (too large/complex to pass as a URL param).
// In-memory is sufficient — this is a normal long-running Node server, not a serverless function,
// so the Map survives for the process lifetime, which is all a short-TTL export token needs.
import type { EditorResumeDocument } from '@/lib/resume-data/editor-resume-data';
import type { MarginsIn } from '@/lib/resume-pagination/page-constants';

export interface ExportPayload {
  document: EditorResumeDocument;
  margins: MarginsIn;
  accent?: string;
}

interface StoredEntry {
  payload: ExportPayload;
  expiresAt: number;
}

const TTL_MS = 60_000;
const store = new Map<string, StoredEntry>();

function sweepExpired(): void {
  const now = Date.now();
  for (const [token, entry] of store) {
    if (entry.expiresAt < now) store.delete(token);
  }
}

export function putExportPayload(token: string, payload: ExportPayload): void {
  sweepExpired();
  store.set(token, { payload, expiresAt: Date.now() + TTL_MS });
}

/** Reads the payload without deleting it — the export client page fetches this once per real
 *  render, but React StrictMode's dev-mode double-invoked effects (mount→cleanup→mount) mean the
 *  *first* fetch can be issued and then abandoned before its response is used, so a strict
 *  one-time-use token would 404 the second (real) fetch. Re-readability within the short TTL is
 *  an acceptable trade-off: the token is an unguessable server-minted UUID exposed only to the
 *  same-origin headless browser instance that requested it, and it still expires within seconds
 *  regardless of how many times it's read. */
export function takeExportPayload(token: string): ExportPayload | null {
  sweepExpired();
  return store.get(token)?.payload ?? null;
}
