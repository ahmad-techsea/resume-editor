import { Suspense } from 'react';
import PdfPrintClient from './PdfPrintClient';

// useSearchParams (inside PdfPrintClient) requires a Suspense boundary for production builds.
export default function PdfPrintPage() {
  return (
    <Suspense fallback={null}>
      <PdfPrintClient />
    </Suspense>
  );
}
