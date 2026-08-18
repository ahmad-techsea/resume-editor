'use client';

import React from 'react';

export interface FilterChip {
  id: string;
  label: string;
  pressed: boolean;
  pick: () => void;
  bg: string;
  fg: string;
  brd: string;
}

export interface ReviewFiltersProps {
  severityChips: FilterChip[];
  categoryChips: FilterChip[];
}

export default function ReviewFilters({ severityChips, categoryChips }: ReviewFiltersProps) {
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '6px' }}>
        {severityChips.map((sv, i) => (
          <button
            key={i}
            onClick={sv.pick}
            aria-pressed={sv.pressed}
            style={{
              padding: '4px 9px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '600',
              background: sv.bg,
              color: sv.fg,
              border: `1px solid ${sv.brd}`,
            }}
          >
            {sv.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
        {categoryChips.map((cc, i) => (
          <button
            key={i}
            onClick={cc.pick}
            aria-pressed={cc.pressed}
            style={{
              padding: '3px 8px',
              borderRadius: '999px',
              fontSize: '10.5px',
              background: cc.bg,
              color: cc.fg,
              border: `1px solid ${cc.brd}`,
            }}
          >
            {cc.label}
          </button>
        ))}
      </div>
    </>
  );
}
