import React from 'react';
import StyleThumb from '../StyleThumb';
import RealStyleThumb from '../RealStyleThumb';

export interface AddSectionPopoverProps {
  addKey: (e: React.KeyboardEvent) => void;
  pickTypes: any[];
  pickNone: boolean;
  pickIsCustom: boolean;
  addTitle: string;
  onAddTitle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pickSel: boolean;
  pickStyles: any[];
}

export default function AddSectionPopover(v: AddSectionPopoverProps) {
  return (
    <div
      className="pop"
      role="dialog"
      aria-label="Add section"
      onKeyDown={v.addKey}
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: '46px',
        zIndex: '50',
        width: '560px',
        maxWidth: '96%',
        boxSizing: 'border-box',
        background: '#fff',
        border: '1px solid #E2DDD4',
        borderRadius: '12px',
        boxShadow: '0 14px 40px -12px rgba(30,27,22,.3)',
        padding: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          padding: '2px 4px 9px',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#54504A' }}>Add a section</div>
        <div style={{ fontSize: '11px', color: '#9A948A' }}>Pick a section, then a style</div>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
        <div
          style={{
            width: '152px',
            flex: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            borderRight: '1px solid #F0EDE7',
            paddingRight: '10px',
          }}
        >
          {v.pickTypes.map((it: any, i: number) => (
            <button
              key={i}
              onClick={it.pick}
              disabled={it.dis}
              className="hv-list-item"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '6px',
                width: '100%',
                textAlign: 'left',
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '12.5px',
                background: it.bg,
                color: it.fg,
                fontWeight: it.fw,
              }}
            >
              <span>{it.label}</span>
              <span style={{ fontSize: '10.5px', color: '#A9A29A', flex: 'none' }}>{it.note}</span>
            </button>
          ))}
        </div>
        <div style={{ flex: '1', minWidth: '0' }}>
          {v.pickNone && (
            <div
              style={{
                minHeight: '180px',
                height: '100%',
                display: 'grid',
                placeItems: 'center',
                fontSize: '12px',
                color: '#A9A29A',
                textAlign: 'center',
                padding: '0 24px',
                lineHeight: '1.5',
              }}
            >
              Select a section on the left to preview its styles
            </div>
          )}
          {v.pickIsCustom && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}
            >
              <input
                value={v.addTitle}
                onChange={v.onAddTitle}
                autoFocus
                placeholder="Section title"
                aria-label="Custom section title"
                className="fc-field"
                style={
                  {
                    flex: '1',
                    minWidth: '0',
                    fieldSizing: 'fixed',
                    border: '1px solid #D8D3CA',
                    borderRadius: '6px',
                    padding: '6px 9px',
                    margin: '0',
                    fontSize: '13px',
                    background: '#fff',
                  } as React.CSSProperties
                }
              />
              <span style={{ fontSize: '11px', color: '#9A948A', flex: 'none' }}>
                then pick a style
              </span>
            </div>
          )}
          {v.pickSel && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
                gap: '8px',
              }}
            >
              {v.pickStyles.map((st: any, i: number) => (
                <button
                  key={i}
                  onClick={st.pick}
                  disabled={st.dis}
                  title="Add with this style"
                  className="hv-style-card"
                  style={{
                    textAlign: 'left',
                    border: `1px solid ${st.brd}`,
                    borderRadius: '8px',
                    padding: '9px 10px',
                    background: st.bgc,
                  }}
                >
                  {st.isCatalog ? (
                    <RealStyleThumb Component={st.Component} width={150} />
                  ) : (
                    <StyleThumb st={st} />
                  )}
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#54504A' }}>
                    {st.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
