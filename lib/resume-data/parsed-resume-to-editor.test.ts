import test from 'node:test';
import assert from 'node:assert/strict';
import { convertParsedResumeToEditorDocument, type ParsedResumeData } from './parsed-resume-to-editor.ts';
import type {
  EditorEntriesSection,
  EditorResumeDocument,
  EditorTextSection,
} from './editor-resume-data';

let idCounter = 0;
const mintId = () => 'x' + ++idCounter;

function findTextSection(doc: EditorResumeDocument, type: string): EditorTextSection {
  const s = doc.sections.find((sec) => sec.type === type);
  if (!s || s.kind !== 'text') throw new Error(`expected a text section of type "${type}"`);
  return s;
}
function findEntriesSection(doc: EditorResumeDocument, type: string): EditorEntriesSection {
  const s = doc.sections.find((sec) => sec.type === type);
  if (!s || s.kind !== 'entries') throw new Error(`expected an entries section of type "${type}"`);
  return s;
}

test('empty parse result -> blank header, no sections, no crash', () => {
  const doc = convertParsedResumeToEditorDocument({}, mintId);
  assert.equal(doc.header.name, '');
  assert.equal(doc.header.contacts[0].text, '');
  assert.deepEqual(doc.sections, []);
});

test('only fields actually present are populated; nothing invented for the rest', () => {
  const parsed: ParsedResumeData = {
    header: { name: 'Alex Rivera', email: 'alex@example.com' }, // no title/phone/location
    summary: 'Backend engineer.',
  };
  const doc = convertParsedResumeToEditorDocument(parsed, mintId);
  assert.equal(doc.header.name, 'Alex Rivera');
  assert.equal(doc.header.title, '');
  assert.equal(doc.header.contacts[0].text, 'alex@example.com');
  assert.equal(doc.header.contacts[1].text, '');
  assert.equal(doc.header.contacts[2].text, '');
  assert.equal(findTextSection(doc, 'summary').body, 'Backend engineer.');
  assert.equal(
    doc.sections.some((s) => s.type === 'experience'),
    false,
    'no experience in the source -> no experience section added at all',
  );
});

test('experience dates: full month+year kept exactly, present handled, bullets carried through', () => {
  const parsed: ParsedResumeData = {
    experience: [
      {
        title: 'Engineer',
        company: 'Acme',
        start: { year: 2022, month: 3 },
        end: { year: null, month: null, present: true },
        bullets: ['Shipped X', 'Led Y'],
      },
    ],
  };
  const doc = convertParsedResumeToEditorDocument(parsed, mintId);
  const exp = findEntriesSection(doc, 'experience');
  assert.deepEqual(exp.entries[0].start, { y: 2022, m: 3 });
  assert.equal(exp.entries[0].end, 'present');
  assert.deepEqual(exp.entries[0].contribs, ['Shipped X', 'Led Y']);
});

test('experience section uses the bullets-rendering style, not the paragraph-only default', () => {
  // '4a' (the catalog default) renders only `desc`, which this converter never populates — bullets
  // always go into `contribs`, so '4a' would silently make every parsed bullet invisible.
  const parsed: ParsedResumeData = {
    experience: [{ title: 'Engineer', company: 'Acme', bullets: ['Shipped X'] }],
  };
  const doc = convertParsedResumeToEditorDocument(parsed, mintId);
  const exp = findEntriesSection(doc, 'experience');
  assert.equal(exp.style, '4b');
});

test('a year with no stated month defaults to January of that year, not dropped entirely', () => {
  const parsed: ParsedResumeData = {
    education: [{ institution: 'State University', degree: 'B.S.', end: { year: 2019, month: null } }],
  };
  const doc = convertParsedResumeToEditorDocument(parsed, mintId);
  const edu = findEntriesSection(doc, 'education');
  assert.deepEqual(edu.entries[0].end, { y: 2019, m: 1 });
});

test('a date with no year at all is left null, never fabricated', () => {
  const parsed: ParsedResumeData = {
    experience: [{ title: 'Intern', start: { year: null, month: 6 }, bullets: [] }],
  };
  const doc = convertParsedResumeToEditorDocument(parsed, mintId);
  const exp = findEntriesSection(doc, 'experience');
  assert.equal(exp.entries[0].start, null);
});

test('skills/languages arrays join into comma-separated text bodies', () => {
  const parsed: ParsedResumeData = {
    skills: ['SQL', 'Python', ''],
    languages: ['English', 'Spanish'],
  };
  const doc = convertParsedResumeToEditorDocument(parsed, mintId);
  assert.equal(findTextSection(doc, 'skills').body, 'SQL, Python');
  assert.equal(findTextSection(doc, 'languages').body, 'English, Spanish');
});

test('certifications: a stated year is kept as free text, an absent one stays empty', () => {
  const parsed: ParsedResumeData = {
    certifications: [
      { name: 'AWS Certified', issuer: 'Amazon', year: 2021 },
      { name: 'Some Cert', issuer: null, year: null },
    ],
  };
  const doc = convertParsedResumeToEditorDocument(parsed, mintId);
  const certs = findEntriesSection(doc, 'certifications');
  assert.equal(certs.entries[0].year, '2021');
  assert.equal(certs.entries[1].year, '');
  assert.equal(certs.entries[1].subtitle, '');
});

test('every generated id is unique', () => {
  const parsed: ParsedResumeData = {
    experience: [{ title: 'A' }, { title: 'B' }],
    education: [{ institution: 'C' }],
  };
  const doc = convertParsedResumeToEditorDocument(parsed, mintId);
  const ids: string[] = [];
  doc.sections.forEach((s) => {
    ids.push(s.id);
    if (s.kind === 'entries') s.entries.forEach((e) => ids.push(e.id));
  });
  assert.equal(new Set(ids).size, ids.length);
});
