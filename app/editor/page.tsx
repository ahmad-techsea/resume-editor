import type { Metadata } from 'next';
import InlineResumeEditor from '@/components/InlineResumeEditor';

export const metadata: Metadata = {
  title: 'Editor — Inline Resume Editor',
  description: 'Edit your resume, then generate a review from the panel inside the editor.',
};

export default function EditorPage() {
  // The landing page always seeds the store (Upload or Scratch) before navigating here — the
  // component's own sample/blank auto-fetch would otherwise silently overwrite that content.
  return <InlineResumeEditor skipInitialFetch />;
}
