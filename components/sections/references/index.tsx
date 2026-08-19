import type { SectionGroup } from '../types';
import CardPair from './CardPair';
import AvailableOnRequest from './AvailableOnRequest';
import RowsContactRight from './RowsContactRight';
import QuoteEndorsement from './QuoteEndorsement';
import InitialAvatars from './InitialAvatars';

const references: SectionGroup = {
  number: 8,
  name: 'References',
  templates: [CardPair, AvailableOnRequest, RowsContactRight, QuoteEndorsement, InitialAvatars],
  tryNode: (
    <>
      Try: “add References to the editor as{' '}
      <a className="dv-oid" href="#8a">
        8a
      </a>
      ” · “more skills styles” · “apply{' '}
      <a className="dv-oid" href="#2b">
        2b
      </a>{' '}
      +{' '}
      <a className="dv-oid" href="#3e">
        3e
      </a>{' '}
      +{' '}
      <a className="dv-oid" href="#7b">
        7b
      </a>
      ”.
    </>
  ),
};

export default references;
