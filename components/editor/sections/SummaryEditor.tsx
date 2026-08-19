import React from 'react';
import type { CatalogSectionProps } from './index';
import { atomicBlock, type PgBlockSpec } from '../pagination/block-spec';
import { buildParagraphBlock } from '../pagination/FlowParagraph';

/** Editable ports of components/sections/professionalSummary/*.tsx (ids 1a-1e). Returns
 *  pagination blocks, not a mounted component — see ExperienceEditor.tsx for the pattern. The
 *  body is a splittable paragraph block (via FlowParagraph) since summary prose is often the
 *  longest single block of text in a resume; where a style originally coupled title+body inside
 *  one shared box (1b/1d), the title becomes its own small block above the paragraph, since a
 *  split paragraph can no longer share a box with a title that must appear only once. */
export default function buildSummaryBlocks({
  s,
  onEdit,
  onFocusF,
  onKeyS,
}: CatalogSectionProps): PgBlockSpec[] {
  if (s.style === '1c') {
    // EditorialNoHeading — no heading at all, just a ruled paragraph. Border applied per-fragment
    // so each page shows its own ruled excerpt if the paragraph splits.
    return [
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
          padding: '14px 0',
          borderTop: '1px solid #E6E2DA',
          borderBottom: '1px solid #E6E2DA',
          fontSize: '15px',
          lineHeight: '1.6',
          color: '#26231F',
        },
      }),
    ];
  }

  if (s.style === '1d') {
    // TintedPanel — tinted background applied to both the title block and each body fragment, so
    // a split paragraph reads as one tinted block per page.
    return [
      atomicBlock(
        s.pTitle,
        <div
          style={{
            background: 'color-mix(in oklab,var(--acc,#3E5C76) 5%,#fff)',
            borderRadius: '8px',
            padding: '15px 17px 2px',
          }}
        >
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
        </div>,
        true,
      ),
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
          padding: '2px 17px 15px',
        },
      }),
    ];
  }

  if (s.style === '1e') {
    // BoldHookDetail — no heading; a bold hook line (atomic, single line by design) followed by a
    // splittable detail paragraph.
    return [
      atomicBlock(
        s.pHook,
        <input
          data-path={s.pHook}
          value={s.hook}
          onChange={onEdit}
          onFocus={onFocusF}
          onKeyDown={onKeyS}
          placeholder={s.phHook}
          aria-label="Summary hook"
          style={{
            display: 'block',
            width: '100%',
            fontSize: '14.5px',
            fontWeight: '700',
            color: '#26231F',
            lineHeight: '1.4',
          }}
        />,
        true,
      ),
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
          marginTop: '6px',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#6B665E',
        },
      }),
    ];
  }

  if (s.style === '1b') {
    // SideLabel — title moves to its own block above a full-width paragraph (was a shared grid
    // row with the body, which a split paragraph can no longer participate in).
    return [
      atomicBlock(
        s.pTitle,
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
            paddingTop: '2px',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '.13em',
            textTransform: 'uppercase',
            color: 'var(--acc,#3E5C76)',
          }}
        />,
        true,
      ),
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
        },
      }),
    ];
  }

  // '1a' (default) — ClassicRuledHeading: ruled heading above the body.
  return [
    atomicBlock(
      s.pTitle,
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
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: 'var(--acc,#3E5C76)',
        }}
      />,
      true,
    ),
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
        marginTop: '10px',
        fontSize: '13.5px',
        lineHeight: '1.62',
        color: '#3B3833',
      },
    }),
  ];
}
