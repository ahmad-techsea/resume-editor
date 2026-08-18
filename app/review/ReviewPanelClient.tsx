'use client';

import dynamic from 'next/dynamic';

// Client-only: the panel reads its saved reviews from localStorage during construction, the way
// the prototype did, so a reload with a stored review paints the result state immediately rather
// than flashing the empty state. Server-rendering it would make that read a hydration mismatch.
const ResumeReviewPanel = dynamic(() => import('@/components/ResumeReviewPanel'), { ssr: false });

export default function ReviewPanelClient() {
  return <ResumeReviewPanel />;
}
