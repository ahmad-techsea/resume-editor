import React from 'react';
import buildSummaryBlocks from './SummaryEditor';
import buildEducationBlocks from './EducationEditor';
import buildExperienceBlocks from './ExperienceEditor';
import buildCertificationsBlocks from './CertificationsEditor';
import buildAwardsBlocks from './AwardsEditor';
import buildSkillsBlocks from './SkillsEditor';
import buildReferencesBlocks from './ReferencesEditor';
import type { PgBlockSpec } from '../pagination/block-spec';

export interface CatalogSectionProps {
  s: any;
  onEdit: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocusF: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyS: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyM: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

type CatalogBlockBuilder = (props: CatalogSectionProps) => PgBlockSpec[];

const BUILDERS: Record<string, CatalogBlockBuilder> = {
  summary: buildSummaryBlocks,
  education: buildEducationBlocks,
  experience: buildExperienceBlocks,
  certifications: buildCertificationsBlocks,
  awards: buildAwardsBlocks,
  skills: buildSkillsBlocks,
  references: buildReferencesBlocks,
};

/** Dispatches a section using the real components/sections/** catalog to its block builder, keyed
 *  by section type. Used only when SectionBlock's `s.useCatalog` is true. Returns a flat block
 *  array (a section heading block plus one block per entry / one body block), not a mounted
 *  component — see SectionBlock.tsx for why sections can no longer be a single wrapping node. */
export default function buildCatalogSectionBlocks({ s, ...handlers }: CatalogSectionProps): PgBlockSpec[] {
  const builder = BUILDERS[s.type];
  return builder ? builder({ s, ...handlers }) : [];
}
