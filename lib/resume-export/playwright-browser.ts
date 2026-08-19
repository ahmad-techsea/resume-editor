// Lazily launches one headless Chromium instance for the process lifetime, reused across export
// requests to avoid paying full browser-launch latency on every "Download PDF" click. Each export
// request still gets its own browser context/page — never shares a page across concurrent
// requests.
import type { Browser } from 'playwright';

let browserPromise: Promise<Browser> | null = null;

async function launchBrowser(): Promise<Browser> {
  const { chromium } = await import('playwright');
  return chromium.launch({ headless: true });
}

export async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((err) => {
      // Allow a later call to retry the launch instead of permanently caching a failure.
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}
