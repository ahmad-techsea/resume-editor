'use client';

import React from 'react';
import type { ResumeFieldColorMap } from '../editor/SectionBlock';

export interface ReviewHeaderFieldsProps {
  header: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
  };
  colorMap?: ResumeFieldColorMap;
  onEdit: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocusF: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyS: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  fieldRef?: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
}

export default function ReviewHeaderFields({
  header,
  colorMap,
  onEdit,
  onFocusF,
  onKeyS,
  fieldRef,
}: ReviewHeaderFieldsProps) {
  const col = (path: string) => (colorMap && colorMap[path] ? colorMap[path].color : 'transparent');

  return (
    <>
      <input
        data-path="header.name"
        value={header.name}
        onChange={onEdit}
        onFocus={onFocusF}
        onKeyDown={onKeyS}
        placeholder="Your name"
        aria-label="Name"
        ref={fieldRef}
        style={{
          display: 'block',
          fontSize: '28px',
          fontWeight: '700',
          color: '#26231F',
          borderBottom: `2px solid ${col('header.name')}`,
          paddingBottom: '2px',
        }}
      />
      <input
        data-path="header.title"
        value={header.title}
        onChange={onEdit}
        onFocus={onFocusF}
        onKeyDown={onKeyS}
        placeholder="Professional title"
        aria-label="Professional title"
        ref={fieldRef}
        style={{
          display: 'block',
          fontSize: '14px',
          color: '#6B665E',
          marginTop: '5px',
          borderBottom: `2px solid ${col('header.title')}`,
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px 22px',
          marginTop: '18px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: '700',
              letterSpacing: '.09em',
              color: '#9A948A',
              textTransform: 'uppercase',
            }}
          >
            Email
          </div>
          <input
            data-path="header.email"
            value={header.email}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyS}
            placeholder="you@email.com"
            aria-label="Email"
            ref={fieldRef}
            style={{
              fontSize: '12.5px',
              color: '#3B3833',
              borderBottom: `2px solid ${col('header.email')}`,
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: '700',
              letterSpacing: '.09em',
              color: '#9A948A',
              textTransform: 'uppercase',
            }}
          >
            Phone
          </div>
          <input
            data-path="header.phone"
            value={header.phone}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyS}
            placeholder="(555) 555-5555"
            aria-label="Phone"
            ref={fieldRef}
            style={{
              fontSize: '12.5px',
              color: '#3B3833',
              borderBottom: `2px solid ${col('header.phone')}`,
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: '700',
              letterSpacing: '.09em',
              color: '#9A948A',
              textTransform: 'uppercase',
            }}
          >
            Location
          </div>
          <input
            data-path="header.location"
            value={header.location}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyS}
            placeholder="City, State"
            aria-label="Location"
            ref={fieldRef}
            style={{
              fontSize: '12.5px',
              color: '#3B3833',
              borderBottom: `2px solid ${col('header.location')}`,
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: '700',
              letterSpacing: '.09em',
              color: '#9A948A',
              textTransform: 'uppercase',
            }}
          >
            LinkedIn
          </div>
          <input
            data-path="header.linkedin"
            value={header.linkedin}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyS}
            placeholder="linkedin.com/in/you"
            aria-label="LinkedIn"
            ref={fieldRef}
            style={{
              fontSize: '12.5px',
              color: '#3B3833',
              borderBottom: `2px solid ${col('header.linkedin')}`,
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: '700',
              letterSpacing: '.09em',
              color: '#9A948A',
              textTransform: 'uppercase',
            }}
          >
            GitHub / Portfolio
          </div>
          <input
            data-path="header.github"
            value={header.github}
            onChange={onEdit}
            onFocus={onFocusF}
            onKeyDown={onKeyS}
            placeholder="github.com/you"
            aria-label="GitHub or portfolio"
            ref={fieldRef}
            style={{
              fontSize: '12.5px',
              color: '#3B3833',
              borderBottom: `2px solid ${col('header.github')}`,
            }}
          />
        </div>
      </div>
    </>
  );
}
