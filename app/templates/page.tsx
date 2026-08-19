import type { Metadata } from 'next';
import SectionTemplates from '@/components/SectionTemplates';

export const metadata: Metadata = {
  title: 'Section templates',
  description: 'Five styles for each of the eight resume sections.',
};

export default function TemplatesPage() {
  return <SectionTemplates />;
}
