import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from './resume-review-engine.ts';

function mkResume({ bullets }: { bullets?: string[] }) {
  return {
    header: {
      name: 'Test User',
      title: 'Engineer',
      email: 'test@example.com',
      phone: '555-0100',
      location: 'Remote',
      linkedin: '',
      github: '',
    },
    summary: 'Engineer with experience shipping products.',
    experience: [
      {
        title: 'Engineer',
        company: 'Acme',
        location: 'Remote',
        start: { y: 2020, m: 1 },
        end: 'present',
        bullets: bullets || [],
      },
    ],
    education: [],
    skills: '',
    certifications: [],
    projects: [],
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
  const rule = E.RULES.find((r) => r.ruleId === 'bul-pronoun')!;
  assert.equal(
    rule.evaluate(mkResume({ bullets: ['I led the migration project.'] })).length,
    1,
    'positive finds "I"',
  );
  assert.equal(
    rule.evaluate(mkResume({ bullets: ['Led the migration project.'] })).length,
    0,
    'negative finds none',
  );
  // boundary: the word "my" as a substring of "army" must not match
  assert.equal(
    rule.evaluate(mkResume({ bullets: ['Reduced army logistics overhead.'] })).length,
    0,
    'boundary does not match "my" inside "army"',
  );
});

test('cert-expired: positive / negative / boundary', () => {
  const rule = E.RULES.find((r) => r.ruleId === 'cert-expired')!;
  const year = new Date().getFullYear();
  const expired = { ...mkResume({}), certifications: [{ name: 'Old Cert', expiryYear: year - 1 }] };
  const active = { ...mkResume({}), certifications: [{ name: 'New Cert', expiryYear: year + 1 }] };
  const boundarySameYear = {
    ...mkResume({}),
    certifications: [{ name: 'This Year', expiryYear: year }],
  };
  assert.equal(rule.evaluate(expired).length, 1, 'positive flags past year');
  assert.equal(rule.evaluate(active).length, 0, 'negative does not flag future year');
  assert.equal(rule.evaluate(boundarySameYear).length, 0, 'boundary does not flag current year');
});

test('con-missing: positive / negative', () => {
  const rule = E.RULES.find((r) => r.ruleId === 'con-missing')!;
  const missing = mkResume({});
  missing.header.email = '';
  const present = mkResume({});
  present.header.email = 'a@b.com';
  present.header.phone = '555';
  present.header.location = 'X';
  assert.ok(
    rule.evaluate(missing).some((f) => f.fieldPath === 'header.email'),
    'positive flags empty email',
  );
  assert.equal(rule.evaluate(present).length, 0, 'negative when all present');
});

test('capFindings: caps at 3 with a grouped remainder', () => {
  const many = Array.from({ length: 5 }, (_, i) => ({
    ruleId: 'x',
    fieldPath: `f${i}`,
    matchedText: 't',
    severity: 'warning',
  })) as E.Finding[];
  const capped = E.capFindings(many, 3);
  assert.equal(capped.length, 3);
  assert.equal(capped[2].grouped, true);
  assert.equal(capped[2].groupCount, 3);
});
test('capFindings: leaves small groups untouched', () => {
  const few = Array.from({ length: 2 }, (_, i) => ({
    ruleId: 'x',
    fieldPath: `f${i}`,
    matchedText: 't',
    severity: 'warning',
  })) as E.Finding[];
  assert.equal(E.capFindings(few, 3).length, 2);
});

test('mergeOverlaps: merges overlapping ranges and picks the highest severity', () => {
  const overlapping = [
    {
      fieldPath: 'summary',
      matchedText: 'a',
      severity: 'suggestion',
      textRange: { start: 0, end: 5 },
    },
    {
      fieldPath: 'summary',
      matchedText: 'b',
      severity: 'critical',
      textRange: { start: 3, end: 8 },
    },
  ] as E.Finding[];
  const merged = E.mergeOverlaps(overlapping);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].severity, 'critical');
});
test('mergeOverlaps: keeps disjoint ranges separate', () => {
  const nonOverlapping = [
    {
      fieldPath: 'summary',
      matchedText: 'a',
      severity: 'warning',
      textRange: { start: 0, end: 2 },
    },
    {
      fieldPath: 'summary',
      matchedText: 'b',
      severity: 'warning',
      textRange: { start: 10, end: 12 },
    },
  ] as E.Finding[];
  assert.equal(E.mergeOverlaps(nonOverlapping).length, 2);
});

test('reanchorFinding: relocates matchedText after an edit shifts offsets', () => {
  const resume = mkResume({ bullets: ['Managed the rollout of a new billing system.'] });
  const finding = {
    fieldPath: 'experience[0].bullets[0]',
    matchedText: 'Managed',
    textRange: { start: 0, end: 7 },
  } as E.Finding;
  const editedResume = JSON.parse(JSON.stringify(resume));
  editedResume.experience[0].bullets[0] = 'In Q3, Managed the rollout of a new billing system.';
  const reanchored = E.reanchorFinding(finding, editedResume);
  assert.equal(reanchored.resolved, true);
  assert.equal(reanchored.textRange!.start, 7);
});
test('reanchorFinding: marks unresolved when the text truly changed', () => {
  const resume = mkResume({ bullets: ['Managed the rollout of a new billing system.'] });
  const finding = {
    fieldPath: 'experience[0].bullets[0]',
    matchedText: 'Managed',
    textRange: { start: 0, end: 7 },
  } as E.Finding;
  const brokenResume = JSON.parse(JSON.stringify(resume));
  brokenResume.experience[0].bullets[0] = 'Owned the rollout of a new billing system.';
  assert.equal(E.reanchorFinding(finding, brokenResume).unresolved, true);
});

test('bul-responsible: message-only, no concrete suggestion to apply', () => {
  const rule = E.RULES.find((r) => r.ruleId === 'bul-responsible')!;
  const [finding] = rule.evaluate(
    mkResume({ bullets: ['Responsible for the onboarding process.'] }),
  );
  assert.equal(finding.matchedText, 'Responsible for');
  assert.equal(finding.suggestion, undefined);
});

test('rem-references: suggestion deletes the flagged text', () => {
  const rule = E.RULES.find((r) => r.ruleId === 'rem-references')!;
  const resume = mkResume({});
  resume.summary = 'References available upon request.';
  const [finding] = rule.evaluate(resume);
  assert.equal(finding.matchedText, 'References available upon request');
  assert.equal(finding.suggestion, '');
});

test('rem-salary: suggestion deletes the flagged text', () => {
  const rule = E.RULES.find((r) => r.ruleId === 'rem-salary')!;
  const resume = mkResume({});
  resume.summary = 'Targeting a base salary of $95,000.';
  const [finding] = rule.evaluate(resume);
  assert.equal(finding.suggestion, '');
});

test('bul-duplicate: suggestion deletes the whole duplicate bullet', () => {
  const rule = E.RULES.find((r) => r.ruleId === 'bul-duplicate')!;
  const resume = mkResume({
    bullets: ['Shipped the billing redesign.', 'Shipped the billing redesign.'],
  });
  const [finding] = rule.evaluate(resume);
  assert.equal(finding.matchedText, 'Shipped the billing redesign.');
  assert.equal(finding.suggestion, '');
});

test('gw-repeat-word: suggestion collapses to a single occurrence', () => {
  const rule = E.RULES.find((r) => r.ruleId === 'gw-repeat-word')!;
  const resume = mkResume({});
  resume.summary = 'Planned the the launch.';
  const [finding] = rule.evaluate(resume);
  assert.equal(finding.matchedText, 'the the');
  assert.equal(finding.suggestion, 'the');
});

test('fmt-dates: suggestion normalizes comma spacing', () => {
  const rule = E.RULES.find((r) => r.ruleId === 'fmt-dates')!;
  const resume = {
    ...mkResume({}),
    experience: [
      { ...mkResume({}).experience[0], location: 'Austin, TX' },
      { ...mkResume({}).experience[0], location: 'Dallas,TX' },
    ],
  };
  const [finding] = rule.evaluate(resume);
  assert.equal(finding.matchedText, 'Dallas,TX');
  assert.equal(finding.suggestion, 'Dallas, TX');
});

test('cons-titlecase: suggestion capitalizes the first letter only', () => {
  const rule = E.RULES.find((r) => r.ruleId === 'cons-titlecase')!;
  const resume = {
    ...mkResume({}),
    experience: [
      { ...mkResume({}).experience[0], title: 'Senior Engineer' },
      { ...mkResume({}).experience[0], title: 'staff engineer' },
    ],
  };
  const [finding] = rule.evaluate(resume);
  assert.equal(finding.matchedText, 'staff engineer');
  assert.equal(finding.suggestion, 'Staff engineer');
});

test('sk-stuffing: dedup suggestion replaces the whole field, preserving first occurrence', () => {
  const rule = E.RULES.find((r) => r.ruleId === 'sk-stuffing')!;
  const resume = { ...mkResume({}), skills: 'SQL, Excel, sql, Python' };
  const findings = rule.evaluate(resume);
  const dupFinding = findings.find((f) => f.matchedText === resume.skills)!;
  assert.ok(dupFinding, 'flags the whole field as matchedText, not the bare duplicate word');
  assert.equal(dupFinding.suggestion, 'SQL, Excel, Python');
  assert.match(dupFinding.message, /"sql"/i);
});
test('sk-stuffing: long list gets a finding but no invented suggestion', () => {
  const rule = E.RULES.find((r) => r.ruleId === 'sk-stuffing')!;
  const skills = Array.from({ length: 30 }, (_, i) => `Skill${i}`).join(', ');
  const resume = { ...mkResume({}), skills };
  const findings = rule.evaluate(resume);
  const longFinding = findings.find((f) => f.message.includes('Long skills list'))!;
  assert.ok(longFinding);
  assert.equal(longFinding.suggestion, undefined);
});
test('sk-stuffing: no duplicates -> no finding', () => {
  const rule = E.RULES.find((r) => r.ruleId === 'sk-stuffing')!;
  const resume = { ...mkResume({}), skills: 'SQL, Excel, Python' };
  assert.equal(rule.evaluate(resume).length, 0);
});

const EMPTY_RESUME = {
  header: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '' },
  summary: '',
  experience: [],
  education: [],
  skills: '',
  certifications: [],
  projects: [],
};
const COMPLETE_RESUME = {
  header: {
    name: 'Test User',
    title: 'Engineer',
    email: 'test@example.com',
    phone: '555-0100',
    location: 'Remote',
    linkedin: '',
    github: '',
  },
  summary: 'Engineer with eight years of experience shipping web applications and leading teams.',
  experience: [
    {
      title: 'Engineer',
      company: 'Acme',
      location: 'Remote',
      start: { y: 2020, m: 1 },
      end: 'present',
      bullets: ['Shipped a component library adopted across four product teams.'],
    },
  ],
  education: [{ institution: 'State University', degree: 'B.S. Computer Science', field: '', gradYear: 2019 }],
  skills: 'TypeScript, React, Node.js',
  certifications: [],
  projects: [],
};

test('computeCompletenessRatio: a fully empty resume fails every check', () => {
  const result = E.computeCompletenessRatio(EMPTY_RESUME);
  assert.equal(result.ratio, 0);
  assert.equal(result.passed, 0);
  assert.equal(result.missing.length, result.total);
});
test('computeCompletenessRatio: a complete resume passes every check', () => {
  const result = E.computeCompletenessRatio(COMPLETE_RESUME);
  assert.equal(result.ratio, 1);
  assert.equal(result.missing.length, 0);
});
test('computeCompletenessRatio: contact info needs at least 2 of email/phone/location', () => {
  const oneContact = { ...COMPLETE_RESUME, header: { ...COMPLETE_RESUME.header, phone: '', location: '' } };
  assert.ok(E.computeCompletenessRatio(oneContact).missing.includes('Contact info'));
});
test('computeCompletenessRatio: a short summary does not count as present', () => {
  const shortSummary = { ...COMPLETE_RESUME, summary: 'Engineer.' };
  assert.ok(E.computeCompletenessRatio(shortSummary).missing.includes('Summary'));
});

test('computeScore: an empty resume scores near zero even with zero findings (the reported bug)', () => {
  // This is the actual bug report: a resume with nothing filled in was scoring 90+, because no
  // rule can find a *grammar/style* problem in text that doesn't exist, and the rules that flag
  // the emptiness itself (sum-missing, exp-missing-fields, ...) were never wired into the score.
  const { total } = E.computeScore([], EMPTY_RESUME);
  assert.equal(total, 0);
});
test('computeScore: a fully complete, finding-free resume still scores 100', () => {
  const { total, buckets } = E.computeScore([], COMPLETE_RESUME);
  assert.equal(total, 100);
  buckets.forEach((b) => assert.equal(b.score, b.max));
});
test('computeScore: partial completeness scales every bucket proportionally, not just one', () => {
  const halfComplete = {
    ...COMPLETE_RESUME,
    education: [],
    skills: '',
    experience: [],
  }; // 3 of 6 checks pass: header, contact, summary
  const { total, buckets } = E.computeScore([], halfComplete);
  buckets.forEach((b) => assert.equal(b.score, Math.round(b.max * 0.5)));
  // Not exactly 100*3/6=50: each bucket independently rounds (matches the pre-existing per-bucket
  // rounding this function already did before this fix), so the two 15-max buckets both round
  // 7.5 up to 8 with nothing rounding down to compensate.
  assert.equal(
    total,
    buckets.reduce((s, b) => s + b.score, 0),
  );
  assert.ok(total >= 49 && total <= 51, `expected total close to 50, got ${total}`);
});

test('runDeterministicRules: an intentional empty-string suggestion survives as "" not null', () => {
  const resume = mkResume({
    bullets: ['Shipped the billing redesign.', 'Shipped the billing redesign.'],
  });
  const findings = E.runDeterministicRules(resume);
  const dup = findings.find((f) => f.ruleId === 'bul-duplicate')!;
  assert.ok(dup, 'bul-duplicate finding present');
  assert.equal(dup.suggestion, '', 'suggestion is an intentional empty string, not null');
});
