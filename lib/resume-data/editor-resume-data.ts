// Data model, constants, and pure builders for InlineResumeEditor's flexible-sections resume.
// No React/DOM here — safe to import from the Redux slice, the mock API, and the component.

import { DEFAULT_PAGE_SIZE_ID, type PageSizeId } from '@/lib/resume-pagination/page-constants';

export function firstFont(stack: string) {
  return (stack || 'Helvetica').split(',')[0].replace(/["']/g, '').trim();
}
export function hexToRgb(hex: string): [number, number, number] {
  const h = (hex || '#3E5C76').replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export type EditorDate = { y: number; m: number } | 'present' | null;

export interface EditorContact {
  kind: string;
  text: string;
  url: string | null;
}
export interface EditorHeader {
  name: string;
  title: string;
  contacts: EditorContact[];
}
export interface EditorEntryLink {
  url: string;
  text: string;
}
export interface EditorEntry {
  id: string;
  title: string;
  subtitle: string;
  start: EditorDate;
  end: EditorDate;
  desc: string;
  contribs: string[];
  link: EditorEntryLink | null;
  /** Certifications (5a-5e) and awards (6a-6e) only — free text, e.g. "2024". Unused elsewhere. */
  year: string;
  /** References (8a, 8c, 8d, 8e) only. Unused elsewhere. */
  email: string;
  /** References (8a, 8c, 8e) only. Unused elsewhere. */
  phone: string;
}

/** Skills style 7c ("Grouped rows") only — one labeled group of comma-separated items. */
export interface SkillGroup {
  label: string;
  items: string;
}
/** Skills styles 7d/7e ("Proficiency bars" / "Dot ratings") only — shared 0-100 level, rendered
 *  as a bar width by 7d and converted to a 0-5 dot count by 7e. */
export interface SkillLevel {
  name: string;
  level: string;
}

export interface EditorTextSection {
  id: string;
  type: string;
  kind: 'text';
  style: string;
  title: string;
  body: string;
  /** Summary style 1e ("Bold hook + detail") only. Unused elsewhere. */
  hook: string;
  /** Skills style 7c only. Unused elsewhere. */
  skillGroups: SkillGroup[];
  /** Skills styles 7d/7e only. Unused elsewhere. */
  skillLevels: SkillLevel[];
}
export interface EditorEntriesSection {
  id: string;
  type: string;
  kind: 'entries';
  style: string;
  title: string;
  entries: EditorEntry[];
}
export type EditorSection = EditorTextSection | EditorEntriesSection;
export interface EditorResumeDocument {
  dateFormat: string;
  templateId: string;
  /** Defaults to 'a4' — resumes saved before this field existed load as A4 with no migration. */
  pageSize: PageSizeId;
  header: EditorHeader;
  sections: EditorSection[];
}

/** Single source of truth for "does this section have anything a user would mind losing" — used
 *  both by the delete-section confirmation popover and by isEditorResumeEmpty below. */
export function sectionHasContent(s: EditorSection): boolean {
  if (s.kind === 'text') return !!(s.body && s.body.trim());
  return s.entries.some(
    (en) =>
      [en.title, en.subtitle, en.desc].some((x) => x && x.trim()) ||
      en.start ||
      en.end ||
      en.link ||
      (en.contribs || []).some((x) => x && x.trim()),
  );
}

/** True when the header carries no real text and every section is empty/whitespace-only. Gates
 *  the Review drawer's Generate button — any partial content anywhere is enough to enable it. */
export function isEditorResumeEmpty(doc: EditorResumeDocument): boolean {
  const headerEmpty =
    !doc.header.name.trim() &&
    !doc.header.title.trim() &&
    doc.header.contacts.every((c) => !c.text || !c.text.trim());
  return headerEmpty && doc.sections.every((s) => !sectionHasContent(s));
}

export const MS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
export const ML = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const PHE: Record<string, [string, string, string]> = {
  experience: ['Job title', 'Company', 'Describe your role and achievements…'],
  education: ['Degree', 'School or university', 'Notes, honors, coursework…'],
  projects: ['Project name', 'Role or technologies', 'Describe the project…'],
  certifications: ['Certification name', 'Issuing organization', ''],
  awards: ['Award title', 'Awarding organization', 'Optional detail…'],
  references: ['Full name', 'Role, Company', 'What they said about you…'],
};
export const PHB: Record<string, string> = {
  summary: 'Write a 2–3 sentence professional summary…',
  skills: 'List your key skills, separated by commas…',
  languages: 'Languages you speak and proficiency levels…',
  custom: 'Add content…',
};
export const CAT = [
  { key: 'summary', label: 'Summary', kind: 'text' },
  { key: 'experience', label: 'Experience', kind: 'entries' },
  { key: 'education', label: 'Education', kind: 'entries' },
  { key: 'projects', label: 'Projects', kind: 'entries' },
  { key: 'skills', label: 'Skills', kind: 'text' },
  { key: 'certifications', label: 'Certifications', kind: 'entries' },
  { key: 'awards', label: 'Awards & Achievements', kind: 'entries' },
  { key: 'languages', label: 'Languages', kind: 'text' },
  { key: 'references', label: 'References', kind: 'entries' },
  { key: 'custom', label: 'Custom section…', kind: 'text' },
];
export const SNAMES: Record<string, string> = {
  classic: 'Classic ruled',
  side: 'Side label',
  tinted: 'Tinted panel',
  editorial: 'Editorial',
  center: 'Centered note',
  pills: 'Pill tags',
  timeline: 'Timeline rail',
  datesLeft: 'Dates left',
  compact: 'Compact rows',
  companyFirst: 'Company first',
};
// Old-system style catalog: only projects/languages/custom still use this (summary/skills/
// certifications/awards/references were migrated to the real components/sections/** catalog —
// see components/sections/catalog.ts and components/editor/sections/*).
export const TSTYLES: Record<string, string[]> = {
  projects: ['classic', 'timeline', 'datesLeft', 'compact', 'companyFirst'],
  languages: ['classic', 'pills', 'side', 'tinted', 'center'],
  custom: ['classic', 'side', 'tinted', 'editorial', 'center'],
};
export const TEMPLATES = [
  {
    id: 'openSans',
    name: 'Open Sans Modern',
    font: "'Open Sans',system-ui,sans-serif",
    accent: null as string | null,
    header: 'left',
  },
  {
    id: 'arial',
    name: 'Arial ATS Classic',
    font: 'Arial,Helvetica,sans-serif',
    accent: '#2C4A6E',
    header: 'left',
  },
  {
    id: 'georgia',
    name: 'Georgia Traditional',
    font: "Georgia,'Times New Roman',serif",
    accent: '#6E3B3B',
    header: 'center',
  },
  {
    id: 'verdana',
    name: 'Verdana Minimal',
    font: 'Verdana,Tahoma,sans-serif',
    accent: '#44484E',
    header: 'split',
  },
  {
    id: 'times',
    name: 'Times Executive',
    font: "'Times New Roman',Times,serif",
    accent: '#1F3A5F',
    header: 'center',
  },
  {
    id: 'tahoma',
    name: 'Tahoma Bold',
    font: 'Tahoma,Geneva,sans-serif',
    accent: '#3F5940',
    header: 'banner',
  },
];

export function createBlankEntry(id: string): EditorEntry {
  return {
    id,
    title: '',
    subtitle: '',
    start: null,
    end: null,
    desc: '',
    contribs: [],
    link: null,
    year: '',
    email: '',
    phone: '',
  };
}

/** Builds a new section object (used when adding a section from the picker popover). */
export function createSection(
  params: { type: string; kind: 'text' | 'entries'; style: string; title: string },
  mintId: () => string,
): EditorSection {
  if (params.kind === 'entries') {
    return {
      id: mintId(),
      type: params.type,
      kind: 'entries',
      style: params.style,
      title: params.title,
      entries: [createBlankEntry(mintId())],
    };
  }
  return {
    id: mintId(),
    type: params.type,
    kind: 'text',
    style: params.style,
    title: params.title,
    body: '',
    hook: '',
    skillGroups: [],
    skillLevels: [],
  };
}

export function buildBlankEditorResume(mintId: () => string): EditorResumeDocument {
  return {
    dateFormat: 'MMM',
    templateId: 'openSans',
    pageSize: DEFAULT_PAGE_SIZE_ID,
    header: {
      name: '',
      title: '',
      contacts: [
        { kind: 'email', text: '', url: null },
        { kind: 'phone', text: '', url: null },
        { kind: 'location', text: '', url: null },
      ],
    },
    sections: [
      {
        id: mintId(),
        type: 'summary',
        kind: 'text',
        style: '1a',
        title: 'Summary',
        body: '',
        hook: '',
        skillGroups: [],
        skillLevels: [],
      },
      {
        id: mintId(),
        type: 'experience',
        kind: 'entries',
        style: '4a',
        title: 'Experience',
        entries: [createBlankEntry(mintId())],
      },
      {
        id: mintId(),
        type: 'education',
        kind: 'entries',
        style: '3a',
        title: 'Education',
        entries: [createBlankEntry(mintId())],
      },
      {
        id: mintId(),
        type: 'skills',
        kind: 'text',
        style: '7a',
        title: 'Skills',
        body: '',
        hook: '',
        skillGroups: [],
        skillLevels: [],
      },
    ],
  };
}

export function buildSampleEditorResume(mintId: () => string): EditorResumeDocument {
  const d = buildBlankEditorResume(mintId);
  d.header.name = 'Maya Chen';
  d.header.title = 'Senior Software Engineer';
  d.header.contacts[0].text = 'hello@mayachen.dev';
  d.header.contacts[1].text = '+1 (415) 555-0192';
  d.header.contacts[2].text = 'San Francisco, CA';
  (d.sections[0] as EditorTextSection).body =
    'Software engineer with 8 years of experience building web applications and developer tools. Led frontend architecture for products serving 2M+ users, with a focus on design systems, performance, and mentoring.';
  const e1 = createBlankEntry(mintId());
  const e2 = createBlankEntry(mintId());
  const ed = createBlankEntry(mintId());
  e1.title = 'Senior Software Engineer';
  e1.subtitle = 'Fieldstone Labs';
  e1.start = { y: 2022, m: 3 };
  e1.end = 'present';
  e1.desc = 'Lead engineer on the design systems team; mentor three engineers.';
  e1.contribs = [
    'Built a component library adopted across four products',
    'Cut UI defect reports by 38% with visual regression testing',
    'Drove the migration of 240k lines to TypeScript',
  ];
  e2.title = 'Software Engineer';
  e2.subtitle = 'Copperline Software';
  e2.start = { y: 2018, m: 7 };
  e2.end = { y: 2022, m: 2 };
  e2.desc =
    'Built customer-facing analytics dashboards in React and Node.js. Reduced initial page load from 4.1s to 1.3s and introduced end-to-end testing that halved regression bugs.';
  ed.title = 'B.S. Computer Science';
  ed.subtitle = 'University of Washington';
  ed.start = { y: 2014, m: 9 };
  ed.end = { y: 2018, m: 6 };
  ed.contribs = ['Dean’s List, six quarters — graduated with honors'];
  (d.sections[1] as EditorEntriesSection).entries = [e1, e2];
  (d.sections[2] as EditorEntriesSection).entries = [ed];
  (d.sections[3] as EditorTextSection).body =
    'TypeScript, React, Node.js, GraphQL, design systems, accessibility, performance profiling, CI/CD';
  return d;
}

export function getTemplate(templateId: string) {
  return TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
}
