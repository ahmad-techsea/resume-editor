/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdf-parse/pdfjs-dist optionally load @napi-rs/canvas (a native addon) to polyfill DOMMatrix/
  // ImageData/Path2D for Node. Native addons resolve their platform-specific prebuilt binary via a
  // runtime require() string, which only works against real node_modules — bundling them breaks
  // that resolution ("Cannot find module '@napi-rs/canvas'"), which then leaves pdfjs-dist without
  // its DOMMatrix polyfill and crashes text extraction. Excluding them from bundling lets Vercel's
  // file tracer include the whole package tree instead, the standard fix for native-addon deps.
  serverExternalPackages: ['pdfjs-dist', '@napi-rs/canvas', 'pdf-parse'],
  async redirects() {
    return [{ source: '/review', destination: '/editor', permanent: false }];
  },
};

export default nextConfig;
