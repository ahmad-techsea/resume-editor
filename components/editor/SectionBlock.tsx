import React from 'react';
import { FiGrid, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { TRASH_ICON } from './icons';
import EntryFields from './EntryFields';
import CatalogSectionRenderer from './sections';

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

export default function SectionBlock({
  s,
  onEdit,
  onFocusF,
  onKeyS,
  onKeyM,
  colorMap,
  fieldRef,
}: SectionBlockProps) {
  const showControls = s.showSectionControls !== false;
  const titleEditable = s.titleEditable !== false;
  const fcol = (path?: string) =>
    path && colorMap && colorMap[path] ? colorMap[path].color : undefined;
  return (
    <section className="sec" style={{ position: 'relative', marginTop: '30px' }}>
      {showControls && (
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
      )}

      {s.useCatalog ? (
        <CatalogSectionRenderer
          s={s}
          onEdit={onEdit}
          onFocusF={onFocusF}
          onKeyS={onKeyS}
          onKeyM={onKeyM}
        />
      ) : (
        <>
          {s.headTop &&
            (titleEditable ? (
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
            ) : (
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
            ))}
          {s.txtClassic && (
            <textarea
              data-path={s.pBody}
              value={s.body}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyM}
              placeholder={s.phBody}
              aria-label="Section text"
              rows={1}
              ref={fieldRef}
              style={{
                width: '100%',
                marginTop: '9px',
                fontSize: '13.5px',
                lineHeight: '1.62',
                color: s.bodyColor,
                textAlign: s.bodyAlign,
                textWrap: 'pretty',
                ...(fcol(s.pBody) ? { borderBottom: `2px solid ${fcol(s.pBody)}` } : {}),
              }}
            />
          )}
          {s.txtSide && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '112px 1fr',
                gap: '18px',
                marginTop: '4px',
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
                    width: '100%',
                    alignSelf: 'start',
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
                    alignSelf: 'start',
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
              )}
              <textarea
                data-path={s.pBody}
                value={s.body}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyM}
                placeholder={s.phBody}
                aria-label="Section text"
                rows={1}
                ref={fieldRef}
                style={{
                  width: '100%',
                  fontSize: '13.5px',
                  lineHeight: '1.62',
                  color: '#3B3833',
                  textWrap: 'pretty',
                  ...(fcol(s.pBody) ? { borderBottom: `2px solid ${fcol(s.pBody)}` } : {}),
                }}
              />
            </div>
          )}
          {s.txtTinted && (
            <div
              style={{
                background: 'color-mix(in oklab,var(--acc,#3E5C76) 5%,#fff)',
                borderRadius: '8px',
                padding: '14px 16px',
                marginTop: '6px',
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
              <textarea
                data-path={s.pBody}
                value={s.body}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyM}
                placeholder={s.phBody}
                aria-label="Section text"
                rows={1}
                ref={fieldRef}
                style={{
                  width: '100%',
                  marginTop: '6px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#3B3833',
                  textWrap: 'pretty',
                  ...(fcol(s.pBody) ? { borderBottom: `2px solid ${fcol(s.pBody)}` } : {}),
                }}
              />
            </div>
          )}
          {s.txtEditorial && (
            <div
              style={{
                borderTop: '1px solid #E6E2DA',
                borderBottom: '1px solid #E6E2DA',
                padding: '12px 0',
                marginTop: '6px',
              }}
            >
              <textarea
                data-path={s.pBody}
                value={s.body}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyM}
                placeholder={s.phBody}
                aria-label="Section text"
                rows={1}
                ref={fieldRef}
                style={{
                  width: '100%',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: '#26231F',
                  textWrap: 'pretty',
                  ...(fcol(s.pBody) ? { borderBottom: `2px solid ${fcol(s.pBody)}` } : {}),
                }}
              />
            </div>
          )}
          {s.txtPills && (
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
            </>
          )}
          {s.isEntries && (
            <>
              <div style={{ borderLeft: s.entRail, paddingLeft: s.entRailPad }}>
                {s.entries.map((ent: any) => (
                  <React.Fragment key={ent.id}>
                    <EntryFields
                      s={s}
                      ent={ent}
                      onEdit={onEdit}
                      onFocusF={onFocusF}
                      onKeyS={onKeyS}
                      onKeyM={onKeyM}
                      colorMap={colorMap}
                      fieldRef={fieldRef}
                    />
                  </React.Fragment>
                ))}
              </div>
              {/* The label is its own element on purpose: this button is an inline-flex box with
              `gap: 5px`, so "+" and the label must be two flex items for the gap to apply. */}
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
            </>
          )}
        </>
      )}
    </section>
  );
}
