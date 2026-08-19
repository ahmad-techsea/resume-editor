import fs from 'node:fs';
import path from 'node:path';
import Groq from 'groq-sdk';
import { jsonrepair } from 'jsonrepair';
import { NextResponse } from 'next/server';
import type { ParsedResumeData } from '@/lib/resume-data/parsed-resume-to-editor';

// Mirrors app/api/complete/route.ts's runtime/error-handling shape. Kept as its own route (rather
// than reusing /api/complete) because it needs multipart file handling and a much larger
// max_tokens budget than the judgment prompt does.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_MODEL = 'qwen/qwen3-32b';
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_EXTRACTED_TEXT_CHARS = 50_000;
const MIME_TO_KIND: Record<string, 'pdf' | 'docx'> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

function hasAcceptedExtension(filename: string): 'pdf' | 'docx' | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx')) return 'docx';
  return null;
}

/** Trusts the MIME type when it's one we recognize; some browsers send a generic/empty type for
 *  less common extensions, so the filename is a legitimate fallback, not a security boundary. */
function classifyFile(file: File): 'pdf' | 'docx' | null {
  return MIME_TO_KIND[file.type] ?? hasAcceptedExtension(file.name || '');
}

// pdf-parse v2 (built on pdfjs-dist) tries to auto-locate its worker script relative to its own
// module location; under Turbopack's dev bundling that path doesn't correspond to a real file
// ("Setting up fake worker failed: Cannot find module '.../pdf.worker.mjs'"), which made every PDF
// — including perfectly valid ones — fail extraction. Every *module-resolution* primitive tried
// here (import.meta.resolve, require.resolve via createRequire) gets rewritten by Turbopack to
// point at its own bundled-chunk location instead of the real file, so this deliberately avoids
// resolution altogether and locates the worker as a plain file under node_modules relative to the
// process's working directory (which `next dev`/`next start` always run from the project root) —
// path.join/fs are runtime operations, not resolvable imports, so Turbopack has nothing to rewrite.
//
// Critical ordering constraint: pdfjs-dist resolves its fake-worker module exactly once per
// process and permanently memoizes the result (its own `shadow()` helper), so setWorker() must run
// before the *first-ever* PDFParse use in this process — calling it later cannot undo an already-
// cached bad path. This function is always awaited before any PDFParse instance is created (see
// extractText below), so that holds; if you ever see this same worker error again after editing
// this file, restart the dev server before concluding the fix doesn't work — a long-running process
// that hit this code path even once before the fix (e.g. mid-debugging) stays poisoned regardless
// of what setWorker is later called with.
let workerConfigured = false;
async function ensurePdfWorkerConfigured(): Promise<void> {
  if (workerConfigured) return;
  const { PDFParse } = await import('pdf-parse');
  const workerPath = path.join(
    process.cwd(),
    'node_modules',
    'pdfjs-dist',
    'legacy',
    'build',
    'pdf.worker.mjs',
  );
  if (!fs.existsSync(workerPath)) {
    throw new Error(`pdf.js worker not found at expected path: ${workerPath}`);
  }
  PDFParse.setWorker(`file://${workerPath}`);
  workerConfigured = true;
}

async function extractText(file: File, kind: 'pdf' | 'docx'): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (kind === 'pdf') {
    await ensurePdfWorkerConfigured();
    // pdf-parse v2's API is a class, not the older v1 `pdfParse(buffer)` function shape.
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      // Multi-page documents get a "-- N of M --" separator between pages, which is presentation
      // furniture, not resume content — strip it so it never reaches the extraction prompt.
      return result.text.replace(/\n*--\s*\d+\s*of\s*\d+\s*--\n*/g, '\n');
    } finally {
      await parser.destroy();
    }
  }
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/** The model is instructed to emit "bullets" as a single "\n"-joined string (see BULLETS in the
 *  prompt) rather than a JSON array — removing that nested-array level is what stopped it from
 *  dropping the array's closing bracket on long, multi-entry resumes. This converts it back to the
 *  string[] shape the rest of the app expects. Tolerates the model returning an actual array
 *  anyway (either shape parses cleanly here) since nothing enforces it followed the instruction. */
function normalizeBullets(v: unknown): string[] | null {
  if (typeof v === 'string') {
    const lines = v
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return lines.length ? lines : null;
  }
  if (Array.isArray(v)) {
    const items = v
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
    return items.length ? items : null;
  }
  return null;
}

function normalizeParsedResume(data: ParsedResumeData): ParsedResumeData {
  const normalized: ParsedResumeData = { ...data };
  if (Array.isArray(data.experience)) {
    normalized.experience = data.experience.map((e) => ({ ...e, bullets: normalizeBullets(e.bullets) }));
  }
  if (Array.isArray(data.projects)) {
    normalized.projects = data.projects.map((p) => ({ ...p, bullets: normalizeBullets(p.bullets) }));
  }
  return normalized;
}

function isPlausibleParsedResume(v: unknown): v is ParsedResumeData {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const knownKeys = [
    'header',
    'summary',
    'experience',
    'education',
    'projects',
    'skills',
    'certifications',
    'awards',
    'languages',
  ];
  return knownKeys.some((k) => k in (v as Record<string, unknown>));
}

/** Tolerant like judgment.ts's parseJudgment — the model is told to return a bare object, but
 *  falls back to extracting the first {...} block if it wraps the answer in prose or a fence, and
 *  finally to jsonrepair for the kind of mistake a long, deeply-nested extraction occasionally
 *  produces (e.g. a missing closing bracket at a nested-array boundary) — deterministic and
 *  instant, so it's tried before ever spending a network round-trip asking the model to fix itself. */
function parseModelJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // fall through
  }
  const m = text.match(/\{[\s\S]*\}/);
  const candidate = m ? m[0] : text;
  try {
    return JSON.parse(candidate);
  } catch {
    // fall through
  }
  return JSON.parse(jsonrepair(candidate));
}

const EXTRACTION_PROMPT_HEADER = `You are transcribing a resume into structured JSON. Extract ONLY text that literally appears in the document — never invent, embellish, guess, or fill in a plausible-sounding value. If a field or an entire section is not present in the document, omit it (or use null / an empty array) rather than guessing.

COMPLETENESS: this resume may list many entries in a section — many jobs under Experience, many schools under Education, many certifications, many projects. Extract EVERY entry in every section, in the order they appear, no matter how many there are. Never skip, merge, summarize, or stop early to save space — a 10-job resume must produce 10 experience entries, not the most recent one or two. Likewise extract every bullet under every entry, not just the first few.

BULLETS: for each experience/project entry, put ALL of its bullet points into a SINGLE "bullets" string — one bullet per line, separated by a "\n" character. Do NOT use a JSON array for bullets, just one flat string. Do not include bullet markers like "-" or "•" at the start of each line, just the bullet text itself.

DATES: report exactly what the document states. If it states both a month and a year, include both. If it states only a year, include the year with month set to null — do not guess a month. If a role/entry is ongoing ("Present", "Current"), set "present": true on its end date and omit year/month for that end date.

OUTPUT CONTRACT:
- Return ONLY a bare JSON object matching the schema below — no markdown fences, no prose before or after, no wrapping array. A response that isn't valid JSON is a fatal error for this task.
- Emit COMPACT single-line JSON: no line breaks, no indentation, no spaces between keys (except inside each "bullets" string itself, where internal "\n" separators are required and expected).
- Before you finish, mentally re-scan the JSON you're about to output and confirm every "[" has a matching "]" and every "{" has a matching "}", in the correct order — an entry with a missing closing bracket invalidates the entire response, discarding all of your work.
- Schema (every field optional/nullable — omit or null anything not found):
{"header":{"name":string|null,"title":string|null,"email":string|null,"phone":string|null,"location":string|null},"summary":string|null,"experience":[{"title":string|null,"company":string|null,"start":{"year":number|null,"month":number|null}|null,"end":{"year":number|null,"month":number|null,"present":boolean}|null,"bullets":string|null}],"education":[{"institution":string|null,"degree":string|null,"end":{"year":number|null,"month":number|null}|null}],"projects":[{"name":string|null,"tech":string|null,"description":string|null,"bullets":string|null}],"skills":[string],"certifications":[{"name":string|null,"issuer":string|null,"year":number|null}],"awards":[{"title":string|null,"issuer":string|null,"year":number|null,"detail":string|null}],"languages":[string]}

RESUME TEXT (as extracted from the uploaded file — extraction artifacts like odd spacing or line breaks may appear; read past them, do not transcribe them literally into field values):
`;

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY is not set. Copy .env.example to .env.local and add your Groq key.' },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Request body must be multipart/form-data.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'No file was uploaded.' }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'File is larger than 5 MB.' }, { status: 413 });
  }
  const kind = classifyFile(file);
  if (!kind) {
    return NextResponse.json({ error: 'Only PDF and DOCX files are accepted.' }, { status: 400 });
  }

  let rawText: string;
  try {
    rawText = (await extractText(file, kind)).trim();
  } catch (err) {
    // Log the full error server-side (not just the message) — extraction failures span both
    // genuinely bad input and environment/setup bugs, and only the stack tells those apart.
    console.error('[api/parse-resume] text extraction failed:', err);
    return NextResponse.json(
      { error: `Could not read the ${kind.toUpperCase()} file — it may be corrupted or scanned as images.` },
      { status: 400 },
    );
  }
  if (!rawText) {
    return NextResponse.json(
      { error: 'No readable text was found in the file — it may be a scanned image with no text layer.' },
      { status: 400 },
    );
  }
  if (rawText.length > MAX_EXTRACTED_TEXT_CHARS) {
    rawText = rawText.slice(0, MAX_EXTRACTED_TEXT_CHARS);
  }

  const groq = new Groq({ apiKey });
  async function callGroq(messages: Groq.Chat.ChatCompletionMessageParam[]): Promise<string> {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || DEFAULT_MODEL,
      messages,
      temperature: 0,
      max_tokens: 12_000,
      reasoning_effort: 'none',
    });
    return completion.choices[0]?.message?.content ?? '';
  }

  const userMessage = { role: 'user' as const, content: EXTRACTION_PROMPT_HEADER + rawText };
  let completionText: string;
  try {
    completionText = await callGroq([userMessage]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error calling Groq.';
    console.error('[api/parse-resume] Groq call failed:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = parseModelJson(completionText);
  } catch (firstErr) {
    // parseModelJson already tried jsonrepair, which deterministically fixes the common failure
    // mode (a missing bracket at a nested-array boundary) — reaching here means the response was
    // broken in some other way jsonrepair couldn't reconstruct. temperature: 0 makes a blind retry
    // with the identical prompt reproduce the identical mistake (verified: it reproduces byte-for-
    // byte), so this hands the model its own broken output plus the exact parse error instead.
    const reason = firstErr instanceof Error ? firstErr.message : String(firstErr);
    console.error('[api/parse-resume] first response was unparseable, retrying with a correction:', reason);
    try {
      completionText = await callGroq([
        userMessage,
        { role: 'assistant', content: completionText },
        {
          role: 'user',
          content: `That response is not valid JSON: ${reason}. Return a corrected version with the exact same content, fixing only the JSON syntax (matching brackets/braces, no missing commas). Output ONLY the corrected bare JSON object, nothing else.`,
        },
      ]);
      parsed = parseModelJson(completionText);
    } catch (secondErr) {
      console.error(
        '[api/parse-resume] retry also failed:',
        secondErr instanceof Error ? secondErr.message : secondErr,
      );
      return NextResponse.json(
        { error: 'The parser returned an unreadable response. Please try again.' },
        { status: 502 },
      );
    }
  }
  if (!isPlausibleParsedResume(parsed)) {
    console.error('[api/parse-resume] model response did not match the expected shape');
    return NextResponse.json(
      { error: 'The parser returned an unreadable response. Please try again.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ data: normalizeParsedResume(parsed) });
}
