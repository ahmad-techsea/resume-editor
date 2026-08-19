// Pure text-matching helper for locating a Finding's matchedText live in the canvas — no DOM
// access, safe to unit test in isolation (see apply-fix.ts, whose currentValue.indexOf(matchedText)
// strategy this generalizes from one candidate string to N, for the paginated-fragment case where
// a single field can be split across multiple same-data-path DOM elements).

export interface MatchResult {
  candidateIndex: number;
  start: number;
  end: number;
}

/** Case-sensitive, first-hit search: Finding.matchedText always stores the exact-cased substring
 *  a rule captured, same assumption apply-fix.ts's own indexOf-based matching already relies on. */
export function resolveMatch(candidateTexts: string[], matchedText: string): MatchResult | null {
  if (!matchedText) return null;
  for (let i = 0; i < candidateTexts.length; i++) {
    const start = candidateTexts[i].indexOf(matchedText);
    if (start >= 0) return { candidateIndex: i, start, end: start + matchedText.length };
  }
  return null;
}
