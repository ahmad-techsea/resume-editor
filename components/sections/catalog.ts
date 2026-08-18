import type { SectionGroup } from './types';
import professionalSummary from './professionalSummary';
import education from './education';
import experience from './experience';
import certifications from './certifications';
import awards from './awards';
import skills from './skills';
import references from './references';

/** Maps an editor section `type` to its real-preview SectionGroup. Only the 7 categories rebuilt
 *  onto the real catalog appear here — projects/languages/custom intentionally stay on the old
 *  TSTYLES/SNAMES/StyleThumb system in lib/resume-data/editor-resume-data.ts. `personalContact`
 *  (the header) is out of scope and deliberately excluded. */
export const SECTION_CATALOG: Record<string, SectionGroup> = {
  summary: professionalSummary,
  education,
  experience,
  certifications,
  awards,
  skills,
  references,
};

export function usesCatalog(type: string): boolean {
  return type in SECTION_CATALOG;
}

export function catalogFor(type: string): SectionGroup | undefined {
  return SECTION_CATALOG[type];
}
