import type { SectionGroup } from '../types';
import ClassicRows from './ClassicRows';
import CompactOneLiners from './CompactOneLiners';
import TimelineRail from './TimelineRail';
import CardPair from './CardPair';
import DatesLeftColumn from './DatesLeftColumn';

const education: SectionGroup = {
  number: 3,
  name: 'Education',
  templates: [ClassicRows, CompactOneLiners, TimelineRail, CardPair, DatesLeftColumn],
  tryNode: (
    <>
      Try: “switch Education to{' '}
      <a className="dv-oid" href="#3e">
        3e
      </a>
      ”.
    </>
  ),
};

export default education;
