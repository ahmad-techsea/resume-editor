import test from 'node:test';
import assert from 'node:assert/strict';
import { computeApplyFixResult, type ApplyFixResult } from './apply-fix.ts';
// Type-only: fully erased, so this never triggers editor-resume-data.ts's runtime module
// evaluation — see editor-to-review-adapter.test.ts for why that matters right now.
import type {
  EditorEntriesSection,
  EditorEntry,
  EditorResumeDocument,
  EditorSection,
  EditorTextSection,
} from '../resume-data/editor-resume-data';

let idCounter = 0;
const mintId = () => 'x' + ++idCounter;

function blankDoc(sections: EditorSection[] = []): EditorResumeDocument {
  return {
    dateFormat: 'MMM',
    templateId: 'openSans',
    pageSize: 'a4',
    header: {
      name: '',
      title: '',
      contacts: [
        { kind: 'email', text: '', url: null },
        { kind: 'phone', text: '', url: null },
        { kind: 'location', text: '', url: null },
      ],
    },
    sections,
  };
}
function textSection(type: string, body = ''): EditorTextSection {
  return {
    id: mintId(),
    type,
    kind: 'text',
    style: '1a',
    title: type,
    body,
    hook: '',
    skillGroups: [],
    skillLevels: [],
  };
}
function entriesSection(type: string, entries: EditorEntry[] = []): EditorEntriesSection {
  return { id: mintId(), type, kind: 'entries', style: 'classic', title: type, entries };
}
function blankEntry(overrides: Partial<EditorEntry> = {}): EditorEntry {
  return {
    id: mintId(),
    title: '',
    subtitle: '',
    start: null,
    end: null,
    desc: '',
    contribs: [],
    link: null,
    year: '',
    email: '',
    phone: '',
    ...overrides,
  };
}

function assertFailed(result: ApplyFixResult): asserts result is Extract<ApplyFixResult, { ok: false }> {
  if (result.ok) throw new Error('expected computeApplyFixResult to fail, but it succeeded');
}
function assertSucceeded(result: ApplyFixResult): asserts result is Extract<ApplyFixResult, { ok: true }> {
  if (!result.ok) throw new Error('expected computeApplyFixResult to succeed, but it failed');
}

test('fails with no-suggestion when the finding has nothing to apply', () => {
  const doc = blankDoc([textSection('summary', 'Some summary.')]);
  const result = computeApplyFixResult(
    { fieldPath: 'summary', matchedText: 'Some', suggestion: null },
    doc,
  );
  assertFailed(result);
  assert.equal(result.reason, 'no-suggestion');
});

test('fails with no-suggestion for a grouped (capped-overflow) finding, even with a suggestion', () => {
  const doc = blankDoc([textSection('summary', 'Some summary.')]);
  const result = computeApplyFixResult(
    { fieldPath: 'summary', matchedText: 'Some', suggestion: 'x', grouped: true },
    doc,
  );
  assertFailed(result);
  assert.equal(result.reason, 'no-suggestion');
});

test('fails with field-not-mapped for a field with no editor destination (e.g. linkedin)', () => {
  const doc = blankDoc([]);
  const result = computeApplyFixResult(
    { fieldPath: 'header.linkedin', matchedText: 'bad link', suggestion: 'https://x.com' },
    doc,
  );
  assertFailed(result);
  assert.equal(result.reason, 'field-not-mapped');
});

test('fails with field-not-mapped when the target section/entry no longer exists in the current resume', () => {
  const doc = blankDoc([textSection('summary', 'Some summary.')]); // no certifications section at all
  // Pretend the review was generated back when a certifications entry still existed — since the
  // pathMap is always rebuilt fresh from the *current* data, a since-deleted section simply never
  // gets an entry in it (this is the "user already deleted that section" case from the task).
  const result = computeApplyFixResult(
    { fieldPath: 'certifications[0].name', matchedText: 'Old Cert', suggestion: 'New name' },
    doc,
  );
  assertFailed(result);
  assert.equal(result.reason, 'field-not-mapped');
});

test('fails with field-not-found when a mapped path cannot actually be resolved (defensive case)', () => {
  // header.email/phone/location are mapped unconditionally to fixed contact positions; if the
  // contacts array were ever shorter than expected (never happens via the app's own reducers, but
  // resolveDotPath must not throw uncaught if it ever did), resolving must fail gracefully.
  const doc = blankDoc([]);
  doc.header.contacts = [];
  const result = computeApplyFixResult(
    { fieldPath: 'header.location', matchedText: 'Old City', suggestion: 'New City' },
    doc,
  );
  assertFailed(result);
  assert.equal(result.reason, 'field-not-found');
});

test('fails with text-changed when matchedText no longer appears in the current field', () => {
  const doc = blankDoc([textSection('summary', 'A totally different summary now.')]);
  const result = computeApplyFixResult(
    { fieldPath: 'summary', matchedText: 'References available upon request', suggestion: '' },
    doc,
  );
  assertFailed(result);
  assert.equal(result.reason, 'text-changed');
});

test('scalar splice: applies a suggestion into the exact matched span', () => {
  const doc = blankDoc([textSection('summary', 'Great work. References available upon request.')]);
  const result = computeApplyFixResult(
    { fieldPath: 'summary', matchedText: 'References available upon request', suggestion: '' },
    doc,
  );
  assertSucceeded(result);
  assert.deepEqual(result.action, {
    kind: 'setPath',
    path: 'sections.0.body',
    value: 'Great work. .',
  });
});

test('scalar splice: recapitalization fix', () => {
  const doc = blankDoc([
    entriesSection('experience', [blankEntry({ title: 'staff engineer', subtitle: 'Acme' })]),
  ]);
  const result = computeApplyFixResult(
    { fieldPath: 'experience[0].title', matchedText: 'staff engineer', suggestion: 'Staff engineer' },
    doc,
  );
  assertSucceeded(result);
  assert.deepEqual(result.action, {
    kind: 'setPath',
    path: 'sections.0.entries.0.title',
    value: 'Staff engineer',
  });
});

test('array removal: a whole-bullet delete-fix removes the array element, not a blank string', () => {
  const entry = blankEntry({
    title: 'Engineer',
    contribs: ['Shipped the redesign.', 'Shipped the redesign.'],
  });
  const doc = blankDoc([entriesSection('experience', [entry])]);
  const result = computeApplyFixResult(
    { fieldPath: 'experience[0].bullets[1]', matchedText: 'Shipped the redesign.', suggestion: '' },
    doc,
  );
  assertSucceeded(result);
  assert.deepEqual(result.action, {
    kind: 'removeAtPath',
    listPath: 'sections.0.entries.0.contribs',
    index: 1,
  });
});

test('recomputes the path map fresh: a section reordered after generation is still targeted correctly', () => {
  const summary = textSection('summary', 'Summary text.');
  const skills = textSection('skills', 'SQL, Excel, SQL');
  // At "generation time" skills would have been index 1; simulate the user reordering sections
  // before Apply is clicked, so skills is now at index 0.
  const doc = blankDoc([skills, summary]);
  const result = computeApplyFixResult(
    { fieldPath: 'skills', matchedText: 'SQL, Excel, SQL', suggestion: 'SQL, Excel' },
    doc,
  );
  assertSucceeded(result);
  assert.deepEqual(result.action, {
    kind: 'setPath',
    path: 'sections.0.body', // index 0, matching skills' *current* position, not a stale index 1
    value: 'SQL, Excel',
  });
});
