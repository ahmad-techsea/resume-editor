---
name: verify
description: Build, launch and drive this resume editor to verify changes end-to-end (exports, pagination, editor UI).
---

# Verifying the inline resume editor

## Launch

`npm run dev` — but a dev server is often ALREADY running on port 3000 (Next 16 refuses a second
one in the same dir; don't kill the user's server, just use :3000). `curl -s -o /dev/null -w
"%{http_code}" http://localhost:3000/` to confirm.

## Drive the paginated editor + exports without typing content

The headless print page renders the SAME `InlineResumeEditor` as `/editor`, seeded from an
injected payload — so you can drive a full rich resume with Playwright (full `playwright` is a
repo dep with browsers installed):

```js
const ctx = await browser.newContext();
await ctx.addInitScript((p) => { window.__pgExportPayload = p; },
  { document: /* EditorResumeDocument */, margins: {top:.5,right:.5,bottom:.5,left:.5}, accent: '#3F5940' });
await page.goto('http://localhost:3000/export/pdf-print?token=anything');
await page.waitForFunction('window.__pgExportReady === true');
// UI page count: page.locator('.pg-frame').count(); badge: '.pg-total-badge'
// Real toolbar: page.getByLabel('Open settings').click() then click 'Export PDF' / 'Export Word'
// and capture with page.waitForEvent('download').
```

Document shape: copy `buildSampleEditorResume` in `lib/resume-data/editor-resume-data.ts`
(sections carry id/type/kind/style; catalog styles like experience '4b' = bullets, '4a' = desc).
A working driver lives in the session scratchpad as `e2e-export.js` (rebuildable from this
recipe).

## Check outputs

- PDF: `pdfinfo x.pdf | grep Pages` (must equal `.pg-frame` count), `pdftoppm -png -r 60` to
  eyeball pages. No LibreOffice on this machine — DOCX page count can't be rendered; instead
  `unzip -p x.docx word/document.xml | grep -c pageBreakBefore` and inspect XML (banner table
  shading, `w:ascii` fonts, right tabs).
- Per-page block keys (which content the UI put on which page):
  `document.querySelectorAll('.pg-frame')` → `[data-pg-key]` children.

## Serverless (Vercel) PDF path

The prod launcher branch (playwright-core + @sparticuz/chromium) can be probed directly on this
Linux x64 box — import both from node_modules, `chromium.launch({args, executablePath: await
sparticuz.executablePath(), headless: true})`, then `page.pdf()`. To verify Vercel bundling, run
`npx vercel build` and inspect `.vercel/output/functions/api/export-pdf.func/.vc-config.json`
`filePathMap` — it must contain `playwright-core/browsers.json` and `@sparticuz/chromium/bin/*.br`.
Gotcha: the file tracer only follows STATIC imports of serverExternalPackages; dynamic
`await import('pkg')` gets silently dropped from the bundle.

## Gotchas

- `git commit` is GPG-signed and needs an interactive passphrase — hand the commit to the user.
- `next dev` regenerates the AGENTS.md block; commit it with the work if it reappears.
