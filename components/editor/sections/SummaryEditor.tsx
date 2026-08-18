import React from 'react';
import type { CatalogSectionProps } from './index';

/** Editable ports of components/sections/professionalSummary/*.tsx (ids 1a-1e). */
export default function SummaryEditor({ s, onEdit, onFocusF, onKeyS, onKeyM }: CatalogSectionProps) {
  const heading = (
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
    />
  );

  if (s.style === '1c') {
    // EditorialNoHeading — no heading at all, just a ruled paragraph.
    return (
      <textarea
        data-path={s.pBody}
        value={s.body}
        onChange={onEdit}
        onFocus={onFocusF}
        onKeyDown={onKeyM}
        placeholder={s.phBody}
        aria-label="Section text"
        rows={1}
        style={{
          width: '100%',
          padding: '14px 0',
          borderTop: '1px solid #E6E2DA',
          borderBottom: '1px solid #E6E2DA',
          fontSize: '15px',
          lineHeight: '1.6',
          color: '#26231F',
          textWrap: 'pretty',
        }}
      />
    );
  }

  if (s.style === '1d') {
    // TintedPanel — heading + body inside a tinted rounded panel.
    return (
      <div
        style={{
          background: 'color-mix(in oklab,var(--acc,#3E5C76) 5%,#fff)',
          borderRadius: '8px',
          padding: '15px 17px',
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
        <textarea
          data-path={s.pBody}
          value={s.body}
          onChange={onEdit}
          onFocus={onFocusF}
          onKeyDown={onKeyM}
          placeholder={s.phBody}
          aria-label="Section text"
          rows={1}
          style={{
            width: '100%',
            marginTop: '6px',
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#3B3833',
            textWrap: 'pretty',
          }}
        />
      </div>
    );
  }

  if (s.style === '1e') {
    // BoldHookDetail — no heading; a bold hook line followed by a smaller detail paragraph.
    return (
      <div>
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
        />
        <textarea
          data-path={s.pBody}
          value={s.body}
          onChange={onEdit}
          onFocus={onFocusF}
          onKeyDown={onKeyM}
          placeholder={s.phBody}
          aria-label="Section text"
          rows={1}
          style={{
            width: '100%',
            marginTop: '6px',
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#6B665E',
            textWrap: 'pretty',
          }}
        />
      </div>
    );
  }

  if (s.style === '1b') {
    // SideLabel — heading in a fixed left column, body alongside.
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr', gap: '18px' }}>
        <input
          data-path={s.pTitle}
          value={s.title}
          onChange={onEdit}
          onFocus={onFocusF}
          onKeyDown={onKeyS}
          placeholder="Section title"
          aria-label="Section title"
          style={{
            width: '100%',
            alignSelf: 'start',
            paddingTop: '2px',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '.13em',
            textTransform: 'uppercase',
            color: 'var(--acc,#3E5C76)',
          }}
        />
        <textarea
          data-path={s.pBody}
          value={s.body}
          onChange={onEdit}
          onFocus={onFocusF}
          onKeyDown={onKeyM}
          placeholder={s.phBody}
          aria-label="Section text"
          rows={1}
          style={{
            width: '100%',
            fontSize: '13.5px',
            lineHeight: '1.62',
            color: '#3B3833',
            textWrap: 'pretty',
          }}
        />
      </div>
    );
  }

  // '1a' (default) — ClassicRuledHeading: ruled heading above the body.
  return (
    <div>
      {heading}
      <textarea
        data-path={s.pBody}
        value={s.body}
        onChange={onEdit}
        onFocus={onFocusF}
        onKeyDown={onKeyM}
        placeholder={s.phBody}
        aria-label="Section text"
        rows={1}
        style={{
          width: '100%',
          marginTop: '10px',
          fontSize: '13.5px',
          lineHeight: '1.62',
          color: '#3B3833',
          textWrap: 'pretty',
        }}
      />
    </div>
  );
}
