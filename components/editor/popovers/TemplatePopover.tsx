import React from 'react';
import { FiCheck } from 'react-icons/fi';

export interface TemplatePopoverProps {
  popKey: (e: React.KeyboardEvent) => void;
  tp: {
    x: number;
    y: number;
    items: Array<{
      id: string;
      name: string;
      font: string;
      dot: string;
      sel: boolean;
      brd: string;
      pick: () => void;
    }>;
  };
}

export default function TemplatePopover({ popKey, tp }: TemplatePopoverProps) {
  return (
    <div
      className="pop"
      role="dialog"
      aria-label="Choose a template"
      onKeyDown={popKey}
      style={{
        position: 'absolute',
        zIndex: '50',
        left: `${tp.x}px`,
        top: `${tp.y}px`,
        width: '300px',
        boxSizing: 'border-box',
        background: '#fff',
        border: '1px solid #E2DDD4',
        borderRadius: '12px',
        boxShadow: '0 14px 40px -12px rgba(30,27,22,.3)',
        padding: '10px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#54504A',
          marginBottom: '8px',
          padding: '0 2px',
        }}
      >
        Resume template
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {tp.items.map((it) => (
          <button
            key={it.id}
            onClick={it.pick}
            className="hv-soft"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              textAlign: 'left',
              padding: '8px 9px',
              border: `1px solid ${it.brd}`,
              borderRadius: '8px',
              background: '#fff',
            }}
          >
            <span
              style={{
                width: '15px',
                height: '15px',
                flex: 'none',
                borderRadius: '50%',
                background: it.dot,
              }}
            />
            <span style={{ flex: '1', minWidth: '0' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: '#2E2B26',
                  fontFamily: it.font,
                }}
              >
                {it.name}
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '10.5px',
                  color: '#9A948A',
                  fontFamily: it.font,
                  marginTop: '1px',
                }}
              >
                The quick brown fox
              </span>
            </span>
            {it.sel && <FiCheck size={14} strokeWidth={1.8} color="var(--acc,#3E5C76)" />}
          </button>
        ))}
      </div>
    </div>
  );
}
