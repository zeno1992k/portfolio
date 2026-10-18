import assert from 'node:assert/strict';
import test from 'node:test';
import { paintSelection, segmentHitsBounds, type DragBounds } from './drag-selection.ts';

const row: DragBounds = { left: 10, right: 30, top: 20, bottom: 40 };

test('a fast vertical movement intersects every skipped row', () => {
  const rows = [0, 40, 80, 120].map((top) => ({ left: 10, right: 30, top, bottom: top + 30 }));
  assert.deepEqual(rows.map((bounds) => segmentHitsBounds({ x: 20, y: -10 }, { x: 20, y: 160 }, bounds)),
    [true, true, true, true]);
  assert.equal(segmentHitsBounds({ x: 31, y: -10 }, { x: 31, y: 160 }, row), false);
});

test('a diagonal is tested as a segment, rather than its overlapping bounding box', () => {
  const from = { x: 0, y: 0 };
  const to = { x: 10, y: 10 };
  assert.equal(segmentHitsBounds(from, to, { left: 0, right: 4, top: 6, bottom: 10 }), false);
  assert.equal(segmentHitsBounds(from, to, { left: 4, right: 6, top: 4, bottom: 6 }), true);
  assert.equal(segmentHitsBounds(from, to, { left: 4, right: 6, top: 6, bottom: 8 }), true);
});

test('horizontal movement includes boundary contact but does not hit nearby rows', () => {
  assert.equal(segmentHitsBounds({ x: 0, y: 20 }, { x: 40, y: 20 }, row), true);
  assert.equal(segmentHitsBounds({ x: 0, y: 19 }, { x: 40, y: 19 }, row), false);
  assert.equal(segmentHitsBounds({ x: 0, y: 30 }, { x: 9, y: 30 }, row), false);
  assert.equal(segmentHitsBounds({ x: 0, y: 30 }, { x: 10, y: 30 }, row), true);
});

test('stationary contacts hit only points inside or on the rectangle', () => {
  for (const point of [{ x: 20, y: 30 }, { x: 10, y: 20 }, { x: 30, y: 40 }]) {
    assert.equal(segmentHitsBounds(point, point, row), true);
  }
  for (const point of [{ x: 9, y: 30 }, { x: 20, y: 41 }]) {
    assert.equal(segmentHitsBounds(point, point, row), false);
  }
});

test('reversing the drag direction preserves hit detection', () => {
  const movements = [
    [{ x: 20, y: 0 }, { x: 20, y: 60 }],
    [{ x: 0, y: 30 }, { x: 50, y: 30 }],
    [{ x: 0, y: 0 }, { x: 40, y: 60 }],
    [{ x: 0, y: 0 }, { x: 8, y: 60 }],
    [{ x: 20, y: 30 }, { x: 50, y: 60 }],
  ];
  for (const [from, to] of movements) {
    assert.equal(segmentHitsBounds(from, to, row), segmentHitsBounds(to, from, row));
  }
});

test('invalid coordinates and zero-area or inverted bounds are ignored', () => {
  const invalidBounds = [
    { ...row, left: row.right }, { ...row, top: row.bottom },
    { ...row, left: row.right + 1 }, { ...row, top: row.bottom + 1 },
    { ...row, left: Number.NaN }, { ...row, bottom: Number.POSITIVE_INFINITY },
  ];
  for (const bounds of invalidBounds) {
    assert.equal(segmentHitsBounds({ x: 0, y: 0 }, { x: 100, y: 100 }, bounds), false);
  }
  assert.equal(segmentHitsBounds({ x: Number.NaN, y: 30 }, { x: 20, y: 30 }, row), false);
  assert.equal(segmentHitsBounds({ x: 20, y: 30 }, { x: 20, y: Number.NEGATIVE_INFINITY }, row), false);
});

test('selection painting adds only missing IDs in visit order', () => {
  assert.deepEqual(paintSelection(['react', 'css'], ['css', 'http', 'react', 'browser', 'http'], true),
    ['react', 'css', 'http', 'browser']);
});

test('clear painting removes selected IDs while preserving unaffected order', () => {
  assert.deepEqual(paintSelection(['react', 'css', 'http', 'browser'], ['css', 'typescript', 'browser', 'css'], false),
    ['react', 'http']);
});

test('repeated visits are idempotent for both selecting and clearing', () => {
  const selected = paintSelection(['css'], ['react', 'http'], true);
  assert.deepEqual(paintSelection(selected, ['http', 'react', 'react'], true), selected);
  const cleared = paintSelection(selected, ['react', 'http'], false);
  assert.deepEqual(paintSelection(cleared, ['react', 'http', 'http'], false), cleared);
});

test('inputs remain unchanged and duplicate selections are normalized', () => {
  const selected = Object.freeze(['react', 'css', 'react'] as const);
  const visited = Object.freeze(['css', 'http', 'http'] as const);
  assert.deepEqual(paintSelection(selected, visited, true), ['react', 'css', 'http']);
  assert.deepEqual(paintSelection(selected, visited, false), ['react']);
  assert.deepEqual(selected, ['react', 'css', 'react']);
  assert.deepEqual(visited, ['css', 'http', 'http']);
  assert.deepEqual(paintSelection(selected, [], true), ['react', 'css']);
  assert.deepEqual(paintSelection([], [], false), []);
});
