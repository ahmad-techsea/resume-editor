// Converts the Groq/Qwen extraction result (see app/api/parse-resume/route.ts) into a real
// EditorResumeDocument the editor can render. Pure, no React/DOM/network — the API route validates
// the model's raw JSON defensively before it ever reaches here, so this file only has to handle
// "well-formed but possibly sparse" input, never malformed input.
//
// Every field is optional on the way in: the extraction prompt is instructed to omit anything it
// can't find rather than guess, so this converter must never invent a value for a missing field —
// it only ever copies through what's present, or defaults to an empty string/array.

import type { EditorDate, EditorResumeDocument } from './editor-resume-data';
import { DEFAULT_PAGE_SIZE_ID } from '../resume-pagination/page-constants.ts';

export interface ParsedDate {
  year: number | null;
  month: number | null; // 1-12
  present?: boolean;
}
export interface ParsedExperience {
  title?: string | null;
  company?: string | null;
  start?: ParsedDate | null;
  end?: ParsedDate | null;
  bullets?: string[] | null;
}
export interface ParsedEducation {
  institution?: string | null;
  degree?: string | null;
  end?: ParsedDate | null;
}
export interface ParsedProject {
  name?: string | null;
  tech?: string | null;
  description?: string | null;
  bullets?: string[] | null;
}
export interface ParsedCertification {
  name?: string | null;
  issuer?: string | null;
  year?: number | null;
}
export interface ParsedAward {
  title?: string | null;
  issuer?: string | null;
  year?: number | null;
  detail?: string | null;
}
export interface ParsedResumeData {
  header?: {
    name?: string | null;
    title?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
  } | null;
  summary?: string | null;
  experience?: ParsedExperience[] | null;
  education?: ParsedEducation[] | null;
  projects?: ParsedProject[] | null;
  skills?: string[] | null;
  certifications?: ParsedCertification[] | null;
  awards?: ParsedAward[] | null;
  languages?: string[] | null;
}

/** A year with no stated month is represented as January of that year — the only way to carry a
 *  real, stated year through EditorDate's {y,m} shape. The month is immediately visible and
 *  editable in the date picker, so this never hides or fabricates information the user can't see
 *  and correct; dropping the year entirely would discard real data the resume actually stated. */
function toEditorDate(d: ParsedDate | null | undefined): EditorDate {
  if (!d) return null;
  if (d.present) return 'present';
  if (!d.year) return null;
  return { y: d.year, m: d.month && d.month >= 1 && d.month <= 12 ? d.month : 1 };
}

function str(v: string | null | undefined): string {
  return typeof v === 'string' ? v.trim() : '';
}

function list(v: string[] | null | undefined): string[] {
  return Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : [];
}

export function convertParsedResumeToEditorDocument(
  parsed: ParsedResumeData,
  mintId: () => string,
): EditorResumeDocument {
  const doc: EditorResumeDocument = {
    dateFormat: 'MMM',
    templateId: 'openSans',
    pageSize: DEFAULT_PAGE_SIZE_ID,
    header: {
      name: str(parsed.header?.name),
      title: str(parsed.header?.title),
      contacts: [
        { kind: 'email', text: str(parsed.header?.email), url: null },
        { kind: 'phone', text: str(parsed.header?.phone), url: null },
        { kind: 'location', text: str(parsed.header?.location), url: null },
      ],
    },
    sections: [],
  };

  const summary = str(parsed.summary);
  if (summary) {
    doc.sections.push({
      id: mintId(),
      type: 'summary',
      kind: 'text',
      style: '1a',
      title: 'Summary',
      body: summary,
      hook: '',
      skillGroups: [],
      skillLevels: [],
    });
  }

  const experience = parsed.experience || [];
  if (experience.length) {
    doc.sections.push({
      id: mintId(),
      type: 'experience',
      kind: 'entries',
      // '4a' (the catalog default) renders only `desc`, never `contribs` — see ExperienceEditor.tsx.
      // Extraction always puts bullets in `contribs` (never `desc`), so '4a' would silently render
      // every parsed entry with no bullets visible at all. '4b' is the same layout but renders
      // `contribs` instead.
      style: '4b',
      title: 'Experience',
      entries: experience.map((e) => ({
        id: mintId(),
        title: str(e.title),
        subtitle: str(e.company),
        start: toEditorDate(e.start),
        end: toEditorDate(e.end),
        desc: '',
        contribs: list(e.bullets),
        link: null,
        year: '',
        email: '',
        phone: '',
      })),
    });
  }

  const education = parsed.education || [];
  if (education.length) {
    doc.sections.push({
      id: mintId(),
      type: 'education',
      kind: 'entries',
      style: '3a',
      title: 'Education',
      entries: education.map((e) => ({
        id: mintId(),
        title: str(e.degree),
        subtitle: str(e.institution),
        start: null,
        end: toEditorDate(e.end),
        desc: '',
        contribs: [],
        link: null,
        year: '',
        email: '',
        phone: '',
      })),
    });
  }

  const skills = list(parsed.skills);
  if (skills.length) {
    doc.sections.push({
      id: mintId(),
      type: 'skills',
      kind: 'text',
      style: '7a',
      title: 'Skills',
      body: skills.join(', '),
      hook: '',
      skillGroups: [],
      skillLevels: [],
    });
  }

  const certifications = parsed.certifications || [];
  if (certifications.length) {
    doc.sections.push({
      id: mintId(),
      type: 'certifications',
      kind: 'entries',
      style: '5a',
      title: 'Certifications',
      entries: certifications.map((c) => ({
        id: mintId(),
        title: str(c.name),
        subtitle: str(c.issuer),
        start: null,
        end: null,
        desc: '',
        contribs: [],
        link: null,
        year: c.year ? String(c.year) : '',
        email: '',
        phone: '',
      })),
    });
  }

  const projects = parsed.projects || [];
  if (projects.length) {
    doc.sections.push({
      id: mintId(),
      type: 'projects',
      kind: 'entries',
      style: 'classic',
      title: 'Projects',
      entries: projects.map((p) => ({
        id: mintId(),
        title: str(p.name),
        subtitle: str(p.tech),
        start: null,
        end: null,
        desc: str(p.description),
        contribs: list(p.bullets),
        link: null,
        year: '',
        email: '',
        phone: '',
      })),
    });
  }

  const awards = parsed.awards || [];
  if (awards.length) {
    doc.sections.push({
      id: mintId(),
      type: 'awards',
      kind: 'entries',
      style: '6a',
      title: 'Awards & Achievements',
      entries: awards.map((a) => ({
        id: mintId(),
        title: str(a.title),
        subtitle: str(a.issuer),
        start: null,
        end: null,
        desc: str(a.detail),
        contribs: [],
        link: null,
        year: a.year ? String(a.year) : '',
        email: '',
        phone: '',
      })),
    });
  }

  const languages = list(parsed.languages);
  if (languages.length) {
    doc.sections.push({
      id: mintId(),
      type: 'languages',
      kind: 'text',
      style: 'classic',
      title: 'Languages',
      body: languages.join(', '),
      hook: '',
      skillGroups: [],
      skillLevels: [],
    });
  }

  return doc;
}
