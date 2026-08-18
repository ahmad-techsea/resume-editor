import React from 'react';
import { FiX } from 'react-icons/fi';
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

/** Editable ports of components/sections/skills/*.tsx (ids 7a-7e). 7a/7b reuse the section's
 *  existing comma-string `body` (same as today's classic/pills rendering); 7c/7d/7e read/write
 *  the section's `skillGroups`/`skillLevels` arrays instead. */
export default function SkillsEditor({ s, onEdit, onFocusF, onKeyS, onKeyM }: CatalogSectionProps) {
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

  if (s.style === '7b') {
    // PillTags — same click-to-edit pill list as today's default "pills" style.
    return (
      <div>
        {heading}
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
            style={{ width: '100%', marginTop: '11px', fontSize: '13.5px', lineHeight: '1.62', color: '#3B3833' }}
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
              <span key={i} style={{ border: '1px solid #D8D4CC', borderRadius: '999px', padding: '4px 11px', fontSize: '11.5px', color: '#3B3833' }}>
                {pl.t}
              </span>
            ))}
            {s.pillsEmpty && <span style={{ fontSize: '13.5px', color: '#A9A29A', padding: '4px 0' }}>{s.phBody}</span>}
          </div>
        )}
      </div>
    );
  }

  if (s.style === '7c') {
    // GroupedColumns — labeled group rows, each a comma-list of items.
    return (
      <div>
        {heading}
        <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr auto', gap: '8px 14px', marginTop: '11px', alignItems: 'baseline' }}>
          {s.skillGroups.map((g: any) => (
            <React.Fragment key={g.key}>
              <input
                data-path={g.pLabel}
                value={g.label}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder="Category"
                aria-label="Skill group label"
                style={{ fontSize: '10.5px', fontWeight: '700', letterSpacing: '.1em', textTransform: 'uppercase', color: '#9A948A' }}
              />
              <input
                data-path={g.pItems}
                value={g.items}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder="Comma-separated skills…"
                aria-label="Skills in group"
                style={{ fontSize: '12.5px', color: '#3B3833' }}
              />
              <button onClick={g.del} aria-label="Delete group" title="Delete group" className="hv-danger" style={delBtnStyle}>
                <FiX size={11} strokeWidth={1.6} />
              </button>
            </React.Fragment>
          ))}
        </div>
        <button
          className="adde hv-add-contrib"
          onClick={s.addSkillGroup}
          style={{
            marginTop: '8px',
            fontSize: '11.5px',
            fontWeight: '600',
            color: '#8A857C',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 6px',
            borderRadius: '5px',
          }}
        >
          + Add group
        </button>
      </div>
    );
  }

  if (s.style === '7d' || s.style === '7e') {
    // ProficiencyBars / DotRatings — shared skillLevels data, different visual readout.
    const isDots = s.style === '7e';
    return (
      <div>
        {heading}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginTop: '12px' }}>
          {s.skillLevels.map((sk: any) => (
            <div key={sk.key} style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto auto', gap: '10px', alignItems: 'center' }}>
              <input
                data-path={sk.pName}
                value={sk.name}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder="Skill"
                aria-label="Skill name"
                style={{ fontSize: '12.5px', color: '#2E2B26' }}
              />
              <input
                type="range"
                min={0}
                max={100}
                data-path={sk.pLevel}
                value={sk.level}
                onChange={onEdit}
                aria-label="Proficiency level"
                style={{ width: '100%', accentColor: '#3E5C76' }}
              />
              {isDots ? (
                <span style={{ display: 'flex', gap: '4px', flex: 'none' }}>
                  {[0, 1, 2, 3, 4].map((d) => (
                    <span
                      key={d}
                      style={{ width: '7px', height: '7px', borderRadius: '50%', background: d < sk.dots ? '#3E5C76' : '#E6E2DA' }}
                    />
                  ))}
                </span>
              ) : (
                <span style={{ fontSize: '10.5px', color: '#9A948A', width: '30px', textAlign: 'right', flex: 'none' }}>{sk.pct}%</span>
              )}
              <button onClick={sk.del} aria-label="Delete skill" title="Delete skill" className="hv-danger" style={delBtnStyle}>
                <FiX size={10} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
        <button
          className="adde hv-add-contrib"
          onClick={s.addSkillLevel}
          style={{
            marginTop: '4px',
            fontSize: '11.5px',
            fontWeight: '600',
            color: '#8A857C',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 6px',
            borderRadius: '5px',
          }}
        >
          + Add skill
        </button>
      </div>
    );
  }

  // '7a' (default) — CommaList: same as today's classic style, a single comma-separated body.
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
        style={{ width: '100%', marginTop: '10px', fontSize: '13px', lineHeight: '1.6', color: '#3B3833', textWrap: 'pretty' }}
      />
    </div>
  );
}
