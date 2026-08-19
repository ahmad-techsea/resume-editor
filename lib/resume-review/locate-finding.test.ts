import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMatch } from './locate-finding.ts';

test('finds a match in the first candidate', () => {
  const result = resolveMatch(['Shipped the redesign.', 'Improved latency.'], 'Shipped');
  assert.deepEqual(result, { candidateIndex: 0, start: 0, end: 7 });
});

test('finds a match in a later candidate', () => {
  const result = resolveMatch(['Shipped the redesign.', 'Improved latency.'], 'latency');
  assert.deepEqual(result, { candidateIndex: 1, start: 9, end: 16 });
});

test('returns null when no candidate contains the text', () => {
  const result = resolveMatch(['Shipped the redesign.', 'Improved latency.'], 'References available');
  assert.equal(result, null);
});

test('returns null for empty matchedText rather than a spurious zero-length match', () => {
  const result = resolveMatch(['Shipped the redesign.'], '');
  assert.equal(result, null);
});

test('does not find a match straddling two candidates (fragment boundary case)', () => {
  // "the redesign" is split across two pagination fragments — neither candidate contains the
  // full phrase on its own, so this must fall through to null (whole-field fallback upstream),
  // not report a false positive.
  const result = resolveMatch(['Shipped the red', 'esign.'], 'the redesign');
  assert.equal(result, null);
});

test('is case-sensitive, matching the exact casing a rule captured', () => {
  const result = resolveMatch(['Shipped the Redesign.'], 'redesign');
  assert.equal(result, null);
});
