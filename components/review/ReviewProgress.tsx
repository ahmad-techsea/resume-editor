'use client';

import React from 'react';

export interface ReviewProgressProps {
  showEmpty: boolean;
  onGenerate: () => void;
  showProgress: boolean;
  progressLabel: string;
  progressCount: string;
  progressPct: number;
  showRegenBar: boolean;
  generating: boolean;
  toggleShowDismissed: () => void;
  dismissedToggleLbl: string;
  isStale: boolean;
  showRetryBanner: boolean;
  onRetryJudgment: () => void;
}

export default function ReviewProgress(v: ReviewProgressProps) {
  return (
    <>
      {v.showEmpty && (
        <div style={{ padding: '6px 2px' }}>
          <p style={{ fontSize: '13px', lineHeight: '1.62', color: '#4C4841', margin: '0' }}>
            Checks this resume against 23 checklist categories — summary, bullets, grammar,
            formatting, and more — and links every finding back to the exact spot on the page.
          </p>
          <button
            onClick={v.onGenerate}
            className="hv-bright"
            style={{
              marginTop: '14px',
              width: '100%',
              padding: '10px',
              background: '#3E5C76',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            Generate Review
          </button>
        </div>
      )}

      {v.showProgress && (
        <div style={{ padding: '2px 2px 16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11.5px',
              color: '#6B665E',
            }}
          >
            <span>{v.progressLabel}</span>
            <span>{v.progressCount}</span>
          </div>
          <div
            style={{
              height: '5px',
              background: '#EFECE6',
              borderRadius: '99px',
              marginTop: '6px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${v.progressPct}%`,
                background: '#3E5C76',
                borderRadius: '99px',
                transition: 'width .2s',
              }}
            />
          </div>
        </div>
      )}

      {v.showRegenBar && (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '2px 2px 16px' }}
        >
          <button
            onClick={v.onGenerate}
            disabled={v.generating}
            className="hv-soft"
            style={{
              flex: '1',
              padding: '8px',
              border: '1px solid #DDD8CF',
              borderRadius: '7px',
              fontSize: '12.5px',
              fontWeight: '600',
              color: '#3F3B35',
              background: '#fff',
            }}
          >
            Regenerate Review
          </button>
          <button
            onClick={v.toggleShowDismissed}
            className="hv-accent"
            style={{ fontSize: '11px', color: '#8A857C', whiteSpace: 'nowrap' }}
          >
            {v.dismissedToggleLbl}
          </button>
        </div>
      )}

      {v.isStale && (
        <div
          role="status"
          style={{
            background: '#FBF3E7',
            border: '1px solid #EBD9B8',
            borderRadius: '8px',
            padding: '9px 11px',
            fontSize: '12px',
            color: '#8A6A2E',
            marginBottom: '14px',
            lineHeight: '1.5',
          }}
        >
          Resume changed since this review — findings below may not reflect the current text.
        </div>
      )}

      {v.showRetryBanner && (
        <div
          style={{
            background: '#FBEDEC',
            border: '1px solid #EFC9C4',
            borderRadius: '8px',
            padding: '9px 11px',
            fontSize: '12px',
            color: '#9A3F38',
            marginBottom: '14px',
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <span>AI analysis didn&apos;t finish.</span>
          <button
            onClick={v.onRetryJudgment}
            style={{ fontWeight: '600', textDecoration: 'underline', flex: 'none' }}
          >
            Retry
          </button>
        </div>
      )}
    </>
  );
}
