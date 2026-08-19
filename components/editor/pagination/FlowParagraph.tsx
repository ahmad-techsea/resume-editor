import React, { useLayoutEffect, useRef } from 'react';
import type { PgBlockSpec, ParagraphFragmentInfo } from './block-spec';

export interface BuildParagraphBlockOptions {
  /** Pagination block key — the field's own data-path (e.g. "sections.2.body"), reused as the
   *  measurer's lookup key. */
  blockKey: string;
  /** The field's data-path, written into each fragment's data-path attribute so the existing
   *  generic onEdit handler (which reads e.target.dataset.path) keeps working unchanged. */
  path: string;
  value: string;
  placeholder?: string;
  ariaLabel?: string;
  style: React.CSSProperties;
  // Matches the codebase-wide onEdit/onFocusF convention (InlineResumeEditor.onEdit reads only
  // e.target.dataset.path / e.target.value, so it's duck-typed across every field element,
  // including the synthesized event this component constructs for its contentEditable div).
  onEdit: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocusF?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/** Builds a splittable paragraph pagination block: a hidden full-text measurer (for line-box
 *  measurement) plus a per-page fragment renderer. Every fragment is a real, independently
 *  editable contentEditable bound to its own slice of the same underlying string — since a
 *  browser can only ever focus one DOM element at a time, there is no risk of two fragments
 *  diverging, so no promote/demote choreography is needed: clicking into any fragment just edits
 *  that fragment directly, and it immediately commits through the same setPath path every other
 *  field already uses. */
export function buildParagraphBlock(opts: BuildParagraphBlockOptions): PgBlockSpec {
  const { blockKey, path, value, placeholder, ariaLabel, style, onEdit, onFocusF } = opts;
  return {
    key: blockKey,
    kind: 'paragraph',
    paragraph: {
      fullText: value,
      measurerNode: (
        <div
          aria-hidden
          data-pg-measurer={blockKey}
          style={{
            ...style,
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            pointerEvents: 'none',
            width: '100%',
          }}
        >
          {value || '​'}
        </div>
      ),
      renderFragment: (fragment: ParagraphFragmentInfo) => (
        <FlowParagraphFragment
          key={fragment.fragmentIndex}
          fragmentKey={fragment.fragmentCount > 1 ? `${blockKey}#${fragment.fragmentIndex}` : blockKey}
          path={path}
          fullText={value}
          startOffset={fragment.startOffset}
          endOffset={fragment.endOffset}
          isLastFragment={fragment.fragmentIndex === fragment.fragmentCount - 1}
          placeholder={fragment.fragmentIndex === 0 ? placeholder : undefined}
          ariaLabel={ariaLabel}
          style={style}
          onEdit={onEdit}
          onFocusF={onFocusF}
        />
      ),
    },
  };
}

interface FlowParagraphFragmentProps {
  fragmentKey: string;
  path: string;
  fullText: string;
  startOffset: number;
  endOffset: number;
  /** True iff this is the last (or only) page-fragment of the paragraph — its range is the one
   *  that elastically extends as the user types past the last pagination pass's measured end. */
  isLastFragment: boolean;
  placeholder?: string;
  ariaLabel?: string;
  style: React.CSSProperties;
  // Matches the codebase-wide onEdit/onFocusF convention (InlineResumeEditor.onEdit reads only
  // e.target.dataset.path / e.target.value, so it's duck-typed across every field element,
  // including the synthesized event this component constructs for its contentEditable div).
  onEdit: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocusF?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function FlowParagraphFragment({
  fragmentKey,
  path,
  fullText,
  startOffset,
  endOffset,
  isLastFragment,
  placeholder,
  ariaLabel,
  style,
  onEdit,
  onFocusF,
}: FlowParagraphFragmentProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const isComposingRef = useRef(false);
  const isFocusedRef = useRef(false);
  const sliceText = fullText.slice(startOffset, endOffset);

  // Controlled-contentEditable sync, gated on focus, not just "did the value change": pagination
  // is debounced, so while the user is actively typing, `startOffset`/`endOffset` here can be one
  // or more keystrokes stale relative to the live DOM — syncing from props mid-edit would fight
  // the user's own input (each keystroke's own commit() races the next render's overwrite) and
  // reset the caret. While focused, the DOM is the source of truth (commit() below already keeps
  // Redux in sync on every input); props only need to push a value into an *unfocused* fragment
  // (e.g. its slice boundary shifted because a different fragment's edit moved the split point).
  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el || isComposingRef.current || isFocusedRef.current) return;
    if (el.textContent !== sliceText) {
      el.textContent = sliceText;
    }
  }, [sliceText]);

  const commit = () => {
    const el = elRef.current;
    if (!el) return;
    const newSlice = el.textContent ?? '';
    // The *live* end of this fragment's owned range: using the (possibly pagination-stale)
    // `endOffset` here would silently drop or duplicate characters typed since the last
    // measurement pass. Only the last fragment's range is actually elastic in practice (typing
    // extends the paragraph's end); earlier fragments' own text is bounded by where the *next*
    // fragment starts, which remains valid regardless of this fragment's own edits.
    const suffixStart = isLastFragment ? fullText.length : endOffset;
    const newFullText = fullText.slice(0, startOffset) + newSlice + fullText.slice(suffixStart);
    if (newFullText === fullText) return;
    onEdit({
      target: { dataset: { path }, value: newFullText },
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>);
  };

  return (
    <div
      ref={elRef}
      data-pg-key={fragmentKey}
      data-path={path}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-label={ariaLabel}
      data-placeholder={placeholder}
      onFocus={(e) => {
        isFocusedRef.current = true;
        (onFocusF as unknown as React.FocusEventHandler<HTMLDivElement> | undefined)?.(e);
      }}
      onBlur={() => {
        isFocusedRef.current = false;
        // A pagination pass may have been withheld while this fragment held stale-relative-to-DOM
        // content during focus (see the sync effect above) — force one now so the fragment's
        // boundaries and the rest of the layout catch up immediately on blur rather than waiting
        // for the next unrelated trigger.
        commit();
      }}
      onInput={commit}
      onCompositionStart={() => {
        isComposingRef.current = true;
      }}
      onCompositionEnd={() => {
        isComposingRef.current = false;
        commit();
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }}
      style={{
        ...style,
        outline: 'none',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        minHeight: '1em',
      }}
    />
  );
}
