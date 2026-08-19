import type { SectionGroup } from '../types';
import CommaList from './CommaList';
import PillTags from './PillTags';
import GroupedColumns from './GroupedColumns';
import ProficiencyBars from './ProficiencyBars';
import DotRatings from './DotRatings';

const skills: SectionGroup = {
  number: 7,
  name: 'Skills',
  templates: [CommaList, PillTags, GroupedColumns, ProficiencyBars, DotRatings],
  tryNode: (
    <>
      Try: “make Skills editable as pills like{' '}
      <a className="dv-oid" href="#7b">
        7b
      </a>
      ” · “
      <a className="dv-oid" href="#7c">
        7c
      </a>{' '}
      with my own group names”.
    </>
  ),
};

export default skills;
