import React from 'react';
import { FiX } from 'react-icons/fi';
import { LINK_ICON, TRASH_ICON } from './icons';
import DateRangeButtons from './DateRangeButtons';
import type { ResumeFieldColorMap } from './SectionBlock';
import { atomicBlock, type PgBlockSpec } from './pagination/block-spec';

export interface EntryFieldsProps {
  s: any;
  ent: any;
  onEdit: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocusF: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyS: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyM: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  colorMap?: ResumeFieldColorMap;
  fieldRef?: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
}

/** Builds the pagination block for one entry. The whole entry (head + description + bullets) is
 *  one atomic unit — it moves to the next page as a whole rather than splitting internally (a
 *  section still breaks *between* entries; see the plan's scoping note on entry-level vs.
 *  sub-entry granularity). Returns a plain block descriptor, not a mounted component — the
 *  pagination engine (PaginatedResumeView) decides which page's container actually renders it. */
export default function buildEntryFieldsBlock({
  s,
  ent,
  onEdit,
  onFocusF,
  onKeyS,
  onKeyM,
  colorMap,
  fieldRef,
}: EntryFieldsProps): PgBlockSpec {
  const linkable = s.entLinkable !== false;
  const hasDates = ent.hasDates !== false;
  const fcol = (path?: string) =>
    path && colorMap && colorMap[path] ? colorMap[path].color : undefined;
  const bcol = (path?: string) => {
    const c = fcol(path);
    return c ? { borderBottom: `2px solid ${c}` } : {};
  };

  const dateSlot = hasDates ? (
    <DateRangeButtons ent={ent} fontSize="12.5px" gap="5px" readOnly={ent.datesReadOnly} />
  ) : ent.meta ? (
    <input
      data-path={ent.meta.path}
      value={ent.meta.value ?? ''}
      onChange={onEdit}
      onFocus={onFocusF}
      onKeyDown={onKeyS}
      placeholder={ent.meta.placeholder}
      aria-label={ent.meta.placeholder || 'Year'}
      ref={fieldRef}
      style={{
        width: '56px',
        flex: 'none',
        textAlign: 'right',
        fontSize: '11.5px',
        color: '#9A948A',
        ...bcol(ent.meta.path),
      }}
    />
  ) : null;

  const node = (
    <div
      className="ent"
      style={{
        position: 'relative',
        marginTop: '16px',
        display: s.entDisp,
        gridTemplateColumns: '112px 1fr',
        gap: '0 14px',
      }}
    >
      <div
        className="ectls"
        style={{
          position: 'absolute',
          left: s.ectlLeft,
          top: '0',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: `2px ${s.ectlPad} 6px 0`,
        }}
      >
        {linkable && (
          <button
            onClick={ent.openLink}
            aria-label="Add or edit entry link"
            title="Add or edit link"
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
            {LINK_ICON}
          </button>
        )}
        <button
          onClick={ent.del}
          aria-label="Delete entry"
          title="Delete entry"
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
      {s.entTimeline && (
        <span
          style={{
            position: 'absolute',
            left: '-21px',
            top: '5px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--acc,#3E5C76)',
          }}
        />
      )}
      {s.entDatesLeft && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '2px',
            fontSize: '12px',
            paddingTop: '3px',
          }}
        >
          <button
            onClick={ent.openStart}
            title="Set start date"
            className="hv-link"
            style={{ color: ent.startCol, borderRadius: '4px', padding: '0 2px' }}
          >
            {ent.startLbl}
          </button>
          <button
            onClick={ent.openEnd}
            title="Set end date"
            className="hv-link"
            style={{ color: ent.endCol, borderRadius: '4px', padding: '0 2px' }}
          >
            {ent.endLbl}
          </button>
        </div>
      )}
      <div style={{ minWidth: '0' }}>
        {s.entClassic && (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <input
                data-path={ent.pT}
                value={ent.title}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phT}
                aria-label="Entry title"
                ref={fieldRef}
                style={{
                  flex: '1',
                  minWidth: '60px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#2E2B26',
                  ...bcol(ent.pT),
                }}
              />
              {dateSlot}
            </div>
            {ent.pS2 ? (
              <div style={{ display: 'flex', gap: '14px', marginTop: '3px' }}>
                <input
                  data-path={ent.pS}
                  value={ent.subtitle}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phS}
                  aria-label="Organization"
                  ref={fieldRef}
                  style={{
                    flex: '1',
                    minWidth: '0',
                    fontSize: '13.5px',
                    color: '#6B665E',
                    ...bcol(ent.pS),
                  }}
                />
                <input
                  data-path={ent.pS2}
                  value={ent.subtitle2}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phS2}
                  aria-label="Location"
                  ref={fieldRef}
                  style={{
                    flex: '1',
                    minWidth: '0',
                    fontSize: '13.5px',
                    color: '#6B665E',
                    ...bcol(ent.pS2),
                  }}
                />
              </div>
            ) : (
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Organization"
                ref={fieldRef}
                style={{
                  display: 'block',
                  width: '100%',
                  fontSize: '13.5px',
                  color: '#6B665E',
                  marginTop: '3px',
                  ...bcol(ent.pS),
                }}
              />
            )}
          </>
        )}
        {s.entTimeline && (
          <>
            <div
              style={{ fontSize: '11.5px', display: 'flex', alignItems: 'baseline', gap: '5px' }}
            >
              <button
                onClick={ent.openStart}
                title="Set start date"
                className="hv-link"
                style={{ color: ent.startCol, borderRadius: '4px', padding: '0 2px' }}
              >
                {ent.startLbl}
              </button>
              <span style={{ color: '#B5AFA5' }}>–</span>
              <button
                onClick={ent.openEnd}
                title="Set end date"
                className="hv-link"
                style={{ color: ent.endCol, borderRadius: '4px', padding: '0 2px' }}
              >
                {ent.endLbl}
              </button>
            </div>
            <input
              data-path={ent.pT}
              value={ent.title}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phT}
              aria-label="Entry title"
              ref={fieldRef}
              style={{
                display: 'block',
                width: '100%',
                fontSize: '15px',
                fontWeight: '600',
                color: '#2E2B26',
                marginTop: '2px',
                ...bcol(ent.pT),
              }}
            />
            {ent.pS2 ? (
              <div style={{ display: 'flex', gap: '14px', marginTop: '2px' }}>
                <input
                  data-path={ent.pS}
                  value={ent.subtitle}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phS}
                  aria-label="Organization"
                  ref={fieldRef}
                  style={{
                    flex: '1',
                    minWidth: '0',
                    fontSize: '13px',
                    color: '#6B665E',
                    ...bcol(ent.pS),
                  }}
                />
                <input
                  data-path={ent.pS2}
                  value={ent.subtitle2}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phS2}
                  aria-label="Location"
                  ref={fieldRef}
                  style={{
                    flex: '1',
                    minWidth: '0',
                    fontSize: '13px',
                    color: '#6B665E',
                    ...bcol(ent.pS2),
                  }}
                />
              </div>
            ) : (
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Organization"
                ref={fieldRef}
                style={{
                  display: 'block',
                  width: '100%',
                  fontSize: '13px',
                  color: '#6B665E',
                  marginTop: '2px',
                  ...bcol(ent.pS),
                }}
              />
            )}
          </>
        )}
        {s.entDatesLeft && (
          <>
            <input
              data-path={ent.pT}
              value={ent.title}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phT}
              aria-label="Entry title"
              ref={fieldRef}
              style={{
                display: 'block',
                width: '100%',
                fontSize: '15px',
                fontWeight: '600',
                color: '#2E2B26',
                ...bcol(ent.pT),
              }}
            />
            {ent.pS2 ? (
              <div style={{ display: 'flex', gap: '14px', marginTop: '2px' }}>
                <input
                  data-path={ent.pS}
                  value={ent.subtitle}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phS}
                  aria-label="Organization"
                  ref={fieldRef}
                  style={{
                    flex: '1',
                    minWidth: '0',
                    fontSize: '13px',
                    color: '#6B665E',
                    ...bcol(ent.pS),
                  }}
                />
                <input
                  data-path={ent.pS2}
                  value={ent.subtitle2}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phS2}
                  aria-label="Location"
                  ref={fieldRef}
                  style={{
                    flex: '1',
                    minWidth: '0',
                    fontSize: '13px',
                    color: '#6B665E',
                    ...bcol(ent.pS2),
                  }}
                />
              </div>
            ) : (
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Organization"
                ref={fieldRef}
                style={{
                  display: 'block',
                  width: '100%',
                  fontSize: '13px',
                  color: '#6B665E',
                  marginTop: '2px',
                  ...bcol(ent.pS),
                }}
              />
            )}
          </>
        )}
        {s.entCompact && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <input
              data-path={ent.pT}
              value={ent.title}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phT}
              aria-label="Entry title"
              ref={fieldRef}
              style={{
                minWidth: '60px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2E2B26',
                ...bcol(ent.pT),
              }}
            />
            <input
              data-path={ent.pS}
              value={ent.subtitle}
              onChange={onEdit}
              onFocus={onFocusF}
              onKeyDown={onKeyS}
              placeholder={ent.phS}
              aria-label="Organization"
              ref={fieldRef}
              style={{
                flex: '1',
                minWidth: '90px',
                fontSize: '13px',
                color: '#6B665E',
                ...bcol(ent.pS),
              }}
            />
            {ent.pS2 && (
              <input
                data-path={ent.pS2}
                value={ent.subtitle2}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS2}
                aria-label="Location"
                ref={fieldRef}
                style={{
                  flex: '1',
                  minWidth: '90px',
                  fontSize: '13px',
                  color: '#6B665E',
                  ...bcol(ent.pS2),
                }}
              />
            )}
            <DateRangeButtons
              ent={ent}
              fontSize="12px"
              gap="5px"
              extra={{ marginLeft: 'auto' }}
              readOnly={ent.datesReadOnly}
            />
          </div>
        )}
        {s.entCompanyFirst && (
          <>
            {ent.pS2 ? (
              <div style={{ display: 'flex', gap: '14px' }}>
                <input
                  data-path={ent.pS}
                  value={ent.subtitle}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phS}
                  aria-label="Organization"
                  ref={fieldRef}
                  style={{
                    flex: '1',
                    minWidth: '0',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '.11em',
                    textTransform: 'uppercase',
                    color: 'var(--acc,#3E5C76)',
                    ...bcol(ent.pS),
                  }}
                />
                <input
                  data-path={ent.pS2}
                  value={ent.subtitle2}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder={ent.phS2}
                  aria-label="Location"
                  ref={fieldRef}
                  style={{
                    flex: '1',
                    minWidth: '0',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '.11em',
                    textTransform: 'uppercase',
                    color: 'var(--acc,#3E5C76)',
                    ...bcol(ent.pS2),
                  }}
                />
              </div>
            ) : (
              <input
                data-path={ent.pS}
                value={ent.subtitle}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phS}
                aria-label="Organization"
                ref={fieldRef}
                style={{
                  display: 'block',
                  width: '100%',
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '.11em',
                  textTransform: 'uppercase',
                  color: 'var(--acc,#3E5C76)',
                  ...bcol(ent.pS),
                }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginTop: '2px' }}>
              <input
                data-path={ent.pT}
                value={ent.title}
                onChange={onEdit}
                onFocus={onFocusF}
                onKeyDown={onKeyS}
                placeholder={ent.phT}
                aria-label="Entry title"
                ref={fieldRef}
                style={{
                  flex: '1',
                  minWidth: '0',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#26231F',
                  ...bcol(ent.pT),
                }}
              />
              <DateRangeButtons
                ent={ent}
                fontSize="12.5px"
                gap="5px"
                readOnly={ent.datesReadOnly}
              />
            </div>
          </>
        )}
        {ent.hasLink && (
          <div style={{ marginTop: '4px', fontSize: '12.5px' }}>
            <a
              href={ent.linkHref}
              target="_blank"
              rel="noopener"
              style={{
                display: 'inline-block',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                verticalAlign: 'bottom',
              }}
            >
              {ent.linkText}
            </a>
          </div>
        )}
        {ent.pD && (
          <textarea
            data-path={ent.pD}
            value={ent.desc}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyM}
            placeholder={ent.phD}
            aria-label="Description"
            rows={1}
            ref={fieldRef}
            style={{
              width: '100%',
              marginTop: '6px',
              fontSize: '13.5px',
              lineHeight: '1.6',
              color: '#3B3833',
              textWrap: 'pretty',
              ...bcol(ent.pD),
            }}
          />
        )}
        {ent.hasContribs && (
          <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {ent.contribs.map((cb: any) => (
              <div
                key={cb.id}
                className="cbrow"
                style={{ display: 'flex', alignItems: 'baseline', gap: '8px', paddingLeft: '2px' }}
              >
                <span style={{ color: 'var(--acc,#3E5C76)', fontSize: '13px', lineHeight: '1.6' }}>
                  •
                </span>
                <input
                  data-path={cb.path}
                  value={cb.val}
                  onChange={onEdit}
                  onFocus={onFocusF}
                  onKeyDown={onKeyS}
                  placeholder="Contribution or achievement…"
                  aria-label="Contribution"
                  ref={fieldRef}
                  style={{
                    flex: '1',
                    minWidth: '60px',
                    fontSize: '13.5px',
                    lineHeight: '1.6',
                    color: '#3B3833',
                    ...bcol(cb.path),
                  }}
                />
                <button
                  className="cbdel hv-ctl-del"
                  onClick={cb.del}
                  aria-label="Delete contribution"
                  title="Delete contribution"
                  style={{
                    width: '18px',
                    height: '18px',
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '5px',
                    color: '#948E84',
                    alignSelf: 'center',
                  }}
                >
                  <FiX size={9} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
        {ent.addContrib && (
          <button
            className="adde hv-add-contrib"
            onClick={ent.addContrib}
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
            + Add contribution
          </button>
        )}
      </div>
    </div>
  );
  return atomicBlock(ent.pathPrefix, node);
}
