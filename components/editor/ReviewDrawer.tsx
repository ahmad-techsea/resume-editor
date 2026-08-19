'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withTimeout } from '@/lib/async-utils';
import { isEditorResumeEmpty } from '@/lib/resume-data/editor-resume-data';
import { projectEditorToReview } from '@/lib/resume-data/editor-to-review-adapter';
import { computeApplyFixResult } from '@/lib/resume-review/apply-fix';
import { runJudgment } from '@/lib/resume-review/judgment';
import * as E from '@/lib/resume-review-engine';
import type { Finding, Severity } from '@/lib/resume-review-engine';
import { editorResumeActions } from '@/lib/store/editor-resume-slice';
import { reviewActions } from '@/lib/store/review-slice';
import type { AppDispatch, RootState } from '@/lib/store';
import type { FilterChip } from '../review/ReviewFilters';
import ReviewFilters from '../review/ReviewFilters';
import ReviewFindingsList from '../review/ReviewFindingsList';
import ReviewProgress from '../review/ReviewProgress';
import ReviewScore from '../review/ReviewScore';
import ReviewVersionSwitcher from '../review/ReviewVersionSwitcher';
import ScoreHistoryChart from '../review/ScoreHistoryChart';
import Drawer from './Drawer';

const SEV_META: Record<Severity, { color: string; label: string }> = {
  critical: { color: '#B04A42', label: 'Critical' },
  warning: { color: '#C68A2E', label: 'Warning' },
  suggestion: { color: '#6E7B8B', label: 'Suggestion' },
};
const SEV_RANK: Record<string, number> = { critical: 3, warning: 2, suggestion: 1 };

export interface ReviewDrawerProps {
  open: boolean;
  onToggle: () => void;
}

/** Applies an already-computed successful ApplyFixResult action through the same
 *  editorResumeActions the user's own typing uses — the editor canvas re-renders immediately
 *  since both share one Redux store, with no extra plumbing needed. */
function dispatchApplyAction(dispatch: AppDispatch, action: { kind: string; [k: string]: any }) {
  if (action.kind === 'setPath') {
    dispatch(editorResumeActions.setPath({ path: action.path, value: action.value }));
  } else {
    dispatch(editorResumeActions.removeAtPath({ listPath: action.listPath, index: action.index }));
  }
}

export default function ReviewDrawer({ open, onToggle }: ReviewDrawerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const editorData = useSelector((s: RootState) => s.editorResume.data);
  const review = useSelector((s: RootState) => s.review);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showDismissed, setShowDismissed] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);
  const [progress, setProgress] = useState<{ label: string; pct: number } | null>(null);

  const isEmpty = isEditorResumeEmpty(editorData);
  const generating = review.status === 'generating';
  const activeVersion = review.versions.find((v) => v.id === review.activeVersionId) || null;
  const hasData = !!activeVersion;

  const generateReview = useCallback(async () => {
    if (review.status === 'generating') return; // belt-and-suspenders: button is also disabled
    dispatch(reviewActions.startGenerating());
    setProgress({ label: 'Running checklist rules…', pct: 15 });
    const { review: projected } = projectEditorToReview(editorData);
    let det: Finding[] = [];
    try {
      det = E.runDeterministicRules(projected);
    } catch {
      det = [];
    }
    setProgress({ label: 'Analyzing writing quality and leadership signal with AI…', pct: 55 });
    let judg: Finding[] = [];
    let status = 'ok';
    try {
      judg = await withTimeout(runJudgment(projected), 15000);
    } catch {
      status = 'error';
    }
    setProgress({ label: 'Finishing up…', pct: 95 });
    const capped = E.capFindings([...det, ...judg], 3);
    const score = E.computeScore(capped, projected);
    dispatch(
      reviewActions.reviewGenerated({
        findings: capped,
        score,
        judgmentStatus: { writingQuality: status, contentQuality: status },
      }),
    );
    setProgress(null);
  }, [dispatch, editorData, review.status]);

  const appliedSet = useMemo(
    () => new Set(activeVersion?.appliedFixKeys ?? []),
    [activeVersion?.appliedFixKeys],
  );

  const reanchored = useMemo(() => {
    if (!activeVersion) return [];
    const { review: projected } = projectEditorToReview(editorData);
    return activeVersion.findings.map((f) => {
      // Once a fix is applied, its old matchedText is gone by design (that's the point) — live
      // re-anchoring would otherwise reclassify it as "unresolved" and bury it in "Could not
      // locate" instead of showing the resolved state the task asks for. Pin it resolved instead.
      if (appliedSet.has(E.dismissKey(f))) return { ...f, unresolved: false, resolved: true };
      return { ...f, ...E.reanchorFinding(f, projected) };
    });
  }, [activeVersion, editorData, appliedSet]);

  const resolved = useMemo(() => reanchored.filter((f) => !f.unresolved), [reanchored]);
  const unresolvedItems = useMemo(() => reanchored.filter((f) => f.unresolved), [reanchored]);

  const activeCats = E.CATEGORIES.filter((c) => !c.requiresJD);
  const skippedList = E.CATEGORIES.filter((c) => c.requiresJD).map((c) => c.name);

  const dismissedSet = new Set(activeVersion?.dismissedKeys ?? []);

  const bySeverity = (f: Finding) => filterSeverity === 'all' || f.severity === filterSeverity;
  const byCategory = (f: Finding) => filterCategory === 'all' || f.category === filterCategory;
  const catCounted = resolved.filter((f) => !dismissedSet.has(E.dismissKey(f))).filter(bySeverity);

  const categoryChips: FilterChip[] = [
    { id: 'all', label: `All (${catCounted.length})` },
    ...activeCats.map((c) => ({
      id: c.id,
      label: `${c.name} (${catCounted.filter((f) => f.category === c.id).length})`,
    })),
  ]
    .filter((c) => c.id === 'all' || catCounted.some((f) => f.category === c.id))
    .map((c) => {
      const on = filterCategory === c.id;
      return {
        ...c,
        pressed: on,
        pick: () => setFilterCategory(on ? 'all' : c.id),
        bg: on ? '#3E5C76' : 'transparent',
        fg: on ? '#fff' : '#54504A',
        brd: on ? '#3E5C76' : '#DDD8CF',
      };
    });
  const severityChips: FilterChip[] = ['all', 'critical', 'warning', 'suggestion'].map((id) => {
    const on = filterSeverity === id;
    return {
      id,
      label: id === 'all' ? 'All' : SEV_META[id as Severity].label,
      pressed: on,
      pick: () => setFilterSeverity(on ? 'all' : id),
      bg: on ? '#3E5C76' : 'transparent',
      fg: on ? '#fff' : '#54504A',
      brd: on ? '#3E5C76' : '#DDD8CF',
    };
  });

  const catOrder: Record<string, number> = {};
  activeCats.forEach((c, i) => (catOrder[c.id] = i));

  const dismissedCount = resolved.filter((f) => dismissedSet.has(E.dismissKey(f))).length;

  const findingItems = resolved
    .filter(bySeverity)
    .filter(byCategory)
    .filter((f) => showDismissed || !dismissedSet.has(E.dismissKey(f)))
    .sort(
      (a, b) =>
        catOrder[a.category] - catOrder[b.category] || SEV_RANK[b.severity] - SEV_RANK[a.severity],
    )
    .map((f) => {
      const key = E.dismissKey(f);
      const catName = (E.CATEGORIES.find((c) => c.id === f.category) as any)?.name || f.category;
      return {
        key,
        color: SEV_META[f.severity].color,
        categoryLabel: catName,
        message: f.message,
        hasQuote: !!f.matchedText,
        quote: (f.matchedText || '').length > 90 ? f.matchedText.slice(0, 90) + '…' : f.matchedText,
        hasSuggestion: !f.grouped && f.suggestion != null,
        suggestion: f.suggestion,
        applied: appliedSet.has(key),
        dismissed: dismissedSet.has(key),
        dismissLbl: dismissedSet.has(key) ? 'Restore' : 'Dismiss',
        onApply: () => {
          const result = computeApplyFixResult(f, editorData);
          if (result.ok && activeVersion) {
            dispatchApplyAction(dispatch, result.action);
            dispatch(reviewActions.markFixApplied({ versionId: activeVersion.id, key }));
          }
          return result;
        },
        onToggleDismiss: () =>
          activeVersion &&
          dispatch(reviewActions.toggleDismissed({ versionId: activeVersion.id, key })),
      };
    });

  const scoreBuckets = (activeVersion?.score.buckets ?? []).map((b) => ({
    label: b.label,
    score: b.score,
    max: b.max,
    pct: Math.round((b.score / b.max) * 100),
    color: b.score / b.max < 0.5 ? '#B04A42' : b.score / b.max < 0.8 ? '#C68A2E' : '#5B8A6B',
  }));

  const completeness = activeVersion?.score.completeness;
  const completenessNote =
    completeness && completeness.passed < completeness.total
      ? `${completeness.passed}/${completeness.total} core sections present — missing: ${completeness.missing.join(', ')}`
      : null;

  const versionTabs = review.versions.map((v) => ({
    id: v.id,
    label: `v${v.id}`,
    score: v.score.total,
    timeLabel: new Date(v.createdAt).toLocaleString(),
    active: v.id === review.activeVersionId,
  }));

  const judgmentNotice =
    activeVersion && activeVersion.judgmentStatus.writingQuality !== 'ok'
      ? 'AI analysis did not finish for this version — some writing-quality and leadership findings may be missing. Regenerate to try again.'
      : null;

  return (
    <Drawer
      side="left"
      open={open}
      onToggle={onToggle}
      title="Resume Review"
      subtitle="23-category checklist · fixes apply straight into your resume"
      toggleLabel={open ? 'Close review' : 'Open review'}
      width={380}
    >
      <ReviewProgress
        showEmpty={!hasData && !generating}
        canGenerate={!isEmpty}
        emptyHint="Add resume content to generate a review"
        onGenerate={generateReview}
        showProgress={generating}
        progressLabel={progress?.label ?? 'Working…'}
        progressPct={progress?.pct ?? 10}
        showRegenBar={!generating && hasData}
        generating={generating}
        onRegenerate={generateReview}
        dismissedToggleLbl={showDismissed ? 'Hide dismissed' : `Show dismissed (${dismissedCount})`}
        toggleShowDismissed={() => setShowDismissed((s) => !s)}
        judgmentNotice={judgmentNotice}
      />

      {review.versions.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <ScoreHistoryChart points={review.versions.map((v) => ({ id: v.id, score: v.score.total }))} />
        </div>
      )}

      <ReviewVersionSwitcher
        versions={versionTabs}
        onSelect={(id) => dispatch(reviewActions.setActiveVersion({ id }))}
      />

      {hasData && (
        <ReviewScore
          scoreTotal={activeVersion!.score.total}
          scoreBuckets={scoreBuckets}
          completenessNote={completenessNote}
        />
      )}

      {hasData && <ReviewFilters severityChips={severityChips} categoryChips={categoryChips} />}

      <ReviewFindingsList
        showFindings={hasData}
        findingItems={findingItems}
        hasNoVisible={hasData && findingItems.length === 0}
        showUnresolved={hasData && unresolvedItems.length > 0}
        unresolvedCount={unresolvedItems.length}
        unresolvedItems={unresolvedItems.map((f) => ({ message: f.message }))}
        showSkippedNote={hasData}
        toggleSkipped={() => setShowSkipped((s) => !s)}
        skippedToggleLbl={
          showSkipped ? 'Hide skipped categories' : `${skippedList.length} categories skipped (no job description)`
        }
        showSkipped={showSkipped}
        skippedList={skippedList}
      />
    </Drawer>
  );
}
