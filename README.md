# Inline Resume Editor

A Next.js app that started as a port of three Claude Design prototypes and has since grown into a
full upload → edit → review flow.

| Route        | Screen                                    | Notes                                              |
| ------------ | ------------------------------------------ | --------------------------------------------------- |
| `/`          | Landing — upload a resume or start blank   | Upload parses PDF/DOCX via Groq; Scratch is empty   |
| `/editor`    | Resume editor + Settings/Review drawers    | The editing surface, plus in-place review           |
| `/templates` | Section templates                          | Reference gallery, five styles × eight sections     |
| `/review`    | *(removed)*                                | Redirects (307) to `/editor` — see `next.config.mjs` |

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your Groq key
npm run dev                  # http://localhost:3000
```

| Script              | What it does                                   |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Dev server                                       |
| `npm run build`     | Production build                                 |
| `npm start`         | Serve the production build                       |
| `npm test`          | Unit tests for the rule engine etc. (`node --test`) |
| `npm run typecheck` | `tsc --noEmit`                                   |

## The flow

**`/` — Landing.** Two choices: upload a resume (PDF or DOCX, up to 5 MB) to have it parsed and
pre-fill the editor, or start from a completely blank one. Uploads go through
[`app/api/parse-resume/route.ts`](app/api/parse-resume/route.ts): text is extracted with
`pdf-parse` / `mammoth`, then a Groq/Qwen prompt structures it into JSON, explicitly instructed to
extract only text that literally appears and to leave a field empty rather than guess. A parsing
failure (bad file, timeout, malformed model output) shows a clear error with a "Try again" action
and a link to continue from scratch instead. On success — or on Scratch — the parsed or blank
document is written into the store and the browser navigates to `/editor`.

**`/editor` — Resume editor.** The resume itself is the editing surface: click any text to edit it
in place, Enter commits, Escape restores. Editing affordances (add / delete / reorder / link) only
appear on hover or keyboard focus, so the page reads as a finished document when idle, and they are
hidden when printing. Sections can be added from a two-pane picker, restyled individually, and
reordered. Whole-resume templates change the font, accent, and header layout.

Settings — template, page size, zoom, date format, margins, export, print — live in a drawer
anchored to the right edge; click its edge tab to open or close it. A Review drawer on the left
holds **Generate Review**, enabled once the resume has any real content (every section empty or
whitespace-only keeps it disabled, with a short hint). Generating renders the full review in
place — score, filters, and findings — reusing the same rule engine and scoring described below.
Every finding that has a mechanically-derivable fix (never a fabricated one) shows an **Apply fix**
button, which writes the suggestion straight into the matching editor field, and a **Copy** button
with a brief confirmation. If the target field can't be located (its section was deleted, or the
text has changed since the review ran), a non-blocking notice appears instead of writing to the
wrong place. Every generation is kept as a labeled version (v1, v2, …) with a timestamp; a version
switcher lets you compare them, and a chart tracks the overall score across all of them. Both
drawers overlay the editor as full-height slide-ins below ~768px.

**Export** produces real files: a headless-browser PDF export and `docx` for the Word document,
both honouring the current margins, template font, and accent colour.

**`/templates` — Section templates.** The reference gallery: five styles for each resume section,
with anchor links so a specific style can be cited by id (`#4b`, `#7c`, …).

## The rule engine

[`lib/resume-review-engine.ts`](lib/resume-review-engine.ts) is pure and dependency-free — no DOM
access, no network, no model calls — so it is directly unit-testable. It holds:

- A **rule registry**: each rule has a stable `ruleId`, a `category` matching the checklist, a
  `severity`, a `scope`, and an `evaluate(resume)` returning zero or more findings. Rules that need
  a job description are flagged `requiresJobDescription` and skipped rather than failed; the drawer
  lists the categories it skipped for that reason. Every rule whose fix is mechanically derivable
  from the matched text alone (delete, dedupe, reformat, recapitalize) also sets a `suggestion` — a
  literal drop-in replacement the drawer's Apply-fix action can use verbatim. Rules where a real fix
  would require inventing content the user hasn't supplied surface the issue as guidance only.
- A **canonical text builder**. Offsets are UTF-16 code-unit indices into the NFC-normalised text of
  the field named by a finding's `fieldPath`, so offsets from different rules are comparable.
- **Re-anchoring**: stored offsets first, then a search within the same field, then the same
  section, and finally `unresolved` — re-run live on every render so an edit either relocates a
  finding or moves it into a "Could not locate" group, never highlights the wrong text.
- **Scoring**: a nine-bucket Resume Quality score out of 100.

Rules are split by execution strategy. The deterministic ones run in code and are covered by
`npm test`. The AI-judgment rules — writing quality and leadership signal — go through the model
with a strict JSON contract in one combined prompt/response
([`lib/resume-review/judgment.ts`](lib/resume-review/judgment.ts)); output that fails validation is
dropped rather than rendered.

The engine's rules are written against a fixed resume schema
([`lib/resume-data/review-resume-data.ts`](lib/resume-data/review-resume-data.ts)), not the
editor's own flexible, reorderable section model
([`lib/resume-data/editor-resume-data.ts`](lib/resume-data/editor-resume-data.ts)).
[`lib/resume-data/editor-to-review-adapter.ts`](lib/resume-data/editor-to-review-adapter.ts)
projects the live editor document into that fixed shape on every "Generate Review" click and
returns a path map translating a finding's field path back into a real, writable editor field —
recomputed fresh on every use (never cached), since sections can be added, removed, or reordered
between generating a review and applying a fix.

## The `/api/complete` and `/api/parse-resume` routes

Both call Groq server-side so the API key never reaches the browser. `/api/complete`
([`app/api/complete/route.ts`](app/api/complete/route.ts), client wrapper
[`lib/complete.ts`](lib/complete.ts)) powers the two AI-judgment rules. `/api/parse-resume`
([`app/api/parse-resume/route.ts`](app/api/parse-resume/route.ts)) powers the landing page's upload
path, with a larger `max_tokens` budget sized for a full structured extraction rather than a
handful of findings.

Configure in `.env.local`:

```
GROQ_API_KEY=...
GROQ_MODEL=qwen/qwen3-32b
```

`GROQ_MODEL` defaults to `qwen/qwen3-32b`; set it to whatever your Groq account has enabled. Qwen 3
emits its reasoning in `<think>` blocks; both routes set `reasoning_effort: 'none'` to skip it.

Without a key, `/api/complete` returns 503 (the two judgment rules are marked incomplete, but every
deterministic rule still runs, so a review is still usable) and `/api/parse-resume` returns 503 (the
landing page surfaces this as its normal error state, with "Try again" / "Continue from scratch").

## Layout

```
app/
  page.tsx                    /          → LandingPage (upload or start from scratch)
  editor/page.tsx             /editor    → InlineResumeEditor (+ Settings/Review drawers)
  templates/page.tsx          /templates → SectionTemplates
  api/complete/route.ts       Groq-backed completion endpoint (review judgment)
  api/parse-resume/route.ts   Groq-backed resume-upload parsing endpoint
  layout.tsx, globals.css     Shared shell: Open Sans, body reset
components/                   Editor, drawers, review UI, landing page
lib/                          Rule engine + tests, the editor↔review adapter, apply-fix logic
styles/                       One stylesheet per screen/concern
```

Each screen's stylesheet is scoped under a root class (`.ire`, `.landing`, `.sectpl`, …) because
Next.js applies imported CSS app-wide — without the scoping, screens that style bare `input`,
`button`, and `a` differently would overwrite each other. Only declarations every screen shares
verbatim live in `globals.css`. `next.config.mjs` redirects `/review` (307, not cached) to
`/editor` so old links or bookmarks land on the editor instead of a 404.
