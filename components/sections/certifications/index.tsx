import type { SectionGroup } from '../types';
import RowsDatesRight from './RowsDatesRight';
import CardGrid from './CardGrid';
import CompactInline from './CompactInline';
import PillChips from './PillChips';
import RuledTable from './RuledTable';

const certifications: SectionGroup = {
  number: 5,
  name: 'Certifications',
  templates: [RowsDatesRight, CardGrid, CompactInline, PillChips, RuledTable],
  tryNode: (
    <>
      Try: “add a Certifications section styled like{' '}
      <a className="dv-oid" href="#5a">
        5a
      </a>
      ”.
    </>
  ),
};

export default certifications;
