// Client-only DOM shell: given a Finding, finds and highlights the live resume field it's about.
// Never import from server code. Mirrors apply-fix.ts's approach of recomputing the pathMap fresh
// on every call (never cached) and re-anchoring matchedText against the *current* live text rather
// than trusting anything computed at review-generation time.

import { projectEditorToReview } from '../resume-data/editor-to-review-adapter.ts';
import type { EditorResumeDocument } from '../resume-data/editor-resume-data';
import type { Finding } from '../resume-review-engine';
import { resolveMatch } from './locate-finding.ts';

export type LocateReason = 'no-target' | 'field-not-mapped' | 'field-not-found';
export type LocateResult =
  | { ok: true; mode: 'text' | 'field' }
  | { ok: false; reason: LocateReason };

const FLASH_CLASS = 'ire-locate-flash';
const FLASH_MS = 900;
const flashTimers = new WeakMap<Element, ReturnType<typeof setTimeout>>();

function flashElements(elements: Element[]) {
  elements.forEach((el) => {
    const existing = flashTimers.get(el);
    if (existing) clearTimeout(existing);
    el.classList.remove(FLASH_CLASS);
    void (el as HTMLElement).offsetWidth; // force reflow so re-adding re-triggers the animation
    el.classList.add(FLASH_CLASS);
    flashTimers.set(
      el,
      setTimeout(() => el.classList.remove(FLASH_CLASS), FLASH_MS),
    );
  });
}

function isTextInput(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
}

function readText(el: Element): string {
  return isTextInput(el) ? el.value : (el.textContent ?? '');
}

function selectTextRange(el: Element, start: number, end: number) {
  if (isTextInput(el)) {
    el.focus({ preventScroll: true });
    el.setSelectionRange(start, end);
    return;
  }
  // contentEditable pagination fragment: text lives in a single Text-node child (see
  // FlowParagraphFragment, which syncs it via `el.textContent = sliceText`).
  const textNode = el.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
  const range = document.createRange();
  range.setStart(textNode, start);
  range.setEnd(textNode, end);
  (el as HTMLElement).focus({ preventScroll: true });
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/** Locates a Finding's field in the live resume canvas, scrolls it into view, and highlights it —
 *  a precise text selection when matchedText still resolves live, otherwise the whole field
 *  (which reads as line-level for a bullet, section-level for a body/desc field). */
export function locateFindingInCanvas(
  finding: Pick<Finding, 'fieldPath' | 'matchedText'>,
  editorData: EditorResumeDocument,
): LocateResult {
  if (!finding.fieldPath) return { ok: false, reason: 'no-target' };

  const { pathMap } = projectEditorToReview(editorData);
  const editorPath = pathMap.get(finding.fieldPath);
  if (!editorPath) return { ok: false, reason: 'field-not-mapped' };

  const elements = Array.from(document.querySelectorAll(`[data-path="${editorPath}"]`));
  if (elements.length === 0) return { ok: false, reason: 'field-not-found' };

  const match = resolveMatch(elements.map(readText), finding.matchedText);
  if (match) {
    const target = elements[match.candidateIndex];
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    selectTextRange(target, match.start, match.end);
    flashElements([target]);
    return { ok: true, mode: 'text' };
  }

  elements[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
  flashElements(elements);
  return { ok: true, mode: 'field' };
}
