import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDotPath, ensureArrayAtDotPath } from './dot-path.ts';

test('resolveDotPath: missing skillLevels is undefined (add-skill crash input)', () => {
  const data = { sections: [{ type: 'skills', body: 'React, TypeScript' }] };
  assert.equal(resolveDotPath(data, 'sections.0.skillLevels'), undefined);
});

test('ensureArrayAtDotPath: push succeeds when skillLevels was never initialized', () => {
  const data: { sections: Array<Record<string, unknown>> } = {
    sections: [{ type: 'skills', body: 'React, TypeScript' }],
  };
  ensureArrayAtDotPath(data, 'sections.0.skillLevels').push({ name: '', level: '60' });
  assert.deepEqual(data.sections[0].skillLevels, [{ name: '', level: '60' }]);
});

test('ensureArrayAtDotPath: reuses an existing array', () => {
  const data = { sections: [{ skillLevels: [{ name: 'Go', level: '80' }] }] };
  ensureArrayAtDotPath(data, 'sections.0.skillLevels').push({ name: 'Rust', level: '40' });
  assert.equal(data.sections[0].skillLevels.length, 2);
  assert.equal(data.sections[0].skillLevels[1].name, 'Rust');
});
