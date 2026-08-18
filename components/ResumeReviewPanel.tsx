'use client';

import { sleep, withTimeout } from '@/lib/async-utils';
import { buildReviewSections } from '@/lib/resume-data/review-entries-adapter';
import type { Finding, Severity } from '@/lib/resume-review-engine';
import * as E from '@/lib/resume-review-engine';
import { runJudgment } from '@/lib/resume-review/judgment';
import type { AppDispatch, RootState } from '@/lib/store';
import { fetchReviewResume, reviewResumeActions } from '@/lib/store/review-resume-slice';
import '@/styles/inline-resume-editor.css';
import '@/styles/resume-review-panel.css';
import React from 'react';
import { connect, type ConnectedProps } from 'react-redux';
import SectionBlock from './editor/SectionBlock';
import ReviewFilters from './review/ReviewFilters';
import ReviewFindingsList from './review/ReviewFindingsList';
import ReviewHeaderFields from './review/ReviewHeaderFields';
import ReviewProgress from './review/ReviewProgress';
import ReviewScore from './review/ReviewScore';

const SEV_META: Record<Severity, { color: string; label: string }> = {
  critical: { color: '#B04A42', label: 'Critical' },
  warning: { color: '#C68A2E', label: 'Warning' },
  suggestion: { color: '#6E7B8B', label: 'Suggestion' },
};
const SEV_RANK: Record<string, number> = { critical: 3, warning: 2, suggestion: 1 };

interface Review {
  version: string;
  findings: Finding[];
  det: Finding[];
  score: {
    total: number;
    buckets: Array<{ id: string; label: string; max: number; score: number }>;
  };
  generatedAt: number;
  judgmentStatus: { writingQuality: string; contentQuality: string };
}

interface PanelState {
  reviewsByVersion: Record<string, Review>;
  dismissed: Set<string>;
  status: 'idle' | 'generating';
  progress: { done: number; total: number; label: string } | null;
  filterCategory: string;
  filterSeverity: string;
  showDismissed: boolean;
  showSkipped: boolean;
}

const mapStateToProps = (state: RootState) => ({ resume: state.reviewResume.data });
const mapDispatchToProps = (dispatch: AppDispatch) => ({
  setPath: (path: string, value: any) => dispatch(reviewResumeActions.setPath({ path, value })),
  pushToList: (listPath: string, item: any) =>
    dispatch(reviewResumeActions.pushToList({ listPath, item })),
  removeFromList: (listPath: string, index: number) =>
    dispatch(reviewResumeActions.removeFromList({ listPath, index })),
  fetchReviewResume: () => dispatch(fetchReviewResume()),
});
const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

class ResumeReviewPanel extends React.Component<Props, PanelState> {
  private _fieldRefs: Record<string, HTMLInputElement | HTMLTextAreaElement> = {};
  private _resumePaneEl: HTMLDivElement | null = null;
  private _inFlightVersionId: string | null = null;
  private _snap: { p: string; v: string } | null = null;

  constructor(props: Props) {
    super(props);
    // Read synchronously, as the prototype did, so a reload with a stored review renders the
    // result state on the first paint instead of flashing the empty state. Safe because the
    // route mounts this component client-only (see app/review/page.tsx).
    let reviewsByVersion: Record<string, Review> = {};
    let dismissed: string[] = [];
    try {
      reviewsByVersion = JSON.parse(localStorage.getItem('rrp.reviews') || '{}');
    } catch {
      /* ignore */
    }
    try {
      dismissed = JSON.parse(localStorage.getItem('rrp.dismissed') || '[]');
    } catch {
      /* ignore */
    }
    this.state = {
      reviewsByVersion,
      dismissed: new Set(dismissed),
      status: 'idle',
      progress: null,
      filterCategory: 'all',
      filterSeverity: 'all',
      showDismissed: false,
      showSkipped: false,
    };
  }

  componentDidMount() {
    this.props.fetchReviewResume();
  }

  onEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const path = e.target.dataset.path!;
    const value = e.target.value;
    this.props.setPath(path, value);
  };
  onFocusF = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this._snap = { p: e.target.dataset.path!, v: e.target.value };
  };
  esc(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (
      e.key === 'Escape' &&
      this._snap &&
      this._snap.p === (e.target as HTMLElement).dataset.path
    ) {
      e.preventDefault();
      const snap = this._snap;
      this.props.setPath(snap.p, snap.v);
      (e.target as HTMLInputElement).blur();
    }
  }
  onKeyS = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    } else this.esc(e);
  };
  onKeyM = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => this.esc(e);
  fieldRef = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (el && el.dataset && el.dataset.path) this._fieldRefs[el.dataset.path] = el;
  };
  resumePaneRef = (el: HTMLDivElement | null) => {
    this._resumePaneEl = el;
  };

  addExperience = () =>
    this.props.pushToList('experience', {
      title: '',
      company: '',
      location: '',
      start: null,
      end: null,
      bullets: [''],
    });
  addEducation = () =>
    this.props.pushToList('education', { institution: '', degree: '', field: '', gradYear: null });
  addCertification = () =>
    this.props.pushToList('certifications', { name: '', issuer: '', expiryYear: null });
  addProject = () =>
    this.props.pushToList('projects', { name: '', tech: '', outcome: '', bullets: [''] });

  jumpToFinding(f: Finding) {
    if (!f.fieldPath) return;
    const el = this._fieldRefs[f.fieldPath];
    if (el && this._resumePaneEl) {
      const paneRect = this._resumePaneEl.getBoundingClientRect(),
        elRect = el.getBoundingClientRect();
      this._resumePaneEl.scrollTop +=
        elRect.top - paneRect.top - paneRect.height / 2 + elRect.height / 2;
      el.focus();
      if (f.textRange && el.setSelectionRange) {
        try {
          el.setSelectionRange(f.textRange.start, f.textRange.end);
        } catch {
          /* ignore */
        }
      }
    }
  }
  dismissFinding(f: Finding) {
    const key = E.dismissKey(f);
    const s = new Set(this.state.dismissed);
    s.add(key);
    try {
      localStorage.setItem('rrp.dismissed', JSON.stringify([...s]));
    } catch {
      /* ignore */
    }
    this.setState({ dismissed: s });
  }
  restoreFinding(f: Finding) {
    const key = E.dismissKey(f);
    const s = new Set(this.state.dismissed);
    s.delete(key);
    try {
      localStorage.setItem('rrp.dismissed', JSON.stringify([...s]));
    } catch {
      /* ignore */
    }
    this.setState({ dismissed: s });
  }
  saveReview(vid: string, review: Review) {
    this.setState((s) => {
      const map = { ...s.reviewsByVersion, [vid]: review };
      try {
        localStorage.setItem('rrp.reviews', JSON.stringify(map));
      } catch {
        /* ignore */
      }
      return { reviewsByVersion: map };
    });
  }
  buildReview(
    vid: string,
    findings: Finding[],
    judgmentStatus: Review['judgmentStatus'],
    det: Finding[],
  ): Review {
    const capped = E.capFindings(findings, 3);
    const score = E.computeScore(capped);
    return { version: vid, findings: capped, det, score, generatedAt: Date.now(), judgmentStatus };
  }

  async generateReview(force: boolean) {
    const resume = structuredClone(this.props.resume);
    const vid = E.computeVersionId(resume);
    if (this.state.status === 'generating' && this._inFlightVersionId === vid) return;
    if (!force && this.state.reviewsByVersion[vid]) return;
    this._inFlightVersionId = vid;
    const cats = E.CATEGORIES.filter((c) => !c.requiresJD);
    const total = cats.length + 1;
    this.setState({
      status: 'generating',
      progress: { done: 0, total, label: 'Running checklist rules…' },
    });
    let det: Finding[] = [];
    try {
      det = E.runDeterministicRules(resume);
    } catch {
      det = [];
    }
    for (let i = 0; i < cats.length; i++) {
      await sleep(25);
      this.setState({ progress: { done: i + 1, total, label: 'Checked ' + cats[i].name } });
    }
    this.saveReview(
      vid,
      this.buildReview(vid, det, { writingQuality: 'pending', contentQuality: 'pending' }, det),
    );
    this.setState({
      progress: {
        done: cats.length,
        total,
        label: 'Analyzing writing quality and leadership signal with AI…',
      },
    });
    let judg: Finding[] = [],
      status = 'ok';
    let err: Error | null = null;
    try {
      judg = await withTimeout(runJudgment(resume), 15000);
    } catch (e) {
      err = e as Error;
      status = 'error';
    }

    const finalReview = this.buildReview(
      vid,
      [...det, ...judg],
      { writingQuality: status, contentQuality: status },
      det,
    );
    this.saveReview(vid, finalReview);
    this._inFlightVersionId = null;
    this.setState({ status: 'idle', progress: null });
  }
  async retryJudgment() {
    const resume = structuredClone(this.props.resume);
    const vid = E.computeVersionId(resume);
    const review = this.state.reviewsByVersion[vid];
    if (!review || this.state.status === 'generating') {
      return this.generateReview(true);
    }
    this._inFlightVersionId = vid;
    this.setState({
      status: 'generating',
      progress: { done: 0, total: 1, label: 'Retrying AI analysis…' },
    });
    let judg: Finding[] = [],
      status = review.judgmentStatus.writingQuality;
    if (status !== 'ok' || review.judgmentStatus.contentQuality !== 'ok') {
      try {
        judg = await withTimeout(runJudgment(resume), 15000);
        status = 'ok';
      } catch {
        status = 'error';
      }
    }
    const finalReview = this.buildReview(
      vid,
      [...review.det, ...judg],
      { writingQuality: status, contentQuality: status },
      review.det,
    );
    this.saveReview(vid, finalReview);
    this._inFlightVersionId = null;
    this.setState({ status: 'idle', progress: null });
  }

  renderVals(): any {
    const Eng = E,
      resume = this.props.resume,
      s = this.state;
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
        review.findings.forEach((f) => {
          if (!f.fieldPath || f.grouped) return;
          if (s.dismissed.has(Eng.dismissKey(f))) return;
          const re = Eng.reanchorFinding(f, resume);
          if (re.unresolved) return;
          const cur = colorMap[f.fieldPath];
          if (!cur || SEV_RANK[f.severity] > SEV_RANK[cur.sev])
            colorMap[f.fieldPath] = { sev: f.severity, color: SEV_META[f.severity].color };
        });
      }
    }
    const vid = Eng.computeVersionId(resume);
    const isStale = !!(review && vid && review.version !== vid);
    const generating = s.status === 'generating';
    const hasData = !!review;

    let findingItems: any[] = [],
      unresolvedItems: Finding[] = [],
      categoryChips: any[] = [],
      severityChips: any[] = [],
      scoreBuckets: any[] = [],
      skippedList: string[] = [];
    let showRetryBanner = false,
      dismissedCount = 0;
    if (review) {
      const activeCats = Eng.CATEGORIES.filter((c) => !c.requiresJD);
      skippedList = Eng.CATEGORIES.filter((c) => c.requiresJD).map((c) => c.name);
      const reanchored = review.findings.map((f) => ({ ...f, ...Eng.reanchorFinding(f, resume) }));
      const resolved = reanchored.filter((f) => !f.unresolved);
      unresolvedItems = reanchored.filter((f) => f.unresolved);
      dismissedCount = resolved.filter((f) => s.dismissed.has(Eng.dismissKey(f))).length;
      showRetryBanner =
        !generating &&
        !!review.judgmentStatus &&
        (review.judgmentStatus.writingQuality !== 'ok' ||
          review.judgmentStatus.contentQuality !== 'ok');

      const bySeverity = (f: Finding) =>
        s.filterSeverity === 'all' || f.severity === s.filterSeverity;
      const byCategory = (f: Finding) =>
        s.filterCategory === 'all' || f.category === s.filterCategory;
      const catCounted = resolved
        .filter((f) => !s.dismissed.has(Eng.dismissKey(f)))
        .filter(bySeverity);
      categoryChips = [
        { id: 'all', label: 'All (' + catCounted.length + ')' },
        ...activeCats.map((c) => ({
          id: c.id,
          label: c.name + ' (' + catCounted.filter((f) => f.category === c.id).length + ')',
        })),
      ]
        .filter((c) => c.id === 'all' || catCounted.some((f) => f.category === c.id))
        .map((c) => {
          const on = s.filterCategory === c.id;
          return {
            ...c,
            pressed: on,
            pick: () => this.setState({ filterCategory: on ? 'all' : c.id }),
            bg: on ? '#3E5C76' : 'transparent',
            fg: on ? '#fff' : '#54504A',
            brd: on ? '#3E5C76' : '#DDD8CF',
          };
        });
      severityChips = ['all', 'critical', 'warning', 'suggestion'].map((id) => {
        const label = id === 'all' ? 'All' : SEV_META[id as Severity].label;
        const on = s.filterSeverity === id;
        return {
          id,
          label,
          pressed: on,
          pick: () => this.setState({ filterSeverity: on ? 'all' : id }),
          bg: on ? '#3E5C76' : 'transparent',
          fg: on ? '#fff' : '#54504A',
          brd: on ? '#3E5C76' : '#DDD8CF',
        };
      });

      const catOrder: Record<string, number> = {};
      activeCats.forEach((c, i) => (catOrder[c.id] = i));
      findingItems = resolved
        .filter(bySeverity)
        .filter(byCategory)
        .filter((f) => s.showDismissed || !s.dismissed.has(Eng.dismissKey(f)))
        .sort(
          (a, b) =>
            catOrder[a.category] - catOrder[b.category] ||
            SEV_RANK[b.severity] - SEV_RANK[a.severity],
        )
        .map((f) => {
          const isDismissed = s.dismissed.has(Eng.dismissKey(f));
          const catName =
            (Eng.CATEGORIES.find((c) => c.id === f.category) || ({} as any)).name || f.category;
          return {
            jump: () => this.jumpToFinding(f),
            opacity: isDismissed ? 0.42 : 1,
            color: SEV_META[f.severity].color,
            categoryLabel: catName,
            message: f.message,
            hasQuote: !!f.matchedText,
            quote:
              (f.matchedText || '').length > 90 ? f.matchedText.slice(0, 90) + '…' : f.matchedText,
            hasSuggestion: !!f.suggestion,
            suggestion: f.suggestion,
            dismissLbl: isDismissed ? 'Restore' : 'Dismiss',
            dismiss: () => (isDismissed ? this.restoreFinding(f) : this.dismissFinding(f)),
          };
        });

      scoreBuckets = review.score.buckets.map((b) => ({
        label: b.label,
        score: b.score,
        max: b.max,
        pct: Math.round((b.score / b.max) * 100),
        color: b.score / b.max < 0.5 ? '#B04A42' : b.score / b.max < 0.8 ? '#C68A2E' : '#5B8A6B',
      }));
    }

    const progress = s.progress || { done: 0, total: 1, label: '' };
    let liveMessage = '';
    if (generating)
      liveMessage = `Generating review, ${progress.done} of ${progress.total} checks complete.`;
    else if (review && !isStale)
      liveMessage = `Review complete. Resume Quality score ${review.score.total} out of 100.`;
    else if (isStale) liveMessage = 'Resume changed since the last review.';

    return {
      liveMessage,
      d: resume,
      colorMap,
      showEmpty: !hasData && !generating,
      onGenerate: () => this.generateReview(!!review),
      showProgress: generating,
      progressLabel: progress.label,
      progressCount: progress.done + ' / ' + progress.total,
      progressPct: Math.round((progress.done / progress.total) * 100),
      showRegenBar: !generating && hasData,
      generating,
      toggleShowDismissed: () => this.setState({ showDismissed: !s.showDismissed }),
      dismissedToggleLbl: s.showDismissed ? 'Hide dismissed' : `Show dismissed (${dismissedCount})`,
      isStale,
      showRetryBanner,
      onRetryJudgment: () => this.retryJudgment(),
      showScore: hasData,
      scoreTotal: review ? review.score.total : 0,
      scoreBuckets,
      showFilters: hasData,
      severityChips,
      categoryChips,
      showFindings: hasData,
      findingItems,
      hasNoVisible: hasData && findingItems.length === 0,
      showUnresolved: hasData && unresolvedItems.length > 0,
      unresolvedCount: unresolvedItems.length,
      unresolvedItems: unresolvedItems.map((f) => ({ message: f.message })),
      showSkippedNote: hasData,
      toggleSkipped: () => this.setState({ showSkipped: !s.showSkipped }),
      skippedToggleLbl: s.showSkipped
        ? 'Hide skipped categories'
        : `${skippedList.length} categories skipped (no job description)`,
      showSkipped: s.showSkipped,
      skippedList,
    };
  }

  render() {
    const v = this.renderVals();
    const sections = buildReviewSections(v.d, {
      onAddExperience: this.addExperience,
      onAddEducation: this.addEducation,
      onAddCertification: this.addCertification,
      onAddProject: this.addProject,
      onDeleteExperience: (i) => this.props.removeFromList('experience', i),
      onDeleteEducation: (i) => this.props.removeFromList('education', i),
      onDeleteCertification: (i) => this.props.removeFromList('certifications', i),
      onDeleteProject: (i) => this.props.removeFromList('projects', i),
      onAddBullet: (section, i) => this.props.pushToList(`${section}[${i}].bullets`, ''),
      onDeleteBullet: (section, i, j) => this.props.removeFromList(`${section}[${i}].bullets`, j),
    });
    return (
      <div>
        <div
          aria-live="polite"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
          }}
        >
          {v.liveMessage}
        </div>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <div
            ref={this.resumePaneRef}
            style={{
              flex: '1',
              minWidth: '0',
              overflowY: 'auto',
              height: '100vh',
              padding: '36px 24px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: '720px',
                maxWidth: '100%',
                margin: '0 auto',
                background: '#fff',
                boxShadow: '0 1px 2px rgba(30,27,22,.05),0 16px 40px -18px rgba(30,27,22,.22)',
                padding: '48px 52px',
                boxSizing: 'border-box',
              }}
            >
              <div className="rrp">
                <ReviewHeaderFields
                  header={v.d.header}
                  colorMap={v.colorMap}
                  onEdit={this.onEdit}
                  onFocusF={this.onFocusF}
                  onKeyS={this.onKeyS}
                  fieldRef={this.fieldRef}
                />
              </div>
              <div className="ire showall">
                {sections.map((s) => (
                  <SectionBlock
                    key={s.id}
                    s={s}
                    colorMap={v.colorMap}
                    fieldRef={this.fieldRef}
                    onEdit={this.onEdit}
                    onFocusF={this.onFocusF}
                    onKeyS={this.onKeyS}
                    onKeyM={this.onKeyM}
                  />
                ))}
              </div>
            </div>
          </div>

          <aside
            role="complementary"
            aria-label="Resume review"
            className="rrp"
            style={{
              width: '400px',
              flex: 'none',
              height: '100vh',
              background: '#fff',
              borderLeft: '1px solid #E6E2DA',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{ padding: '20px 20px 14px', borderBottom: '1px solid #E6E2DA', flex: 'none' }}
            >
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#26231F' }}>
                Resume Review
              </div>
              <div style={{ fontSize: '11px', color: '#9A948A', marginTop: '2px' }}>
                23-category checklist · findings link back to the exact text
              </div>
            </div>
            <div style={{ flex: '1', overflowY: 'auto', padding: '16px 20px 30px' }}>
              <ReviewProgress
                showEmpty={v.showEmpty}
                onGenerate={v.onGenerate}
                showProgress={v.showProgress}
                progressLabel={v.progressLabel}
                progressCount={v.progressCount}
                progressPct={v.progressPct}
                showRegenBar={v.showRegenBar}
                generating={v.generating}
                toggleShowDismissed={v.toggleShowDismissed}
                dismissedToggleLbl={v.dismissedToggleLbl}
                isStale={v.isStale}
                showRetryBanner={v.showRetryBanner}
                onRetryJudgment={v.onRetryJudgment}
              />

              {v.showScore && (
                <ReviewScore scoreTotal={v.scoreTotal} scoreBuckets={v.scoreBuckets} />
              )}

              {v.showFilters && (
                <ReviewFilters severityChips={v.severityChips} categoryChips={v.categoryChips} />
              )}

              <ReviewFindingsList
                showFindings={v.showFindings}
                findingItems={v.findingItems}
                hasNoVisible={v.hasNoVisible}
                showUnresolved={v.showUnresolved}
                unresolvedCount={v.unresolvedCount}
                unresolvedItems={v.unresolvedItems}
                showSkippedNote={v.showSkippedNote}
                toggleSkipped={v.toggleSkipped}
                skippedToggleLbl={v.skippedToggleLbl}
                showSkipped={v.showSkipped}
                skippedList={v.skippedList}
              />
            </div>
          </aside>
        </div>
      </div>
    );
  }
}

export default connector(ResumeReviewPanel);
