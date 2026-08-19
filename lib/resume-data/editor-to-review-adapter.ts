// Projects EditorResumeDocument (the flexible-sections resume the editor actually edits) into
// ReviewResumeDocument's fixed shape, so lib/resume-review-engine.ts's rules can run against it
// unmodified. Also returns a path map (review bracket-path -> editor dot-path) so a Finding's
// fieldPath can be translated back to a real, writable location in the editor's own data.
//
// Every non-custom section category can appear at most once in EditorResumeDocument.sections[]
// (InlineResumeEditor's add-section picker disables re-adding a category that's already present),
// so a `sections.find(s => s.type === X)` lookup per category is safe and unambiguous.
//
// Recompute this fresh every time — never cache the result — since sections can be added, removed,
// or reordered between generating a review and applying a fix; a stale pathMap could silently
// target the wrong field after a reorder.

import type {
  EditorEntry,
  EditorResumeDocument,
  EditorSection,
} from './editor-resume-data';
import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ReviewResumeDocument,
} from './review-resume-data';

export interface EditorToReviewProjection {
  review: ReviewResumeDocument;
  pathMap: Map<string, string>;
}

function findSection(doc: EditorResumeDocument, type: string): EditorSection | undefined {
  return doc.sections.find((s) => s.type === type);
}

function sectionIndex(doc: EditorResumeDocument, section: EditorSection): number {
  return doc.sections.indexOf(section);
}

function textBody(section: EditorSection | undefined): string {
  return section && section.kind === 'text' ? section.body || '' : '';
}

function entriesOf(section: EditorSection | undefined): EditorEntry[] {
  return section && section.kind === 'entries' ? section.entries : [];
}

/**
 * An entry's bullets: `contribs` when populated, else `desc` as a single bullet. Paragraph-style
 * templates (e.g. the default Experience style, 4a "Classic Paragraph") only populate `desc`, not
 * `contribs` — skipping this fallback would make every bullet-quality rule inert for most users.
 */
function entryBullets(entry: EditorEntry): {
  bullets: string[];
  bulletEditorField: 'contribs' | 'desc';
} {
  if (entry.contribs && entry.contribs.length > 0) {
    return { bullets: entry.contribs, bulletEditorField: 'contribs' };
  }
  return { bullets: entry.desc ? [entry.desc] : [], bulletEditorField: 'desc' };
}

function bulletEditorPath(
  si: number,
  ei: number,
  bi: number,
  bulletEditorField: 'contribs' | 'desc',
): string {
  return bulletEditorField === 'contribs'
    ? `sections.${si}.entries.${ei}.contribs.${bi}`
    : `sections.${si}.entries.${ei}.desc`;
}

/** Certifications' `year` is free text (e.g. "2024"); only trust it as a year if it's a clean
 *  4-digit numeral — never invent an expiry year from ambiguous input. */
function parseCleanYear(raw: string): number | null {
  const trimmed = (raw || '').trim();
  return /^\d{4}$/.test(trimmed) ? Number(trimmed) : null;
}

export function projectEditorToReview(doc: EditorResumeDocument): EditorToReviewProjection {
  const pathMap = new Map<string, string>();
  const map = (reviewPath: string, editorPath: string) => pathMap.set(reviewPath, editorPath);

  map('header.name', 'header.name');
  map('header.title', 'header.title');
  map('header.email', 'header.contacts.0.text');
  map('header.phone', 'header.contacts.1.text');
  map('header.location', 'header.contacts.2.text');
  // No linkedin/github field exists anywhere in the editor header today — projected as '' below
  // and deliberately left unmapped here, so the one rule that reads them ('final-links') never
  // fires, and Apply-fix would correctly report "field not found" if it somehow did.

  const summarySection = findSection(doc, 'summary');
  if (summarySection) map('summary', `sections.${sectionIndex(doc, summarySection)}.body`);

  const skillsSection = findSection(doc, 'skills');
  if (skillsSection) map('skills', `sections.${sectionIndex(doc, skillsSection)}.body`);

  const experienceSection = findSection(doc, 'experience');
  const experienceSi = experienceSection ? sectionIndex(doc, experienceSection) : -1;
  const experience: ExperienceEntry[] = entriesOf(experienceSection).map((entry, i) => {
    const { bullets, bulletEditorField } = entryBullets(entry);
    map(`experience[${i}].title`, `sections.${experienceSi}.entries.${i}.title`);
    map(`experience[${i}].company`, `sections.${experienceSi}.entries.${i}.subtitle`);
    bullets.forEach((_, j) =>
      map(
        `experience[${i}].bullets[${j}]`,
        bulletEditorPath(experienceSi, i, j, bulletEditorField),
      ),
    );
    return {
      title: entry.title || '',
      company: entry.subtitle || '',
      // No location field exists on EditorEntry — always empty; rules that key off experience
      // location (e.g. fmt-dates) are unreachable through this adapter, which is an honest
      // reflection of the editor's data model, not a bug to work around here.
      location: '',
      // EditorDate allows 'present' for either end of the picker, but a job can't *start*
      // "present" — the UI's date popover only ever offers that option for end dates, so this
      // narrows a case the type permits but the app never actually produces.
      start: entry.start === 'present' ? null : entry.start,
      end: entry.end,
      bullets,
    };
  });

  const educationSection = findSection(doc, 'education');
  const educationSi = educationSection ? sectionIndex(doc, educationSection) : -1;
  const education: EducationEntry[] = entriesOf(educationSection).map((entry, i) => {
    map(`education[${i}].institution`, `sections.${educationSi}.entries.${i}.subtitle`);
    map(`education[${i}].degree`, `sections.${educationSi}.entries.${i}.title`);
    // No rule reads gradYear directly — display-only, derived, no reverse path needed.
    const gradYear = entry.end && entry.end !== 'present' ? entry.end.y : null;
    return { institution: entry.subtitle || '', degree: entry.title || '', field: '', gradYear };
  });

  const certificationsSection = findSection(doc, 'certifications');
  const certificationsSi = certificationsSection ? sectionIndex(doc, certificationsSection) : -1;
  const certifications: CertificationEntry[] = entriesOf(certificationsSection).map(
    (entry, i) => {
      map(`certifications[${i}].name`, `sections.${certificationsSi}.entries.${i}.title`);
      return {
        name: entry.title || '',
        issuer: entry.subtitle || '',
        expiryYear: parseCleanYear(entry.year),
      };
    },
  );

  const projectsSection = findSection(doc, 'projects');
  const projectsSi = projectsSection ? sectionIndex(doc, projectsSection) : -1;
  const projects: ProjectEntry[] = entriesOf(projectsSection).map((entry, i) => {
    const { bullets, bulletEditorField } = entryBullets(entry);
    map(`projects[${i}].name`, `sections.${projectsSi}.entries.${i}.title`);
    map(`projects[${i}].tech`, `sections.${projectsSi}.entries.${i}.subtitle`);
    map(`projects[${i}].outcome`, `sections.${projectsSi}.entries.${i}.desc`);
    bullets.forEach((_, j) =>
      map(`projects[${i}].bullets[${j}]`, bulletEditorPath(projectsSi, i, j, bulletEditorField)),
    );
    return {
      name: entry.title || '',
      tech: entry.subtitle || '',
      outcome: entry.desc || '',
      bullets,
    };
  });

  // awards/languages/references/custom sections have no corresponding ReviewResumeDocument
  // field — lib/resume-review-engine.ts's RULES never reference those categories either, so this
  // is permanently out of the review engine's scope, not a gap in this adapter.

  const review: ReviewResumeDocument = {
    header: {
      name: doc.header.name || '',
      title: doc.header.title || '',
      email: doc.header.contacts[0]?.text || '',
      phone: doc.header.contacts[1]?.text || '',
      location: doc.header.contacts[2]?.text || '',
      linkedin: '',
      github: '',
    },
    summary: textBody(summarySection),
    experience,
    education,
    skills: textBody(skillsSection),
    certifications,
    projects,
  };

  return { review, pathMap };
}
