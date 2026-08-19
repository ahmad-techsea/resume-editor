// Client-only, best-effort persistence for the page-size preference. There is no backend and no
// resume-identity concept anywhere else in the app today (fetchEditorResume() is an explicit
// stand-in that returns fresh sample/blank data on every load) — this gives page size a stable
// per-browser "current resume" slot to persist against via localStorage, without inventing a
// multi-resume identity system that the rest of the app doesn't have yet.
import { DEFAULT_PAGE_SIZE_ID, isPageSizeId, type PageSizeId } from '@/lib/resume-pagination/page-constants';

const RESUME_ID_KEY = 'ire:resumeId';
const PAGE_SIZE_KEY_PREFIX = 'ire:pageSize:';

/** Probes localStorage with an actual write (not just presence), since some browsers (e.g.
 *  Safari private mode) allow `getItem` but throw on `setItem`. Returns null if unusable for any
 *  reason — missing, disabled, or over quota — so callers can fall back silently. */
function safeLocalStorage(): Storage | null {
  try {
    const probeKey = '__ire_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

let inMemoryResumeId: string | null = null;

function mintResumeId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}

/** Returns a stable id for "the resume currently being edited," minting and persisting one on
 *  first use. Falls back to an in-memory id (stable for the lifetime of the tab, not across
 *  reloads) when localStorage is unavailable, so the feature degrades gracefully instead of
 *  erroring. */
export function getOrCreateResumeId(): string {
  const storage = safeLocalStorage();
  if (!storage) {
    if (!inMemoryResumeId) inMemoryResumeId = mintResumeId();
    return inMemoryResumeId;
  }
  const existing = storage.getItem(RESUME_ID_KEY);
  if (existing) return existing;
  const minted = mintResumeId();
  try {
    storage.setItem(RESUME_ID_KEY, minted);
  } catch {
    // Over quota or otherwise unwritable — proceed with the minted id for this session anyway.
  }
  return minted;
}

/** Missing, invalid, or unreadable values all normalize to A4 — the default for resumes saved
 *  before this feature existed, with no migration required. */
export function normalizePageSize(raw: unknown): PageSizeId {
  return isPageSizeId(raw) ? raw : DEFAULT_PAGE_SIZE_ID;
}

export function loadPageSize(resumeId: string): PageSizeId {
  const storage = safeLocalStorage();
  if (!storage) return DEFAULT_PAGE_SIZE_ID;
  try {
    return normalizePageSize(storage.getItem(PAGE_SIZE_KEY_PREFIX + resumeId));
  } catch {
    return DEFAULT_PAGE_SIZE_ID;
  }
}

export function savePageSize(resumeId: string, pageSizeId: PageSizeId): void {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(PAGE_SIZE_KEY_PREFIX + resumeId, pageSizeId);
  } catch {
    // Quota exceeded or otherwise unwritable — the in-memory Redux value still works for this
    // session, it just won't survive a reload. Not an error condition for the user.
  }
}
