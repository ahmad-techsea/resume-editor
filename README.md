# Inline Resume Editor

A Next.js app ported from the Claude Design prototypes in [`design/`](design/). It has three
screens, each a faithful reimplementation of one design artboard:

| Route        | Screen               | Ported from                    |
| ------------ | -------------------- | ------------------------------ |
| `/`          | Inline resume editor | `Inline Resume Editor.dc.html` |
| `/review`    | Resume review panel  | `Resume Review Panel.dc.html`  |
| `/templates` | Section templates    | `Section Templates.dc.html`    |

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your Groq key
npm run dev                  # http://localhost:3000
```

| Script              | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Dev server                                     |
| `npm run build`     | Production build                               |
| `npm start`         | Serve the production build                     |
| `npm test`          | Unit tests for the rule engine (`node --test`) |
| `npm run typecheck` | `tsc --noEmit`                                 |

## The three screens

**`/` — Inline resume editor.** The resume itself is the editing surface: click any text to edit it
in place, Enter commits, Escape restores. Editing affordances (add / delete / reorder / link) only
appear on hover or keyboard focus, so the page reads as a finished document when idle, and they are
hidden when printing. Sections can be added from a two-pane picker, restyled individually (Classic
ruled, Side label, Tinted panel, Editorial, Centered note, Pill tags, and for repeatable sections
Timeline rail, Dates left, Compact rows, Company first), and reordered. Six ATS-safe whole-resume
templates change the font, accent, and header layout. Dates use a month-and-year picker with a
"Present" option and start/end range validation. Page margins are dragged visually and feed
straight into the exports.

**Export** produces real files, not print-to-PDF: `jspdf` for the PDF and `docx` for the Word
document, both honouring the current margins, template font, and accent colour.

**`/review` — Resume review panel.** An editable resume on the left, a review panel on the right
with three states: empty, generating (per-category progress), and result (score, grouped findings,
filters). Findings are anchored to the exact text they refer to — clicking one scrolls the resume
and selects the flagged substring. Edits re-anchor findings live, or move them into a "Could not
locate" group rather than highlighting the wrong text. Reviews are persisted in `localStorage`
keyed by a content hash of the resume, so a resume that already has a review never shows the empty
state, and editing after a review marks it stale. Dismissals persist per rule + field + matched
text, so a dismissed issue does not come back on regeneration but a genuinely new occurrence does.

**`/templates` — Section templates.** The reference gallery: five styles for each of eight resume
sections, with anchor links so a specific style can be cited by id (`#4b`, `#7c`, …).

## The rule engine

[`lib/resume-review-engine.ts`](lib/resume-review-engine.ts) is pure and dependency-free — no DOM
access, no network, no model calls — so it is directly unit-testable. It holds:

- A **rule registry**: each rule has a stable `ruleId`, a `category` matching the checklist, a
  `severity`, a `scope`, and an `evaluate(resume)` returning zero or more findings. Rules that need
  a job description are flagged `requiresJobDescription` and skipped rather than failed; the panel
  lists the categories it skipped for that reason.
- A **canonical text builder**. Offsets are UTF-16 code-unit indices into the NFC-normalised text of
  the field named by a finding's `fieldPath`, so offsets from different rules are comparable. A
  rule that cannot produce a character range degrades to the smallest scope it can honestly give
  rather than inventing one.
- **Re-anchoring**: stored offsets first, then a search within the same field, then the same
  section, and finally `unresolved`.
- **Scoring**: a nine-bucket Resume Quality score out of 100.

Rules are split by execution strategy. The deterministic ones run in code and are covered by
`npm test` (positive, negative, and boundary cases, plus offset normalisation, overlap merging, and
re-anchoring after an edit that shifts offsets). The two judgment rules — writing quality and
leadership signal — go through the model with a strict JSON contract; output that fails validation
is dropped rather than rendered.

## The `/api/complete` route

The prototypes called `window.claude.complete(prompt)`, a global that only exists inside Claude
Design. Here that is [`lib/complete.ts`](lib/complete.ts) posting to
[`app/api/complete/route.ts`](app/api/complete/route.ts), which calls Groq server-side so the API
key never reaches the browser.

Configure it in `.env.local`:

```
GROQ_API_KEY=...
GROQ_MODEL=qwen/qwen3-32b
```

`GROQ_MODEL` defaults to `qwen/qwen3-32b`; set it to whatever your Groq account has enabled. Qwen 3
emits its reasoning in `<think>` blocks, which the route strips before returning the completion.

Without a key the route returns 503, the two judgment rules are marked incomplete, and the panel
shows its "AI analysis didn't finish — Retry" banner. Every deterministic rule still runs, so the
review is fully usable unconfigured.

## Layout

```
app/
  page.tsx                  /          → InlineResumeEditor
  review/page.tsx           /review    → ResumeReviewPanel
  templates/page.tsx        /templates → SectionTemplates
  api/complete/route.ts     Groq-backed completion endpoint
  layout.tsx, globals.css   Shared shell: Open Sans, body reset
components/                 One component per design artboard
lib/                        Rule engine + its tests, completion client
styles/                     One stylesheet per artboard
design/                     The original Claude Design handoff bundle
```

Each artboard's stylesheet is scoped under a root class (`.ire`, `.rrp`, `.sectpl`) because Next.js
applies imported CSS app-wide — without the scoping the three screens, which style bare `input`,
`button`, and `a` differently, would overwrite each other. Only the declarations all three shared
verbatim live in `globals.css`.

Hover and focus styling that the design runtime generated from `style-hover=` / `style-focus=`
attributes is reproduced as `!important` rules in those stylesheets, since the base styling is
inline and would otherwise win.
