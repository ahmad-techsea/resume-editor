import React from 'react';
import { FiX } from 'react-icons/fi';
import DateRangeButtons from '../DateRangeButtons';
import type { CatalogSectionProps } from './index';

const delBtnStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '5px',
  color: '#B0A99E',
  flex: 'none',
};

/** Editable ports of components/sections/education/*.tsx (ids 3a-3e). None of these designs show
 *  a description paragraph — 3a is the only one that ever shows a bulleted honors/notes line. */
export default function EducationEditor({ s, onEdit, onFocusF, onKeyS }: CatalogSectionProps) {
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

  if (s.style === '3b') {
    // CompactOneLiners — title + institution on one dense line, dates right.
    return (
      <div>
        {heading}
        {s.entries.map((ent: any, i: number) => (
          <div
            key={ent.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              alignItems: 'baseline',
              padding: '9px 0',
              borderBottom: i < s.entries.length - 1 ? '1px solid #F0EDE7' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flex: '1', minWidth: '0' }}>
              <input
                data-path={ent.pT}
                value={ent.title}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phT}
                aria-label="Degree"
                style={{ fontSize: '13px', fontWeight: '600', color: '#2E2B26', minWidth: '60px' }}
              />
              <span style={{ fontSize: '13px', color: '#2E2B26' }}>,</span>
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Institution"
                style={{ fontSize: '13px', color: '#2E2B26', flex: '1', minWidth: '60px' }}
              />
            </div>
            <DateRangeButtons ent={ent} fontSize="11.5px" gap="4px" />
            <button onClick={ent.del} aria-label="Delete education" title="Delete" className="hv-danger" style={delBtnStyle}>
              <FiX size={11} strokeWidth={1.6} />
            </button>
          </div>
        ))}
        {addBtn}
      </div>
    );
  }

  if (s.style === '3c') {
    // TimelineRail — dot + rail, title above, institution + dates on one meta line.
    return (
      <div>
        {heading}
        {s.entries.map((ent: any) => (
          <div
            key={ent.id}
            style={{
              marginTop: '14px',
              borderLeft: '2px solid #E6E2DA',
              paddingLeft: '16px',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: '-5px',
                top: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#3E5C76',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <input
                data-path={ent.pT}
                value={ent.title}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phT}
                aria-label="Degree"
                style={{ flex: '1', minWidth: '0', fontSize: '13.5px', fontWeight: '600', color: '#2E2B26' }}
              />
              <button onClick={ent.del} aria-label="Delete education" title="Delete" className="hv-danger" style={delBtnStyle}>
                <FiX size={11} strokeWidth={1.6} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '1px', fontSize: '12px' }}>
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Institution"
                style={{ color: '#6B665E', minWidth: '60px' }}
              />
              <span style={{ color: '#B5AFA5' }}>·</span>
              <DateRangeButtons ent={ent} fontSize="12px" gap="4px" />
            </div>
          </div>
        ))}
        {addBtn}
      </div>
    );
  }

  if (s.style === '3d') {
    // CardPair — 2-column grid of bordered cards.
    return (
      <div>
        {heading}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '11px' }}>
          {s.entries.map((ent: any) => (
            <div key={ent.id} style={{ border: '1px solid #E6E2DA', borderRadius: '8px', padding: '11px 12px', position: 'relative' }}>
              <button
                onClick={ent.del}
                aria-label="Delete education"
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
                aria-label="Degree"
                style={{ display: 'block', width: '100%', fontSize: '12.5px', fontWeight: '600', color: '#2E2B26', lineHeight: '1.4' }}
              />
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Institution"
                style={{ display: 'block', width: '100%', fontSize: '11.5px', color: '#6B665E', marginTop: '3px' }}
              />
              <div style={{ marginTop: '5px' }}>
                <DateRangeButtons ent={ent} fontSize="11px" gap="4px" />
              </div>
            </div>
          ))}
        </div>
        {addBtn}
      </div>
    );
  }

  if (s.style === '3e') {
    // DatesLeftColumn — dates in a fixed-width left column, content on the right.
    return (
      <div>
        {heading}
        <div style={{ display: 'grid', gridTemplateColumns: '104px 1fr', gap: '8px 14px', marginTop: '11px' }}>
          {s.entries.map((ent: any) => (
            <React.Fragment key={ent.id}>
              <div style={{ paddingTop: '1px' }}>
                <DateRangeButtons ent={ent} fontSize="11.5px" gap="4px" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <div style={{ flex: '1', minWidth: '0' }}>
                  <input
                    data-path={ent.pT}
                    value={ent.title}
                    onChange={onEdit}
                    onFocus={onFocusF}
                    onKeyDown={onKeyS}
                    placeholder={ent.phT}
                    aria-label="Degree"
                    style={{ display: 'block', width: '100%', fontSize: '13.5px', fontWeight: '600', color: '#2E2B26' }}
                  />
                  <input
                    data-path={ent.pS}
                    value={ent.subtitle}
                    onChange={onEdit}
                    onFocus={onFocusF}
                    onKeyDown={onKeyS}
                    placeholder={ent.phS}
                    aria-label="Institution"
                    style={{ display: 'block', width: '100%', fontSize: '12px', color: '#6B665E' }}
                  />
                </div>
                <button onClick={ent.del} aria-label="Delete education" title="Delete" className="hv-danger" style={delBtnStyle}>
                  <FiX size={11} strokeWidth={1.6} />
                </button>
              </div>
            </React.Fragment>
          ))}
        </div>
        {addBtn}
      </div>
    );
  }

  // '3a' (default) — ClassicRows: title+dates row, institution below, one optional honors bullet.
  return (
    <div>
      {heading}
      {s.entries.map((ent: any) => (
        <div key={ent.id} style={{ marginTop: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <input
              data-path={ent.pT}
              value={ent.title}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phT}
              aria-label="Degree"
              style={{ flex: '1', minWidth: '0', fontSize: '14px', fontWeight: '600', color: '#2E2B26' }}
            />
            <DateRangeButtons ent={ent} fontSize="11.5px" gap="4px" />
            <button onClick={ent.del} aria-label="Delete education" title="Delete" className="hv-danger" style={delBtnStyle}>
              <FiX size={11} strokeWidth={1.6} />
            </button>
          </div>
          <input
            data-path={ent.pS}
            value={ent.subtitle}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyS}
            placeholder={ent.phS}
            aria-label="Institution"
            style={{ display: 'block', width: '100%', fontSize: '12.5px', color: '#6B665E', marginTop: '2px' }}
          />
          {ent.hasContribs && (
            <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {ent.contribs.map((cb: any) => (
                <div key={cb.id} style={{ display: 'flex', alignItems: 'baseline', gap: '7px' }}>
                  <span style={{ color: '#3E5C76', fontSize: '12.5px', lineHeight: '1.55' }}>•</span>
                  <input
                    data-path={cb.path}
                    value={cb.val}
                    onChange={onEdit}
                    onFocus={onFocusF}
                    onKeyDown={onKeyS}
                    placeholder="Honors, activities, coursework…"
                    aria-label="Note"
                    style={{ flex: '1', minWidth: '60px', fontSize: '12.5px', lineHeight: '1.55', color: '#3B3833' }}
                  />
                  <button onClick={cb.del} aria-label="Delete note" title="Delete" className="hv-danger" style={delBtnStyle}>
                    <FiX size={9} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            className="adde hv-add-contrib"
            onClick={ent.addContrib}
            style={{
              marginTop: '4px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#8A857C',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '5px',
            }}
          >
            + Add note
          </button>
        </div>
      ))}
      {addBtn}
    </div>
  );
}
