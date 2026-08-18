'use client';

import React from 'react';

export interface ScoreBucket {
  label: string;
  score: number;
  max: number;
  pct: number;
  color: string;
}

export interface ReviewScoreProps {
  scoreTotal: number;
  scoreBuckets: ScoreBucket[];
}

export default function ReviewScore({ scoreTotal, scoreBuckets }: ReviewScoreProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <div style={{ fontSize: '30px', fontWeight: '700', color: '#26231F' }}>{scoreTotal}</div>
        <div style={{ fontSize: '12px', color: '#9A948A' }}>/ 100 Resume Quality</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
        {scoreBuckets.map((b, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '92px 1fr 30px',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '10px', color: '#6B665E' }}>{b.label}</div>
            <div
              style={{
                height: '4px',
                background: '#EFECE6',
                borderRadius: '99px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${b.pct}%`,
                  background: b.color,
                  borderRadius: '99px',
                }}
              />
            </div>
            <div style={{ fontSize: '9.5px', color: '#9A948A', textAlign: 'right' }}>
              {b.score}/{b.max}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
