import React from 'react';
import { FiGrid, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { TRASH_ICON } from './icons';
import buildEntryFieldsBlock from './EntryFields';
import buildCatalogSectionBlocks from './sections';
import { atomicBlock, decorateBlock, type PgBlockSpec } from './pagination/block-spec';
import { buildParagraphBlock } from './pagination/FlowParagraph';

export interface ResumeFieldColorMap {
  [fieldPath: string]: { sev: string; color: string };
}

export interface SectionBlockProps {
  s: any;
  onEdit: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocusF: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyS: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyM: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  colorMap?: ResumeFieldColorMap;
  fieldRef?: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
}

/** Builds the flat pagination blocks for one section: a heading block (kept together with its
 *  first content via `keepWithNext`) plus one or more content blocks. A section can no longer be
 *  one wrapping DOM node once its pieces may land on different pages, so this returns siblings
 *  rather than a nested `<section>` tree — the section-level hover controls (`.sctls`) attach to
 *  whichever block renders first, since that's always where they visually belong (top of the
 *  section, wherever it currently sits). */
export default function buildSectionBlocks({
  s,
  onEdit,
  onFocusF,
  onKeyS,
  onKeyM,
  colorMap,
  fieldRef,
}: SectionBlockProps): PgBlockSpec[] {
  const showControls = s.showSectionControls !== false;
  const titleEditable = s.titleEditable !== false;
  const fcol = (path?: string) =>
    path && colorMap && colorMap[path] ? colorMap[path].color : undefined;

  const sctls = showControls ? (
    <div
      className="sctls"
      style={{
        position: 'absolute',
        right: '-4px',
        top: '-2px',
        display: 'flex',
        flexDirection: 'row',
        gap: '2px',
        padding: '2px 0 18px 16px',
      }}
    >
      <button
        onClick={s.openStyle}
        aria-label="Change section style"
        title="Change section style"
        className="hv-ctl"
        style={{
          width: '22px',
          height: '22px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '6px',
          color: '#8A857D',
        }}
      >
        <FiGrid size={12} strokeWidth={1.3} />
      </button>
      <button
        onClick={s.up}
        disabled={s.upDis}
        aria-label="Move section up"
        title="Move up"
        className="hv-ctl"
        style={{
          width: '22px',
          height: '22px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '6px',
          color: '#8A857D',
        }}
      >
        <FiChevronUp size={11} strokeWidth={1.6} />
      </button>
      <button
        onClick={s.down}
        disabled={s.dnDis}
        aria-label="Move section down"
        title="Move down"
        className="hv-ctl"
        style={{
          width: '22px',
          height: '22px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '6px',
          color: '#8A857D',
        }}
      >
        <FiChevronDown size={11} strokeWidth={1.6} />
      </button>
      <button
        onClick={s.del}
        aria-label="Delete section"
        title="Delete section"
        className="hv-ctl-del"
        style={{
          width: '22px',
          height: '22px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '6px',
          color: '#8A857D',
        }}
      >
        {TRASH_ICON}
      </button>
    </div>
  ) : null;

  let sctlsUsed = false;
  const withControls = (node: React.ReactNode): React.ReactNode => {
    if (sctlsUsed || !sctls) return node;
    sctlsUsed = true;
    return (
      <>
        {sctls}
        {node}
      </>
    );
  };

  // Sections used to be one `<section style={{marginTop:'30px'}}>` wrapper, giving 30px of
  // breathing room before every section. Now that a section's pieces are flat siblings that may
  // land on different pages, that spacing (and the `position:relative` anchor point that .sctls'
  // absolute positioning and .ent's timeline dot rely on) moves to whichever block renders first
  // — kind-aware via decorateBlock, since that first block may be a splittable paragraph with no
  // single `.node` of its own (see block-spec.ts).
  const decorateFirst = (list: PgBlockSpec[]): PgBlockSpec[] => {
    if (list.length === 0) return list;
    const [first, ...rest] = list;
    return [
      decorateBlock(first, (node) => <div style={{ position: 'relative', marginTop: '30px' }}>{node}</div>),
      ...rest,
    ];
  };

  if (s.useCatalog) {
    const blocks = buildCatalogSectionBlocks({ s, onEdit, onFocusF, onKeyS, onKeyM });
    if (blocks.length === 0) return blocks;
    const [first, ...rest] = blocks;
    return decorateFirst([decorateBlock(first, withControls), ...rest]);
  }

  const heading = s.headTop
    ? titleEditable
      ? (
          <div style={{ borderBottom: '1px solid #E6E2DA', paddingBottom: '5px' }}>
            <input
              data-path={s.pTitle}
              value={s.title}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder="Section title"
              aria-label="Section title"
              ref={fieldRef}
              style={{
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--acc,#3E5C76)',
                minWidth: '90px',
                maxWidth: '100%',
              }}
            />
          </div>
        )
      : (
          <div
            style={{
              borderBottom: '1px solid #E6E2DA',
              paddingBottom: '5px',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--acc,#3E5C76)',
            }}
          >
            {s.title}
          </div>
        )
    : null;

  const blocks: PgBlockSpec[] = [];

  if (s.headTop) {
    blocks.push(atomicBlock(s.pTitle, withControls(heading), true));
  }

  if (s.txtClassic) {
    // classic/center are always headTop styles, so the heading block above already consumed
    // sctls — this is a pure paragraph block with no chrome of its own.
    blocks.push(
      buildParagraphBlock({
        blockKey: s.pBody,
        path: s.pBody,
        value: s.body,
        placeholder: s.phBody,
        ariaLabel: 'Section text',
        onEdit,
        onFocusF,
        style: {
          width: '100%',
          marginTop: '9px',
          fontSize: '13.5px',
          lineHeight: '1.62',
          color: s.bodyColor,
          textAlign: s.bodyAlign,
          ...(fcol(s.pBody) ? { borderBottom: `2px solid ${fcol(s.pBody)}` } : {}),
        },
      }),
    );
  } else if (s.txtSide) {
    // Side-label styling coupled title+body in one grid; a splittable body can no longer share a
    // grid row with a title that must appear only once, so the title becomes its own small block
    // (styling preserved) directly above a full-width paragraph.
    blocks.push(
      atomicBlock(
        s.pTitle,
        withControls(
          titleEditable ? (
            <input
              data-path={s.pTitle}
              value={s.title}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder="Section title"
              aria-label="Section title"
              style={{
                display: 'block',
                width: '100%',
                paddingTop: '3px',
                fontSize: '11.5px',
                fontWeight: '700',
                letterSpacing: '.13em',
                textTransform: 'uppercase',
                color: 'var(--acc,#3E5C76)',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                paddingTop: '3px',
                fontSize: '11.5px',
                fontWeight: '700',
                letterSpacing: '.13em',
                textTransform: 'uppercase',
                color: 'var(--acc,#3E5C76)',
              }}
            >
              {s.title}
            </div>
          ),
        ),
        true,
      ),
    );
    blocks.push(
      buildParagraphBlock({
        blockKey: s.pBody,
        path: s.pBody,
        value: s.body,
        placeholder: s.phBody,
        ariaLabel: 'Section text',
        onEdit,
        onFocusF,
        style: {
          width: '100%',
          marginTop: '4px',
          fontSize: '13.5px',
          lineHeight: '1.62',
          color: '#3B3833',
          ...(fcol(s.pBody) ? { borderBottom: `2px solid ${fcol(s.pBody)}` } : {}),
        },
      }),
    );
  } else if (s.txtTinted) {
    // The tinted panel background/padding is applied directly to each fragment's own style, so a
    // split paragraph renders as one tinted block per page rather than one box spanning pages
    // that can't physically exist.
    blocks.push(
      atomicBlock(
        s.pTitle,
        withControls(
          <div
            style={{
              background: 'color-mix(in oklab,var(--acc,#3E5C76) 5%,#fff)',
              borderRadius: '8px',
              padding: '10px 16px 2px',
            }}
          >
            {titleEditable ? (
              <input
                data-path={s.pTitle}
                value={s.title}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder="Section title"
                aria-label="Section title"
                style={{
                  display: 'block',
                  width: '100%',
                  fontSize: '10.5px',
                  fontWeight: '700',
                  letterSpacing: '.13em',
                  textTransform: 'uppercase',
                  color: 'var(--acc,#3E5C76)',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'block',
                  width: '100%',
                  fontSize: '10.5px',
                  fontWeight: '700',
                  letterSpacing: '.13em',
                  textTransform: 'uppercase',
                  color: 'var(--acc,#3E5C76)',
                }}
              >
                {s.title}
              </div>
            )}
          </div>,
        ),
        true,
      ),
    );
    blocks.push(
      buildParagraphBlock({
        blockKey: s.pBody,
        path: s.pBody,
        value: s.body,
        placeholder: s.phBody,
        ariaLabel: 'Section text',
        onEdit,
        onFocusF,
        style: {
          width: '100%',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#3B3833',
          background: 'color-mix(in oklab,var(--acc,#3E5C76) 5%,#fff)',
          borderRadius: '8px',
          padding: '2px 16px 12px',
          ...(fcol(s.pBody) ? { borderBottom: `2px solid ${fcol(s.pBody)}` } : {}),
        },
      }),
    );
  } else if (s.txtEditorial) {
    // No heading in this style — the ruled top/bottom border is applied per-fragment, so each
    // page shows its own ruled excerpt if the paragraph splits.
    const body = buildParagraphBlock({
      blockKey: s.pBody,
      path: s.pBody,
      value: s.body,
      placeholder: s.phBody,
      ariaLabel: 'Section text',
      onEdit,
      onFocusF,
      style: {
        width: '100%',
        fontSize: '15px',
        lineHeight: '1.6',
        color: '#26231F',
        borderTop: '1px solid #E6E2DA',
        borderBottom: '1px solid #E6E2DA',
        padding: '12px 0',
        marginTop: '6px',
        ...(fcol(s.pBody) ? { borderBottom: `2px solid ${fcol(s.pBody)}` } : {}),
      },
    });
    blocks.push(decorateBlock(body, withControls));
  } else if (s.txtPills) {
    blocks.push(
      atomicBlock(
        s.pBody,
        withControls(
          <>
            {s.pillsEditing && (
              <textarea
                data-path={s.pBody}
                value={s.body}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyM}
                onBlur={s.pillsBlur}
                autoFocus
                placeholder={s.phBody}
                aria-label="Section text"
                rows={1}
                style={{
                  width: '100%',
                  marginTop: '9px',
                  fontSize: '13.5px',
                  lineHeight: '1.62',
                  color: '#3B3833',
                }}
              />
            )}
            {s.pillsIdle && (
              <div
                role="button"
                tabIndex={0}
                onClick={s.editPills}
                onFocus={s.editPills}
                aria-label="Edit list (comma-separated)"
                title="Click to edit"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '7px',
                  marginTop: '11px',
                  cursor: 'text',
                  minHeight: '24px',
                  borderRadius: '4px',
                }}
              >
                {s.pills.map((pl: any, i: number) => (
                  <span
                    key={i}
                    style={{
                      border: '1px solid #D8D4CC',
                      borderRadius: '999px',
                      padding: '4px 11px',
                      fontSize: '11.5px',
                      color: '#3B3833',
                    }}
                  >
                    {pl.t}
                  </span>
                ))}
                {s.pillsEmpty && (
                  <span style={{ fontSize: '13.5px', color: '#A9A29A', padding: '4px 0' }}>
                    {s.phBody}
                  </span>
                )}
              </div>
            )}
          </>,
        ),
      ),
    );
  } else if (s.isEntries) {
    blocks.push(
      ...s.entries.map((ent: any) =>
        buildEntryFieldsBlock({ s, ent, onEdit, onFocusF, onKeyS, onKeyM, colorMap, fieldRef }),
      ),
    );
    blocks.push(
      atomicBlock(
        s.pTitle + '.add',
        // The label is its own element on purpose: this button is an inline-flex box with
        // `gap: 5px`, so "+" and the label must be two flex items for the gap to apply.
        <button
          className="adde hv-add-entry"
          onClick={s.addEntry}
          style={{
            marginTop: '12px',
            fontSize: '12.5px',
            fontWeight: '600',
            color: 'var(--acc,#3E5C76)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 6px',
            borderRadius: '6px',
          }}
        >
          {'+ '}
          <span>{s.addLbl}</span>
        </button>,
      ),
    );
  }

  return decorateFirst(blocks);
}

/** Non-paginated adapter for callers that just want a normal rendered `<section>` (the resume
 *  review panel — components/ResumeReviewPanel.tsx — shares this renderer but has no pagination
 *  concept). Not used by the paginated editor view. */
export function SectionBlockLegacy(props: SectionBlockProps) {
  const blocks = buildSectionBlocks(props);
  return (
    <section className="sec">
      {blocks.map((b) => (
        <div key={b.key} style={{ position: 'relative' }}>
          {b.kind === 'paragraph' && b.paragraph
            ? // No pagination here — render the whole paragraph as one unsplit fragment.
              b.paragraph.renderFragment({
                startOffset: 0,
                endOffset: b.paragraph.fullText.length,
                fragmentIndex: 0,
                fragmentCount: 1,
              })
            : b.node}
        </div>
      ))}
    </section>
  );
}
