import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'design/**'] },
  ...coreWebVitals,
  ...typescript,
  prettier,
  {
    // The design prototypes were untyped JS, and their resume/view-model objects are genuinely
    // dynamic (paths like `sections.2.entries.0.contribs.1` are resolved at runtime). Modelling
    // them with real types would be a rewrite, not a port — and a port is what these files are.
    // This also covers the pieces InlineResumeEditor.tsx and ResumeReviewPanel.tsx were split
    // into (components/editor/**, the path-based Redux reducers in lib/store/*-resume-slice.ts,
    // the AI-judgment helpers in lib/resume-review/, the PDF/DOCX export code which dynamically
    // imports jsPDF/docx without their full types, and lib/resume-data/review-entries-adapter.ts,
    // which builds the same dynamic view-model shape components/editor/** consumes so the review
    // page can render through it).
    files: [
      'components/InlineResumeEditor.tsx',
      'components/ResumeReviewPanel.tsx',
      'lib/resume-review-engine.ts',
      'components/editor/**',
      'lib/resume-data/review-entries-adapter.ts',
      'lib/resume-review/**',
      'lib/store/editor-resume-slice.ts',
      'lib/store/review-resume-slice.ts',
      'lib/resume-export/pdf.ts',
      'lib/resume-export/docx.ts',
    ],
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
