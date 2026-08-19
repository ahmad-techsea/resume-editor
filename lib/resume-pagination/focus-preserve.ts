// Capture/restore focus + selection + scroll around a re-pagination commit. Needed for every
// editable block, not just paragraphs: moving a block from one page's container to another's is a
// cross-parent React move, which unmounts+remounts the DOM node even with a stable `key` — a
// focused <input> pushed to the next page mid-edit would lose focus without this.

export interface CapturedFocus {
  blockKey: string;
  selectionStart: number | null;
  selectionEnd: number | null;
  /** contentEditable elements (FlowParagraph, added in a later phase) don't have
   *  selectionStart/End — they use a Range-based text offset instead. */
  rangeOffset: number | null;
}

function findFocusableRoot(el: Element | null): { blockKey: string; el: HTMLElement } | null {
  let node: Element | null = el;
  while (node) {
    const key = node.getAttribute?.('data-pg-key');
    if (key) return { blockKey: key, el: node as HTMLElement };
    node = node.parentElement;
  }
  return null;
}

export function captureFocus(root: HTMLElement): CapturedFocus | null {
  const active = document.activeElement;
  if (!active || !root.contains(active)) return null;
  const found = findFocusableRoot(active);
  if (!found) return null;
  const { blockKey } = found;
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
    return {
      blockKey,
      selectionStart: active.selectionStart,
      selectionEnd: active.selectionEnd,
      rangeOffset: null,
    };
  }
  if (active instanceof HTMLElement && active.isContentEditable) {
    const sel = window.getSelection();
    const rangeOffset = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).startOffset : null;
    return { blockKey, selectionStart: null, selectionEnd: null, rangeOffset };
  }
  return null;
}

export function restoreFocus(root: HTMLElement, captured: CapturedFocus | null): void {
  if (!captured) return;
  const el = root.querySelector<HTMLElement>(`[data-pg-key="${captured.blockKey}"]`);
  if (!el) return;
  const field =
    el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
      ? el
      : el.querySelector<HTMLElement>('input, textarea, [contenteditable="true"]');
  if (!field) return;

  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    field.focus({ preventScroll: true });
    if (captured.selectionStart != null && captured.selectionEnd != null) {
      try {
        field.setSelectionRange(captured.selectionStart, captured.selectionEnd);
      } catch {
        // Some input types (e.g. number) don't support selection ranges — ignore.
      }
    }
  } else if (field.isContentEditable) {
    field.focus({ preventScroll: true });
    if (captured.rangeOffset != null) {
      const textNode = field.firstChild;
      if (textNode) {
        try {
          const range = document.createRange();
          const max = textNode.textContent?.length ?? 0;
          range.setStart(textNode, Math.min(captured.rangeOffset, max));
          range.collapse(true);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        } catch {
          // Offset no longer valid against the new content — leave the caret at the default.
        }
      }
    }
  }
  el.scrollIntoView({ block: 'nearest' });
}

export function captureScroll(root: HTMLElement): number {
  return root.scrollTop;
}

export function restoreScroll(root: HTMLElement, scrollTop: number): void {
  root.scrollTop = scrollTop;
}
