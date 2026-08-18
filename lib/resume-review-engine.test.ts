import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from './resume-review-engine.ts';

function mkResume({ bullets }: { bullets?: string[] }) {
  return {
    header: { name: 'Test User', title: 'Engineer', email: 'test@example.com', phone: '555-0100', location: 'Remote', linkedin: '', github: '' },
    summary: 'Engineer with experience shipping products.',
    experience: [{ title: 'Engineer', company: 'Acme', location: 'Remote', start: { y: 2020, m: 1 }, end: 'present', bullets: bullets || [] }],
    education: [], skills: '', certifications: [], projects: []
  };
}

test('normalizeText: CRLF -> \\n', () => {
  assert.equal(E.normalizeText('a\r\nb'), 'a\nb');
});
test('normalizeText: trims trailing spaces per line', () => {
  assert.equal(E.normalizeText('a   \nb'), 'a\nb');
});
test('normalizeText: null -> empty string', () => {
  assert.equal(E.normalizeText(null), '');
});

test('bul-pronoun: positive / negative / boundary', () => {
  const rule = E.RULES.find(r => r.ruleId === 'bul-pronoun')!;
  assert.equal(rule.evaluate(mkResume({ bullets: ['I led the migration project.'] })).length, 1, 'positive finds "I"');
  assert.equal(rule.evaluate(mkResume({ bullets: ['Led the migration project.'] })).length, 0, 'negative finds none');
  // boundary: the word "my" as a substring of "army" must not match
  assert.equal(rule.evaluate(mkResume({ bullets: ['Reduced army logistics overhead.'] })).length, 0, 'boundary does not match "my" inside "army"');
});

test('cert-expired: positive / negative / boundary', () => {
  const rule = E.RULES.find(r => r.ruleId === 'cert-expired')!;
  const year = new Date().getFullYear();
  const expired = { ...mkResume({}), certifications: [{ name: 'Old Cert', expiryYear: year - 1 }] };
  const active = { ...mkResume({}), certifications: [{ name: 'New Cert', expiryYear: year + 1 }] };
  const boundarySameYear = { ...mkResume({}), certifications: [{ name: 'This Year', expiryYear: year }] };
  assert.equal(rule.evaluate(expired).length, 1, 'positive flags past year');
  assert.equal(rule.evaluate(active).length, 0, 'negative does not flag future year');
  assert.equal(rule.evaluate(boundarySameYear).length, 0, 'boundary does not flag current year');
});

test('con-missing: positive / negative', () => {
  const rule = E.RULES.find(r => r.ruleId === 'con-missing')!;
  const missing = mkResume({}); missing.header.email = '';
  const present = mkResume({});
  present.header.email = 'a@b.com'; present.header.phone = '555'; present.header.location = 'X';
  assert.ok(rule.evaluate(missing).some(f => f.fieldPath === 'header.email'), 'positive flags empty email');
  assert.equal(rule.evaluate(present).length, 0, 'negative when all present');
});

test('capFindings: caps at 3 with a grouped remainder', () => {
  const many = Array.from({ length: 5 }, (_, i) => ({ ruleId: 'x', fieldPath: `f${i}`, matchedText: 't', severity: 'warning' })) as E.Finding[];
  const capped = E.capFindings(many, 3);
  assert.equal(capped.length, 3);
  assert.equal(capped[2].grouped, true);
  assert.equal(capped[2].groupCount, 3);
});
test('capFindings: leaves small groups untouched', () => {
  const few = Array.from({ length: 2 }, (_, i) => ({ ruleId: 'x', fieldPath: `f${i}`, matchedText: 't', severity: 'warning' })) as E.Finding[];
  assert.equal(E.capFindings(few, 3).length, 2);
});

test('mergeOverlaps: merges overlapping ranges and picks the highest severity', () => {
  const overlapping = [
    { fieldPath: 'summary', matchedText: 'a', severity: 'suggestion', textRange: { start: 0, end: 5 } },
    { fieldPath: 'summary', matchedText: 'b', severity: 'critical', textRange: { start: 3, end: 8 } }
  ] as E.Finding[];
  const merged = E.mergeOverlaps(overlapping);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].severity, 'critical');
});
test('mergeOverlaps: keeps disjoint ranges separate', () => {
  const nonOverlapping = [
    { fieldPath: 'summary', matchedText: 'a', severity: 'warning', textRange: { start: 0, end: 2 } },
    { fieldPath: 'summary', matchedText: 'b', severity: 'warning', textRange: { start: 10, end: 12 } }
  ] as E.Finding[];
  assert.equal(E.mergeOverlaps(nonOverlapping).length, 2);
});

test('reanchorFinding: relocates matchedText after an edit shifts offsets', () => {
  const resume = mkResume({ bullets: ['Managed the rollout of a new billing system.'] });
  const finding = { fieldPath: 'experience[0].bullets[0]', matchedText: 'Managed', textRange: { start: 0, end: 7 } } as E.Finding;
  const editedResume = JSON.parse(JSON.stringify(resume));
  editedResume.experience[0].bullets[0] = 'In Q3, Managed the rollout of a new billing system.';
  const reanchored = E.reanchorFinding(finding, editedResume);
  assert.equal(reanchored.resolved, true);
  assert.equal(reanchored.textRange!.start, 7);
});
test('reanchorFinding: marks unresolved when the text truly changed', () => {
  const resume = mkResume({ bullets: ['Managed the rollout of a new billing system.'] });
  const finding = { fieldPath: 'experience[0].bullets[0]', matchedText: 'Managed', textRange: { start: 0, end: 7 } } as E.Finding;
  const brokenResume = JSON.parse(JSON.stringify(resume));
  brokenResume.experience[0].bullets[0] = 'Owned the rollout of a new billing system.';
  assert.equal(E.reanchorFinding(finding, brokenResume).unresolved, true);
});
