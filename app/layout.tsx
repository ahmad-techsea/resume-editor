import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Inline Resume Editor',
  description: 'Inline resume editor, section template gallery, and a 23-category resume review panel.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Same font delivery as the design prototypes, so metrics match exactly. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
