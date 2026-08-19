import { NextResponse } from 'next/server';
import { putExportPayload } from '@/lib/resume-export/export-token-store';
import { getBrowser } from '@/lib/resume-export/playwright-browser';
import { getPageMetrics, isPageSizeId, type MarginsIn } from '@/lib/resume-pagination/page-constants';
import type { EditorResumeDocument } from '@/lib/resume-data/editor-resume-data';

// Headless-browser PDF export: renders the *same* paginated component tree the user sees
// on-screen (via app/export/pdf-print) in a real Chromium instance and snapshots it with
// page.pdf(), so the download is guaranteed page-for-page identical to what's on screen — parity
// is structural, not something this route has to separately maintain. Needs the Node runtime
// (Playwright can't run on Edge).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// A cold serverless start pays brotli-extracting the Chromium binary to /tmp plus launch plus a
// full page render with web-font fetches — comfortably over the platform default.
export const maxDuration = 60;

const MAX_BODY_CHARS = 500_000;

interface ExportRequestBody {
  document?: EditorResumeDocument;
  margins?: MarginsIn;
  accent?: string;
}

export async function POST(request: Request) {
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json({ error: 'Could not read request body.' }, { status: 400 });
  }
  if (raw.length > MAX_BODY_CHARS) {
    return NextResponse.json({ error: 'Export payload is too large.' }, { status: 413 });
  }

  let body: ExportRequestBody;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Request body must be JSON.' }, { status: 400 });
  }
  if (!body.document || !body.margins) {
    return NextResponse.json({ error: 'Missing document or margins.' }, { status: 400 });
  }

  const pageSizeId = isPageSizeId(body.document.pageSize) ? body.document.pageSize : 'a4';
  const metrics = getPageMetrics(pageSizeId, body.margins);

  const token = crypto.randomUUID();
  putExportPayload(token, { document: body.document, margins: body.margins, accent: body.accent });

  const origin = new URL(request.url).origin;
  let browser;
  try {
    browser = await getBrowser();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error launching the renderer.';
    console.error('[api/export-pdf] browser launch failed:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const context = await browser.newContext();
  try {
    // The print page reads this injected payload directly; the token-store fetch below it is only
    // a fallback. On serverless the in-memory token store can't be trusted at all — the payload
    // GET may be routed to a different instance than the one that stored it — so the primary
    // handoff must not leave this process.
    await context.addInitScript(
      (p) => {
        (window as unknown as { __pgExportPayload?: unknown }).__pgExportPayload = p;
      },
      { document: body.document, margins: body.margins, accent: body.accent },
    );
    const page = await context.newPage();
    await page.goto(`${origin}/export/pdf-print?token=${encodeURIComponent(token)}`, {
      waitUntil: 'networkidle',
    });
    // Generous timeout: a cold start renders with zero warm caches, including web-font fetches.
    await page.waitForFunction('window.__pgExportReady === true', { timeout: 30000 });
    const pdfBuffer = await page.pdf({
      width: `${metrics.widthIn}in`,
      height: `${metrics.heightIn}in`,
      // Margin is baked into the rendered page-frame padding (identical to on-screen and to
      // @page in PrintPageStyle.tsx) — zero here for the same reason it's zero there: applying
      // it twice would double it.
      margin: { top: '0in', right: '0in', bottom: '0in', left: '0in' },
      printBackground: true,
    });
    const filename = (body.document.header?.name || 'resume').trim().replace(/\s+/g, '_') || 'resume';
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error generating the PDF.';
    console.error('[api/export-pdf] render failed:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    await context.close();
  }
}
