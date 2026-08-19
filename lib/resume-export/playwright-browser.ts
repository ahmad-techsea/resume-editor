// Lazily launches one headless Chromium instance for the process lifetime, reused across export
// requests to avoid paying full browser-launch latency on every "Download PDF" click. Each export
// request still gets its own browser context/page — never shares a page across concurrent
// requests.
//
// Two launch paths: serverless (Vercel/Lambda) uses playwright-core driving @sparticuz/chromium's
// Lambda-compiled headless shell — full playwright's own downloaded browser and its browsers.json
// registry never make it into a serverless bundle. Local dev keeps full playwright with its
// managed browser. Both packages expose the same API; the type comes from playwright-core (full
// playwright re-exports it).
//
// The serverless pair is imported STATICALLY on purpose: both are serverExternalPackages, and the
// output file tracer only follows require()/import of externals it can see statically — as a
// dynamic `await import(...)` they were silently dropped from the Vercel function bundle
// (verified against .vercel/output's filePathMap). Full playwright stays a dynamic import so the
// dev-only package can be excluded from tracing without breaking this module's load in prod.
import { chromium as chromiumCore } from 'playwright-core';
import type { Browser } from 'playwright-core';
import sparticuz from '@sparticuz/chromium';

let browserPromise: Promise<Browser> | null = null;

function isServerless(): boolean {
  return process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
}

async function launchBrowser(): Promise<Browser> {
  if (isServerless()) {
    return chromiumCore.launch({
      args: sparticuz.args,
      // Extracts the brotli-packed binary to /tmp once per instance (~3-6s cold, cached warm).
      executablePath: await sparticuz.executablePath(),
      headless: true,
    });
  }
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
