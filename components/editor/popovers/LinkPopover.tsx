import React from 'react';

export interface LinkPopoverProps {
  popKey: (e: React.KeyboardEvent) => void;
  lpKeySave: (e: React.KeyboardEvent) => void;
  closePop: () => void;
  lp: {
    x: number;
    y: number;
    url: string;
    text: string;
    err: string | false;
    canRemove: boolean;
    heading: string;
    onUrl: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onText: (e: React.ChangeEvent<HTMLInputElement>) => void;
    save: () => void;
    remove: () => void;
  };
}

export default function LinkPopover({ popKey, lpKeySave, closePop, lp }: LinkPopoverProps) {
  return (
    <div
      className="pop"
      role="dialog"
      aria-label="Edit link"
      onKeyDown={popKey}
      style={{
        position: 'absolute',
        zIndex: '50',
        left: `${lp.x}px`,
        top: `${lp.y}px`,
        width: '308px',
        boxSizing: 'border-box',
        background: '#fff',
        border: '1px solid #E2DDD4',
        borderRadius: '10px',
        boxShadow: '0 12px 34px -10px rgba(30,27,22,.3)',
        padding: '13px',
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#54504A' }}>{lp.heading}</div>
      <label
        style={{
          display: 'block',
          marginTop: '9px',
          fontSize: '11.5px',
          fontWeight: '600',
          color: '#8A857C',
        }}
      >
        URL
        <input
          value={lp.url}
          onChange={lp.onUrl}
          onKeyDown={lpKeySave}
          autoFocus
          placeholder="example.com/portfolio"
          className="fc-field"
          style={
            {
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              margin: '3px 0 0',
              fieldSizing: 'fixed',
              border: '1px solid #D8D3CA',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '13px',
              fontWeight: '400',
              background: '#fff',
            } as React.CSSProperties
          }
        />
      </label>
      <label
        style={{
          display: 'block',
          marginTop: '8px',
          fontSize: '11.5px',
          fontWeight: '600',
          color: '#8A857C',
        }}
      >
        Display text <span style={{ fontWeight: '400' }}>(optional — defaults to the URL)</span>
        <input
          value={lp.text}
          onChange={lp.onText}
          onKeyDown={lpKeySave}
          placeholder="Defaults to the URL"
          className="fc-field"
          style={
            {
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              margin: '3px 0 0',
              fieldSizing: 'fixed',
              border: '1px solid #D8D3CA',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '13px',
              fontWeight: '400',
              background: '#fff',
            } as React.CSSProperties
          }
        />
      </label>
      {lp.err && (
        <div
          role="alert"
          style={{ marginTop: '8px', fontSize: '12px', color: '#B04A42', lineHeight: '1.45' }}
        >
          {lp.err}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={lp.save}
          className="hv-b108"
          style={{
            background: 'var(--acc,#3E5C76)',
            color: '#fff',
            borderRadius: '6px',
            padding: '5px 13px',
            fontSize: '12.5px',
            fontWeight: '600',
          }}
        >
          Save
        </button>
        {lp.canRemove && (
          <button
            onClick={lp.remove}
            className="hv-remove"
            style={{
              color: '#B04A42',
              fontSize: '12.5px',
              fontWeight: '600',
              padding: '5px 8px',
              borderRadius: '6px',
            }}
          >
            Remove
          </button>
        )}
        <button
          onClick={closePop}
          className="hv-muted"
          style={{
            marginLeft: 'auto',
            color: '#8A857C',
            fontSize: '12.5px',
            padding: '5px 8px',
            borderRadius: '6px',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
