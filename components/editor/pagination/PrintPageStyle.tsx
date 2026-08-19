import React from 'react';
import type { PageMetrics } from '@/lib/resume-pagination/page-constants';

export interface PrintPageStyleProps {
  metrics: PageMetrics;
}

/** `@page` can't literally import the constants module (it's plain CSS), so this component
 *  injects the print stylesheet computed from the same shared PageMetrics used on-screen — one
 *  structural source, not two hand-kept-in-sync numbers. `@page { margin: 0 }` always: margin is
 *  expressed entirely as `.pg-content` padding (identical to on-screen), so it's never applied
 *  twice. JS pagination already decided every page's exact contents, so this stylesheet's only
 *  job is physical sizing, one page-frame per sheet, chrome-hiding, and zoom-neutralization — it
 *  never relies on the browser reflowing content itself. */
export default function PrintPageStyle({ metrics }: PrintPageStyleProps) {
  const css = `
@page { size: ${metrics.widthIn}in ${metrics.heightIn}in; margin: 0; }
@media print {
  .pg-zoom-wrapper { transform: none !important; }
  .pg-stack-outer { background: none !important; padding: 0 !important; }
  .pg-frame { box-shadow: none !important; margin: 0 !important; break-after: page; }
  .pg-frame:last-child { break-after: auto; }
  [data-pg-atomic="true"] { break-inside: avoid; }
  .pg-chrome, .pg-total-badge, .pg-warning-banner { display: none !important; }
}
`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
