import type { SectionGroup } from '../types';
import ClassicRuledHeading from './ClassicRuledHeading';
import SideLabel from './SideLabel';
import EditorialNoHeading from './EditorialNoHeading';
import TintedPanel from './TintedPanel';
import BoldHookDetail from './BoldHookDetail';

const professionalSummary: SectionGroup = {
  number: 1,
  name: 'Professional summary',
  templates: [ClassicRuledHeading, SideLabel, EditorialNoHeading, TintedPanel, BoldHookDetail],
  tryNode: (
    <>
      Try: “use{' '}
      <a className="dv-oid" href="#1d">
        1d
      </a>{' '}
      as the Summary style in the editor”.
    </>
  ),
};

export default professionalSummary;
