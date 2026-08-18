import type { Metadata } from 'next';
import ReviewPanelClient from './ReviewPanelClient';

export const metadata: Metadata = {
  title: 'Resume Review',
  description: 'Reviews a resume against a 23-category checklist and anchors every finding to the exact text.',
};

export default function ReviewPage() {
  return <ReviewPanelClient />;
}
