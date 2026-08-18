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

function Bullets({ ent, onEdit, onFocusF, onKeyS }: any) {
  return (
    <>
      {ent.hasContribs && (
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {ent.contribs.map((cb: any) => (
            <div key={cb.id} style={{ display: 'flex', alignItems: 'baseline', gap: '7px' }}>
              <span style={{ color: '#3E5C76', fontSize: '12.5px', lineHeight: '1.55' }}>•</span>
              <input
                data-path={cb.path}
                value={cb.val}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder="Contribution or achievement…"
                aria-label="Contribution"
                style={{ flex: '1', minWidth: '60px', fontSize: '12.5px', lineHeight: '1.55', color: '#3B3833' }}
              />
              <button onClick={cb.del} aria-label="Delete bullet" title="Delete bullet" className="hv-danger" style={delBtnStyle}>
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
        + Add bullet
      </button>
    </>
  );
}

function Desc({ ent, onEdit, onFocusF, onKeyM, color = '#3B3833' }: any) {
  return (
    <textarea
      data-path={ent.pD}
      value={ent.desc}
      onChange={onEdit}
      onFocus={onFocusF}
      onKeyDown={onKeyM}
      placeholder={ent.phD}
      aria-label="Description"
      rows={1}
      style={{ width: '100%', marginTop: '6px', fontSize: '12.5px', lineHeight: '1.58', color, textWrap: 'pretty' }}
    />
  );
}

/** Editable ports of components/sections/experience/*.tsx (ids 4a-4e). */
export default function ExperienceEditor({ s, onEdit, onFocusF, onKeyS, onKeyM }: CatalogSectionProps) {
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
    <button onClick={ent.del} aria-label="Delete role" title="Delete role" className="hv-danger" style={delBtnStyle}>
      <FiX size={11} strokeWidth={1.6} />
    </button>
  );

  if (s.style === '4b') {
    // ContributionBullets — same header as 4a, bullets instead of a description paragraph.
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
                aria-label="Job title"
                style={{ flex: '1', minWidth: '0', fontSize: '14px', fontWeight: '600', color: '#2E2B26' }}
              />
              <DateRangeButtons ent={ent} fontSize="11.5px" gap="4px" />
              {delBtn(ent)}
            </div>
            <input
              data-path={ent.pS}
              value={ent.subtitle}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phS}
              aria-label="Company"
              style={{ display: 'block', width: '100%', fontSize: '12.5px', color: '#6B665E', marginTop: '2px' }}
            />
            <Bullets ent={ent} onEdit={onEdit} onFocusF={onFocusF} onKeyS={onKeyS} />
          </div>
        ))}
        {addBtn}
      </div>
    );
  }

  if (s.style === '4c') {
    // TimelineRail — dates above title+company, a description paragraph below.
    return (
      <div>
        {heading}
        {s.entries.map((ent: any) => (
          <div key={ent.id} style={{ marginTop: '14px', borderLeft: '2px solid #E6E2DA', paddingLeft: '16px', position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '-5px',
                top: '3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#3E5C76',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <DateRangeButtons ent={ent} fontSize="11px" gap="4px" />
              {delBtn(ent)}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '1px' }}>
              <input
                data-path={ent.pT}
                value={ent.title}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phT}
                aria-label="Job title"
                style={{ fontSize: '13.5px', fontWeight: '600', color: '#2E2B26', minWidth: '60px' }}
              />
              <span style={{ color: '#B5AFA5' }}>·</span>
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Company"
                style={{ fontSize: '13.5px', fontWeight: '600', color: '#2E2B26', flex: '1', minWidth: '60px' }}
              />
            </div>
            <Desc ent={ent} onEdit={onEdit} onFocusF={onFocusF} onKeyM={onKeyM} />
          </div>
        ))}
        {addBtn}
      </div>
    );
  }

  if (s.style === '4d') {
    // CompanyFirst — company eyebrow line above title, description paragraph below.
    return (
      <div>
        {heading}
        {s.entries.map((ent: any) => (
          <div key={ent.id} style={{ marginTop: '12px' }}>
            <input
              data-path={ent.pS}
              value={ent.subtitle}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phS}
              aria-label="Company"
              style={{
                display: 'block',
                width: '100%',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '.11em',
                textTransform: 'uppercase',
                color: 'var(--acc,#3E5C76)',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '2px' }}>
              <input
                data-path={ent.pT}
                value={ent.title}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phT}
                aria-label="Job title"
                style={{ flex: '1', minWidth: '0', fontSize: '15px', fontWeight: '700', color: '#26231F' }}
              />
              <DateRangeButtons ent={ent} fontSize="11.5px" gap="4px" />
              {delBtn(ent)}
            </div>
            <Desc ent={ent} onEdit={onEdit} onFocusF={onFocusF} onKeyM={onKeyM} />
          </div>
        ))}
        {addBtn}
      </div>
    );
  }

  if (s.style === '4e') {
    // TwoColumnMeta — company + dates in a fixed left column, title + description on the right.
    return (
      <div>
        {heading}
        {s.entries.map((ent: any) => (
          <div key={ent.id} style={{ display: 'grid', gridTemplateColumns: '128px 1fr', gap: '14px', marginTop: '12px' }}>
            <div>
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Company"
                style={{ display: 'block', width: '100%', fontSize: '12.5px', fontWeight: '600', color: '#2E2B26' }}
              />
              <div style={{ marginTop: '2px' }}>
                <DateRangeButtons ent={ent} fontSize="11px" gap="4px" />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <input
                  data-path={ent.pT}
                  value={ent.title}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phT}
                  aria-label="Job title"
                  style={{ flex: '1', minWidth: '0', fontSize: '13.5px', fontWeight: '600', color: '#2E2B26' }}
                />
                {delBtn(ent)}
              </div>
              <Desc ent={ent} onEdit={onEdit} onFocusF={onFocusF} onKeyM={onKeyM} />
            </div>
          </div>
        ))}
        {addBtn}
      </div>
    );
  }

  // '4a' (default) — ClassicParagraph: title+dates row, company below, description paragraph.
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
              aria-label="Job title"
              style={{ flex: '1', minWidth: '0', fontSize: '14px', fontWeight: '600', color: '#2E2B26' }}
            />
            <DateRangeButtons ent={ent} fontSize="11.5px" gap="4px" />
            {delBtn(ent)}
          </div>
          <input
            data-path={ent.pS}
            value={ent.subtitle}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyS}
            placeholder={ent.phS}
            aria-label="Company"
            style={{ display: 'block', width: '100%', fontSize: '12.5px', color: '#6B665E', marginTop: '2px' }}
          />
          <Desc ent={ent} onEdit={onEdit} onFocusF={onFocusF} onKeyM={onKeyM} />
        </div>
      ))}
      {addBtn}
    </div>
  );
}
