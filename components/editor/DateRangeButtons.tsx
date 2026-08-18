import React from 'react';

export interface DateRangeButtonsProps {
  ent: any;
  fontSize: string;
  gap: string;
  extra?: React.CSSProperties;
  readOnly?: boolean;
}

export default function DateRangeButtons({
  ent,
  fontSize,
  gap,
  extra,
  readOnly,
}: DateRangeButtonsProps) {
  const Start = readOnly ? 'span' : 'button';
  const End = readOnly ? 'span' : 'button';
  return (
    <span
      style={{
        whiteSpace: 'nowrap',
        fontSize,
        display: 'inline-flex',
        alignItems: 'baseline',
        gap,
        ...extra,
      }}
    >
      <Start
        onClick={readOnly ? undefined : ent.openStart}
        title={readOnly ? undefined : 'Set start date'}
        className={readOnly ? undefined : 'hv-link'}
        style={{ color: ent.startCol, borderRadius: '4px', padding: '0 2px' }}
      >
        {ent.startLbl}
      </Start>
      <span style={{ color: '#B5AFA5' }}>–</span>
      <End
        onClick={readOnly ? undefined : ent.openEnd}
        title={readOnly ? undefined : 'Set end date'}
        className={readOnly ? undefined : 'hv-link'}
        style={{ color: ent.endCol, borderRadius: '4px', padding: '0 2px' }}
      >
        {ent.endLbl}
      </End>
    </span>
  );
}
