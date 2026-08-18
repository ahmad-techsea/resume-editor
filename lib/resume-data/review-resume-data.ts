// Data model and pure builder for ResumeReviewPanel's fixed-schema resume — the shape
// lib/resume-review-engine.ts's rules already expect. No React/DOM here.

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

export function createSampleReviewResume(): ReviewResumeDocument {
  return {
    header: {
      name: 'Jordan Lee',
      title: 'Senior Product Manager',
      email: 'jlee12345xyz@gmail.com',
      phone: '(555) 019-2834',
      location: 'Austin, TX',
      linkedin: 'linkedin.com/in/jordanleepm',
      github: 'my portfolio site',
    },
    summary:
      'I am a hard-working and motivated product manager with experience leading teams. I am a team player who always gives 110%. References available upon request.',
    experience: [
      {
        title: 'Senior Product Manager',
        company: 'Northwind Cloud',
        location: 'Austin, TX',
        start: { y: 2023, m: 1 },
        end: 'present',
        bullets: [
          'Responsible for the product roadmap and worked on cross-team alignment.',
          'Increased user engagement significantly across the platform.',
          'Managed a team of designers and engineers to launch new features.',
        ],
      },
      {
        title: 'product manager',
        company: 'Bluebird Systems',
        location: 'Remote',
        start: { y: 2019, m: 6 },
        end: { y: 2022, m: 11 },
        bullets: [
          'Managed the backlog for three engineering pods.',
          'Managed vendor relationships and contract negotiations.',
          'Reduced the the onboarding time for new customers.',
        ],
      },
      {
        title: 'Associate PM',
        company: 'Bluebird Systems',
        location: 'Austin,TX',
        start: { y: 2021, m: 1 },
        end: { y: 2021, m: 8 },
        bullets: ['Helped with sprint planning and helped the team ship on time.'],
      },
    ],
    education: [
      {
        institution: 'University of Texas at Austin',
        degree: 'B.B.A.',
        field: 'Marketing',
        gradYear: 2015,
      },
    ],
    skills: 'Product Strategy, Roadmapping, SQL, SQL, A/B Testing, Stakeholder Management',
    certifications: [
      { name: 'Certified Scrum Product Owner', issuer: 'Scrum Alliance', expiryYear: 2020 },
    ],
    projects: [
      {
        name: 'Internal Analytics Revamp',
        tech: '',
        outcome: 'Targeting a base salary of $95,000 in this role.',
        bullets: ['Led redesign of internal analytics dashboards used by 40+ stakeholders.'],
      },
    ],
  };
}
