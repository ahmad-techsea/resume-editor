import type { SectionGroup } from '../types';
import ClassicParagraph from './ClassicParagraph';
import ContributionBullets from './ContributionBullets';
import TimelineRail from './TimelineRail';
import CompanyFirst from './CompanyFirst';
import TwoColumnMeta from './TwoColumnMeta';

const experience: SectionGroup = {
  number: 4,
  name: 'Experience',
  templates: [ClassicParagraph, ContributionBullets, TimelineRail, CompanyFirst, TwoColumnMeta],
  tryNode: (
    <>
      Try: “use{' '}
      <a className="dv-oid" href="#4b">
        4b
      </a>{' '}
      — it matches the new contribution bullets in the editor”.
    </>
  ),
};

export default experience;
