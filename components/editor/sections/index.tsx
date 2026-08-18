import React from 'react';
import SummaryEditor from './SummaryEditor';
import EducationEditor from './EducationEditor';
import ExperienceEditor from './ExperienceEditor';
import CertificationsEditor from './CertificationsEditor';
import AwardsEditor from './AwardsEditor';
import SkillsEditor from './SkillsEditor';
import ReferencesEditor from './ReferencesEditor';

export interface CatalogSectionProps {
  s: any;
  onEdit: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocusF: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyS: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyM: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const RENDERERS: Record<string, React.ComponentType<CatalogSectionProps>> = {
  summary: SummaryEditor,
  education: EducationEditor,
  experience: ExperienceEditor,
  certifications: CertificationsEditor,
  awards: AwardsEditor,
  skills: SkillsEditor,
  references: ReferencesEditor,
};

/** Dispatches a section using the real components/sections/** catalog to its editable renderer,
 *  keyed by section type. Used only when SectionBlock's `s.useCatalog` is true. */
export default function CatalogSectionRenderer({ s, ...handlers }: CatalogSectionProps) {
  const Renderer = RENDERERS[s.type];
  return Renderer ? <Renderer s={s} {...handlers} /> : null;
}
