/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdf-parse/pdfjs-dist optionally load @napi-rs/canvas (a native addon) to polyfill DOMMatrix/
  // ImageData/Path2D for Node. Native addons resolve their platform-specific prebuilt binary via a
  // runtime require() string, which only works against real node_modules — bundling them breaks
  // that resolution ("Cannot find module '@napi-rs/canvas'"), which then leaves pdfjs-dist without
  // its DOMMatrix polyfill and crashes text extraction. Excluding them from bundling lets Vercel's
  // file tracer include the whole package tree instead, the standard fix for native-addon deps.
  // playwright/playwright-core/@sparticuz/chromium are external for the same class of reason:
  // playwright-core require()s its browsers.json registry via a runtime-joined path, and sparticuz
  // locates its brotli-packed binary the same way — bundling breaks both.
  serverExternalPackages: [
    'pdfjs-dist',
    '@napi-rs/canvas',
    'pdf-parse',
    'playwright',
    'playwright-core',
    '@sparticuz/chromium',
  ],
  // Belt-and-suspenders: pdfjs-dist loads @napi-rs/canvas via
  // `process.getBuiltinModule('module').createRequire(import.meta.url)`, an indirection the file
  // tracer's static require() detection doesn't recognize, so the package (and its platform-specific
  // native binary) is silently dropped from the trace even with serverExternalPackages set. Force it
  // in explicitly.
  outputFileTracingIncludes: {
    '/api/parse-resume': [
      './node_modules/@napi-rs/canvas/**/*',
      './node_modules/@napi-rs/canvas-linux-x64-gnu/**/*',
    ],
    // sparticuz resolves its packed binary/fonts via runtime path joins the tracer can't follow,
    // and playwright-core require()s its browsers.json registry the same way (the exact file the
    // original production failure named) — force both package trees in whole.
    '/api/export-pdf': [
      './node_modules/@sparticuz/chromium/**/*',
      './node_modules/playwright-core/**/*',
    ],
  },
  outputFileTracingExcludes: {
    // Full playwright is the local-dev launch path only (see lib/resume-export/
    // playwright-browser.ts); in serverless it's never imported, so keep its tree out of the
    // shared function bundle. playwright-core must stay traced — it's the prod launcher.
    '/api/export-pdf': ['./node_modules/playwright/**/*'],
  },
  async redirects() {
    return [{ source: '/review', destination: '/editor', permanent: false }];
  },
};

export default nextConfig;
