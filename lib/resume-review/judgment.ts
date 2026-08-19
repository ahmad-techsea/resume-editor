// AI-judgment pass for ResumeReviewPanel — writing quality and seniority/leadership signal,
// merged into a single lib/complete.ts call so review generation makes exactly one /api/complete
// round trip. Module-level functions: these never touched component state, only the resume
// document and the engine's pure helpers.
import { complete } from '@/lib/complete';
import type { Finding } from '@/lib/resume-review-engine';
import * as Eng from '@/lib/resume-review-engine';

export async function parseJudgment(
text: Array<any> | string,
validFields: Set<string>,
resume: any,
categoryMap: Record<string, string>,
): Promise<Finding[]> {
let arr: any;
if (typeof text === 'string') {
  try {
    arr = JSON.parse(text);
  } catch {
    const m = text.match(/\[[\s\S]*\]/);
    if (!m) throw new Error('bad json');
    arr = JSON.parse(m[0]);
  }
} else {
  arr = text as Array<any>;
}
if (!Array.isArray(arr)) throw new Error('not array');
const out: Finding[] = [];
for (const item of arr) {
  if (!item || typeof item !== 'object') continue;
  const { ruleId, fieldPath, matchedText, severity, message } = item;
  if (!ruleId || !categoryMap[ruleId]) continue;
  if (!fieldPath || !validFields.has(fieldPath)) continue;
  if (!['critical', 'warning', 'suggestion'].includes(severity)) continue;
  if (typeof message !== 'string' || !message.trim()) continue;
  const fieldText = Eng.normalizeText(Eng.getByPath(resume, fieldPath));
  if (typeof matchedText !== 'string' || !matchedText || fieldText.indexOf(matchedText) < 0)
    continue;
  const i = fieldText.indexOf(matchedText);
  out.push({
    ruleId,
    category: categoryMap[ruleId],
    severity,
    scope: 'field',
    fieldPath,
    matchedText,
    message,
    suggestion: typeof item.suggestion === 'string' ? item.suggestion : null,
    textRange: { start: i, end: i + matchedText.length },
  });
}
return out;
}

const CATEGORY_MAP: Record<string, string> = {
'sum-generic-ai': 'summary',
'bul-impact': 'bullets',
'gw-grammar': 'grammar',
'gw-spelling': 'grammar',
'sen-leadership': 'seniority',
};

export async function runJudgment(resume: any): Promise<Finding[]> {
const fields: Array<{ fieldPath: string; text: string }> = [];
fields.push({ fieldPath: 'summary', text: Eng.normalizeText(resume.summary) });
(resume.experience || []).forEach((e: any, i: number) =>
  (e.bullets || []).forEach((b: string, j: number) =>
    fields.push({ fieldPath: `experience[${i}].bullets[${j}]`, text: Eng.normalizeText(b) }),
  ),
);
(resume.projects || []).forEach((p: any, i: number) =>
  (p.bullets || []).forEach((b: string, j: number) =>
    fields.push({ fieldPath: `projects[${i}].bullets[${j}]`, text: Eng.normalizeText(b) }),
  ),
);

const roles: Array<{ fieldPath: string; title: string; bullets: string[] }> = [];
(resume.experience || []).forEach((e: any, i: number) =>
  roles.push({
    fieldPath: `experience[${i}].title`,
    title: e.title,
    bullets: (e.bullets || []).map((b: string) => Eng.normalizeText(b)),
  }),
);

const validFields = new Set([...fields.map((f) => f.fieldPath), ...roles.map((r) => r.fieldPath)]);

// Prompt tuned for Groq Qwen with reasoning disabled: the model executes this checklist
// mechanically, so the prompt carries all analytical structure. matchedText must survive
// parseJudgment's verbatim-substring check, and the compact-JSON + hard-limit lines keep a
// problem-heavy resume from truncating at max_tokens (which would fail the whole parse). Both
// audits share one 4096-token response budget, so the combined hard cap stays at 25 (AUDIT 2
// rarely flags anything — see its own gate below) rather than 25 apiece.
const prompt = `You are a veteran tech recruiter and professional copy editor doing a line-by-line resume review. Run BOTH audits below and return their findings merged into ONE JSON array. Flag only real problems.

=== AUDIT 1 — WRITING QUALITY ===
INPUT: a JSON array of {fieldPath, text} (see FIELDS below). The field with fieldPath "summary" is the professional summary; every other field is a single experience/project bullet.

CHECKLIST — run every step on each field:
STEP 1 — SPELLING (ruleId "gw-spelling"): read the field word by word. Flag each misspelled word (invented examples: "enviroment", "managment"). matchedText = the misspelled word only, copied exactly as it appears in the text (keep its original capitalization).
STEP 2 — GRAMMAR (ruleId "gw-grammar"): check subject-verb agreement, garbled or malformed sentences, AND duplicated adjacent words — e.g. "planned the the launch" doubles "the"; flag matchedText "the the". Doubled words are easy to skim past: re-read each field slowly just for them. matchedText = the minimal span containing the error. Do NOT flag normal resume style: bullets that omit the subject ("Led X...", "Built Y...") are correct fragments, not grammar errors.
STEP 3 — SUMMARY ONLY (ruleId "sum-generic-ai", fieldPath must be exactly "summary"): find every generic, cliché, interchangeable phrase that could sit on anyone's resume (invented examples: "results-driven professional", "thinks outside the box"). Emit ONE finding PER offending phrase — never one blanket finding covering the whole summary. matchedText = that exact phrase alone.
STEP 4 — BULLETS ONLY (ruleId "bul-impact"): ask one question: does this bullet state a concrete outcome — a number, metric, or specific named result?
- Activity with no outcome at all -> flag, severity "warning".
- Only a vague unquantified outcome ("significantly", "made things better") -> flag, severity "suggestion".
- A concrete number or specific outcome is present -> DO NOT flag, even if the style is imperfect. Invented example: "Migrated the payment service to Kubernetes, cutting deploy time from 30 minutes to 4." -> output NOTHING; it already states a quantified outcome.
matchedText = the entire bullet text, copied verbatim (here the whole bullet is the problem).

SEVERITY RUBRIC (AUDIT 1):
- "critical": reserve for errors that badly damage credibility at first glance (a garbled, unreadable sentence).
- "warning": misspellings and grammar errors a recruiter would notice; bullets with no outcome at all.
- "suggestion": vague-but-present impact; style-level wording issues; summary clichés.

MESSAGE STYLE (each ≤140 chars): quote the offending text and state precisely why it fails. Never output a bare category label. The message states the problem; put replacement text only in "suggestion".
BAD: "Spelling error detected."
GOOD: "\\"Enviroment\\" is misspelled — should be \\"Environment\\"."
GOOD: "\\"the the\\" — the word \\"the\\" is duplicated."

SUGGESTION STYLE (each ≤200 chars): give a concrete drop-in replacement for matchedText, not abstract advice. For "gw-spelling", suggestion = the corrected word alone (a drop-in for matchedText): matchedText "Acheived" -> suggestion "Achieved", not "Replace with Achieved". For "bul-impact", rewrite the bullet to end in a measurable result and mark placeholder metrics clearly, e.g. "cutting churn by [X]% (replace [X] with your number)". When a bullet opens with a weak activity (attended, helped with, worked on), reframe the rewrite outcome-first — do not merely append a metric to the weak phrasing.

matchedText RULES (a wrong matchedText silently destroys the finding):
- It must be an exact byte-for-byte substring of that field's "text": same capitalization, punctuation, and spacing. Never paraphrase, re-capitalize, add "...", or change quote/dash characters.
- Use the minimal span that pinpoints the problem: the misspelled word alone, the cliché phrase alone, the grammar error span alone — the whole bullet only for "bul-impact".

FIELDS:
${JSON.stringify(fields)}

=== AUDIT 2 — SENIORITY/LEADERSHIP SIGNAL ===
Audit whether senior job titles are backed up by the bullets beneath them. Most resumes pass this audit: the expected output is usually no findings from this audit, and a false positive is worse than a miss. When in doubt, do not flag.

INPUT: a JSON array of roles: {fieldPath, title, bullets} (see ROLES below).

PROCEDURE — run these steps on each role, in order:
STEP 1 — TITLE GATE: does the title genuinely imply leadership or seniority? Passing signals: Manager, Lead, Director, Head, Principal, Staff, VP, Chief, or "Senior" combined with the rest of the title. Caveat: "Product Manager" or "Account Manager" alone names a role type, not people-leadership — such titles pass the gate only with an added seniority modifier (Senior, Group, Head, Director). If the title does NOT pass -> skip the role entirely; non-senior titles are never flagged: Engineer, Developer, Analyst, Associate, Coordinator, Consultant, Intern — and numeric levels like "II" or "III" alone do not imply seniority.
STEP 2 — BULLET SCAN: read EVERY bullet of the role looking for ANY ownership, leadership, or scope signal:
- managing or leading people (any team size), hiring, mentoring, coaching
- budget, strategy, roadmap, or ownership of a product/area
- cross-functional or cross-team coordination
- architectural or system-level ownership; setting technical direction
STEP 3 — DECISION: if ANY single bullet shows ANY signal from Step 2 -> do NOT flag this role. Flag ONLY when the title passed Step 1 AND every bullet reads as individual-contributor task work with zero leadership/scope signal.

SEVERITY RUBRIC (AUDIT 2):
- "warning": people-leadership title (Manager, Director, Head, VP, Chief) with zero signal in any bullet.
- "suggestion": senior IC title (Staff, Principal, Senior, Lead) with zero scope/ownership signal.

matchedText RULES: copy the flagged role's "title" value EXACTLY as given — byte-for-byte, same capitalization and punctuation. It is validated against the title string, so any change (or copying from a bullet instead) silently destroys the finding.

MESSAGE STYLE (≤140 chars): name the title and state the gap concretely, e.g. "Title \\"Head of Platform\\" implies leadership, but no bullet shows a team, budget, or owned scope."
SUGGESTION STYLE (≤200 chars): a concrete new bullet proving scope, tailored to that role's actual domain from its own bullets — never reuse the same suggestion text for two roles. People-manager title: "Led a team of [N] engineers, ran performance reviews, and owned sprint planning." Senior-IC title: "Defined technical strategy for [system] and mentored [N] engineers." Replace bracketed parts with specifics.

ROLES:
${JSON.stringify(roles)}

=== OUTPUT CONTRACT (covers BOTH audits) ===
- Return ONLY a bare JSON array merging findings from both audits. No markdown fences, no prose, no wrapping object — a top-level {...} is a fatal error. Return [] if nothing to flag.
- Each item: {"ruleId":"sum-generic-ai"|"bul-impact"|"gw-grammar"|"gw-spelling"|"sen-leadership","fieldPath":"...","matchedText":"...","severity":"critical"|"warning"|"suggestion","message":"...","suggestion":"..."}
- fieldPath must be exactly one of the FIELDS paths (AUDIT 1 ruleIds) or ROLES paths (AUDIT 2's "sen-leadership"). "sum-generic-ai" only ever pairs with fieldPath "summary".
- HARD LIMITS across the WHOLE combined array: at most 25 findings total, at most 2 findings per field for AUDIT 1, at most 1 finding per role for AUDIT 2 (keep the most severe ones). On a problem-heavy resume, cover more fields rather than exhaustively flagging a few.
- Emit the array as COMPACT single-line JSON: no line breaks, no indentation, no spaces between keys.

OUTPUT MUST BE A JSON.
`;

const text = await complete(prompt);
return parseJudgment(text, validFields, resume, CATEGORY_MAP);
}
