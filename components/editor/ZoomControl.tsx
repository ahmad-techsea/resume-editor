import React from 'react';

export interface ZoomControlProps {
  zoom: number;
  onChange: (zoom: number) => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const STEP = 0.1;

const clamp = (v: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(v * 100) / 100));

/** Purely a visual control — the actual scaling is a CSS transform applied in
 *  PaginatedResumeView, composed with the responsive auto-fit factor. Pagination math never
 *  reads this value, so zooming can never change page count or content distribution. */
export default function ZoomControl({ zoom, onChange }: ZoomControlProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        border: '1px solid #DDD8CF',
        borderRadius: '7px',
        background: '#fff',
        padding: '2px',
      }}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(zoom - STEP))}
        disabled={zoom <= MIN_ZOOM}
        aria-label="Zoom out"
        className="hv-soft"
        style={{ width: '22px', height: '22px', display: 'grid', placeItems: 'center', borderRadius: '5px' }}
      >
        −
      </button>
      <span style={{ fontSize: '11.5px', minWidth: '38px', textAlign: 'center', color: '#3F3B35' }}>
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(zoom + STEP))}
        disabled={zoom >= MAX_ZOOM}
        aria-label="Zoom in"
        className="hv-soft"
        style={{ width: '22px', height: '22px', display: 'grid', placeItems: 'center', borderRadius: '5px' }}
      >
        +
      </button>
    </div>
  );
}
