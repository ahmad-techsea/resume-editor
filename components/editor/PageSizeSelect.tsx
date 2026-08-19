import React from 'react';
import { PAGE_SIZE_IDS, PAGE_SIZE_LABELS, type PageSizeId } from '@/lib/resume-pagination/page-constants';

export interface PageSizeSelectProps {
  value: PageSizeId;
  onChange: (id: PageSizeId) => void;
}

export default function PageSizeSelect({ value, onChange }: PageSizeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PageSizeId)}
      aria-label="Page size"
      className="hv-soft"
      style={{
        padding: '5px 8px',
        border: '1px solid #DDD8CF',
        borderRadius: '7px',
        background: '#fff',
        fontSize: '12.5px',
        fontWeight: 600,
        color: '#3F3B35',
      }}
    >
      {PAGE_SIZE_IDS.map((id) => (
        <option key={id} value={id}>
          {PAGE_SIZE_LABELS[id]}
        </option>
      ))}
    </select>
  );
}
