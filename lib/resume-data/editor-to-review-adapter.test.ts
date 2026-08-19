import test from 'node:test';
import assert from 'node:assert/strict';
import { projectEditorToReview } from './editor-to-review-adapter.ts';
// Type-only: fully erased, so this never triggers editor-resume-data.ts's runtime module
// evaluation (that file is mid-edit elsewhere and plain `node --test` can't resolve one of its
// new `@/`-aliased imports) while still giving these fixtures real, checked types.
import type {
  EditorEntriesSection,
  EditorEntry,
  EditorResumeDocument,
  EditorSection,
  EditorTextSection,
} from './editor-resume-data';

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

test('blank resume: empty everything, but summary/skills/experience/education paths still map', () => {
  const doc = blankDoc([
    textSection('summary'),
    entriesSection('experience'),
    entriesSection('education'),
    textSection('skills'),
  ]);
  const { review, pathMap } = projectEditorToReview(doc);
  assert.equal(review.header.name, '');
  assert.equal(review.summary, '');
  assert.equal(review.skills, '');
  assert.deepEqual(review.experience, []);
  assert.deepEqual(review.education, []);
  assert.deepEqual(review.certifications, []);
  assert.deepEqual(review.projects, []);
  assert.equal(pathMap.get('summary'), 'sections.0.body');
  assert.equal(pathMap.get('skills'), 'sections.3.body');
  assert.equal(pathMap.has('experience[0].title'), false, 'no entries exist yet');
});

test('header: name/title map directly, email/phone/location come from fixed contact positions', () => {
  const doc = blankDoc([]);
  doc.header.name = 'Jamie Rivers';
  doc.header.title = 'Product Designer';
  doc.header.contacts[0].text = 'jamie@example.com';
  doc.header.contacts[1].text = '555-0100';
  doc.header.contacts[2].text = 'Denver, CO';
  const { review, pathMap } = projectEditorToReview(doc);
  assert.equal(review.header.name, 'Jamie Rivers');
  assert.equal(review.header.email, 'jamie@example.com');
  assert.equal(review.header.phone, '555-0100');
  assert.equal(review.header.location, 'Denver, CO');
  assert.equal(review.header.linkedin, '');
  assert.equal(review.header.github, '');
  assert.equal(pathMap.get('header.email'), 'header.contacts.0.text');
  assert.equal(pathMap.has('header.linkedin'), false, 'no editor field exists, must stay unmapped');
});

test('experience bullets: uses contribs when present', () => {
  const entry = blankEntry({
    title: 'Engineer',
    subtitle: 'Acme',
    contribs: ['Shipped X', 'Led Y'],
    desc: 'unused paragraph text',
  });
  const doc = blankDoc([entriesSection('experience', [entry])]);
  const { review, pathMap } = projectEditorToReview(doc);
  assert.deepEqual(review.experience[0].bullets, ['Shipped X', 'Led Y']);
  assert.equal(pathMap.get('experience[0].bullets[1]'), 'sections.0.entries.0.contribs.1');
});

test('experience bullets: falls back to desc as a single bullet when contribs is empty', () => {
  const entry = blankEntry({ title: 'Engineer', desc: 'Owned the migration end to end.' });
  const doc = blankDoc([entriesSection('experience', [entry])]);
  const { review, pathMap } = projectEditorToReview(doc);
  assert.deepEqual(review.experience[0].bullets, ['Owned the migration end to end.']);
  assert.equal(pathMap.get('experience[0].bullets[0]'), 'sections.0.entries.0.desc');
  assert.equal(review.experience[0].location, '', 'no editor field for location');
});

test('education: institution/degree mapped, gradYear derived only from a dated end', () => {
  const dated = blankEntry({
    title: 'B.S. Computer Science',
    subtitle: 'State University',
    end: { y: 2019, m: 5 },
  });
  const present = blankEntry({ title: 'M.S. Data Science', end: 'present' });
  const doc = blankDoc([entriesSection('education', [dated, present])]);
  const { review, pathMap } = projectEditorToReview(doc);
  assert.equal(review.education[0].institution, 'State University');
  assert.equal(review.education[0].degree, 'B.S. Computer Science');
  assert.equal(review.education[0].gradYear, 2019);
  assert.equal(review.education[1].gradYear, null, '"present" must not be read as a grad year');
  assert.equal(pathMap.get('education[0].degree'), 'sections.0.entries.0.title');
});

test('certifications: only a clean 4-digit year is trusted as expiryYear', () => {
  const clean = blankEntry({ title: 'AWS Certified', year: '2021' });
  const messy = blankEntry({ title: 'PMP', year: 'Spring 2020' });
  const doc = blankDoc([entriesSection('certifications', [clean, messy])]);
  const { review } = projectEditorToReview(doc);
  assert.equal(review.certifications[0].expiryYear, 2021);
  assert.equal(
    review.certifications[1].expiryYear,
    null,
    'ambiguous free text must never be guessed into a year',
  );
});

test('projects: name/tech/outcome/bullets mapped, outcome and a desc-fallback bullet may share one editor field', () => {
  const entry = blankEntry({
    title: 'Internal tool',
    subtitle: 'React, Node',
    desc: 'Cut manual triage time by half.',
  });
  const doc = blankDoc([entriesSection('projects', [entry])]);
  const { review, pathMap } = projectEditorToReview(doc);
  assert.equal(review.projects[0].tech, 'React, Node');
  assert.equal(review.projects[0].outcome, 'Cut manual triage time by half.');
  assert.deepEqual(review.projects[0].bullets, ['Cut manual triage time by half.']);
  assert.equal(pathMap.get('projects[0].outcome'), 'sections.0.entries.0.desc');
  assert.equal(pathMap.get('projects[0].bullets[0]'), 'sections.0.entries.0.desc');
});

test('missing categories project as empty with no crash and no stray path entries', () => {
  const doc = blankDoc([textSection('summary', 'Just a summary, nothing else.')]);
  const { review, pathMap } = projectEditorToReview(doc);
  assert.deepEqual(review.experience, []);
  assert.deepEqual(review.certifications, []);
  assert.equal(pathMap.has('certifications[0].name'), false);
});
