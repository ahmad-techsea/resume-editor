import React from 'react';

export interface ConfirmDeletePopoverProps {
  popKey: (e: React.KeyboardEvent) => void;
  closePop: () => void;
  cf: {
    x: number;
    y: number;
    title: string;
    msg: string;
    confirm: () => void;
  };
}

export default function ConfirmDeletePopover({ popKey, closePop, cf }: ConfirmDeletePopoverProps) {
  return (
    <div
      className="pop"
      role="alertdialog"
      aria-label="Confirm delete"
      onKeyDown={popKey}
      style={{
        position: 'absolute',
        zIndex: '50',
        left: `${cf.x}px`,
        top: `${cf.y}px`,
        width: '272px',
        boxSizing: 'border-box',
        background: '#fff',
        border: '1px solid #E2DDD4',
        borderRadius: '10px',
        boxShadow: '0 12px 34px -10px rgba(30,27,22,.3)',
        padding: '13px',
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: '700', color: '#2E2B26' }}>{cf.title}</div>
      <div style={{ marginTop: '4px', fontSize: '12.5px', color: '#6B665E', lineHeight: '1.5' }}>
        {cf.msg}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={closePop}
          autoFocus
          className="hv-plain"
          style={{
            color: '#54504A',
            fontSize: '12.5px',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid #DDD8CF',
          }}
        >
          Cancel
        </button>
        <button
          onClick={cf.confirm}
          className="hv-confirm-del"
          style={{
            background: '#B04A42',
            color: '#fff',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '12.5px',
            fontWeight: '600',
          }}
        >
          Delete section
        </button>
      </div>
    </div>
  );
}
