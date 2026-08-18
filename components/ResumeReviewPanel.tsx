'use client';

import React from 'react';
import * as E from '@/lib/resume-review-engine';
import type { Finding, Severity } from '@/lib/resume-review-engine';
import { complete } from '@/lib/complete';
import '@/styles/resume-review-panel.css';

const MS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SEV_META: Record<Severity, { color: string; label: string }> = {
  critical: { color: '#B04A42', label: 'Critical' },
  warning: { color: '#C68A2E', label: 'Warning' },
  suggestion: { color: '#6E7B8B', label: 'Suggestion' },
};
const SEV_RANK: Record<string, number> = { critical: 3, warning: 2, suggestion: 1 };

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}
function tokenize(path: string): Array<string | number> {
  const out: Array<string | number> = [];
  path.split('.').forEach(part => {
    const m = part.match(/^([a-zA-Z0-9_]+)((?:\[\d+\])*)$/);
    if (!m) return;
    out.push(m[1]);
    (m[2].match(/\[(\d+)\]/g) || []).forEach(i => out.push(Number(i.slice(1, -1))));
  });
  return out;
}
function setP(obj: any, path: string, val: any) {
  const t = tokenize(path);
  let c = obj;
  for (let i = 0; i < t.length - 1; i++) c = c[t[i]];
  c[t[t.length - 1]] = val;
}

interface Review {
  version: string;
  findings: Finding[];
  det: Finding[];
  score: { total: number; buckets: Array<{ id: string; label: string; max: number; score: number }> };
  generatedAt: number;
  judgmentStatus: { writingQuality: string; contentQuality: string };
}

interface PanelState {
  resume: any;
  reviewsByVersion: Record<string, Review>;
  dismissed: Set<string>;
  status: 'idle' | 'generating';
  progress: { done: number; total: number; label: string } | null;
  filterCategory: string;
  filterSeverity: string;
  showDismissed: boolean;
  showSkipped: boolean;
}

export default class ResumeReviewPanel extends React.Component<Record<string, never>, PanelState> {
  private _fieldRefs: Record<string, HTMLInputElement | HTMLTextAreaElement> = {};
  private _resumePaneEl: HTMLDivElement | null = null;
  private _inFlightVersionId: string | null = null;
  private _snap: { p: string; v: string } | null = null;
  private _E = E;

  constructor(props: Record<string, never>) {
    super(props);
    // Read synchronously, as the prototype did, so a reload with a stored review renders the
    // result state on the first paint instead of flashing the empty state. Safe because the
    // route mounts this component client-only (see app/review/page.tsx).
    let reviewsByVersion: Record<string, Review> = {};
    let dismissed: string[] = [];
    try { reviewsByVersion = JSON.parse(localStorage.getItem('rrp.reviews') || '{}'); } catch { /* ignore */ }
    try { dismissed = JSON.parse(localStorage.getItem('rrp.dismissed') || '[]'); } catch { /* ignore */ }
    this.state = {
      resume: this.sampleResume(),
      reviewsByVersion, dismissed: new Set(dismissed),
      status: 'idle', progress: null,
      filterCategory: 'all', filterSeverity: 'all', showDismissed: false, showSkipped: false,
    };
  }

  sampleResume() {
    return {
      header: { name: 'Jordan Lee', title: 'Senior Product Manager', email: 'jlee12345xyz@gmail.com', phone: '(555) 019-2834', location: 'Austin, TX', linkedin: 'linkedin.com/in/jordanleepm', github: 'my portfolio site' },
      summary: 'I am a hard-working and motivated product manager with experience leading teams. I am a team player who always gives 110%. References available upon request.',
      experience: [
        { title: 'Senior Product Manager', company: 'Northwind Cloud', location: 'Austin, TX', start: { y: 2023, m: 1 }, end: 'present', bullets: [
          'Responsible for the product roadmap and worked on cross-team alignment.',
          'Increased user engagement significantly across the platform.',
          'Managed a team of designers and engineers to launch new features.',
        ] },
        { title: 'product manager', company: 'Bluebird Systems', location: 'Remote', start: { y: 2019, m: 6 }, end: { y: 2022, m: 11 }, bullets: [
          'Managed the backlog for three engineering pods.',
          'Managed vendor relationships and contract negotiations.',
          'Reduced the the onboarding time for new customers.',
        ] },
        { title: 'Associate PM', company: 'Bluebird Systems', location: 'Austin,TX', start: { y: 2021, m: 1 }, end: { y: 2021, m: 8 }, bullets: [
          'Helped with sprint planning and helped the team ship on time.',
        ] },
      ],
      education: [{ institution: 'University of Texas at Austin', degree: 'B.B.A.', field: 'Marketing', gradYear: 2015 }],
      skills: 'Product Strategy, Roadmapping, SQL, SQL, A/B Testing, Stakeholder Management',
      certifications: [{ name: 'Certified Scrum Product Owner', issuer: 'Scrum Alliance', expiryYear: 2020 }],
      projects: [{ name: 'Internal Analytics Revamp', tech: '', outcome: 'Targeting a base salary of $95,000 in this role.', bullets: ['Led redesign of internal analytics dashboards used by 40+ stakeholders.'] }],
    };
  }

  formatDate(d: any) { if (!d) return ''; if (d === 'present') return 'Present'; return MS[d.m - 1] + ' ' + d.y; }

  onEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const path = e.target.dataset.path!;
    const value = e.target.value;
    this.setState(s => { const resume = structuredClone(s.resume); setP(resume, path, value); return { resume }; });
  };
  onFocusF = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this._snap = { p: e.target.dataset.path!, v: e.target.value };
  };
  esc(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === 'Escape' && this._snap && this._snap.p === (e.target as HTMLElement).dataset.path) {
      e.preventDefault();
      const snap = this._snap;
      this.setState(s => { const resume = structuredClone(s.resume); setP(resume, snap.p, snap.v); return { resume }; });
      (e.target as HTMLInputElement).blur();
    }
  }
  onKeyS = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } else this.esc(e);
  };
  onKeyM = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => this.esc(e);
  fieldRef = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (el && el.dataset && el.dataset.path) this._fieldRefs[el.dataset.path] = el;
  };
  resumePaneRef = (el: HTMLDivElement | null) => { this._resumePaneEl = el; };
  mut(fn: (resume: any) => void) {
    this.setState(s => { const resume = structuredClone(s.resume); fn(resume); return { resume }; });
  }
  addExperience = () => this.mut(r => r.experience.push({ title: '', company: '', location: '', start: null, end: null, bullets: [''] }));
  addEducation = () => this.mut(r => r.education.push({ institution: '', degree: '', field: '', gradYear: null }));
  addCertification = () => this.mut(r => r.certifications.push({ name: '', issuer: '', expiryYear: null }));
  addProject = () => this.mut(r => r.projects.push({ name: '', tech: '', outcome: '', bullets: [''] }));

  jumpToFinding(f: Finding) {
    if (!f.fieldPath) return;
    const el = this._fieldRefs[f.fieldPath];
    if (el && this._resumePaneEl) {
      const paneRect = this._resumePaneEl.getBoundingClientRect(), elRect = el.getBoundingClientRect();
      this._resumePaneEl.scrollTop += (elRect.top - paneRect.top) - paneRect.height / 2 + elRect.height / 2;
      el.focus();
      if (f.textRange && el.setSelectionRange) { try { el.setSelectionRange(f.textRange.start, f.textRange.end); } catch { /* ignore */ } }
    }
  }
  dismissFinding(f: Finding) {
    const key = this._E.dismissKey(f);
    const s = new Set(this.state.dismissed); s.add(key);
    try { localStorage.setItem('rrp.dismissed', JSON.stringify([...s])); } catch { /* ignore */ }
    this.setState({ dismissed: s });
  }
  restoreFinding(f: Finding) {
    const key = this._E.dismissKey(f);
    const s = new Set(this.state.dismissed); s.delete(key);
    try { localStorage.setItem('rrp.dismissed', JSON.stringify([...s])); } catch { /* ignore */ }
    this.setState({ dismissed: s });
  }
  saveReview(vid: string, review: Review) {
    this.setState(s => {
      const map = { ...s.reviewsByVersion, [vid]: review };
      try { localStorage.setItem('rrp.reviews', JSON.stringify(map)); } catch { /* ignore */ }
      return { reviewsByVersion: map };
    });
  }
  buildReview(Eng: typeof E, vid: string, findings: Finding[], judgmentStatus: Review['judgmentStatus'], det: Finding[]): Review {
    const capped = Eng.capFindings(findings, 3);
    const score = Eng.computeScore(capped);
    return { version: vid, findings: capped, det, score, generatedAt: Date.now(), judgmentStatus };
  }

  async parseJudgment(text: string, validFields: Set<string>, resume: any, categoryMap: Record<string, string>): Promise<Finding[]> {
    const Eng = this._E;
    let arr: any;
    try { arr = JSON.parse(text); } catch { const m = text.match(/\[[\s\S]*\]/); if (!m) throw new Error('bad json'); arr = JSON.parse(m[0]); }
    if (!Array.isArray(arr)) throw new Error('not array');
    const out: Finding[] = [];
    for (const item of arr) {
      if (!item || typeof item !== 'object') continue;
      const { ruleId, fieldPath, matchedText, severity, message } = item;
      if (!ruleId || !categoryMap[ruleId]) continue;
      if (!fieldPath || !validFields.has(fieldPath)) continue;
      if (!['critical', 'warning', 'suggestion'].includes(severity)) continue;
      if (typeof message !== 'string' || !message.trim()) continue;
      const fieldText = Eng.normalizeText(Eng.getByPath(resume, fieldPath));
      if (typeof matchedText !== 'string' || !matchedText || fieldText.indexOf(matchedText) < 0) continue;
      const i = fieldText.indexOf(matchedText);
      out.push({ ruleId, category: categoryMap[ruleId], severity, scope: 'field', fieldPath, matchedText, message, suggestion: typeof item.suggestion === 'string' ? item.suggestion : null, textRange: { start: i, end: i + matchedText.length } });
    }
    return out;
  }
  async runJudgmentA(resume: any) {
    const Eng = this._E;
    const fields: Array<{ fieldPath: string; text: string }> = [];
    fields.push({ fieldPath: 'summary', text: Eng.normalizeText(resume.summary) });
    (resume.experience || []).forEach((e: any, i: number) => (e.bullets || []).forEach((b: string, j: number) => fields.push({ fieldPath: `experience[${i}].bullets[${j}]`, text: Eng.normalizeText(b) })));
    (resume.projects || []).forEach((p: any, i: number) => (p.bullets || []).forEach((b: string, j: number) => fields.push({ fieldPath: `projects[${i}].bullets[${j}]`, text: Eng.normalizeText(b) })));
    const validFields = new Set(fields.map(f => f.fieldPath));
    const prompt = `You are a resume reviewer. Given these resume text fields as JSON, find issues in three categories only: (1) generic/non-specific professional summary wording (ruleId "sum-generic-ai", only for fieldPath "summary"), (2) bullets that state an action but no impact or result (ruleId "bul-impact"), (3) grammar or spelling errors (ruleId "gw-grammar" for grammar, "gw-spelling" for spelling).
Return ONLY a JSON array, no prose, no markdown fences. Each item: {"ruleId":"...","fieldPath":"...","matchedText":"...","severity":"critical"|"warning"|"suggestion","message":"...","suggestion":"..."}.
fieldPath MUST be exactly one of the provided field paths. matchedText MUST be an exact verbatim substring copied from that field's text. If nothing to flag, return [].
Fields:
${JSON.stringify(fields)}`;
    const text = await complete(prompt);
    return this.parseJudgment(text, validFields, resume, { 'sum-generic-ai': 'summary', 'bul-impact': 'bullets', 'gw-grammar': 'grammar', 'gw-spelling': 'grammar' });
  }
  async runJudgmentB(resume: any) {
    const Eng = this._E;
    const fields: Array<{ fieldPath: string; title: string; bullets: string[] }> = [];
    (resume.experience || []).forEach((e: any, i: number) => fields.push({ fieldPath: `experience[${i}].title`, title: e.title, bullets: (e.bullets || []).map((b: string) => Eng.normalizeText(b)) }));
    const validFields = new Set(fields.map(f => f.fieldPath));
    const prompt = `You are a resume reviewer assessing seniority signal. For each role below, decide if the job title implies people-leadership or seniority (Manager, Lead, Director, Head, Principal, Staff, etc.) but the bullets don't demonstrate ownership, team leadership, or scope (headcount, budget, mentoring, cross-functional coordination). Only flag genuine mismatches.
Return ONLY a JSON array, no prose. Each item: {"ruleId":"sen-leadership","fieldPath":"...","matchedText":"...","severity":"suggestion"|"warning","message":"...","suggestion":"..."}.
fieldPath must be exactly one of the role's fieldPath values below. matchedText must be an exact verbatim substring of that role's title. If nothing to flag, return [].
Roles:
${JSON.stringify(fields)}`;
    const text = await complete(prompt);
    return this.parseJudgment(text, validFields, resume, { 'sen-leadership': 'seniority' });
  }

  async generateReview(force: boolean) {
    const Eng = this._E;
    const resume = structuredClone(this.state.resume);
    const vid = Eng.computeVersionId(resume);
    if (this.state.status === 'generating' && this._inFlightVersionId === vid) return;
    if (!force && this.state.reviewsByVersion[vid]) return;
    this._inFlightVersionId = vid;
    const cats = Eng.CATEGORIES.filter(c => !c.requiresJD);
    const total = cats.length + 2;
    this.setState({ status: 'generating', progress: { done: 0, total, label: 'Running checklist rules…' } });
    let det: Finding[] = [];
    try { det = Eng.runDeterministicRules(resume); } catch { det = []; }
    for (let i = 0; i < cats.length; i++) { await sleep(25); this.setState({ progress: { done: i + 1, total, label: 'Checked ' + cats[i].name } }); }
    this.saveReview(vid, this.buildReview(Eng, vid, det, { writingQuality: 'pending', contentQuality: 'pending' }, det));
    this.setState({ progress: { done: cats.length, total, label: 'Analyzing writing quality with Claude…' } });
    let judgA: Finding[] = [], statusA = 'ok';
    try { judgA = await withTimeout(this.runJudgmentA(resume), 15000); } catch { statusA = 'error'; }
    this.setState({ progress: { done: cats.length + 1, total, label: 'Checking leadership signal…' } });
    let judgB: Finding[] = [], statusB = 'ok';
    try { judgB = await withTimeout(this.runJudgmentB(resume), 15000); } catch { statusB = 'error'; }
    const finalReview = this.buildReview(Eng, vid, [...det, ...judgA, ...judgB], { writingQuality: statusA, contentQuality: statusB }, det);
    this.saveReview(vid, finalReview);
    this._inFlightVersionId = null;
    this.setState({ status: 'idle', progress: null });
  }
  async retryJudgment() {
    const Eng = this._E;
    const resume = structuredClone(this.state.resume);
    const vid = Eng.computeVersionId(resume);
    const review = this.state.reviewsByVersion[vid];
    if (!review || this.state.status === 'generating') { return this.generateReview(true); }
    this._inFlightVersionId = vid;
    this.setState({ status: 'generating', progress: { done: 0, total: 2, label: 'Retrying AI analysis…' } });
    let judgA: Finding[] = [], statusA = review.judgmentStatus.writingQuality;
    if (statusA !== 'ok') { try { judgA = await withTimeout(this.runJudgmentA(resume), 15000); statusA = 'ok'; } catch { statusA = 'error'; } }
    let judgB: Finding[] = [], statusB = review.judgmentStatus.contentQuality;
    if (statusB !== 'ok') { try { judgB = await withTimeout(this.runJudgmentB(resume), 15000); statusB = 'ok'; } catch { statusB = 'error'; } }
    const finalReview = this.buildReview(Eng, vid, [...review.det, ...judgA, ...judgB], { writingQuality: statusA, contentQuality: statusB }, review.det);
    this.saveReview(vid, finalReview);
    this._inFlightVersionId = null;
    this.setState({ status: 'idle', progress: null });
  }

  renderVals(): any {
    const Eng = this._E, resume = this.state.resume, s = this.state;
    const col = (path: string, map: Record<string, { sev: string; color: string }>) => (map && map[path]) ? map[path].color : 'transparent';
    let review: Review | null = null;
    const colorMap: Record<string, { sev: string; color: string }> = {};
    {
      const currentVid = Eng.computeVersionId(resume);
      review = s.reviewsByVersion[currentVid] || null;
      const isStaleLookup = !review;
      let latest = review;
      if (isStaleLookup) {
        const all = Object.values(s.reviewsByVersion);
        if (all.length) latest = all.sort((a, b) => b.generatedAt - a.generatedAt)[0];
      }
      review = latest;
      if (review) {
        review.findings.forEach(f => {
          if (!f.fieldPath || f.grouped) return;
          if (s.dismissed.has(Eng.dismissKey(f))) return;
          const re = Eng.reanchorFinding(f, resume);
          if (re.unresolved) return;
          const cur = colorMap[f.fieldPath];
          if (!cur || SEV_RANK[f.severity] > SEV_RANK[cur.sev]) colorMap[f.fieldPath] = { sev: f.severity, color: SEV_META[f.severity].color };
        });
      }
    }
    const vid = Eng.computeVersionId(resume);
    const isStale = !!(review && vid && review.version !== vid);
    const generating = s.status === 'generating';
    const hasData = !!review;

    // experience
    const expEntries = (resume.experience || []).map((e: any, i: number) => ({
      pTitle: `experience[${i}].title`, title: e.title, colTitle: col(`experience[${i}].title`, colorMap),
      pCompany: `experience[${i}].company`, company: e.company, colCompany: col(`experience[${i}].company`, colorMap),
      pLocation: `experience[${i}].location`, location: e.location, colLocation: col(`experience[${i}].location`, colorMap),
      dates: (this.formatDate(e.start) || 'Start') + ' – ' + (this.formatDate(e.end) || 'End'),
      del: () => this.mut(r => r.experience.splice(i, 1)),
      bullets: (e.bullets || []).map((b: string, j: number) => ({ path: `experience[${i}].bullets[${j}]`, value: b, color: col(`experience[${i}].bullets[${j}]`, colorMap), del: () => this.mut(r => r.experience[i].bullets.splice(j, 1)) })),
      addBullet: () => this.mut(r => r.experience[i].bullets.push('')),
    }));
    const eduEntries = (resume.education || []).map((e: any, i: number) => ({
      pDegree: `education[${i}].degree`, degree: e.degree, colDegree: col(`education[${i}].degree`, colorMap),
      pField: `education[${i}].field`, field: e.field, colField: col(`education[${i}].field`, colorMap),
      pInstitution: `education[${i}].institution`, institution: e.institution, colInstitution: col(`education[${i}].institution`, colorMap),
      gradYear: e.gradYear || '', del: () => this.mut(r => r.education.splice(i, 1)),
    }));
    const certEntries = (resume.certifications || []).map((c: any, i: number) => ({
      pName: `certifications[${i}].name`, name: c.name, colName: col(`certifications[${i}].name`, colorMap),
      meta: [c.issuer, c.expiryYear ? 'exp. ' + c.expiryYear : null].filter(Boolean).join(' · '),
      del: () => this.mut(r => r.certifications.splice(i, 1)),
    }));
    const projEntries = (resume.projects || []).map((p: any, i: number) => ({
      pName: `projects[${i}].name`, name: p.name, colName: col(`projects[${i}].name`, colorMap),
      pTech: `projects[${i}].tech`, tech: p.tech, colTech: col(`projects[${i}].tech`, colorMap),
      pOutcome: `projects[${i}].outcome`, outcome: p.outcome, colOutcome: col(`projects[${i}].outcome`, colorMap),
      del: () => this.mut(r => r.projects.splice(i, 1)),
      bullets: (p.bullets || []).map((b: string, j: number) => ({ path: `projects[${i}].bullets[${j}]`, value: b, color: col(`projects[${i}].bullets[${j}]`, colorMap), del: () => this.mut(r => r.projects[i].bullets.splice(j, 1)) })),
      addBullet: () => this.mut(r => r.projects[i].bullets.push('')),
    }));

    let findingItems: any[] = [], unresolvedItems: Finding[] = [], categoryChips: any[] = [], severityChips: any[] = [], scoreBuckets: any[] = [], skippedList: string[] = [];
    let showRetryBanner = false, dismissedCount = 0;
    if (review) {
      const activeCats = Eng.CATEGORIES.filter(c => !c.requiresJD);
      skippedList = Eng.CATEGORIES.filter(c => c.requiresJD).map(c => c.name);
      const reanchored = review.findings.map(f => ({ ...f, ...Eng.reanchorFinding(f, resume) }));
      const resolved = reanchored.filter(f => !f.unresolved);
      unresolvedItems = reanchored.filter(f => f.unresolved);
      dismissedCount = resolved.filter(f => s.dismissed.has(Eng.dismissKey(f))).length;
      showRetryBanner = !generating && !!review.judgmentStatus && (review.judgmentStatus.writingQuality !== 'ok' || review.judgmentStatus.contentQuality !== 'ok');

      const bySeverity = (f: Finding) => s.filterSeverity === 'all' || f.severity === s.filterSeverity;
      const byCategory = (f: Finding) => s.filterCategory === 'all' || f.category === s.filterCategory;
      const catCounted = resolved.filter(f => !s.dismissed.has(Eng.dismissKey(f))).filter(bySeverity);
      categoryChips = [{ id: 'all', label: 'All (' + catCounted.length + ')' }, ...activeCats.map(c => ({ id: c.id, label: c.name + ' (' + catCounted.filter(f => f.category === c.id).length + ')' }))]
        .filter(c => c.id === 'all' || catCounted.some(f => f.category === c.id))
        .map(c => { const on = s.filterCategory === c.id; return { ...c, pressed: on, pick: () => this.setState({ filterCategory: on ? 'all' : c.id }), bg: on ? '#3E5C76' : 'transparent', fg: on ? '#fff' : '#54504A', brd: on ? '#3E5C76' : '#DDD8CF' }; });
      severityChips = ['all', 'critical', 'warning', 'suggestion'].map(id => {
        const label = id === 'all' ? 'All' : SEV_META[id as Severity].label;
        const on = s.filterSeverity === id;
        return { id, label, pressed: on, pick: () => this.setState({ filterSeverity: on ? 'all' : id }), bg: on ? '#3E5C76' : 'transparent', fg: on ? '#fff' : '#54504A', brd: on ? '#3E5C76' : '#DDD8CF' };
      });

      const catOrder: Record<string, number> = {}; activeCats.forEach((c, i) => catOrder[c.id] = i);
      findingItems = resolved
        .filter(bySeverity).filter(byCategory)
        .filter(f => s.showDismissed || !s.dismissed.has(Eng.dismissKey(f)))
        .sort((a, b) => (catOrder[a.category] - catOrder[b.category]) || (SEV_RANK[b.severity] - SEV_RANK[a.severity]))
        .map(f => {
          const isDismissed = s.dismissed.has(Eng.dismissKey(f));
          const catName = (Eng.CATEGORIES.find(c => c.id === f.category) || ({} as any)).name || f.category;
          return {
            jump: () => this.jumpToFinding(f),
            opacity: isDismissed ? 0.42 : 1,
            color: SEV_META[f.severity].color,
            categoryLabel: catName,
            message: f.message,
            hasQuote: !!f.matchedText,
            quote: (f.matchedText || '').length > 90 ? f.matchedText.slice(0, 90) + '…' : f.matchedText,
            hasSuggestion: !!f.suggestion,
            suggestion: f.suggestion,
            dismissLbl: isDismissed ? 'Restore' : 'Dismiss',
            dismiss: () => isDismissed ? this.restoreFinding(f) : this.dismissFinding(f),
          };
        });

      scoreBuckets = review.score.buckets.map(b => ({ label: b.label, score: b.score, max: b.max, pct: Math.round((b.score / b.max) * 100), color: b.score / b.max < 0.5 ? '#B04A42' : (b.score / b.max < 0.8 ? '#C68A2E' : '#5B8A6B') }));
    }

    const progress = s.progress || { done: 0, total: 1, label: '' };
    let liveMessage = '';
    if (generating) liveMessage = `Generating review, ${progress.done} of ${progress.total} checks complete.`;
    else if (review && !isStale) liveMessage = `Review complete. Resume Quality score ${review.score.total} out of 100.`;
    else if (isStale) liveMessage = 'Resume changed since the last review.';

    return {
      liveMessage,
      d: resume,
      col_header_name: col('header.name', colorMap), col_header_title: col('header.title', colorMap), col_header_email: col('header.email', colorMap),
      col_header_phone: col('header.phone', colorMap), col_header_location: col('header.location', colorMap), col_header_linkedin: col('header.linkedin', colorMap), col_header_github: col('header.github', colorMap),
      col_summary: col('summary', colorMap), col_skills: col('skills', colorMap),
      expEntries, eduEntries, certEntries, projEntries,
      showEmpty: !hasData && !generating,
      onGenerate: () => this.generateReview(!!review),
      showProgress: generating, progressLabel: progress.label, progressCount: progress.done + ' / ' + progress.total, progressPct: Math.round((progress.done / progress.total) * 100),
      showRegenBar: !generating && hasData, generating,
      toggleShowDismissed: () => this.setState({ showDismissed: !s.showDismissed }),
      dismissedToggleLbl: s.showDismissed ? 'Hide dismissed' : `Show dismissed (${dismissedCount})`,
      isStale, showRetryBanner, onRetryJudgment: () => this.retryJudgment(),
      showScore: hasData, scoreTotal: review ? review.score.total : 0, scoreBuckets,
      showFilters: hasData, severityChips, categoryChips,
      showFindings: hasData, findingItems, hasNoVisible: hasData && findingItems.length === 0,
      showUnresolved: hasData && unresolvedItems.length > 0, unresolvedCount: unresolvedItems.length, unresolvedItems: unresolvedItems.map(f => ({ message: f.message })),
      showSkippedNote: hasData, toggleSkipped: () => this.setState({ showSkipped: !s.showSkipped }),
      skippedToggleLbl: s.showSkipped ? 'Hide skipped categories' : `${skippedList.length} categories skipped (no job description)`,
      showSkipped: s.showSkipped, skippedList,
    };
  }

  render() {
    const v = this.renderVals();
    const { onEdit, onFocusF, onKeyS, onKeyM, fieldRef } = this;
    return (
      <div className="rrp">
        <div aria-live="polite" className="sr-only">{v.liveMessage}</div>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <div ref={this.resumePaneRef} style={{ flex: '1', minWidth: '0', overflowY: 'auto', height: '100vh', padding: '36px 24px', boxSizing: 'border-box' }}>
            <div style={{ width: '720px', maxWidth: '100%', margin: '0 auto', background: '#fff', boxShadow: '0 1px 2px rgba(30,27,22,.05),0 16px 40px -18px rgba(30,27,22,.22)', padding: '48px 52px', boxSizing: 'border-box' }}>

              <input data-path="header.name" value={v.d.header.name} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Your name" aria-label="Name" ref={fieldRef} style={{ display: 'block', fontSize: '28px', fontWeight: '700', color: '#26231F', borderBottom: `2px solid ${v.col_header_name}`, paddingBottom: '2px' }} />
              <input data-path="header.title" value={v.d.header.title} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Professional title" aria-label="Professional title" ref={fieldRef} style={{ display: 'block', fontSize: '14px', color: '#6B665E', marginTop: '5px', borderBottom: `2px solid ${v.col_header_title}` }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 22px', marginTop: '18px' }}>
                <div><div style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '.09em', color: '#9A948A', textTransform: 'uppercase' }}>Email</div><input data-path="header.email" value={v.d.header.email} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="you@email.com" aria-label="Email" ref={fieldRef} style={{ fontSize: '12.5px', color: '#3B3833', borderBottom: `2px solid ${v.col_header_email}` }} /></div>
                <div><div style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '.09em', color: '#9A948A', textTransform: 'uppercase' }}>Phone</div><input data-path="header.phone" value={v.d.header.phone} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="(555) 555-5555" aria-label="Phone" ref={fieldRef} style={{ fontSize: '12.5px', color: '#3B3833', borderBottom: `2px solid ${v.col_header_phone}` }} /></div>
                <div><div style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '.09em', color: '#9A948A', textTransform: 'uppercase' }}>Location</div><input data-path="header.location" value={v.d.header.location} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="City, State" aria-label="Location" ref={fieldRef} style={{ fontSize: '12.5px', color: '#3B3833', borderBottom: `2px solid ${v.col_header_location}` }} /></div>
                <div><div style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '.09em', color: '#9A948A', textTransform: 'uppercase' }}>LinkedIn</div><input data-path="header.linkedin" value={v.d.header.linkedin} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="linkedin.com/in/you" aria-label="LinkedIn" ref={fieldRef} style={{ fontSize: '12.5px', color: '#3B3833', borderBottom: `2px solid ${v.col_header_linkedin}` }} /></div>
                <div><div style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '.09em', color: '#9A948A', textTransform: 'uppercase' }}>GitHub / Portfolio</div><input data-path="header.github" value={v.d.header.github} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="github.com/you" aria-label="GitHub or portfolio" ref={fieldRef} style={{ fontSize: '12.5px', color: '#3B3833', borderBottom: `2px solid ${v.col_header_github}` }} /></div>
              </div>

              <div style={{ marginTop: '26px' }}>
                <div className="secLbl"><span>Summary</span></div>
                <textarea data-path="summary" value={v.d.summary} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyM} placeholder="Write a 2–4 line professional summary…" aria-label="Summary" rows={1} ref={fieldRef} style={{ marginTop: '7px', fontSize: '13.5px', lineHeight: '1.6', color: '#3B3833', borderBottom: `2px solid ${v.col_summary}`, paddingBottom: '3px' }} />
              </div>

              <div style={{ marginTop: '26px' }}>
                <div className="secLbl"><span>Experience</span><button onClick={this.addExperience} className="hv-accent" style={{ fontSize: '11px', fontWeight: '600', color: '#8A857C', textTransform: 'none', letterSpacing: '0' }}>+ Add role</button></div>
                {v.expEntries.map((ent: any, ei: number) => (
                  <div key={ei} style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <input data-path={ent.pTitle} value={ent.title} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Job title" aria-label="Job title" ref={fieldRef} style={{ flex: '1', minWidth: '0', fontSize: '15px', fontWeight: '600', color: '#2E2B26', borderBottom: `2px solid ${ent.colTitle}` }} />
                      <span style={{ fontSize: '11px', color: '#9A948A', whiteSpace: 'nowrap', flex: 'none' }}>{ent.dates}</span>
                      <button onClick={ent.del} aria-label="Delete role" title="Delete role" className="hv-danger" style={{ fontSize: '13px', color: '#B0A99E', flex: 'none' }}>×</button>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', marginTop: '2px' }}>
                      <input data-path={ent.pCompany} value={ent.company} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Company" aria-label="Company" ref={fieldRef} style={{ flex: '1', minWidth: '0', fontSize: '13px', color: '#6B665E', borderBottom: `2px solid ${ent.colCompany}` }} />
                      <input data-path={ent.pLocation} value={ent.location} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Location" aria-label="Location" ref={fieldRef} style={{ width: '130px', flex: 'none', fontSize: '13px', color: '#6B665E', borderBottom: `2px solid ${ent.colLocation}` }} />
                    </div>
                    <div style={{ marginTop: '7px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {ent.bullets.map((bl: any, bi: number) => (
                        <div key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                          <span style={{ color: '#3E5C76', fontSize: '13px', lineHeight: '1.55' }}>•</span>
                          <textarea data-path={bl.path} value={bl.value} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyM} placeholder="Describe what you did and the result…" aria-label="Bullet" rows={1} ref={fieldRef} style={{ flex: '1', minWidth: '0', fontSize: '13px', lineHeight: '1.55', color: '#3B3833', borderBottom: `2px solid ${bl.color}` }} />
                          <button onClick={bl.del} aria-label="Delete bullet" title="Delete bullet" className="hv-danger" style={{ fontSize: '12px', color: '#B0A99E', flex: 'none' }}>×</button>
                        </div>
                      ))}
                      <button onClick={ent.addBullet} className="hv-accent" style={{ alignSelf: 'flex-start', fontSize: '11px', fontWeight: '600', color: '#8A857C', marginLeft: '16px' }}>+ Add bullet</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '26px' }}>
                <div className="secLbl"><span>Education</span><button onClick={this.addEducation} className="hv-accent" style={{ fontSize: '11px', fontWeight: '600', color: '#8A857C', textTransform: 'none', letterSpacing: '0' }}>+ Add school</button></div>
                {v.eduEntries.map((ed: any, i: number) => (
                  <div key={i} style={{ marginTop: '14px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <div style={{ flex: '1', minWidth: '0' }}>
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <input data-path={ed.pDegree} value={ed.degree} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Degree" aria-label="Degree" ref={fieldRef} style={{ flex: '1', minWidth: '0', fontSize: '14px', fontWeight: '600', color: '#2E2B26', borderBottom: `2px solid ${ed.colDegree}` }} />
                        <input data-path={ed.pField} value={ed.field} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Field of study" aria-label="Field of study" ref={fieldRef} style={{ flex: '1', minWidth: '0', fontSize: '13px', color: '#6B665E', borderBottom: `2px solid ${ed.colField}` }} />
                      </div>
                      <input data-path={ed.pInstitution} value={ed.institution} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Institution" aria-label="Institution" ref={fieldRef} style={{ display: 'block', marginTop: '2px', fontSize: '13px', color: '#6B665E', borderBottom: `2px solid ${ed.colInstitution}` }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#9A948A', whiteSpace: 'nowrap', flex: 'none' }}>{ed.gradYear}</span>
                    <button onClick={ed.del} aria-label="Delete education" title="Delete" className="hv-danger" style={{ fontSize: '13px', color: '#B0A99E', flex: 'none' }}>×</button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '26px' }}>
                <div className="secLbl"><span>Skills</span></div>
                <textarea data-path="skills" value={v.d.skills} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyM} placeholder="List your key skills, separated by commas…" aria-label="Skills" rows={1} ref={fieldRef} style={{ marginTop: '7px', fontSize: '13px', lineHeight: '1.6', color: '#3B3833', borderBottom: `2px solid ${v.col_skills}`, paddingBottom: '3px' }} />
              </div>

              <div style={{ marginTop: '26px' }}>
                <div className="secLbl"><span>Certifications</span><button onClick={this.addCertification} className="hv-accent" style={{ fontSize: '11px', fontWeight: '600', color: '#8A857C', textTransform: 'none', letterSpacing: '0' }}>+ Add certification</button></div>
                {v.certEntries.map((ct: any, i: number) => (
                  <div key={i} style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <input data-path={ct.pName} value={ct.name} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Certification name" aria-label="Certification name" ref={fieldRef} style={{ flex: '1', minWidth: '0', fontSize: '13.5px', color: '#2E2B26', borderBottom: `2px solid ${ct.colName}` }} />
                    <span style={{ fontSize: '11px', color: '#9A948A', whiteSpace: 'nowrap', flex: 'none' }}>{ct.meta}</span>
                    <button onClick={ct.del} aria-label="Delete certification" title="Delete" className="hv-danger" style={{ fontSize: '13px', color: '#B0A99E', flex: 'none' }}>×</button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '26px' }}>
                <div className="secLbl"><span>Projects</span><button onClick={this.addProject} className="hv-accent" style={{ fontSize: '11px', fontWeight: '600', color: '#8A857C', textTransform: 'none', letterSpacing: '0' }}>+ Add project</button></div>
                {v.projEntries.map((pj: any, i: number) => (
                  <div key={i} style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <input data-path={pj.pName} value={pj.name} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Project name" aria-label="Project name" ref={fieldRef} style={{ flex: '1', minWidth: '0', fontSize: '15px', fontWeight: '600', color: '#2E2B26', borderBottom: `2px solid ${pj.colName}` }} />
                      <button onClick={pj.del} aria-label="Delete project" title="Delete" className="hv-danger" style={{ fontSize: '13px', color: '#B0A99E', flex: 'none' }}>×</button>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', marginTop: '2px' }}>
                      <input data-path={pj.pTech} value={pj.tech} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Technologies" aria-label="Technologies" ref={fieldRef} style={{ flex: '1', minWidth: '0', fontSize: '13px', color: '#6B665E', borderBottom: `2px solid ${pj.colTech}` }} />
                      <input data-path={pj.pOutcome} value={pj.outcome} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Outcome / impact" aria-label="Outcome" ref={fieldRef} style={{ flex: '1', minWidth: '0', fontSize: '13px', color: '#6B665E', borderBottom: `2px solid ${pj.colOutcome}` }} />
                    </div>
                    <div style={{ marginTop: '7px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {pj.bullets.map((bl: any, bi: number) => (
                        <div key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                          <span style={{ color: '#3E5C76', fontSize: '13px', lineHeight: '1.55' }}>•</span>
                          <textarea data-path={bl.path} value={bl.value} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyM} placeholder="Describe your contribution…" aria-label="Bullet" rows={1} ref={fieldRef} style={{ flex: '1', minWidth: '0', fontSize: '13px', lineHeight: '1.55', color: '#3B3833', borderBottom: `2px solid ${bl.color}` }} />
                          <button onClick={bl.del} aria-label="Delete bullet" title="Delete bullet" className="hv-danger" style={{ fontSize: '12px', color: '#B0A99E', flex: 'none' }}>×</button>
                        </div>
                      ))}
                      <button onClick={pj.addBullet} className="hv-accent" style={{ alignSelf: 'flex-start', fontSize: '11px', fontWeight: '600', color: '#8A857C', marginLeft: '16px' }}>+ Add bullet</button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          <aside role="complementary" aria-label="Resume review" style={{ width: '400px', flex: 'none', height: '100vh', background: '#fff', borderLeft: '1px solid #E6E2DA', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid #E6E2DA', flex: 'none' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#26231F' }}>Resume Review</div>
              <div style={{ fontSize: '11px', color: '#9A948A', marginTop: '2px' }}>23-category checklist · findings link back to the exact text</div>
            </div>
            <div style={{ flex: '1', overflowY: 'auto', padding: '16px 20px 30px' }}>

              {v.showEmpty && (
                <div style={{ padding: '6px 2px' }}>
                  <p style={{ fontSize: '13px', lineHeight: '1.62', color: '#4C4841', margin: '0' }}>Checks this resume against 23 checklist categories — summary, bullets, grammar, formatting, and more — and links every finding back to the exact spot on the page.</p>
                  <button onClick={v.onGenerate} className="hv-bright" style={{ marginTop: '14px', width: '100%', padding: '10px', background: '#3E5C76', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>Generate Review</button>
                </div>
              )}

              {v.showProgress && (
                <div style={{ padding: '2px 2px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#6B665E' }}><span>{v.progressLabel}</span><span>{v.progressCount}</span></div>
                  <div style={{ height: '5px', background: '#EFECE6', borderRadius: '99px', marginTop: '6px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${v.progressPct}%`, background: '#3E5C76', borderRadius: '99px', transition: 'width .2s' }} /></div>
                </div>
              )}

              {v.showRegenBar && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '2px 2px 16px' }}>
                  <button onClick={v.onGenerate} disabled={v.generating} className="hv-soft" style={{ flex: '1', padding: '8px', border: '1px solid #DDD8CF', borderRadius: '7px', fontSize: '12.5px', fontWeight: '600', color: '#3F3B35', background: '#fff' }}>Regenerate Review</button>
                  <button onClick={v.toggleShowDismissed} className="hv-accent" style={{ fontSize: '11px', color: '#8A857C', whiteSpace: 'nowrap' }}>{v.dismissedToggleLbl}</button>
                </div>
              )}

              {v.isStale && (
                <div role="status" style={{ background: '#FBF3E7', border: '1px solid #EBD9B8', borderRadius: '8px', padding: '9px 11px', fontSize: '12px', color: '#8A6A2E', marginBottom: '14px', lineHeight: '1.5' }}>Resume changed since this review — findings below may not reflect the current text.</div>
              )}

              {v.showRetryBanner && (
                <div style={{ background: '#FBEDEC', border: '1px solid #EFC9C4', borderRadius: '8px', padding: '9px 11px', fontSize: '12px', color: '#9A3F38', marginBottom: '14px', lineHeight: '1.5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}><span>AI analysis didn&apos;t finish.</span><button onClick={v.onRetryJudgment} style={{ fontWeight: '600', textDecoration: 'underline', flex: 'none' }}>Retry</button></div>
              )}

              {v.showScore && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}><div style={{ fontSize: '30px', fontWeight: '700', color: '#26231F' }}>{v.scoreTotal}</div><div style={{ fontSize: '12px', color: '#9A948A' }}>/ 100 Resume Quality</div></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                    {v.scoreBuckets.map((b: any, i: number) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '92px 1fr 30px', gap: '8px', alignItems: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#6B665E' }}>{b.label}</div>
                        <div style={{ height: '4px', background: '#EFECE6', borderRadius: '99px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${b.pct}%`, background: b.color, borderRadius: '99px' }} /></div>
                        <div style={{ fontSize: '9.5px', color: '#9A948A', textAlign: 'right' }}>{b.score}/{b.max}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {v.showFilters && (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '6px' }}>
                    {v.severityChips.map((sv: any, i: number) => (
                      <button key={i} onClick={sv.pick} aria-pressed={sv.pressed} style={{ padding: '4px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', background: sv.bg, color: sv.fg, border: `1px solid ${sv.brd}` }}>{sv.label}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
                    {v.categoryChips.map((cc: any, i: number) => (
                      <button key={i} onClick={cc.pick} aria-pressed={cc.pressed} style={{ padding: '3px 8px', borderRadius: '999px', fontSize: '10.5px', background: cc.bg, color: cc.fg, border: `1px solid ${cc.brd}` }}>{cc.label}</button>
                    ))}
                  </div>
                </>
              )}

              {v.showFindings && (
                <>
                  {v.findingItems.map((fi: any, i: number) => (
                    <div key={i} style={{ borderBottom: '1px solid #F0EDE7', padding: '10px 0', opacity: fi.opacity }}>
                      <button onClick={fi.jump} style={{ display: 'block', width: '100%', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: fi.color, flex: 'none' }} />
                          <span style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '.06em', textTransform: 'uppercase', color: '#9A948A' }}>{fi.categoryLabel}</span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#2E2B26', marginTop: '3px', lineHeight: '1.45' }}>{fi.message}</div>
                        {fi.hasQuote && <div style={{ fontSize: '11px', color: '#6B665E', background: '#F6F4EF', borderRadius: '5px', padding: '3px 7px', marginTop: '5px', fontFamily: 'ui-monospace,Menlo,monospace', overflowWrap: 'break-word' }}>&quot;{fi.quote}&quot;</div>}
                        {fi.hasSuggestion && <div style={{ fontSize: '11px', color: '#3E5C76', marginTop: '4px' }}>Suggestion: {fi.suggestion}</div>}
                      </button>
                      <button onClick={fi.dismiss} className="hv-accent" style={{ fontSize: '10.5px', color: '#8A857C', marginTop: '5px' }}>{fi.dismissLbl}</button>
                    </div>
                  ))}
                  {v.hasNoVisible && <div style={{ fontSize: '12px', color: '#9A948A', padding: '20px 2px', textAlign: 'center' }}>No findings match this filter.</div>}
                </>
              )}

              {v.showUnresolved && (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '.08em', textTransform: 'uppercase', color: '#9A948A', marginBottom: '6px' }}>Could not locate ({v.unresolvedCount})</div>
                  {v.unresolvedItems.map((u: any, i: number) => (
                    <div key={i} style={{ fontSize: '11.5px', color: '#8A857C', padding: '6px 0', borderBottom: '1px solid #F5F3EE' }}>{u.message}</div>
                  ))}
                </div>
              )}

              {v.showSkippedNote && (
                <div style={{ marginTop: '18px' }}>
                  <button onClick={v.toggleSkipped} className="hv-accent" style={{ fontSize: '11px', color: '#8A857C' }}>{v.skippedToggleLbl}</button>
                  {v.showSkipped && (
                    <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {v.skippedList.map((sk: string, i: number) => (
                        <div key={i} style={{ fontSize: '11px', color: '#B0A99E' }}>{sk} — needs a job description</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </aside>
        </div>
      </div>
    );
  }
}
