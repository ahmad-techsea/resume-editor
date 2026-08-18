import React from 'react';
import '@/styles/section-templates.css';
import type { SectionTemplateComponent } from '../sections/types';

export interface RealStyleThumbProps {
  Component: SectionTemplateComponent;
  /** On-screen thumbnail width, px. */
  width?: number;
  /** On-screen thumbnail height (clip), px. */
  height?: number;
  /** Assumed native `.dv-card` width the real component was authored for. */
  nativeWidth?: number;
}

/** Renders a real components/sections/** template at picker-thumbnail scale, in place of the
 *  abstract StyleThumb mockup, for the 7 categories that now use the real catalog. */
export default function RealStyleThumb({
  Component,
  width = 150,
  height = 56,
  nativeWidth = 400,
}: RealStyleThumbProps) {
  const scale = width / nativeWidth;
  return (
    <div
      style={{
        width,
        height,
        overflow: 'hidden',
        position: 'relative',
        pointerEvents: 'none',
        marginBottom: '7px',
      }}
    >
      <div
        className="sectpl"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: nativeWidth,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <Component />
      </div>
    </div>
  );
}
