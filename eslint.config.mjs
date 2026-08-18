import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'design/**'] },
  ...coreWebVitals,
  ...typescript,
  {
    // The design prototypes were untyped JS, and their resume/view-model objects are genuinely
    // dynamic (paths like `sections.2.entries.0.contribs.1` are resolved at runtime). Modelling
    // them with real types would be a rewrite, not a port — and a port is what these files are.
    files: ['components/InlineResumeEditor.tsx', 'components/ResumeReviewPanel.tsx', 'lib/resume-review-engine.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    // This rule targets the Pages Router, where a font <link> outside _document.js really does
    // load per-page. Ours is in the App Router root layout, so it applies to every route — and it
    // is deliberately the same <link> the prototypes used, so font metrics match exactly.
    files: ['app/layout.tsx'],
    rules: { '@next/next/no-page-custom-font': 'off' },
  },
];

export default config;
