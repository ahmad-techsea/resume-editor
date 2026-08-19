import test from 'node:test';
import assert from 'node:assert/strict';
import reviewReducer, { reviewActions } from './review-slice.ts';

const scoreStub = { total: 80, buckets: [], completeness: { ratio: 1, passed: 6, total: 6, missing: [] } };
const judgmentStub = { writingQuality: 'ok', contentQuality: 'ok' };

test('reviewGenerated appends sequential versions (v1, v2, ...) and activates the newest', () => {
  let state = reviewReducer(undefined, { type: '@@INIT' });
  state = reviewReducer(
    state,
    reviewActions.reviewGenerated({ findings: [], score: scoreStub, judgmentStatus: judgmentStub }),
  );
  assert.equal(state.versions.length, 1);
  assert.equal(state.versions[0].id, 1);
  assert.equal(state.activeVersionId, 1);

  state = reviewReducer(
    state,
    reviewActions.reviewGenerated({ findings: [], score: scoreStub, judgmentStatus: judgmentStub }),
  );
  assert.equal(state.versions.length, 2);
  assert.equal(state.versions[1].id, 2);
  assert.equal(state.activeVersionId, 2, 'newest generation becomes the active version');
  assert.ok(state.versions[0].createdAt > 0 && state.versions[1].createdAt > 0);
});

test('setActiveVersion switches to an existing version and ignores unknown ids', () => {
  let state = reviewReducer(undefined, { type: '@@INIT' });
  state = reviewReducer(
    state,
    reviewActions.reviewGenerated({ findings: [], score: scoreStub, judgmentStatus: judgmentStub }),
  );
  state = reviewReducer(
    state,
    reviewActions.reviewGenerated({ findings: [], score: scoreStub, judgmentStatus: judgmentStub }),
  );
  state = reviewReducer(state, reviewActions.setActiveVersion({ id: 1 }));
  assert.equal(state.activeVersionId, 1, 'can switch back to view an older version');
  state = reviewReducer(state, reviewActions.setActiveVersion({ id: 999 }));
  assert.equal(state.activeVersionId, 1, 'unknown id is ignored, not silently applied');
});

test('markFixApplied records a key on the right version only, without duplicating it', () => {
  let state = reviewReducer(undefined, { type: '@@INIT' });
  state = reviewReducer(
    state,
    reviewActions.reviewGenerated({ findings: [], score: scoreStub, judgmentStatus: judgmentStub }),
  );
  state = reviewReducer(
    state,
    reviewActions.reviewGenerated({ findings: [], score: scoreStub, judgmentStatus: judgmentStub }),
  );
  state = reviewReducer(state, reviewActions.markFixApplied({ versionId: 1, key: 'r::f::m' }));
  state = reviewReducer(state, reviewActions.markFixApplied({ versionId: 1, key: 'r::f::m' }));
  assert.deepEqual(state.versions[0].appliedFixKeys, ['r::f::m'], 'no duplicate entries');
  assert.deepEqual(state.versions[1].appliedFixKeys, [], 'other versions are untouched');
});

test('toggleDismissed flips a key on/off per version, independent of applied state', () => {
  let state = reviewReducer(undefined, { type: '@@INIT' });
  state = reviewReducer(
    state,
    reviewActions.reviewGenerated({ findings: [], score: scoreStub, judgmentStatus: judgmentStub }),
  );
  state = reviewReducer(state, reviewActions.toggleDismissed({ versionId: 1, key: 'r::f::m' }));
  assert.deepEqual(state.versions[0].dismissedKeys, ['r::f::m']);
  state = reviewReducer(state, reviewActions.toggleDismissed({ versionId: 1, key: 'r::f::m' }));
  assert.deepEqual(state.versions[0].dismissedKeys, [], 'toggling again restores it');
});

test('startGenerating / generationFailed toggle status without touching versions', () => {
  let state = reviewReducer(undefined, { type: '@@INIT' });
  state = reviewReducer(state, reviewActions.startGenerating());
  assert.equal(state.status, 'generating');
  state = reviewReducer(state, reviewActions.generationFailed());
  assert.equal(state.status, 'idle');
  assert.equal(state.versions.length, 0);
});
