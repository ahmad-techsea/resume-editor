'use client';

import React, { useState } from 'react';
import type { ApplyFixResult } from '@/lib/resume-review/apply-fix';
import type { LocateResult } from '@/lib/resume-review/locate-in-canvas';

export interface FindingCardData {
  key: string;
  color: string;
  categoryLabel: string;
  message: string;
  hasQuote: boolean;
  quote: string;
  hasSuggestion: boolean;
  suggestion: string | null | undefined;
  applied: boolean;
  dismissed: boolean;
  dismissLbl: string;
  locatable: boolean;
}

export interface FindingCardProps {
  item: FindingCardData;
  onApply: () => ApplyFixResult;
  onLocate: () => LocateResult;
  onToggleDismiss: () => void;
}

const FAILURE_MESSAGES: Record<string, string> = {
  'field-not-mapped': 'Could not find this field — it may have been removed from your resume.',
  'field-not-found': 'Could not find this field — it may have been removed from your resume.',
  'text-changed': 'This text has changed since the review was generated.',
  'no-suggestion': 'Nothing to apply for this finding.',
};

const SUGGESTION_COLLAPSE_LENGTH = 160;

export default function FindingCard({ item, onApply, onLocate, onToggleDismiss }: FindingCardProps) {
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleApply = () => {
    const result = onApply();
    setNotice(result.ok ? null : (FAILURE_MESSAGES[result.reason] ?? 'Could not apply this fix.'));
  };
  const handleLocate = () => {
    const result = onLocate();
    setNotice(result.ok ? null : (FAILURE_MESSAGES[result.reason] ?? 'Could not locate this text.'));
  };
  const handleCopy = () => {
    if (!item.suggestion) return;
    navigator.clipboard
      .writeText(item.suggestion)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setNotice('Could not copy to clipboard.'));
  };

  const suggestion = item.suggestion || '';
  const isLong = suggestion.length > SUGGESTION_COLLAPSE_LENGTH;
  const displaySuggestion =
    isLong && !expanded ? suggestion.slice(0, SUGGESTION_COLLAPSE_LENGTH) + '…' : suggestion;

  return (
    <div
      style={{
        borderBottom: '1px solid #F0EDE7',
        padding: '10px 0',
        opacity: item.dismissed ? 0.42 : 1,
        overflow: 'hidden',
      }}
    >
      <div
        className={item.locatable ? 'ire-finding-locate' : undefined}
        onClick={item.locatable ? handleLocate : undefined}
        style={{ cursor: item.locatable ? 'pointer' : undefined, padding: '2px 4px', margin: '-2px -4px' }}
        title={item.locatable ? 'Show this in your resume' : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: item.color,
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
            {item.categoryLabel}
          </span>
        </div>
        <div style={{ fontSize: '12.5px', color: '#2E2B26', marginTop: '3px', lineHeight: '1.45' }}>
          {item.message}
        </div>
        {item.hasQuote && (
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
              whiteSpace: 'pre-wrap',
            }}
          >
            &quot;{item.quote}&quot;
          </div>
        )}
      </div>
      {item.hasSuggestion && (
        <div
          style={{
            fontSize: '11px',
            color: '#3E5C76',
            marginTop: '4px',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          Suggestion: {suggestion ? displaySuggestion : '(remove this text)'}
          {isLong && (
            <button
              onClick={() => setExpanded((e) => !e)}
              style={{
                display: 'block',
                marginTop: '2px',
                fontSize: '10.5px',
                fontWeight: 600,
                color: '#8A857C',
              }}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '6px',
          flexWrap: 'wrap',
        }}
      >
        {item.hasSuggestion && !item.applied && (
          <button
            onClick={handleApply}
            className="hv-accent"
            style={{ fontSize: '10.5px', fontWeight: 700, color: '#3E5C76' }}
          >
            Apply fix
          </button>
        )}
        {item.applied && (
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#5B8A6B' }}>✓ Fixed</span>
        )}
        {item.hasSuggestion && (
          <button
            onClick={handleCopy}
            className="hv-accent"
            style={{ fontSize: '10.5px', color: '#8A857C' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
        <button
          onClick={onToggleDismiss}
          className="hv-accent"
          style={{ fontSize: '10.5px', color: '#8A857C' }}
        >
          {item.dismissLbl}
        </button>
      </div>
      {notice && <div style={{ fontSize: '10.5px', color: '#9A3F38', marginTop: '5px' }}>{notice}</div>}
    </div>
  );
}
