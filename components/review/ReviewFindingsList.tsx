'use client';

import React from 'react';
import type { ApplyFixResult } from '@/lib/resume-review/apply-fix';
import type { LocateResult } from '@/lib/resume-review/locate-in-canvas';
import FindingCard, { type FindingCardData } from './FindingCard';

export interface ReviewFindingsListProps {
  showFindings: boolean;
  findingItems: Array<
    FindingCardData & {
      onApply: () => ApplyFixResult;
      onLocate: () => LocateResult;
      onToggleDismiss: () => void;
    }
  >;
  hasNoVisible: boolean;
  showUnresolved: boolean;
  unresolvedCount: number;
  unresolvedItems: Array<{ message: string }>;
  showSkippedNote: boolean;
  toggleSkipped: () => void;
  skippedToggleLbl: string;
  showSkipped: boolean;
  skippedList: string[];
}

export default function ReviewFindingsList(v: ReviewFindingsListProps) {
  return (
    <>
      {v.showFindings && (
        <>
          {v.findingItems.map((fi) => (
            <FindingCard
              key={fi.key}
              item={fi}
              onApply={fi.onApply}
              onLocate={fi.onLocate}
              onToggleDismiss={fi.onToggleDismiss}
            />
          ))}
          {v.hasNoVisible && (
            <div
              style={{
                fontSize: '12px',
                color: '#9A948A',
                padding: '20px 2px',
                textAlign: 'center',
              }}
            >
              No findings match this filter.
            </div>
          )}
        </>
      )}

      {v.showUnresolved && (
        <div style={{ marginTop: '18px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#9A948A',
              marginBottom: '6px',
            }}
          >
            Could not locate ({v.unresolvedCount})
          </div>
          {v.unresolvedItems.map((u, i) => (
            <div
              key={i}
              style={{
                fontSize: '11.5px',
                color: '#8A857C',
                padding: '6px 0',
                borderBottom: '1px solid #F5F3EE',
              }}
            >
              {u.message}
            </div>
          ))}
        </div>
      )}

      {v.showSkippedNote && (
        <div style={{ marginTop: '18px' }}>
          <button
            onClick={v.toggleSkipped}
            className="hv-accent"
            style={{ fontSize: '11px', color: '#8A857C' }}
          >
            {v.skippedToggleLbl}
          </button>
          {v.showSkipped && (
            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {v.skippedList.map((sk, i) => (
                <div key={i} style={{ fontSize: '11px', color: '#B0A99E' }}>
                  {sk} — needs a job description
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
