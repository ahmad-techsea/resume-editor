// Maps ReviewResumeDocument (the review panel's fixed-schema resume) into the section/entry
// view-model shape `components/editor/SectionBlock.tsx` and `EntryFields.tsx` consume, so the
// review page can render through the editor's real components instead of a parallel
// implementation. Field paths use resume-review-engine's bracket convention (`experience[0].title`)
// so colorMap/jumpToFinding/setPath keep resolving correctly — this file does not change the
// review data model or the rules engine, only how it's rendered.
import { MS } from './editor-resume-data';
import type { ReviewResumeDocument } from './review-resume-data';

function formatDate(d: { y: number; m: number } | 'present' | null): string {
  if (!d) return '';
  if (d === 'present') return 'Present';
  return MS[d.m - 1] + ' ' + d.y;
}

export interface ReviewEntriesCallbacks {
  onAddExperience: () => void;
  onAddEducation: () => void;
  onAddCertification: () => void;
  onAddProject: () => void;
  onDeleteExperience: (i: number) => void;
  onDeleteEducation: (i: number) => void;
  onDeleteCertification: (i: number) => void;
  onDeleteProject: (i: number) => void;
  onAddBullet: (section: 'experience' | 'projects', entryIndex: number) => void;
  onDeleteBullet: (
    section: 'experience' | 'projects',
    entryIndex: number,
    bulletIndex: number,
  ) => void;
}

const TEXT_SECTION_BASE = {
  headTop: true,
  txtClassic: true,
  bodyAlign: 'left' as const,
  bodyColor: '#3B3833',
  showSectionControls: false,
  titleEditable: false,
};

const ENTRIES_SECTION_BASE = {
  headTop: true,
  entClassic: true,
  entDisp: 'block' as const,
  entRail: '0',
  entRailPad: '0px',
  ectlLeft: '-42px',
  ectlPad: '20px',
  showSectionControls: false,
  titleEditable: false,
  entLinkable: false,
};

function bulletContribs(
  bullets: string[],
  section: 'experience' | 'projects',
  i: number,
  cb: ReviewEntriesCallbacks,
) {
  return (bullets || []).map((b, j) => ({
    id: `${section}-${i}-${j}`,
    val: b,
    path: `${section}[${i}].bullets[${j}]`,
    del: () => cb.onDeleteBullet(section, i, j),
  }));
}

export function buildReviewSections(
  resume: ReviewResumeDocument,
  cb: ReviewEntriesCallbacks,
): any[] {
  const experience = {
    id: 'experience',
    title: 'Experience',
    addLbl: 'Add role',
    addEntry: cb.onAddExperience,
    entries: resume.experience.map((e, i) => ({
      id: `experience-${i}`,
      pT: `experience[${i}].title`,
      title: e.title,
      phT: 'Job title',
      pS: `experience[${i}].company`,
      subtitle: e.company,
      phS: 'Company',
      pS2: `experience[${i}].location`,
      subtitle2: e.location,
      phS2: 'Location',
      hasDates: true,
      datesReadOnly: true,
      startLbl: formatDate(e.start) || 'Start date',
      startCol: e.start ? '#6B665E' : '#A9A29A',
      endLbl: formatDate(e.end) || 'End date',
      endCol: e.end ? '#6B665E' : '#A9A29A',
      hasContribs: (e.bullets || []).length > 0,
      contribs: bulletContribs(e.bullets, 'experience', i, cb),
      addContrib: () => cb.onAddBullet('experience', i),
      del: () => cb.onDeleteExperience(i),
    })),
    ...ENTRIES_SECTION_BASE,
  };

  const education = {
    id: 'education',
    title: 'Education',
    addLbl: 'Add school',
    addEntry: cb.onAddEducation,
    entries: resume.education.map((e, i) => ({
      id: `education-${i}`,
      pT: `education[${i}].degree`,
      title: e.degree,
      phT: 'Degree',
      pS: `education[${i}].institution`,
      subtitle: e.institution,
      phS: 'Institution',
      pS2: `education[${i}].field`,
      subtitle2: e.field,
      phS2: 'Field of study',
      hasDates: false,
      meta: { path: `education[${i}].gradYear`, value: e.gradYear ?? '', placeholder: 'Year' },
      del: () => cb.onDeleteEducation(i),
    })),
    ...ENTRIES_SECTION_BASE,
  };

  const certifications = {
    id: 'certifications',
    title: 'Certifications',
    addLbl: 'Add certification',
    addEntry: cb.onAddCertification,
    entries: resume.certifications.map((c, i) => ({
      id: `certifications-${i}`,
      pT: `certifications[${i}].name`,
      title: c.name,
      phT: 'Certification name',
      pS: `certifications[${i}].issuer`,
      subtitle: c.issuer,
      phS: 'Issuer',
      hasDates: false,
      meta: {
        path: `certifications[${i}].expiryYear`,
        value: c.expiryYear ?? '',
        placeholder: 'Exp. year',
      },
      del: () => cb.onDeleteCertification(i),
    })),
    ...ENTRIES_SECTION_BASE,
  };

  const projects = {
    id: 'projects',
    title: 'Projects',
    addLbl: 'Add project',
    addEntry: cb.onAddProject,
    entries: resume.projects.map((p, i) => ({
      id: `projects-${i}`,
      pT: `projects[${i}].name`,
      title: p.name,
      phT: 'Project name',
      pS: `projects[${i}].tech`,
      subtitle: p.tech,
      phS: 'Technologies',
      pS2: `projects[${i}].outcome`,
      subtitle2: p.outcome,
      phS2: 'Outcome / impact',
      hasDates: false,
      hasContribs: (p.bullets || []).length > 0,
      contribs: bulletContribs(p.bullets, 'projects', i, cb),
      addContrib: () => cb.onAddBullet('projects', i),
      del: () => cb.onDeleteProject(i),
    })),
    ...ENTRIES_SECTION_BASE,
  };

  const summary = {
    id: 'summary',
    title: 'Summary',
    pBody: 'summary',
    body: resume.summary,
    phBody: 'Write a 2–4 line professional summary…',
    ...TEXT_SECTION_BASE,
  };

  const skills = {
    id: 'skills',
    title: 'Skills',
    pBody: 'skills',
    body: resume.skills,
    phBody: 'List your key skills, separated by commas…',
    ...TEXT_SECTION_BASE,
  };

  return [summary, experience, education, skills, certifications, projects];
}
