import type { SectionGroup } from '../types';
import LeftAligned from './LeftAligned';
import CenteredClassic from './CenteredClassic';
import SplitNameContactsRight from './SplitNameContactsRight';
import AccentBanner from './AccentBanner';
import MonogramBlock from './MonogramBlock';

const personalContact: SectionGroup = {
  number: 2,
  name: 'Personal info (header)',
  templates: [LeftAligned, CenteredClassic, SplitNameContactsRight, AccentBanner, MonogramBlock],
  tryNode: (
    <>
      Try: “make the editor header{' '}
      <a className="dv-oid" href="#2e">
        2e
      </a>
      ” · “
      <a className="dv-oid" href="#2d">
        2d
      </a>{' '}
      but with the accent from Tweaks”.
    </>
  ),
};

export default personalContact;
