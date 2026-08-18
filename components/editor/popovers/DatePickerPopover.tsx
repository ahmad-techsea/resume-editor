import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface DatePickerPopoverProps {
  popKey: (e: React.KeyboardEvent) => void;
  dp: {
    x: number;
    y: number;
    year: string;
    err: string | false;
    isEnd: boolean;
    prev: () => void;
    next: () => void;
    months: Array<{ lbl: string; bg: string; fg: string; fw: number; pick: () => void }>;
    clear: () => void;
    present: () => void;
    presBg: string;
    presFg: string;
  };
}

export default function DatePickerPopover({ popKey, dp }: DatePickerPopoverProps) {
  return (
    <div
      className="pop"
      role="dialog"
      aria-label="Choose month and year"
      onKeyDown={popKey}
      style={{
        position: 'absolute',
        zIndex: '50',
        left: `${dp.x}px`,
        top: `${dp.y}px`,
        width: '256px',
        boxSizing: 'border-box',
        background: '#fff',
        border: '1px solid #E2DDD4',
        borderRadius: '10px',
        boxShadow: '0 12px 34px -10px rgba(30,27,22,.3)',
        padding: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={dp.prev}
          aria-label="Previous year"
          className="hv-list-item"
          style={{
            width: '24px',
            height: '24px',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '6px',
            color: '#6B665E',
          }}
        >
          <FiChevronLeft size={11} strokeWidth={1.6} />
        </button>
        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#2E2B26' }}>{dp.year}</span>
        <button
          onClick={dp.next}
          aria-label="Next year"
          className="hv-list-item"
          style={{
            width: '24px',
            height: '24px',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '6px',
            color: '#6B665E',
          }}
        >
          <FiChevronRight size={11} strokeWidth={1.6} />
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: '4px',
          marginTop: '10px',
        }}
      >
        {dp.months.map((m, i) => (
          <button
            key={i}
            onClick={m.pick}
            className="hv-month"
            style={{
              padding: '7px 0',
              borderRadius: '6px',
              fontSize: '12.5px',
              background: m.bg,
              color: m.fg,
              fontWeight: m.fw,
            }}
          >
            {m.lbl}
          </button>
        ))}
      </div>
      {dp.err && (
        <div
          role="alert"
          style={{ marginTop: '9px', fontSize: '12px', color: '#B04A42', lineHeight: '1.45' }}
        >
          {dp.err}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '11px',
        }}
      >
        <button
          onClick={dp.clear}
          className="hv-muted"
          style={{ fontSize: '12.5px', color: '#8A857C', padding: '4px 8px', borderRadius: '6px' }}
        >
          Clear
        </button>
        {dp.isEnd && (
          <button
            onClick={dp.present}
            className="hv-b105"
            style={{
              fontSize: '12.5px',
              fontWeight: '600',
              padding: '4px 12px',
              borderRadius: '6px',
              background: dp.presBg,
              color: dp.presFg,
            }}
          >
            Present
          </button>
        )}
      </div>
    </div>
  );
}
