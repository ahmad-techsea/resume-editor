// Fixed-schema resume shape lib/resume-review-engine.ts's rules expect. No React/DOM here.
// Populated by projecting the real EditorResumeDocument (see editor-to-review-adapter.ts) — this
// file only holds the type definitions themselves now; the sample-data builder that used to seed
// the standalone /review page was removed along with that page.

export interface ReviewHeader {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}
export interface ExperienceEntry {
  title: string;
  company: string;
  location: string;
  start: { y: number; m: number } | null;
  end: { y: number; m: number } | 'present' | null;
  bullets: string[];
}
export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  gradYear: number | null;
}
export interface CertificationEntry {
  name: string;
  issuer: string;
  expiryYear: number | null;
}
export interface ProjectEntry {
  name: string;
  tech: string;
  outcome: string;
  bullets: string[];
}
export interface ReviewResumeDocument {
  header: ReviewHeader;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string;
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
}
