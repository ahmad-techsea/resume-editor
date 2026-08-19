import React from 'react';
import { FiCheck } from 'react-icons/fi';
import StyleThumb from '../StyleThumb';
import RealStyleThumb from '../RealStyleThumb';

export interface RestylePopoverProps {
  popKey: (e: React.KeyboardEvent) => void;
  rp: {
    x: number;
    y: number;
    secTitle: string;
    styles: any[];
  };
}

export default function RestylePopover({ popKey, rp }: RestylePopoverProps) {
  return (
    <div
      className="pop"
      role="dialog"
      aria-label="Section style"
      onKeyDown={popKey}
      style={{
        position: 'absolute',
        zIndex: '50',
        left: `${rp.x}px`,
        top: `${rp.y}px`,
        width: '320px',
        boxSizing: 'border-box',
        background: '#fff',
        border: '1px solid #E2DDD4',
        borderRadius: '12px',
        boxShadow: '0 14px 40px -12px rgba(30,27,22,.3)',
        padding: '12px',
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#54504A', marginBottom: '9px' }}>
        Style — {rp.secTitle}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '8px' }}>
        {rp.styles.map((st: any, i: number) => (
          <button
            key={i}
            onClick={st.pick}
            title={st.name}
            className="hv-style-card-plain"
            style={{
              textAlign: 'left',
              border: `1px solid ${st.brd}`,
              borderRadius: '8px',
              padding: '9px 10px',
              background: st.bgc,
            }}
          >
            {st.isCatalog ? (
              <RealStyleThumb Component={st.Component} width={120} />
            ) : (
              <StyleThumb st={st} />
            )}
            <div
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#54504A',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {st.name}
              {st.sel && <FiCheck size={12} strokeWidth={1.8} color="var(--acc,#3E5C76)" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
