import test from 'node:test';
import assert from 'node:assert/strict';
import { groupAssignmentsByPage } from './group-by-page.ts';

test('groupAssignmentsByPage: splits blocks per their assignment', () => {
  const blocks = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
  const assignments = [
    { blockKey: 'a', pageIndex: 0 },
    { blockKey: 'b', pageIndex: 0 },
    { blockKey: 'c', pageIndex: 1 },
  ];
  const pages = groupAssignmentsByPage(blocks, assignments, 2);
  assert.deepEqual(
    pages.map((p) => p.map((f) => f.fragmentKey)),
    [['a', 'b'], ['c']],
  );
});

test('groupAssignmentsByPage: unknown block inherits the previous block\'s page, not page 0', () => {
  const blocks = [{ key: 'a' }, { key: 'b' }, { key: 'new' }];
  const assignments = [
    { blockKey: 'a', pageIndex: 0 },
    { blockKey: 'b', pageIndex: 2 },
  ];
  const pages = groupAssignmentsByPage(blocks, assignments, 3);
  assert.deepEqual(pages[2].map((f) => f.fragmentKey), ['b', 'new']);
  assert.deepEqual(pages[0].map((f) => f.fragmentKey), ['a']);
});

test('groupAssignmentsByPage: the very first unknown block defaults to page 0', () => {
  const pages = groupAssignmentsByPage([{ key: 'new' }], [], 1);
  assert.deepEqual(pages[0].map((f) => f.fragmentKey), ['new']);
});

test('groupAssignmentsByPage: always returns at least pageCount buckets, even if some are empty', () => {
  const pages = groupAssignmentsByPage([{ key: 'a' }], [{ blockKey: 'a', pageIndex: 0 }], 3);
  assert.equal(pages.length, 3);
  assert.deepEqual(pages[1], []);
  assert.deepEqual(pages[2], []);
});

test('groupAssignmentsByPage: pageCount is floored at 1', () => {
  const pages = groupAssignmentsByPage([], [], 0);
  assert.equal(pages.length, 1);
});

test('groupAssignmentsByPage: a paragraph split across 3 pages expands into 3 keyed fragments', () => {
  const blocks = [{ key: 'p' }];
  const assignments = [
    { blockKey: 'p', pageIndex: 0, startOffset: 0, endOffset: 10 },
    { blockKey: 'p', pageIndex: 1, startOffset: 10, endOffset: 25 },
    { blockKey: 'p', pageIndex: 2, startOffset: 25, endOffset: 30 },
  ];
  const pages = groupAssignmentsByPage(blocks, assignments, 3);
  assert.deepEqual(pages[0][0], {
    pageIndex: 0,
    fragmentKey: 'p#0',
    block: { key: 'p' },
    startOffset: 0,
    endOffset: 10,
    fragmentIndex: 0,
    fragmentCount: 3,
  });
  assert.equal(pages[1][0].fragmentKey, 'p#1');
  assert.equal(pages[2][0].fragmentKey, 'p#2');
});

test('groupAssignmentsByPage: an unsplit paragraph (one assignment) keeps its plain key', () => {
  const blocks = [{ key: 'p' }];
  const assignments = [{ blockKey: 'p', pageIndex: 0 }];
  const pages = groupAssignmentsByPage(blocks, assignments, 1);
  assert.equal(pages[0][0].fragmentKey, 'p');
  assert.equal(pages[0][0].fragmentCount, 1);
});
