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
const yearInputStyle: React.CSSProperties = {
  width: '44px',
  flex: 'none',
  textAlign: 'right',
  fontSize: '11.5px',
  color: '#9A948A',
};

/** Editable ports of components/sections/certifications/*.tsx (ids 5a-5e). No variant shows a
 *  description — every one needs exactly name/issuer/year. Returns pagination blocks, not a
 *  mounted component — see ExperienceEditor.tsx for the pattern. 5b/5c/5d/5e group entries inside
 *  a shared grid/flex container in the original design; since blocks must be independently
 *  placeable, that container is dropped here and each entry becomes its own block. */
export default function buildCertificationsBlocks({ s, onEdit, onFocusF, onKeyS }: CatalogSectionProps): PgBlockSpec[] {
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
    <button onClick={ent.del} aria-label="Delete certification" title="Delete" className="hv-danger" style={delBtnStyle}>
      <FiX size={11} strokeWidth={1.6} />
    </button>
  );

  if (s.style === '5b') {
    // CardGrid — 2-column grid of bordered cards in the original design. The shared grid container
    // can't wrap independently-placeable blocks, so it's dropped here; each card is its own block.
    return [
      atomicBlock(s.pTitle, heading, true),
      ...s.entries.map((ent: any) =>
        atomicBlock(
          ent.pathPrefix,
          <div key={ent.id} style={{ border: '1px solid #E6E2DA', borderRadius: '8px', padding: '11px 12px', position: 'relative' }}>
            <button
              onClick={ent.del}
              aria-label="Delete certification"
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
              aria-label="Certification name"
              style={{ display: 'block', width: '100%', fontSize: '12px', fontWeight: '600', color: '#2E2B26', lineHeight: '1.4' }}
            />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Issuing organization"
                style={{ fontSize: '11px', color: '#9A948A', minWidth: '40px' }}
              />
              <span style={{ color: '#9A948A', fontSize: '11px' }}>·</span>
              <input
                data-path={ent.pYear}
                value={ent.year}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phYear}
                aria-label="Year"
                style={{ fontSize: '11px', color: '#9A948A', width: '40px' }}
              />
            </div>
          </div>,
        ),
      ),
      atomicBlock(s.pTitle + '.add', addBtn),
    ];
  }

  if (s.style === '5c') {
    // CompactInline — dense single-line-per-item list. The shared flex-column container can't wrap
    // independently-placeable blocks, so it's dropped here; each row becomes its own block.
    return [
      atomicBlock(s.pTitle, heading, true),
      ...s.entries.map((ent: any) =>
        atomicBlock(
          ent.pathPrefix,
          <div key={ent.id} style={{ display: 'flex', alignItems: 'baseline', gap: '4px', fontSize: '12.5px', color: '#3B3833' }}>
            <input
              data-path={ent.pT}
              value={ent.title}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phT}
              aria-label="Certification name"
              style={{ fontWeight: '600', color: '#3B3833', minWidth: '60px' }}
            />
            <span>—</span>
            <input
              data-path={ent.pS}
              value={ent.subtitle}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phS}
              aria-label="Issuing organization"
              style={{ color: '#3B3833', flex: '1', minWidth: '60px' }}
            />
            <span>·</span>
            <input
              data-path={ent.pYear}
              value={ent.year}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phYear}
              aria-label="Year"
              style={{ color: '#3B3833', width: '40px' }}
            />
            {delBtn(ent)}
          </div>,
        ),
      ),
      atomicBlock(s.pTitle + '.add', addBtn),
    ];
  }

  if (s.style === '5d') {
    // PillChips — rounded pill per certification. The shared flex-wrap container can't wrap
    // independently-placeable blocks, so it's dropped here; each pill becomes its own block.
    return [
      atomicBlock(s.pTitle, heading, true),
      ...s.entries.map((ent: any) =>
        atomicBlock(
          ent.pathPrefix,
          <div
            key={ent.id}
            style={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '4px',
              border: '1px solid #D8D4CC',
              borderRadius: '999px',
              padding: '5px 8px 5px 11px',
              fontSize: '11.5px',
              color: '#3B3833',
            }}
          >
            <input
              data-path={ent.pT}
              value={ent.title}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phT}
              aria-label="Certification name"
              style={{ color: '#3B3833', minWidth: '80px' }}
            />
            <span style={{ color: '#9A948A' }}>·</span>
            <input
              data-path={ent.pYear}
              value={ent.year}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phYear}
              aria-label="Year"
              style={{ color: '#9A948A', width: '36px' }}
            />
            <button onClick={ent.del} aria-label="Delete certification" title="Delete" className="hv-danger" style={delBtnStyle}>
              <FiX size={10} strokeWidth={1.5} />
            </button>
          </div>,
        ),
      ),
      atomicBlock(s.pTitle + '.add', addBtn),
    ];
  }

  if (s.style === '5e') {
    // RuledTable — 3-column ruled rows: name / issuer / year, laid out in the original design as
    // Fragment cells sharing one section-wide grid. The shared grid container can't wrap
    // independently-placeable blocks, so it's dropped here; each entry's Fragment (unchanged)
    // becomes its own block and no longer shares column sizing with its siblings.
    return [
      atomicBlock(s.pTitle, heading, true),
      ...s.entries.map((ent: any, i: number) => {
        const border = i < s.entries.length - 1 ? '1px solid #F0EDE7' : 'none';
        return atomicBlock(
          ent.pathPrefix,
          <React.Fragment key={ent.id}>
            <input
              data-path={ent.pT}
              value={ent.title}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phT}
              aria-label="Certification name"
              style={{ padding: '8px 0', borderBottom: border, fontWeight: '600', color: '#2E2B26' }}
            />
            <input
              data-path={ent.pS}
              value={ent.subtitle}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phS}
              aria-label="Issuing organization"
              style={{ padding: '8px 0', borderBottom: border, color: '#6B665E', width: '90px' }}
            />
            <input
              data-path={ent.pYear}
              value={ent.year}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phYear}
              aria-label="Year"
              style={{ padding: '8px 0', borderBottom: border, color: '#9A948A', width: '40px' }}
            />
            <span style={{ padding: '8px 0', borderBottom: border, display: 'flex', alignItems: 'center' }}>
              {delBtn(ent)}
            </span>
          </React.Fragment>,
        );
      }),
      atomicBlock(s.pTitle + '.add', addBtn),
    ];
  }

  // '5a' (default) — RowsDatesRight: name+issuer stacked left, year right.
  return [
    atomicBlock(s.pTitle, heading, true),
    ...s.entries.map((ent: any) =>
      atomicBlock(
        ent.pathPrefix,
        <div key={ent.id} style={{ marginTop: '10px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <div style={{ flex: '1', minWidth: '0' }}>
            <input
              data-path={ent.pT}
              value={ent.title}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phT}
              aria-label="Certification name"
              style={{ display: 'block', width: '100%', fontSize: '13px', fontWeight: '600', color: '#2E2B26' }}
            />
            <input
              data-path={ent.pS}
              value={ent.subtitle}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phS}
              aria-label="Issuing organization"
              style={{ display: 'block', width: '100%', fontSize: '11.5px', color: '#6B665E' }}
            />
          </div>
          <input
            data-path={ent.pYear}
            value={ent.year}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyS}
            placeholder={ent.phYear}
            aria-label="Year"
            style={yearInputStyle}
          />
          {delBtn(ent)}
        </div>,
      ),
    ),
    atomicBlock(s.pTitle + '.add', addBtn),
  ];
}
