import React from 'react';
import { FiX } from 'react-icons/fi';
import type { CatalogSectionProps } from './index';
import { atomicBlock, type PgBlockSpec } from '../pagination/block-spec';

const delBtnStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '5px',
  color: '#B0A99E',
  flex: 'none',
};

function initials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
}

/** Editable ports of components/sections/references/*.tsx (ids 8a-8e). `8b` (AvailableOnRequest)
 *  is the one deliberate exception across the whole catalog: it needs no per-reference data at
 *  all, so it renders only the heading with no entries list — it has no `s.entries.map()` to
 *  split, so it stays a single block (like the text-kind sections) rather than heading+entries+add.
 *  Returns pagination blocks, not a mounted component — see ExperienceEditor.tsx for the pattern.
 *  8a/8e group entries inside a shared grid/flex container in the original design; since blocks
 *  must be independently placeable, that container is dropped here and each entry becomes its own
 *  block. */
export default function buildReferencesBlocks({ s, onEdit, onFocusF, onKeyS, onKeyM }: CatalogSectionProps): PgBlockSpec[] {
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
        borderBottom: '1px solid #E6E2DA',
        paddingBottom: '5px',
      }}
    />
  );
  const addBtn = (
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
    </button>
  );
  const delBtn = (ent: any) => (
    <button onClick={ent.del} aria-label="Delete reference" title="Delete" className="hv-danger" style={delBtnStyle}>
      <FiX size={11} strokeWidth={1.6} />
    </button>
  );

  if (s.style === '8b') {
    // AvailableOnRequest — heading only, no per-reference data. No s.entries.map() here, so this
    // stays one opaque block rather than heading+entries+add.
    return [
      atomicBlock(
        s.pTitle,
        <div key="8b">
          {heading}
          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12.5px', color: '#6B665E', padding: '6px 0 2px' }}>
            References available upon request.
          </div>
        </div>,
      ),
    ];
  }

  if (s.style === '8c') {
    // RowsContactRight — name + role/company on the left, email/phone stacked on the right.
    return [
      atomicBlock(s.pTitle, heading, true),
      ...s.entries.map((ent: any) =>
        atomicBlock(
          ent.pathPrefix,
          <div key={ent.id} style={{ marginTop: '10px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div style={{ flex: '1', display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap', fontSize: '12.5px', color: '#2E2B26' }}>
              <input
                data-path={ent.pT}
                value={ent.title}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phT}
                aria-label="Name"
                style={{ fontWeight: '600', color: '#2E2B26', minWidth: '60px' }}
              />
              <span>,</span>
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Role, company"
                style={{ color: '#2E2B26', flex: '1', minWidth: '60px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px', flex: 'none' }}>
              <input
                data-path={ent.pEmail}
                value={ent.email}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phEmail}
                aria-label="Email"
                style={{ fontSize: '11px', color: '#3E5C76', textAlign: 'right' }}
              />
              <input
                data-path={ent.pPhone}
                value={ent.phone}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phPhone}
                aria-label="Phone"
                style={{ fontSize: '11px', color: '#3E5C76', textAlign: 'right' }}
              />
            </div>
            {delBtn(ent)}
          </div>,
        ),
      ),
      atomicBlock(s.pTitle + '.add', addBtn),
    ];
  }

  if (s.style === '8d') {
    // QuoteEndorsement — a quote (reusing `desc`) plus attribution: name, role/company, email.
    return [
      atomicBlock(s.pTitle, heading, true),
      ...s.entries.map((ent: any) =>
        atomicBlock(
          ent.pathPrefix,
          <div key={ent.id} style={{ marginTop: '11px', position: 'relative' }}>
            <textarea
              data-path={ent.pD}
              value={ent.desc}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyM}
              placeholder={ent.phD}
              aria-label="Quote"
              rows={1}
              style={{ width: '100%', fontSize: '13.5px', lineHeight: '1.6', color: '#26231F', textWrap: 'pretty' }}
            />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap', marginTop: '7px', fontSize: '11.5px', color: '#6B665E' }}>
              <input
                data-path={ent.pT}
                value={ent.title}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phT}
                aria-label="Name"
                style={{ color: '#6B665E', minWidth: '60px' }}
              />
              <span>,</span>
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Role, company"
                style={{ color: '#6B665E', minWidth: '60px' }}
              />
              <span>·</span>
              <input
                data-path={ent.pEmail}
                value={ent.email}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phEmail}
                aria-label="Email"
                style={{ color: '#3E5C76', minWidth: '60px' }}
              />
              {delBtn(ent)}
            </div>
          </div>,
        ),
      ),
      atomicBlock(s.pTitle + '.add', addBtn),
    ];
  }

  if (s.style === '8e') {
    // InitialAvatars — a circular initials avatar, name — role/company, email · phone. The shared
    // flex-column container can't wrap independently-placeable blocks, so it's dropped here; each
    // reference becomes its own block.
    return [
      atomicBlock(s.pTitle, heading, true),
      ...s.entries.map((ent: any) =>
        atomicBlock(
          ent.pathPrefix,
          <div key={ent.id} style={{ display: 'flex', gap: '11px', alignItems: 'center' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                flex: 'none',
                borderRadius: '50%',
                background: 'color-mix(in oklab,var(--acc,#3E5C76) 12%,#fff)',
                color: 'var(--acc,#3E5C76)',
                fontSize: '12px',
                fontWeight: '700',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {initials(ent.title)}
            </div>
            <div style={{ flex: '1', minWidth: '0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap', fontSize: '12.5px', fontWeight: '600', color: '#2E2B26' }}>
                <input
                  data-path={ent.pT}
                  value={ent.title}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phT}
                  aria-label="Name"
                  style={{ fontWeight: '600', color: '#2E2B26', minWidth: '60px' }}
                />
                <span>—</span>
                <input
                  data-path={ent.pS}
                  value={ent.subtitle}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phS}
                  aria-label="Role, company"
                  style={{ fontWeight: '600', color: '#2E2B26', flex: '1', minWidth: '60px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '1px', fontSize: '11px', color: '#6B665E' }}>
                <input
                  data-path={ent.pEmail}
                  value={ent.email}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phEmail}
                  aria-label="Email"
                  style={{ color: '#6B665E', minWidth: '60px' }}
                />
                <span>·</span>
                <input
                  data-path={ent.pPhone}
                  value={ent.phone}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phPhone}
                  aria-label="Phone"
                  style={{ color: '#6B665E', minWidth: '60px' }}
                />
              </div>
            </div>
            {delBtn(ent)}
          </div>,
        ),
      ),
      atomicBlock(s.pTitle + '.add', addBtn),
    ];
  }

  // '8a' (default) — CardPair: 2-column grid of bordered cards in the original design. The shared
  // grid container can't wrap independently-placeable blocks, so it's dropped here; each card is
  // its own block.
  return [
    atomicBlock(s.pTitle, heading, true),
    ...s.entries.map((ent: any) =>
      atomicBlock(
        ent.pathPrefix,
        <div key={ent.id} style={{ border: '1px solid #E6E2DA', borderRadius: '8px', padding: '11px 12px', position: 'relative' }}>
          <button
            onClick={ent.del}
            aria-label="Delete reference"
            title="Delete"
            className="hv-danger"
            style={{ ...delBtnStyle, position: 'absolute', top: '6px', right: '6px' }}
          >
            <FiX size={11} strokeWidth={1.6} />
          </button>
          <input
            data-path={ent.pT}
            value={ent.title}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyS}
            placeholder={ent.phT}
            aria-label="Name"
            style={{ display: 'block', width: '100%', fontSize: '12.5px', fontWeight: '600', color: '#2E2B26' }}
          />
          <input
            data-path={ent.pS}
            value={ent.subtitle}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyS}
            placeholder={ent.phS}
            aria-label="Role, company"
            style={{ display: 'block', width: '100%', fontSize: '11.5px', color: '#6B665E', marginTop: '2px' }}
          />
          <input
            data-path={ent.pEmail}
            value={ent.email}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyS}
            placeholder={ent.phEmail}
            aria-label="Email"
            style={{ display: 'block', width: '100%', fontSize: '11px', color: '#3E5C76', marginTop: '5px' }}
          />
        </div>,
      ),
    ),
    atomicBlock(s.pTitle + '.add', addBtn),
  ];
}
