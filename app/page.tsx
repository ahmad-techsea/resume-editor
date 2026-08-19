import type { Metadata } from 'next';
import LandingPage from '@/components/LandingPage';

export const metadata: Metadata = {
  title: 'Inline Resume Editor',
  description: 'Upload a resume to parse it automatically, or start from a blank one.',
};

export default function HomePage() {
  return <LandingPage />;
}
