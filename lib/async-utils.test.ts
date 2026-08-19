import test from 'node:test';
import assert from 'node:assert/strict';
import { debounce, sleep } from './async-utils.ts';

test('debounce: coalesces a burst of calls into one trailing invocation', async () => {
  let calls = 0;
  let lastArg = -1;
  const d = debounce((n: number) => {
    calls++;
    lastArg = n;
  }, 20);
  d(1);
  d(2);
  d(3);
  await sleep(60);
  assert.equal(calls, 1, 'only the trailing call should have run');
  assert.equal(lastArg, 3, 'the trailing call gets the most recent arguments');
});

test('debounce: cancel() prevents a pending call from running', async () => {
  let calls = 0;
  const d = debounce(() => calls++, 15);
  d();
  d.cancel();
  await sleep(40);
  assert.equal(calls, 0);
});

test('debounce: separate bursts each produce their own trailing call', async () => {
  let calls = 0;
  const d = debounce(() => calls++, 15);
  d();
  await sleep(40);
  d();
  await sleep(40);
  assert.equal(calls, 2);
});
