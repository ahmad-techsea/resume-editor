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

/** Editable ports of components/sections/awards/*.tsx (ids 6a-6e). Every variant needs
 *  title/org/year; 6b/6c additionally show `desc` reused as an optional detail line. Returns
 *  pagination blocks, not a mounted component — see ExperienceEditor.tsx for the pattern. 6a/6c/
 *  6d/6e group entries inside a shared grid/flex container in the original design; since blocks
 *  must be independently placeable, that container is dropped here and each entry becomes its
 *  own block. */
export default function buildAwardsBlocks({ s, onEdit, onFocusF, onKeyS }: CatalogSectionProps): PgBlockSpec[] {
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
    <button onClick={ent.del} aria-label="Delete award" title="Delete" className="hv-danger" style={delBtnStyle}>
      <FiX size={11} strokeWidth={1.6} />
    </button>
  );

  if (s.style === '6b') {
    // RowsDatesRight — title+dates row, org — detail line below, year right.
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
                aria-label="Award title"
                style={{ display: 'block', width: '100%', fontSize: '13px', fontWeight: '600', color: '#2E2B26' }}
              />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <input
                  data-path={ent.pS}
                  value={ent.subtitle}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phS}
                  aria-label="Awarding organization"
                  style={{ fontSize: '11.5px', color: '#6B665E', minWidth: '60px' }}
                />
                <input
                  data-path={ent.pD}
                  value={ent.desc}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phD}
                  aria-label="Detail"
                  style={{ fontSize: '11.5px', color: '#6B665E', flex: '1', minWidth: '60px' }}
                />
              </div>
            </div>
            <input
              data-path={ent.pYear}
              value={ent.year}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phYear}
              aria-label="Year"
              style={{ width: '44px', flex: 'none', textAlign: 'right', fontSize: '11.5px', color: '#9A948A' }}
            />
            {delBtn(ent)}
          </div>,
        ),
      ),
      atomicBlock(s.pTitle + '.add', addBtn),
    ];
  }

  if (s.style === '6c') {
    // SimpleBullets — "Title, Org (Year)" per bulleted line. The shared flex-column container
    // can't wrap independently-placeable blocks, so it's dropped here; each line is its own block.
    return [
      atomicBlock(s.pTitle, heading, true),
      ...s.entries.map((ent: any) =>
        atomicBlock(
          ent.pathPrefix,
          <div key={ent.id} style={{ display: 'flex', alignItems: 'baseline', gap: '7px' }}>
            <span style={{ color: '#3E5C76', fontSize: '12.5px', lineHeight: '1.55' }}>•</span>
            <div style={{ flex: '1', display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap', fontSize: '12.5px', color: '#3B3833' }}>
              <input
                data-path={ent.pT}
                value={ent.title}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phT}
                aria-label="Award title"
                style={{ fontWeight: '600', color: '#3B3833', minWidth: '60px' }}
              />
              <span>,</span>
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Awarding organization"
                style={{ color: '#3B3833', minWidth: '60px' }}
              />
              <span>(</span>
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
              <span>)</span>
            </div>
            {delBtn(ent)}
          </div>,
        ),
      ),
      atomicBlock(s.pTitle + '.add', addBtn),
    ];
  }

  if (s.style === '6d') {
    // TintedPanels — 2-column grid of tinted cards in the original design. The shared grid
    // container can't wrap independently-placeable blocks, so it's dropped here; each card is its
    // own block.
    return [
      atomicBlock(s.pTitle, heading, true),
      ...s.entries.map((ent: any) =>
        atomicBlock(
          ent.pathPrefix,
          <div
            key={ent.id}
            style={{
              background: 'color-mix(in oklab,var(--acc,#3E5C76) 5%,#fff)',
              borderRadius: '8px',
              padding: '11px 12px',
              position: 'relative',
            }}
          >
            <button
              onClick={ent.del}
              aria-label="Delete award"
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
              aria-label="Award title"
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
                aria-label="Awarding organization"
                style={{ fontSize: '11px', color: '#6B665E', minWidth: '40px' }}
              />
              <span style={{ color: '#6B665E', fontSize: '11px' }}>·</span>
              <input
                data-path={ent.pYear}
                value={ent.year}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phYear}
                aria-label="Year"
                style={{ fontSize: '11px', color: '#6B665E', width: '40px' }}
              />
            </div>
          </div>,
        ),
      ),
      atomicBlock(s.pTitle + '.add', addBtn),
    ];
  }

  if (s.style === '6e') {
    // SingleLineDotSeparated — every award flows in one dot-separated paragraph. The shared
    // flex-wrap container can't wrap independently-placeable blocks, so it's dropped here; each
    // award (and its leading "·" separator, unchanged) becomes its own block.
    return [
      atomicBlock(s.pTitle, heading, true),
      ...s.entries.map((ent: any, i: number) =>
        atomicBlock(
          ent.pathPrefix,
          <div key={ent.id} style={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
            {i > 0 && <span style={{ color: '#C9C4BB' }}>·</span>}
            <input
              data-path={ent.pT}
              value={ent.title}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phT}
              aria-label="Award title"
              style={{ color: '#3B3833', minWidth: '60px' }}
            />
            <span>(</span>
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
            <span>)</span>
            {delBtn(ent)}
          </div>,
        ),
      ),
      atomicBlock(s.pTitle + '.add', addBtn),
    ];
  }

  // '6a' (default) — YearLeftColumn: year in a fixed left column, title — org on the right, laid
  // out in the original design as two grid cells per entry sharing one section-wide grid. The
  // shared grid container can't wrap independently-placeable blocks, so it's dropped here; each
  // entry's Fragment (unchanged) becomes its own block and no longer shares the grid with its
  // siblings.
  return [
    atomicBlock(s.pTitle, heading, true),
    ...s.entries.map((ent: any) =>
      atomicBlock(
        ent.pathPrefix,
        <React.Fragment key={ent.id}>
          <input
            data-path={ent.pYear}
            value={ent.year}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyS}
            placeholder={ent.phYear}
            aria-label="Year"
            style={{ color: '#3E5C76', fontWeight: '700', fontSize: '11.5px', paddingTop: '1px', width: '44px' }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <div style={{ flex: '1', display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
              <input
                data-path={ent.pT}
                value={ent.title}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phT}
                aria-label="Award title"
                style={{ fontWeight: '600', color: '#2E2B26', minWidth: '60px' }}
              />
              <span style={{ color: '#6B665E' }}>—</span>
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Awarding organization"
                style={{ color: '#6B665E', minWidth: '60px' }}
              />
            </div>
            {delBtn(ent)}
          </div>
        </React.Fragment>,
      ),
    ),
    atomicBlock(s.pTitle + '.add', addBtn),
  ];
}
