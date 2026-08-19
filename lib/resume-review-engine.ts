// Pure, dependency-free resume review engine. No DOM access — safe to unit test in isolation.
// Offsets are UTF-16 code-unit indices (JS string indices) into the NORMALIZED text of the
// field named by `fieldPath` (not a single global document string). A canonical whole-document
// string is still built (buildCanonicalDoc) so document/section-scope rules and normalization
// stay consistent across every rule, but per-field offsets are what the UI uses to highlight.

export type Severity = 'critical' | 'warning' | 'suggestion';

export interface TextRange {
  start: number;
  end: number;
}

export interface Finding {
  ruleId: string;
  category: string;
  severity: Severity;
  scope?: string;
  fieldPath: string | null;
  matchedText: string;
  message: string;
  suggestion?: string | null;
  textRange?: TextRange | null;
  grouped?: boolean;
  groupCount?: number;
  errored?: boolean;
  unresolved?: boolean;
  resolved?: boolean;
  scopeUsed?: string;
}

/** A finding as produced inside a rule's `evaluate`, before the runner stamps rule metadata on. */
interface RawFinding {
  fieldPath: string;
  matchedText: string;
  message: string;
  suggestion?: string;
  severity?: Severity;
}

export interface Rule {
  ruleId: string;
  category: string;
  scope: string;
  severity?: Severity;
  requiresJobDescription?: boolean;
  evaluate: (resume: any) => RawFinding[];
}

export function normalizeText(s: unknown): string {
  if (s == null) return '';
  return String(s)
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim();
}

function tokenizePath(path: string): Array<string | number> {
  const out: Array<string | number> = [];
  path.split('.').forEach((part) => {
    const m = part.match(/^([a-zA-Z0-9_]+)((?:\[\d+\])*)$/);
    if (!m) return;
    out.push(m[1]);
    (m[2].match(/\[(\d+)\]/g) || []).forEach((i) => out.push(Number(i.slice(1, -1))));
  });
  return out;
}
export function getByPath(obj: any, path: string): any {
  let cur = obj;
  for (const t of tokenizePath(path)) {
    if (cur == null) return undefined;
    cur = cur[t];
  }
  return cur;
}
export function setByPath(obj: any, path: string, value: any): void {
  const tokens = tokenizePath(path);
  let cur = obj;
  for (let i = 0; i < tokens.length - 1; i++) cur = cur[tokens[i]];
  cur[tokens[tokens.length - 1]] = value;
}

export function enumerateFields(resume: any): Array<{ fieldPath: string; text: any }> {
  const f: Array<{ fieldPath: string; text: any }> = [];
  (['name', 'title', 'email', 'phone', 'location', 'linkedin', 'github'] as const).forEach((k) => {
    if (resume.header[k] !== undefined)
      f.push({ fieldPath: 'header.' + k, text: resume.header[k] });
  });
  f.push({ fieldPath: 'summary', text: resume.summary });
  (resume.experience || []).forEach((e: any, i: number) => {
    f.push({ fieldPath: `experience[${i}].title`, text: e.title });
    f.push({ fieldPath: `experience[${i}].company`, text: e.company });
    f.push({ fieldPath: `experience[${i}].location`, text: e.location });
    (e.bullets || []).forEach((b: string, j: number) =>
      f.push({ fieldPath: `experience[${i}].bullets[${j}]`, text: b }),
    );
  });
  (resume.education || []).forEach((e: any, i: number) => {
    f.push({ fieldPath: `education[${i}].institution`, text: e.institution });
    f.push({ fieldPath: `education[${i}].degree`, text: e.degree });
    f.push({ fieldPath: `education[${i}].field`, text: e.field });
  });
  f.push({ fieldPath: 'skills', text: resume.skills || '' });
  (resume.certifications || []).forEach((c: any, i: number) =>
    f.push({ fieldPath: `certifications[${i}].name`, text: c.name }),
  );
  (resume.projects || []).forEach((p: any, i: number) => {
    f.push({ fieldPath: `projects[${i}].name`, text: p.name });
    f.push({ fieldPath: `projects[${i}].tech`, text: p.tech });
    f.push({ fieldPath: `projects[${i}].outcome`, text: p.outcome });
    (p.bullets || []).forEach((b: string, j: number) =>
      f.push({ fieldPath: `projects[${i}].bullets[${j}]`, text: b }),
    );
  });
  return f;
}

export function buildCanonicalDoc(resume: any): {
  text: string;
  segments: Array<{ fieldPath: string; start: number; end: number }>;
} {
  const fields = enumerateFields(resume);
  let text = '';
  const segments: Array<{ fieldPath: string; start: number; end: number }> = [];
  for (const fld of fields) {
    const norm = normalizeText(fld.text);
    const start = text.length;
    text += norm;
    segments.push({ fieldPath: fld.fieldPath, start, end: start + norm.length });
    text += '\n';
  }
  return { text, segments };
}

export function hashStr(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
export function computeVersionId(resume: any): string {
  return hashStr(buildCanonicalDoc(resume).text);
}

export const CATEGORIES: Array<{ id: string; name: string; requiresJD?: boolean }> = [
  { id: 'job-match', name: 'Job Match & ATS Alignment', requiresJD: true },
  { id: 'summary', name: 'Professional Summary' },
  { id: 'experience', name: 'Work Experience' },
  { id: 'bullets', name: 'Achievement Bullets' },
  { id: 'skills', name: 'Skills' },
  { id: 'relevant-experience', name: 'Relevant Experience' },
  { id: 'responsibilities', name: 'Responsibilities & Job-Task Alignment', requiresJD: true },
  { id: 'seniority', name: 'Seniority & Leadership' },
  { id: 'industry', name: 'Industry & Domain', requiresJD: true },
  { id: 'education', name: 'Education' },
  { id: 'certifications', name: 'Certifications & Licenses' },
  { id: 'projects', name: 'Projects' },
  { id: 'grammar', name: 'Grammar & Writing Quality' },
  { id: 'action-verbs', name: 'Action Verbs' },
  { id: 'quantification', name: 'Quantification' },
  { id: 'ats-structure', name: 'ATS Parsing & Structure' },
  { id: 'formatting', name: 'Resume Formatting' },
  { id: 'length', name: 'Resume Length' },
  { id: 'contact', name: 'Contact Information' },
  { id: 'consistency', name: 'Consistency' },
  { id: 'content-remove', name: 'Content to Remove or Avoid' },
  { id: 'rescore', name: 'Before Re-Scoring Against a JD', requiresJD: true },
  { id: 'final-review', name: 'Final Review' },
];

const GENERIC_PHRASES = [
  'hard-working',
  'hard working',
  'motivated',
  'team player',
  'results-driven',
  'results driven',
  'detail-oriented',
  'detail oriented',
  'go-getter',
  'self-starter',
  'gives 110%',
  'think outside the box',
  'synergy',
];
const WEAK_OPENERS = ['helped with', 'worked on', 'assisted with', 'in charge of', 'tasked with'];
const PRONOUN_RE = /\b(I|I'm|I've|my|me)\b/i;
const IMPACT_WORDS =
  /\b(increased|reduced|improved|grew|decreased|saved|cut|boosted|accelerated|streamlined)\b/i;
const NUMBER_RE = /\d/;
const monthIdx = (d: any): number | null => (d && d !== 'present' ? d.y * 12 + (d.m - 1) : null);

function find(text: string, needle: string) {
  const i = text.toLowerCase().indexOf(needle.toLowerCase());
  return i < 0
    ? null
    : { matchedText: text.slice(i, i + needle.length), start: i, end: i + needle.length };
}

// Each rule: { ruleId, category, scope, requiresJobDescription, evaluate(resume) => finding[] }
// finding shape returned by evaluate: { fieldPath, matchedText, message, suggestion?, severity? }
export const RULES: Rule[] = [
  {
    ruleId: 'jd-tailored',
    category: 'job-match',
    scope: 'document',
    requiresJobDescription: true,
    evaluate: () => [],
  },
  {
    ruleId: 'resp-jd-evidence',
    category: 'responsibilities',
    scope: 'document',
    requiresJobDescription: true,
    evaluate: () => [],
  },
  {
    ruleId: 'industry-jd-fit',
    category: 'industry',
    scope: 'document',
    requiresJobDescription: true,
    evaluate: () => [],
  },
  {
    ruleId: 'rescore-jd-version',
    category: 'rescore',
    scope: 'document',
    requiresJobDescription: true,
    evaluate: () => [],
  },

  {
    ruleId: 'sum-missing',
    category: 'summary',
    scope: 'field',
    severity: 'critical',
    evaluate: (r) =>
      !normalizeText(r.summary)
        ? [
            {
              fieldPath: 'summary',
              matchedText: '',
              message: 'No professional summary — add 2–4 lines introducing your background.',
            },
          ]
        : [],
  },
  {
    ruleId: 'sum-generic',
    category: 'summary',
    scope: 'field',
    severity: 'warning',
    evaluate: (r) => {
      const t = r.summary || '';
      const out: RawFinding[] = [];
      for (const p of GENERIC_PHRASES) {
        const m = find(t, p);
        if (m)
          out.push({
            fieldPath: 'summary',
            matchedText: m.matchedText,
            message: `Generic phrase "${m.matchedText}" adds little — replace with something specific.`,
          });
      }
      return out;
    },
  },
  {
    ruleId: 'sum-length',
    category: 'summary',
    scope: 'field',
    severity: 'suggestion',
    evaluate: (r) => {
      const words = (r.summary || '').trim().split(/\s+/).filter(Boolean).length;
      return words > 70
        ? [
            {
              fieldPath: 'summary',
              matchedText: (r.summary || '').slice(0, 24) + '…',
              message: `Summary is ${words} words — aim for 2–4 concise lines.`,
            },
          ]
        : [];
    },
  },

  {
    ruleId: 'exp-missing-fields',
    category: 'experience',
    scope: 'entry',
    severity: 'critical',
    evaluate: (r) => {
      const out: RawFinding[] = [];
      (r.experience || []).forEach((e: any, i: number) => {
        if (!e.company)
          out.push({
            fieldPath: `experience[${i}].company`,
            matchedText: '',
            message: 'Missing company name.',
          });
        if (!e.title)
          out.push({
            fieldPath: `experience[${i}].title`,
            matchedText: '',
            message: 'Missing job title.',
          });
      });
      return out;
    },
  },
  {
    ruleId: 'exp-chronology',
    category: 'experience',
    scope: 'document',
    severity: 'warning',
    evaluate: (r) => {
      const list = r.experience || [];
      const out: RawFinding[] = [];
      for (let i = 1; i < list.length; i++) {
        const prevStart = monthIdx(list[i - 1].start),
          curStart = monthIdx(list[i].start);
        if (prevStart != null && curStart != null && curStart > prevStart) {
          out.push({
            fieldPath: `experience[${i}].title`,
            matchedText: list[i].title || '',
            message: 'Entry is not in reverse-chronological order relative to the role above it.',
          });
        }
      }
      return out;
    },
  },

  {
    ruleId: 'bul-pronoun',
    category: 'bullets',
    scope: 'bullet',
    severity: 'warning',
    evaluate: (r) =>
      bulletScan(r, (b) => {
        const m = b.match(PRONOUN_RE);
        return m ? { matchedText: m[0], message: 'Avoid first-person pronouns in bullets.' } : null;
      }),
  },
  {
    ruleId: 'bul-responsible',
    category: 'bullets',
    scope: 'bullet',
    severity: 'warning',
    evaluate: (r) =>
      bulletScan(r, (b) => {
        const m = find(b, 'responsible for');
        return m
          ? {
              matchedText: m.matchedText,
              message: 'Vague — replace "responsible for" with a strong action verb.',
            }
          : null;
      }),
  },
  {
    ruleId: 'bul-duplicate',
    category: 'bullets',
    scope: 'bullet',
    severity: 'warning',
    evaluate: (r) => {
      const seen = new Map<string, string>();
      const out: RawFinding[] = [];
      allBullets(r).forEach(({ fieldPath, text }) => {
        const key = text
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, '')
          .trim();
        if (!key) return;
        if (seen.has(key))
          out.push({
            fieldPath,
            matchedText: text,
            message: 'Duplicate accomplishment — nearly identical to another bullet.',
            suggestion: '',
          });
        else seen.set(key, fieldPath);
      });
      return out;
    },
  },
  {
    ruleId: 'bul-length',
    category: 'bullets',
    scope: 'bullet',
    severity: 'suggestion',
    evaluate: (r) =>
      allBullets(r)
        .filter((b) => b.text.length > 200)
        .map((b) => ({
          fieldPath: b.fieldPath,
          matchedText: b.text.slice(0, 30) + '…',
          message: 'Long bullet — split for scannability.',
        })),
  },

  {
    ruleId: 'sk-stuffing',
    category: 'skills',
    scope: 'field',
    severity: 'suggestion',
    evaluate: (r) => {
      const raw = r.skills || '';
      const skills = raw
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const seen = new Set<string>();
      const dups = new Set<string>();
      const deduped: string[] = [];
      skills.forEach((s: string) => {
        const k = s.toLowerCase();
        if (seen.has(k)) {
          dups.add(s);
        } else {
          seen.add(k);
          deduped.push(s);
        }
      });
      const out: RawFinding[] = [];
      if (dups.size) {
        // The whole field is the matchedText (not the bare duplicate word) so the fix is an
        // unambiguous whole-field replacement — a bare word like "SQL" can't be located as a
        // specific *duplicate* occurrence via a plain indexOf search of the field text.
        out.push({
          fieldPath: 'skills',
          matchedText: raw,
          message: `${[...dups].map((s) => `"${s}"`).join(', ')} ${dups.size === 1 ? 'is' : 'are'} listed more than once.`,
          suggestion: deduped.join(', '),
        });
      }
      if (skills.length > 25)
        out.push({
          fieldPath: 'skills',
          matchedText: skills.slice(25).join(', '),
          message: 'Long skills list — consider trimming to the most relevant.',
        });
      return out;
    },
  },

  {
    ruleId: 'rel-gap',
    category: 'relevant-experience',
    scope: 'document',
    severity: 'suggestion',
    evaluate: (r) => {
      const list = [...(r.experience || [])]
        .filter((e: any) => e.start)
        .sort((a: any, b: any) => monthIdx(b.start)! - monthIdx(a.start)!);
      const out: RawFinding[] = [];
      for (let i = 1; i < list.length; i++) {
        const prevStart = monthIdx(list[i - 1].start);
        const curEnd =
          list[i].end === 'present' ? monthIdx(list[i - 1].start) : monthIdx(list[i].end);
        if (curEnd != null && prevStart! - curEnd >= 6)
          out.push({
            fieldPath: `experience[${(r.experience || []).indexOf(list[i - 1])}].title`,
            matchedText: list[i - 1].title || '',
            message: `Gap of ${prevStart! - curEnd}+ months before this role — consider addressing it briefly.`,
          });
      }
      return out;
    },
  },

  {
    ruleId: 'sen-title-mismatch',
    category: 'seniority',
    scope: 'entry',
    severity: 'suggestion',
    evaluate: (r) => {
      const out: RawFinding[] = [];
      (r.experience || []).forEach((e: any, i: number) => {
        if (/manager|lead|director|head/i.test(e.title || '')) {
          const txt = (e.bullets || []).join(' ').toLowerCase();
          if (!/team|led|managed|mentored|direct report|stakeholder|coordinat/.test(txt)) {
            out.push({
              fieldPath: `experience[${i}].title`,
              matchedText: e.title,
              message: 'Title implies leadership, but bullets don’t show team/ownership evidence.',
            });
          }
        }
      });
      return out;
    },
  },

  {
    ruleId: 'edu-missing',
    category: 'education',
    scope: 'entry',
    severity: 'warning',
    evaluate: (r) => {
      const out: RawFinding[] = [];
      (r.education || []).forEach((e: any, i: number) => {
        if (!e.institution)
          out.push({
            fieldPath: `education[${i}].institution`,
            matchedText: '',
            message: 'Missing institution name.',
          });
        if (!e.degree)
          out.push({
            fieldPath: `education[${i}].degree`,
            matchedText: '',
            message: 'Missing degree.',
          });
      });
      return out;
    },
  },

  {
    ruleId: 'cert-expired',
    category: 'certifications',
    scope: 'entry',
    severity: 'critical',
    evaluate: (r) => {
      const year = new Date().getFullYear();
      return (r.certifications || [])
        .map((c: any, i: number) =>
          c.expiryYear && c.expiryYear < year
            ? {
                fieldPath: `certifications[${i}].name`,
                matchedText: c.name,
                message: `Appears expired (${c.expiryYear}) — remove or note renewal status.`,
              }
            : null,
        )
        .filter(Boolean) as RawFinding[];
    },
  },

  {
    ruleId: 'proj-missing',
    category: 'projects',
    scope: 'entry',
    severity: 'suggestion',
    evaluate: (r) => {
      const out: RawFinding[] = [];
      (r.projects || []).forEach((p: any, i: number) => {
        if (!p.tech)
          out.push({
            fieldPath: `projects[${i}].tech`,
            matchedText: '',
            message: 'No technologies/tools listed for this project.',
          });
        if (!p.outcome)
          out.push({
            fieldPath: `projects[${i}].outcome`,
            matchedText: '',
            message: 'No outcome/impact listed for this project.',
          });
      });
      return out;
    },
  },

  {
    ruleId: 'gw-repeat-word',
    category: 'grammar',
    scope: 'field',
    severity: 'warning',
    evaluate: (r) => {
      const out: RawFinding[] = [];
      enumerateFields(r).forEach(({ fieldPath, text }) => {
        const t = normalizeText(text);
        const re = /\b(\w+)\s+\1\b/gi;
        let m;
        while ((m = re.exec(t)))
          out.push({ fieldPath, matchedText: m[0], message: 'Repeated word.', suggestion: m[1] });
      });
      return out;
    },
  },
  {
    ruleId: 'gw-tense',
    category: 'grammar',
    scope: 'entry',
    severity: 'suggestion',
    evaluate: (r) => {
      const out: RawFinding[] = [];
      (r.experience || []).forEach((e: any, i: number) => {
        if (e.end === 'present')
          (e.bullets || []).forEach((b: string, j: number) => {
            const w = b.trim().split(/\s+/)[0] || '';
            if (/ed$/i.test(w))
              out.push({
                fieldPath: `experience[${i}].bullets[${j}]`,
                matchedText: w,
                message:
                  'Current role bullet reads past tense — consider present tense for ongoing work.',
              });
          });
      });
      return out;
    },
  },

  {
    ruleId: 'av-weak',
    category: 'action-verbs',
    scope: 'bullet',
    severity: 'warning',
    evaluate: (r) =>
      allBullets(r)
        .map((b) => {
          const low = b.text.toLowerCase();
          const hit = WEAK_OPENERS.find((w) => low.startsWith(w));
          return hit
            ? {
                fieldPath: b.fieldPath,
                matchedText: b.text.slice(0, hit.length),
                message: 'Weak opener — start with a strong action verb.',
              }
            : null;
        })
        .filter(Boolean) as RawFinding[],
  },
  {
    ruleId: 'av-overused',
    category: 'action-verbs',
    scope: 'document',
    severity: 'suggestion',
    evaluate: (r) => {
      const counts = new Map<string, number>();
      const first = new Map<string, { fieldPath: string; text: string }>();
      allBullets(r).forEach((b) => {
        const w = (b.text.trim().split(/\s+/)[0] || '').toLowerCase().replace(/ed$/, '');
        if (!w) return;
        counts.set(w, (counts.get(w) || 0) + 1);
        if (!first.has(w)) first.set(w, b);
      });
      const out: RawFinding[] = [];
      counts.forEach((n, w) => {
        if (n >= 3) {
          const b = first.get(w)!;
          out.push({
            fieldPath: b.fieldPath,
            matchedText: b.text.split(/\s+/)[0],
            message: `"${w}" used to open ${n} bullets — vary your verbs.`,
          });
        }
      });
      return out;
    },
  },

  {
    ruleId: 'quant-missing',
    category: 'quantification',
    scope: 'bullet',
    severity: 'suggestion',
    evaluate: (r) =>
      allBullets(r)
        .filter((b) => IMPACT_WORDS.test(b.text) && !NUMBER_RE.test(b.text))
        .map((b) => ({
          fieldPath: b.fieldPath,
          matchedText: (b.text.match(IMPACT_WORDS) || [''])[0],
          message: 'Claims impact without a number — add one if you have it (don’t invent it).',
        })),
  },

  {
    ruleId: 'ats-headings',
    category: 'ats-structure',
    scope: 'document',
    severity: 'suggestion',
    evaluate: (r) => {
      const out: RawFinding[] = [];
      if (!normalizeText(r.summary))
        out.push({ fieldPath: 'summary', matchedText: '', message: 'Summary section is empty.' });
      if (!(r.experience || []).length)
        out.push({
          fieldPath: 'summary',
          matchedText: '',
          message: 'No Experience section content.',
        });
      if (!(r.skills || '').trim())
        out.push({ fieldPath: 'skills', matchedText: '', message: 'No Skills section content.' });
      return out;
    },
  },

  {
    ruleId: 'fmt-dates',
    category: 'formatting',
    scope: 'document',
    severity: 'suggestion',
    evaluate: (r) => {
      const locs = (r.experience || [])
        .map((e: any, i: number) => ({ i, l: e.location || '' }))
        .filter((x: any) => x.l);
      const withSpace = locs.filter((x: any) => /,\s/.test(x.l)).length,
        withoutSpace = locs.filter((x: any) => /,(?!\s)/.test(x.l)).length;
      if (withSpace && withoutSpace) {
        const bad = locs.find((x: any) => /,(?!\s)/.test(x.l));
        return [
          {
            fieldPath: `experience[${bad.i}].location`,
            matchedText: bad.l,
            message: 'Location formatting is inconsistent with other entries ("City, ST").',
            suggestion: bad.l.replace(/,(?!\s)/, ', '),
          },
        ];
      }
      return [];
    },
  },

  {
    ruleId: 'cons-titlecase',
    category: 'consistency',
    scope: 'entry',
    severity: 'suggestion',
    evaluate: (r) => {
      const titles = (r.experience || [])
        .map((e: any, i: number) => ({ i, t: e.title || '' }))
        .filter((x: any) => x.t);
      const titleCased = titles.filter((x: any) => /^[A-Z]/.test(x.t)).length;
      const lower = titles.find((x: any) => /^[a-z]/.test(x.t));
      return lower && titleCased > 0
        ? [
            {
              fieldPath: `experience[${lower.i}].title`,
              matchedText: lower.t,
              message: 'Job title capitalization is inconsistent with other entries.',
              suggestion: lower.t.charAt(0).toUpperCase() + lower.t.slice(1),
            },
          ]
        : [];
    },
  },

  {
    ruleId: 'con-missing',
    category: 'contact',
    scope: 'field',
    severity: 'critical',
    evaluate: (r) =>
      (['email', 'phone', 'location'] as const)
        .filter((k) => !r.header[k])
        .map((k) => ({ fieldPath: `header.${k}`, matchedText: '', message: `Missing ${k}.` })),
  },
  {
    ruleId: 'con-email',
    category: 'contact',
    scope: 'field',
    severity: 'warning',
    evaluate: (r) => {
      const e = r.header.email || '';
      if (!e) return [];
      const bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || /\d{4,}/.test(e);
      return bad
        ? [
            {
              fieldPath: 'header.email',
              matchedText: e,
              message: 'Email looks unprofessional or malformed — use a clean name-based address.',
            },
          ]
        : [];
    },
  },

  {
    ruleId: 'rem-references',
    category: 'content-remove',
    scope: 'document',
    severity: 'warning',
    evaluate: (r) => {
      const out: RawFinding[] = [];
      enumerateFields(r).forEach(({ fieldPath, text }) => {
        const m = find(text || '', 'References available upon request');
        if (m)
          out.push({
            fieldPath,
            matchedText: m.matchedText,
            message: 'Remove — this line is assumed and wastes space.',
            suggestion: '',
          });
      });
      return out;
    },
  },
  {
    ruleId: 'rem-salary',
    category: 'content-remove',
    scope: 'document',
    severity: 'warning',
    evaluate: (r) => {
      const out: RawFinding[] = [];
      enumerateFields(r).forEach(({ fieldPath, text }) => {
        const m = (text || '').match(/\$[\d,]+|salary expectation/i);
        if (m)
          out.push({
            fieldPath,
            matchedText: m[0],
            message: 'Remove salary expectations unless the employer asked for them.',
            suggestion: '',
          });
      });
      return out;
    },
  },

  {
    ruleId: 'len-total',
    category: 'length',
    scope: 'document',
    severity: 'suggestion',
    evaluate: (r) => {
      const words = [r.summary, ...allBullets(r).map((b) => b.text)]
        .join(' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      if (words < 40)
        return [
          {
            fieldPath: 'summary',
            matchedText: '',
            message: 'Resume content is sparse — add more detail to your experience.',
          },
        ];
      if (words > 900)
        return [
          {
            fieldPath: 'summary',
            matchedText: '',
            message: 'Resume is lengthy — trim less-relevant detail.',
          },
        ];
      return [];
    },
  },

  {
    ruleId: 'final-links',
    category: 'final-review',
    scope: 'field',
    severity: 'warning',
    evaluate: (r) => {
      const out: RawFinding[] = [];
      (['linkedin', 'github'] as const).forEach((k) => {
        const v = r.header[k];
        if (v && (/\s/.test(v) || !/\./.test(v)))
          out.push({
            fieldPath: `header.${k}`,
            matchedText: v,
            message: 'This doesn’t look like a valid link.',
          });
      });
      return out;
    },
  },
];

function allBullets(r: any): Array<{ fieldPath: string; text: string }> {
  const out: Array<{ fieldPath: string; text: string }> = [];
  (r.experience || []).forEach((e: any, i: number) =>
    (e.bullets || []).forEach((b: string, j: number) =>
      out.push({ fieldPath: `experience[${i}].bullets[${j}]`, text: b }),
    ),
  );
  (r.projects || []).forEach((p: any, i: number) =>
    (p.bullets || []).forEach((b: string, j: number) =>
      out.push({ fieldPath: `projects[${i}].bullets[${j}]`, text: b }),
    ),
  );
  return out;
}
function bulletScan(
  r: any,
  fn: (text: string) => { matchedText: string; message: string; suggestion?: string } | null,
): RawFinding[] {
  const out: RawFinding[] = [];
  allBullets(r).forEach((b) => {
    const hit = fn(b.text);
    if (hit) out.push({ fieldPath: b.fieldPath, ...hit });
  });
  return out;
}

export function runDeterministicRules(resume: any): Finding[] {
  const findings: Finding[] = [];
  for (const rule of RULES) {
    if (rule.requiresJobDescription) continue;
    let results: RawFinding[] = [];
    try {
      results = rule.evaluate(resume) || [];
    } catch (err: any) {
      findings.push({
        ruleId: rule.ruleId,
        category: rule.category,
        severity: 'suggestion',
        errored: true,
        message: 'Rule failed to run: ' + err.message,
        fieldPath: null,
        matchedText: '',
      });
      continue;
    }
    for (const res of results) {
      findings.push({
        ruleId: rule.ruleId,
        category: rule.category,
        severity: res.severity || rule.severity || 'suggestion',
        scope: rule.scope,
        fieldPath: res.fieldPath,
        matchedText: res.matchedText || '',
        message: res.message,
        suggestion: res.suggestion != null ? res.suggestion : null,
      });
    }
  }
  return findings.map((f) => attachRange(f, resume));
}

function attachRange(f: Finding, resume: any): Finding {
  if (!f.fieldPath || !f.matchedText) return f;
  const fieldText = normalizeText(getByPath(resume, f.fieldPath));
  const i = fieldText.indexOf(f.matchedText);
  return i >= 0 ? { ...f, textRange: { start: i, end: i + f.matchedText.length } } : f;
}

export function capFindings(findings: Finding[], cap = 3): Finding[] {
  const groups = new Map<string, Finding[]>();
  findings.forEach((f) => {
    const k = f.ruleId;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(f);
  });
  const out: Finding[] = [];
  groups.forEach((list) => {
    if (list.length <= cap) {
      out.push(...list);
      return;
    }
    out.push(...list.slice(0, cap - 1));
    const rest = list.slice(cap - 1);
    out.push({
      ...rest[0],
      grouped: true,
      groupCount: rest.length,
      message: `+${rest.length} more findings like this`,
    });
  });
  return out;
}

export function dismissKey(f: Pick<Finding, 'ruleId' | 'fieldPath' | 'matchedText'>): string {
  return [f.ruleId, f.fieldPath || '', f.matchedText || ''].join('::');
}

export function mergeOverlaps(findingsForField: Finding[]) {
  const withRange = findingsForField
    .filter((f) => f.textRange)
    .sort((a, b) => a.textRange!.start - b.textRange!.start);
  const rank: Record<string, number> = { critical: 3, warning: 2, suggestion: 1 };
  const merged: Array<{ start: number; end: number; severity: Severity; findings: Finding[] }> = [];
  for (const f of withRange) {
    const last = merged[merged.length - 1];
    if (last && f.textRange!.start <= last.end) {
      last.end = Math.max(last.end, f.textRange!.end);
      last.findings.push(f);
      if (rank[f.severity] > rank[last.severity]) last.severity = f.severity;
    } else {
      merged.push({
        start: f.textRange!.start,
        end: f.textRange!.end,
        severity: f.severity,
        findings: [f],
      });
    }
  }
  return merged;
}

export function reanchorFinding(f: Finding, resume: any): Finding {
  if (!f.fieldPath) return { ...f, resolved: true };
  const fieldText = normalizeText(getByPath(resume, f.fieldPath));
  if (!f.matchedText) return { ...f, resolved: fieldText !== undefined, scopeUsed: 'field' };
  if (f.textRange && fieldText.slice(f.textRange.start, f.textRange.end) === f.matchedText) {
    return { ...f, resolved: true, scopeUsed: 'exact' };
  }
  const i = fieldText.indexOf(f.matchedText);
  if (i >= 0)
    return {
      ...f,
      resolved: true,
      scopeUsed: 'field',
      textRange: { start: i, end: i + f.matchedText.length },
    };
  const sectionMatch = f.fieldPath.match(/^([a-zA-Z]+)(\[\d+\])?/);
  if (sectionMatch) {
    const prefix = sectionMatch[1] + (sectionMatch[2] || '');
    const sectionText = enumerateFields(resume)
      .filter((x) => x.fieldPath.startsWith(prefix))
      .map((x) => normalizeText(x.text))
      .join(' ');
    if (sectionText.indexOf(f.matchedText) >= 0)
      return { ...f, resolved: true, scopeUsed: 'section', textRange: null };
  }
  return { ...f, resolved: false, unresolved: true };
}

export const BUCKETS = [
  { id: 'grammar', label: 'Grammar', max: 15 },
  { id: 'spelling', label: 'Spelling', max: 10 },
  { id: 'readability', label: 'Readability', max: 10 },
  { id: 'action-verbs', label: 'Action Verbs', max: 10 },
  { id: 'bullet-strength', label: 'Bullet Strength', max: 15 },
  { id: 'quantification', label: 'Quantification', max: 10 },
  { id: 'formatting', label: 'Formatting', max: 10 },
  { id: 'consistency', label: 'Consistency', max: 10 },
  { id: 'ats-parse', label: 'ATS Parse Quality', max: 10 },
];
const BUCKET_MAP: Record<string, string> = {
  'gw-repeat-word': 'grammar',
  'gw-tense': 'grammar',
  'gw-grammar': 'grammar',
  'gw-spelling': 'spelling',
  'len-total': 'readability',
  'bul-length': 'readability',
  'av-weak': 'action-verbs',
  'av-overused': 'action-verbs',
  'bul-pronoun': 'bullet-strength',
  'bul-responsible': 'bullet-strength',
  'bul-duplicate': 'bullet-strength',
  'bul-impact': 'bullet-strength',
  'quant-missing': 'quantification',
  'fmt-dates': 'formatting',
  'cons-titlecase': 'consistency',
  'ats-headings': 'ats-parse',
};
const SEV_WEIGHT: Record<string, number> = { critical: 8, warning: 4, suggestion: 1.5 };

// Every BUCKETS/BUCKET_MAP deduction above only fires when a rule finds a *problem in existing
// text* (a grammar slip, a weak verb, a missing number). None of that machinery ever fires on a
// resume with little or no content — there's no grammar to get wrong in an empty summary, no weak
// verbs in a bullet list with zero bullets — so an almost-entirely-blank resume sails through with
// every bucket near its max and scores 90+, even though rules like sum-missing/exp-missing-fields/
// edu-missing/con-missing are correctly flagging that same emptiness as findings the whole time.
// Those "is anything here at all" rules are deliberately never added to BUCKET_MAP for this: fixing
// it by mapping them into the existing quality buckets would just add a small, easily-maxed-out
// deduction, not solve the actual problem, which is that the other 9 buckets default to full marks
// on empty content. Instead, completeness is measured directly from the resume's structure (not
// from findings) and scales every bucket's earned score uniformly, so "no content to critique" no
// longer reads as "flawless content."
const COMPLETENESS_CHECKS: Array<{ id: string; label: string; test: (r: any) => boolean }> = [
  {
    id: 'header',
    label: 'Name & title',
    test: (r) => !!normalizeText(r?.header?.name) && !!normalizeText(r?.header?.title),
  },
  {
    id: 'contact',
    label: 'Contact info',
    test: (r) =>
      [r?.header?.email, r?.header?.phone, r?.header?.location].filter((x) => normalizeText(x))
        .length >= 2,
  },
  {
    id: 'summary',
    label: 'Summary',
    test: (r) => normalizeText(r?.summary).split(/\s+/).filter(Boolean).length >= 10,
  },
  {
    id: 'experience',
    label: 'Experience',
    test: (r) =>
      (r?.experience || []).some((e: any) => normalizeText(e?.title) && normalizeText(e?.company)),
  },
  {
    id: 'education',
    label: 'Education',
    test: (r) =>
      (r?.education || []).some((e: any) => normalizeText(e?.institution) && normalizeText(e?.degree)),
  },
  { id: 'skills', label: 'Skills', test: (r) => !!normalizeText(r?.skills) },
];

export interface CompletenessResult {
  ratio: number;
  passed: number;
  total: number;
  missing: string[];
}

export function computeCompletenessRatio(resume: any): CompletenessResult {
  const total = COMPLETENESS_CHECKS.length;
  const missing = COMPLETENESS_CHECKS.filter((c) => !c.test(resume)).map((c) => c.label);
  const passed = total - missing.length;
  return { ratio: total === 0 ? 1 : passed / total, passed, total, missing };
}

export function computeScore(findings: Finding[], resume: any) {
  const deduction: Record<string, number> = {};
  BUCKETS.forEach((b) => (deduction[b.id] = 0));
  findings.forEach((f) => {
    const b = BUCKET_MAP[f.ruleId];
    if (!b || f.grouped) return;
    deduction[b] += SEV_WEIGHT[f.severity] || 1;
  });
  const completeness = computeCompletenessRatio(resume);
  const buckets = BUCKETS.map((b) => {
    const earned = Math.max(0, Math.round(b.max - Math.min(deduction[b.id], b.max)));
    return { ...b, score: Math.round(earned * completeness.ratio) };
  });
  const total = buckets.reduce((s, b) => s + b.score, 0);
  return { total, buckets, completeness };
}
