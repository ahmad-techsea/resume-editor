// Computes what "Apply fix" should do to the live editor data for a given review Finding, without
// ever touching Redux/React itself — the caller dispatches the returned action through the same
// editorResumeActions.setPath/removeAtPath reducers the user's own typing already uses.
//
// Pure and side-effect free: never mutates editorData, never caches anything across calls. The
// editor's sections can be added, removed, or reordered between when a review was generated and
// when a fix is applied, so the field-path mapping is recomputed fresh on every call.

import { resolveDotPath } from '../dot-path.ts';
import type { EditorResumeDocument } from '../resume-data/editor-resume-data';
import { projectEditorToReview } from '../resume-data/editor-to-review-adapter.ts';
import type { Finding } from '../resume-review-engine';

export type ApplyFixAction =
  | { kind: 'setPath'; path: string; value: string }
  | { kind: 'removeAtPath'; listPath: string; index: number };

export type ApplyFixFailureReason =
  | 'no-suggestion'
  | 'field-not-mapped'
  | 'field-not-found'
  | 'text-changed';

export type ApplyFixResult =
  | { ok: true; action: ApplyFixAction }
  | { ok: false; reason: ApplyFixFailureReason };

/** `resolveDotPath` walks with plain `o[k]` and throws if an intermediate segment is missing
 *  (e.g. the section at that index was deleted) — never let that escape as an uncaught exception. */
function safeResolve(obj: any, path: string): { found: true; value: any } | { found: false } {
  try {
    return { found: true, value: resolveDotPath(obj, path) };
  } catch {
    return { found: false };
  }
}

function splitParent(path: string): { parentPath: string; lastSegment: string } {
  const i = path.lastIndexOf('.');
  return { parentPath: path.slice(0, i), lastSegment: path.slice(i + 1) };
}

export function computeApplyFixResult(
  finding: Pick<Finding, 'fieldPath' | 'matchedText' | 'suggestion' | 'grouped'>,
  editorData: EditorResumeDocument,
): ApplyFixResult {
  if (finding.grouped) return { ok: false, reason: 'no-suggestion' };
  if (finding.suggestion == null) return { ok: false, reason: 'no-suggestion' };
  if (!finding.fieldPath || !finding.matchedText) return { ok: false, reason: 'field-not-found' };

  const { pathMap } = projectEditorToReview(editorData);
  const editorPath = pathMap.get(finding.fieldPath);
  if (!editorPath) return { ok: false, reason: 'field-not-mapped' };

  const current = safeResolve(editorData, editorPath);
  if (!current.found || typeof current.value !== 'string') {
    return { ok: false, reason: 'field-not-found' };
  }
  const currentValue: string = current.value;

  const { parentPath, lastSegment } = splitParent(editorPath);
  const parent = parentPath ? safeResolve(editorData, parentPath) : { found: false as const };
  const isArrayElement =
    parent.found && Array.isArray(parent.value) && /^\d+$/.test(lastSegment);

  // A "delete this" fix (suggestion === '') on a whole array element (e.g. a duplicate bullet)
  // removes the element outright, rather than leaving a blank string sitting in the array.
  if (isArrayElement && finding.suggestion === '' && currentValue === finding.matchedText) {
    return {
      ok: true,
      action: { kind: 'removeAtPath', listPath: parentPath, index: Number(lastSegment) },
    };
  }

  const matchIndex = currentValue.indexOf(finding.matchedText);
  if (matchIndex < 0) return { ok: false, reason: 'text-changed' };

  const value =
    currentValue.slice(0, matchIndex) +
    finding.suggestion +
    currentValue.slice(matchIndex + finding.matchedText.length);
  return { ok: true, action: { kind: 'setPath', path: editorPath, value } };
}
