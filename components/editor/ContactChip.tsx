import React from 'react';
import { LINK_ICON } from './icons';

/** A contact chip: either a rendered anchor or an editable input, plus its link control. */
export interface ContactChipProps {
  c: any;
  placeholder: string;
  label: string;
  onEdit: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocusF: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyS: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function ContactChip({
  c,
  placeholder,
  label,
  onEdit,
  onFocusF,
  onKeyS,
}: ContactChipProps) {
  return (
    <span className="citem" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      {c.isLink && (
        <a
          href={c.href}
          target="_blank"
          rel="noopener"
          style={{
            display: 'inline-block',
            maxWidth: '250px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            verticalAlign: 'bottom',
          }}
        >
          {c.text}
        </a>
      )}
      {c.noLink && (
        <input
          data-path={c.path}
          value={c.text}
          onChange={onEdit}
          onFocus={onFocusF}
          onKeyDown={onKeyS}
          placeholder={placeholder}
          aria-label={label}
          style={{ minWidth: '36px' }}
        />
      )}
      <button
        className="lctl hv-link"
        onClick={c.openLink}
        aria-label={`Edit link for ${label.toLowerCase()}`}
        title="Add or edit link"
        style={{
          width: '20px',
          height: '20px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '5px',
          color: '#948E84',
        }}
      >
        {LINK_ICON}
      </button>
    </span>
  );
}
