import type { Metadata } from 'next';
import StoreProvider from './StoreProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Inline Resume Editor',
  description:
    'Inline resume editor, section template gallery, and a 23-category resume review panel.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Same font delivery as the design prototypes, so metrics match exactly. Every resume
            template's primary face is web-delivered (here or via @font-face in globals.css) so the
            editor, browser print, and the headless PDF renderer all shape text identically —
            pagination is measured from real glyph metrics, so a substituted system font would
            change page counts between machines. Tinos ships no 600 weight; requesting one makes
            the css2 endpoint reject the whole URL. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Arimo:wght@400;600;700&family=Gelasio:wght@400;600;700&family=Tinos:wght@400;700&display=swap"
        />
      </head>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
