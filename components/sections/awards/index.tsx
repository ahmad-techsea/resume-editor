import type { SectionGroup } from '../types';
import YearLeftColumn from './YearLeftColumn';
import RowsDatesRight from './RowsDatesRight';
import SimpleBullets from './SimpleBullets';
import TintedPanels from './TintedPanels';
import SingleLineDotSeparated from './SingleLineDotSeparated';

const awards: SectionGroup = {
  number: 6,
  name: 'Awards & achievements',
  templates: [YearLeftColumn, RowsDatesRight, SimpleBullets, TintedPanels, SingleLineDotSeparated],
  tryNode: (
    <>
      Try: “Awards as{' '}
      <a className="dv-oid" href="#6a">
        6a
      </a>{' '}
      with the accent color”.
    </>
  ),
};

export default awards;
