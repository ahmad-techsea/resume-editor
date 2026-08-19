'use client';

import React from 'react';

export interface ScoreHistoryPoint {
  id: number;
  score: number;
}

export interface ScoreHistoryChartProps {
  points: ScoreHistoryPoint[];
}

const WIDTH = 300;
const HEIGHT = 130;
const PAD_TOP = 10;
const PAD_BOTTOM = 22;
const PAD_LEFT = 26;
const PAD_RIGHT = 10;
const PLOT_W = WIDTH - PAD_LEFT - PAD_RIGHT;
const PLOT_H = HEIGHT - PAD_TOP - PAD_BOTTOM;

const yFor = (score: number) => PAD_TOP + PLOT_H * (1 - Math.max(0, Math.min(100, score)) / 100);

/** Hand-rolled SVG — no charting library exists in this codebase (matches ReviewScore.tsx's
 *  existing hand-rolled bars). Handles 0/1/2+ points explicitly since a naive line chart renders
 *  nothing visible for exactly one point. */
export default function ScoreHistoryChart({ points }: ScoreHistoryChartProps) {
  if (points.length === 0) {
    return (
      <div
        style={{
          padding: '18px 4px',
          textAlign: 'center',
          fontSize: '11.5px',
          color: '#9A948A',
          border: '1px dashed #E2DDD4',
          borderRadius: '8px',
        }}
      >
        Score history will appear here after your first review.
      </div>
    );
  }

  const xFor = (i: number) =>
    points.length === 1 ? PAD_LEFT + PLOT_W / 2 : PAD_LEFT + (PLOT_W * i) / (points.length - 1);
  const coords = points.map((p, i) => ({ x: xFor(i), y: yFor(p.score), p }));
  const linePath = coords.map((c) => `${c.x},${c.y}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height={HEIGHT}
      role="img"
      aria-label={`Score history across ${points.length} version${points.length === 1 ? '' : 's'}`}
    >
      {[0, 50, 100].map((tick) => (
        <g key={tick}>
          <line
            x1={PAD_LEFT}
            x2={WIDTH - PAD_RIGHT}
            y1={yFor(tick)}
            y2={yFor(tick)}
            stroke="#EFECE6"
            strokeWidth={1}
          />
          <text x={0} y={yFor(tick) + 3} fontSize={9} fill="#9A948A">
            {tick}
          </text>
        </g>
      ))}

      {coords.length > 1 && (
        <polyline points={linePath} fill="none" stroke="#3E5C76" strokeWidth={2} />
      )}

      {coords.map((c, i) => (
        <g key={c.p.id}>
          <circle
            cx={c.x}
            cy={c.y}
            r={i === coords.length - 1 ? 4.5 : 3.5}
            fill={i === coords.length - 1 ? '#3E5C76' : '#fff'}
            stroke="#3E5C76"
            strokeWidth={2}
          />
          <text x={c.x} y={HEIGHT - 6} fontSize={9} fill="#9A948A" textAnchor="middle">
            v{c.p.id}
          </text>
        </g>
      ))}
    </svg>
  );
}
