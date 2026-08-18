'use client';

import React from 'react';

export interface FindingItem {
  jump: () => void;
  opacity: number;
  color: string;
  categoryLabel: string;
  message: string;
  hasQuote: boolean;
  quote: string;
  hasSuggestion: boolean;
  suggestion: string | null | undefined;
  dismissLbl: string;
  dismiss: () => void;
}

export interface ReviewFindingsListProps {
  showFindings: boolean;
  findingItems: FindingItem[];
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
          {v.findingItems.map((fi, i) => (
            <div
              key={i}
              style={{ borderBottom: '1px solid #F0EDE7', padding: '10px 0', opacity: fi.opacity }}
            >
              <button
                onClick={fi.jump}
                style={{ display: 'block', width: '100%', textAlign: 'left' }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: fi.color,
                      flex: 'none',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: '700',
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      color: '#9A948A',
                    }}
                  >
                    {fi.categoryLabel}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '12.5px',
                    color: '#2E2B26',
                    marginTop: '3px',
                    lineHeight: '1.45',
                  }}
                >
                  {fi.message}
                </div>
                {fi.hasQuote && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6B665E',
                      background: '#F6F4EF',
                      borderRadius: '5px',
                      padding: '3px 7px',
                      marginTop: '5px',
                      fontFamily: 'ui-monospace,Menlo,monospace',
                      overflowWrap: 'break-word',
                    }}
                  >
                    &quot;{fi.quote}&quot;
                  </div>
                )}
                {fi.hasSuggestion && (
                  <div style={{ fontSize: '11px', color: '#3E5C76', marginTop: '4px' }}>
                    Suggestion: {fi.suggestion}
                  </div>
                )}
              </button>
              <button
                onClick={fi.dismiss}
                className="hv-accent"
                style={{ fontSize: '10.5px', color: '#8A857C', marginTop: '5px' }}
              >
                {fi.dismissLbl}
              </button>
            </div>
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
