'use client';

import React from 'react';

export interface ReviewProgressProps {
  showEmpty: boolean;
  canGenerate: boolean;
  emptyHint: string;
  onGenerate: () => void;
  showProgress: boolean;
  progressLabel: string;
  progressPct: number;
  showRegenBar: boolean;
  generating: boolean;
  onRegenerate: () => void;
  dismissedToggleLbl: string;
  toggleShowDismissed: () => void;
  judgmentNotice?: string | null;
}

export default function ReviewProgress(v: ReviewProgressProps) {
  return (
    <>
      {v.showEmpty && (
        <div style={{ padding: '6px 2px' }}>
          <p style={{ fontSize: '13px', lineHeight: '1.62', color: '#4C4841', margin: '0' }}>
            Checks this resume against a 23-category checklist — summary, bullets, grammar,
            formatting, and more — and links every finding back to the exact spot on the page.
          </p>
          <button
            onClick={v.onGenerate}
            disabled={!v.canGenerate}
            className="hv-bright"
            style={{
              marginTop: '14px',
              width: '100%',
              padding: '10px',
              background: v.canGenerate ? '#3E5C76' : '#DDD8CF',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: v.canGenerate ? 'pointer' : 'not-allowed',
            }}
          >
            Generate Review
          </button>
          {!v.canGenerate && (
            <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#9A948A' }}>
              {v.emptyHint}
            </div>
          )}
        </div>
      )}

      {v.showProgress && (
        <div style={{ padding: '2px 2px 16px' }} role="status" aria-live="polite">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11.5px',
              color: '#6B665E',
            }}
          >
            <span>{v.progressLabel}</span>
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
            onClick={v.onRegenerate}
            disabled={v.generating}
            className="hv-soft"
            style={{
              flex: '1',
              padding: '8px',
              border: '1px solid #DDD8CF',
              borderRadius: '7px',
              fontSize: '12.5px',
              fontWeight: '600',
              color: v.generating ? '#B0A99E' : '#3F3B35',
              background: '#fff',
              cursor: v.generating ? 'not-allowed' : 'pointer',
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

      {v.judgmentNotice && (
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
          {v.judgmentNotice}
        </div>
      )}
    </>
  );
}
