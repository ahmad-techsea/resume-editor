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
  body: string | null;
  entries: ExportEntry[] | null;
}
export interface ExportModel {
  name: string;
  title: string;
  contacts: ExportContact[];
  sections: ExportSection[];
}

// Some catalog styles (SummaryEditor's "1e", SkillsEditor's "7c"/"7d"/"7e") keep their real
// content outside the plain `body` string — fold it back in for export so nothing typed is
// silently dropped from the PDF/DOCX output.
function buildTextBody(sec: EditorTextSection): string {
  const parts: string[] = [];
  if (sec.hook && sec.hook.trim()) parts.push(sec.hook.trim());
  if (sec.body && sec.body.trim()) parts.push(sec.body.trim());
  (sec.skillGroups || []).forEach((g) => {
    if (g.items && g.items.trim()) parts.push((g.label ? g.label.trim() + ': ' : '') + g.items.trim());
  });
  if (sec.skillLevels && sec.skillLevels.length) {
    const names = sec.skillLevels.map((sk) => sk.name && sk.name.trim()).filter(Boolean);
    if (names.length) parts.push(names.join(', '));
  }
  return parts.join('\n');
}

export function buildExportModel(data: EditorResumeDocument): ExportModel {
  const contacts = data.header.contacts
    .filter((c) => c.text && c.text.trim())
    .map((c) => ({ text: c.text, url: c.url || null }));
  const sections = data.sections.map((s) => ({
    title: s.title || '',
    kind: s.kind,
    body: s.kind === 'text' ? buildTextBody(s as EditorTextSection) : null,
    entries:
      s.kind === 'entries'
        ? (s as EditorEntriesSection).entries.map((en) => {
            const dateRange = [fmt(en.start, data.dateFormat), fmt(en.end, data.dateFormat)]
              .filter(Boolean)
              .join(' – ');
            const contactBits = [en.email, en.phone].filter((x) => x && x.trim());
            return {
              title: en.title || '',
              subtitle: contactBits.length
                ? [en.subtitle, contactBits.join(' · ')].filter(Boolean).join(' — ')
                : en.subtitle || '',
              dates: dateRange || en.year || '',
              desc: en.desc || '',
              contribs: (en.contribs || []).filter((c) => c && c.trim()),
              link: en.link || null,
            };
          })
        : null,
  }));
  return { name: data.header.name || '', title: data.header.title || '', contacts, sections };
}

export function exportAccent(
  templateId: string,
  templateAccent: string | null,
  propsAccent: string | undefined,
): string {
  return templateId === 'openSans' ? (propsAccent ?? '#3E5C76') : templateAccent || '#3E5C76';
}
