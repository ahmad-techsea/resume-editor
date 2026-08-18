import type { ReactNode } from 'react';

export type SectionTemplateComponent = (() => ReactNode) & {
  templateId: string;
  templateLabel: string;
};

export interface SectionGroup {
  number: number;
  name: string;
  templates: SectionTemplateComponent[];
  tryNode: ReactNode;
}
