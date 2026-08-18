import * as E from './resume-review-engine.js';

function assert(name, cond, results) { results.push({ name, pass: !!cond }); }

export function runTests() {
  const results = [];

  // normalizeText
  assert('normalizeText: CRLF -> \\n', E.normalizeText('a\r\nb') === 'a\nb', results);
  assert('normalizeText: trims trailing spaces per line', E.normalizeText('a   \nb') === 'a\nb', results);
  assert('normalizeText: null -> empty string', E.normalizeText(null) === '', results);

  // bul-pronoun rule: positive / negative / boundary
  const pronounRule = E.RULES.find(r => r.ruleId === 'bul-pronoun');
  const resumeWithPronoun = mkResume({ bullets: ['I led the migration project.'] });
  const resumeNoPronoun = mkResume({ bullets: ['Led the migration project.'] });
  const resumeBoundary = mkResume({ bullets: ['Trimmed timelines by reprioritizing scope.'] }); // contains no pronoun, boundary: word "my" substring inside "army" should not match
  assert('bul-pronoun: positive finds "I"', pronounRule.evaluate(resumeWithPronoun).length === 1, results);
  assert('bul-pronoun: negative finds none', pronounRule.evaluate(resumeNoPronoun).length === 0, results);
  const resumeSubstring = mkResume({ bullets: ['Reduced army logistics overhead.'] });
  assert('bul-pronoun: boundary does not match "my" inside "army"', pronounRule.evaluate(resumeSubstring).length === 0, results);

  // cert-expired: positive / negative / boundary (expires this year = not expired)
  const certRule = E.RULES.find(r => r.ruleId === 'cert-expired');
  const year = new Date().getFullYear();
  const expired = { ...mkResume({}), certifications: [{ name: 'Old Cert', expiryYear: year - 1 }] };
  const active = { ...mkResume({}), certifications: [{ name: 'New Cert', expiryYear: year + 1 }] };
  const boundarySameYear = { ...mkResume({}), certifications: [{ name: 'This Year', expiryYear: year }] };
  assert('cert-expired: positive flags past year', certRule.evaluate(expired).length === 1, results);
  assert('cert-expired: negative does not flag future year', certRule.evaluate(active).length === 0, results);
  assert('cert-expired: boundary does not flag current year', certRule.evaluate(boundarySameYear).length === 0, results);

  // con-missing: positive / negative / boundary (empty string counts as missing)
  const conRule = E.RULES.find(r => r.ruleId === 'con-missing');
  const missing = mkResume({}); missing.header.email = '';
  const present = mkResume({}); present.header.email = 'a@b.com'; present.header.phone = '555'; present.header.location = 'X';
  assert('con-missing: positive flags empty email', conRule.evaluate(missing).some(f => f.fieldPath === 'header.email'), results);
  assert('con-missing: negative when all present', conRule.evaluate(present).length === 0, results);

  // capFindings grouping
  const many = Array.from({ length: 5 }, (_, i) => ({ ruleId: 'x', fieldPath: `f${i}`, matchedText: 't', severity: 'warning' }));
  const capped = E.capFindings(many, 3);
  assert('capFindings: caps at 3 with a grouped remainder', capped.length === 3 && capped[2].grouped && capped[2].groupCount === 3, results);
  const few = many.slice(0, 2);
  assert('capFindings: leaves small groups untouched', E.capFindings(few, 3).length === 2, results);

  // mergeOverlaps
  const overlapping = [
    { fieldPath: 'summary', matchedText: 'a', severity: 'suggestion', textRange: { start: 0, end: 5 } },
    { fieldPath: 'summary', matchedText: 'b', severity: 'critical', textRange: { start: 3, end: 8 } }
  ];
  const merged = E.mergeOverlaps(overlapping);
  assert('mergeOverlaps: merges overlapping ranges into one span', merged.length === 1, results);
  assert('mergeOverlaps: picks the highest severity', merged[0] && merged[0].severity === 'critical', results);
  const nonOverlapping = [
    { fieldPath: 'summary', matchedText: 'a', severity: 'warning', textRange: { start: 0, end: 2 } },
    { fieldPath: 'summary', matchedText: 'b', severity: 'warning', textRange: { start: 10, end: 12 } }
  ];
  assert('mergeOverlaps: keeps disjoint ranges separate', E.mergeOverlaps(nonOverlapping).length === 2, results);

  // reanchorFinding after an edit shifts offsets
  const resume = mkResume({ bullets: ['Managed the rollout of a new billing system.'] });
  const finding = { fieldPath: 'experience[0].bullets[0]', matchedText: 'Managed', textRange: { start: 0, end: 7 } };
  const editedResume = JSON.parse(JSON.stringify(resume));
  editedResume.experience[0].bullets[0] = 'In Q3, Managed the rollout of a new billing system.';
  const reanchored = E.reanchorFinding(finding, editedResume);
  assert('reanchorFinding: relocates matchedText after text shifts', reanchored.resolved === true && reanchored.textRange.start === 7, results);
  const brokenResume = JSON.parse(JSON.stringify(resume));
  brokenResume.experience[0].bullets[0] = 'Owned the rollout of a new billing system.';
  const unresolved = E.reanchorFinding(finding, brokenResume);
  assert('reanchorFinding: marks unresolved when text truly changed', unresolved.unresolved === true, results);

  const passed = results.filter(r => r.pass).length;
  return { total: results.length, passed, failed: results.length - passed, results };
}

function mkResume({ bullets }) {
  return {
    header: { name: 'Test User', title: 'Engineer', email: 'test@example.com', phone: '555-0100', location: 'Remote', linkedin: '', github: '' },
    summary: 'Engineer with experience shipping products.',
    experience: [{ title: 'Engineer', company: 'Acme', location: 'Remote', start: { y: 2020, m: 1 }, end: 'present', bullets: bullets || [] }],
    education: [], skills: '', certifications: [], projects: []
  };
}
