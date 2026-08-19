import {
  MS,
  ML,
  type EditorDate,
  type EditorResumeDocument,
  type EditorEntriesSection,
  type EditorTextSection,
} from '@/lib/resume-data/editor-resume-data';

function fmt(dt: EditorDate, dateFormat: string): string {
  if (!dt) return '';
  if (dt === 'present') return 'Present';
  return (dateFormat === 'MMMM' ? ML : MS)[dt.m - 1] + ' ' + dt.y;
}

export interface ExportContact {
  text: string;
  url: string | null;
}
export interface ExportEntry {
  /** Pagination block key of the whole entry (`sections.{i}.entries.{j}`) — the DOCX export maps
   *  the live page assignments back to entries through it. */
  key: string;
  title: string;
  subtitle: string;
  dates: string;
  desc: string;
  contribs: string[];
  link: { url: string; text: string } | null;
}
export interface ExportSection {
  title: string;
  kind: string;
  /** Section style id ('classic', 'center', '1e', '7c'…) — DOCX uses it to mirror the on-screen
   *  presentation (centered body, hook-first summary, grouped skills, …). */
  style: string;
  /** Pagination block keys, mirroring buildBlocks()'s key space exactly (see SectionBlock.tsx and
   *  the catalog editors): heading/whole-section blocks use `.title`, the summary hook `.hook`,
   *  splittable body paragraphs `.body`. */
  headingKey: string;
  hookKey: string;
  bodyKey: string;
  hook: string | null;
  body: string | null;
  skillGroups: { label: string; items: string }[] | null;
  skillLevels: { name: string; pct: number; dots: number }[] | null;
  entries: ExportEntry[] | null;
}
export interface ExportModel {
  name: string;
  title: string;
  contacts: ExportContact[];
  sections: ExportSection[];
}

/** Which optional entry fields the on-screen section style actually renders. Data can outlive a
 *  style switch (e.g. bullets typed under experience '4b' persist after switching to '4a', which
 *  only shows the description) — the export must drop what the UI hides, or Word gains content the
 *  editor/PDF never showed and page parity breaks. Mirrors the catalog editors' style branches
 *  (components/editor/sections/*); legacy EntryFields (projects/languages/custom) renders both. */
function entryFieldVisibility(type: string, style: string): { desc: boolean; contribs: boolean } {
  switch (type) {
    case 'experience':
      return { desc: style !== '4b', contribs: style === '4b' };
    case 'education':
      return { desc: false, contribs: style === '3a' };
    case 'certifications':
      return { desc: false, contribs: false };
    case 'awards':
      return { desc: style === '6b', contribs: false };
    case 'references':
      return { desc: style === '8d', contribs: false };
    default:
      return { desc: true, contribs: true };
  }
}

export function buildExportModel(data: EditorResumeDocument): ExportModel {
  const contacts = data.header.contacts
    .filter((c) => c.text && c.text.trim())
    .map((c) => ({ text: c.text, url: c.url || null }));
  const sections = data.sections.map((s, si) => {
    const text = s.kind === 'text' ? (s as EditorTextSection) : null;
    const skillGroups = (text?.skillGroups || [])
      .filter((g) => (g.items && g.items.trim()) || (g.label && g.label.trim()))
      .map((g) => ({ label: (g.label || '').trim(), items: (g.items || '').trim() }));
    const skillLevels = (text?.skillLevels || [])
      .filter((sk) => sk.name && sk.name.trim())
      .map((sk) => {
        const pct = Number(sk.level) || 0;
        return { name: sk.name.trim(), pct, dots: Math.round(pct / 20) };
      });
    return {
      title: s.title || '',
      kind: s.kind,
      style: s.style || 'classic',
      headingKey: `sections.${si}.title`,
      hookKey: `sections.${si}.hook`,
      bodyKey: `sections.${si}.body`,
      hook: text?.hook?.trim() ? text.hook.trim() : null,
      body: text?.body?.trim() ? text.body.trim() : null,
      skillGroups: skillGroups.length ? skillGroups : null,
      skillLevels: skillLevels.length ? skillLevels : null,
      entries:
        s.kind === 'entries'
          ? (s as EditorEntriesSection).entries.map((en, ei) => {
              const vis = entryFieldVisibility(s.type, s.style || 'classic');
              const dateRange = [fmt(en.start, data.dateFormat), fmt(en.end, data.dateFormat)]
                .filter(Boolean)
                .join(' – ');
              const contactBits = [en.email, en.phone].filter((x) => x && x.trim());
              return {
                key: `sections.${si}.entries.${ei}`,
                title: en.title || '',
                subtitle: contactBits.length
                  ? [en.subtitle, contactBits.join(' · ')].filter(Boolean).join(' — ')
                  : en.subtitle || '',
                dates: dateRange || en.year || '',
                desc: vis.desc ? en.desc || '' : '',
                contribs: vis.contribs ? (en.contribs || []).filter((c) => c && c.trim()) : [],
                link: en.link || null,
              };
            })
          : null,
    };
  });
  return { name: data.header.name || '', title: data.header.title || '', contacts, sections };
}

export function exportAccent(
  templateId: string,
  templateAccent: string | null,
  propsAccent: string | undefined,
): string {
  return templateId === 'openSans' ? (propsAccent ?? '#3E5C76') : templateAccent || '#3E5C76';
}
