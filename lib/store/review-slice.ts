// Review versions for the editor's Review drawer. Every generation appends a new sequential
// version (v1, v2, ...) rather than overwriting by content hash — the point is to let the user
// switch between and compare past versions, not cache the "latest for this exact text."
// Session-only: not persisted to localStorage, consistent with editorResume itself not
// surviving a hard reload either.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CompletenessResult, Finding } from '../resume-review-engine';

export interface ReviewScore {
  total: number;
  buckets: Array<{ id: string; label: string; max: number; score: number }>;
  completeness: CompletenessResult;
}

export interface JudgmentStatus {
  writingQuality: string;
  contentQuality: string;
}

export interface ReviewVersion {
  id: number;
  createdAt: number;
  findings: Finding[];
  score: ReviewScore;
  judgmentStatus: JudgmentStatus;
  appliedFixKeys: string[];
  dismissedKeys: string[];
}

interface ReviewState {
  versions: ReviewVersion[];
  activeVersionId: number | null;
  status: 'idle' | 'generating';
}

const initialState: ReviewState = {
  versions: [],
  activeVersionId: null,
  status: 'idle',
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    startGenerating(state) {
      state.status = 'generating';
    },
    generationFailed(state) {
      state.status = 'idle';
    },
    reviewGenerated(
      state,
      action: PayloadAction<{
        findings: Finding[];
        score: ReviewScore;
        judgmentStatus: JudgmentStatus;
      }>,
    ) {
      const id = state.versions.length + 1;
      state.versions.push({
        id,
        createdAt: Date.now(),
        findings: action.payload.findings,
        score: action.payload.score,
        judgmentStatus: action.payload.judgmentStatus,
        appliedFixKeys: [],
        dismissedKeys: [],
      });
      state.activeVersionId = id;
      state.status = 'idle';
    },
    setActiveVersion(state, action: PayloadAction<{ id: number }>) {
      if (state.versions.some((v) => v.id === action.payload.id)) {
        state.activeVersionId = action.payload.id;
      }
    },
    markFixApplied(state, action: PayloadAction<{ versionId: number; key: string }>) {
      const version = state.versions.find((v) => v.id === action.payload.versionId);
      if (version && !version.appliedFixKeys.includes(action.payload.key)) {
        version.appliedFixKeys.push(action.payload.key);
      }
    },
    toggleDismissed(state, action: PayloadAction<{ versionId: number; key: string }>) {
      const version = state.versions.find((v) => v.id === action.payload.versionId);
      if (!version) return;
      const i = version.dismissedKeys.indexOf(action.payload.key);
      if (i >= 0) version.dismissedKeys.splice(i, 1);
      else version.dismissedKeys.push(action.payload.key);
    },
  },
});

export const reviewActions = reviewSlice.actions;
export default reviewSlice.reducer;
