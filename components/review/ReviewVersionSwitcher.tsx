'use client';

import React from 'react';

export interface VersionTab {
  id: number;
  label: string;
  score: number;
  timeLabel: string;
  active: boolean;
}

export interface ReviewVersionSwitcherProps {
  versions: VersionTab[];
  onSelect: (id: number) => void;
}

export default function ReviewVersionSwitcher({ versions, onSelect }: ReviewVersionSwitcherProps) {
  if (versions.length < 2) return null;
  return (
    <div
      role="tablist"
      aria-label="Review versions"
      style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '4px',
        marginBottom: '14px',
      }}
    >
      {versions.map((v) => (
        <button
          key={v.id}
          role="tab"
          aria-selected={v.active}
          onClick={() => onSelect(v.id)}
          title={v.timeLabel}
          style={{
            flex: 'none',
            padding: '6px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 600,
            border: `1px solid ${v.active ? '#3E5C76' : '#DDD8CF'}`,
            background: v.active ? '#3E5C76' : '#fff',
            color: v.active ? '#fff' : '#54504A',
            whiteSpace: 'nowrap',
          }}
        >
          {v.label} · {v.score}
        </button>
      ))}
    </div>
  );
}
