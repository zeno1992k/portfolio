import assert from 'node:assert/strict';
import test from 'node:test';
import { categoryGroups } from '../data/categories';
import { terms } from '../data/terms';
import { buildQueue, type CardProgress } from './study';
import {
  buildCurriculumQueue, buildLearningQueue, defaultLearningCategoryIds, discoveryTerms, LEARNING_CATEGORIES_STORAGE_KEY, LearningCategoriesStore,
  readLearningCategories, readLearningLevel, selectLearningTerms, type LearningCategoriesStorage,
} from './learning-categories';

class FakeStorage implements LearningCategoriesStorage {
  values = new Map<string, string>();
  readBlocked = false;
  writeBlocked = false;
  writes = 0;
  getItem(key: string) { if (this.readBlocked) throw new Error('Read blocked'); return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.writes++; if (this.writeBlocked) throw new Error('Write blocked'); this.values.set(key, value); }
}

test('the default selection contains all seven groups and preserves the entire term catalog', () => {
  assert.equal(defaultLearningCategoryIds().length, 7);
  assert.deepEqual(defaultLearningCategoryIds(), categoryGroups.map(group => group.id));
  assert.deepEqual(selectLearningTerms(terms, defaultLearningCategoryIds()), terms);
});

test('saved selection strips unknown IDs and duplicates, keeping a stable group order', () => {
  assert.deepEqual(readLearningCategories({ version: 1, groupIds: ['browser-network', 'removed', 'web-basics', 'browser-network', false] }), ['web-basics', 'browser-network']);
});

test('empty, unsupported or malformed saved selections fall back to all groups', () => {
  for (const value of [null, [], 'broken', {}, { version: 3, groupIds: ['web-basics'] }, { version: 1, groupIds: [] }, { version: 1, groupIds: ['removed'] }]) {
    assert.deepEqual(readLearningCategories(value), defaultLearningCategoryIds());
  }
  const first = readLearningCategories(null); first.pop();
  assert.equal(readLearningCategories(null).length, 7, 'Fallback arrays are not shared');
});

test('legacy group settings migrate without losing the selection and default to learning from basics', () => {
  const storage = new FakeStorage();
  storage.values.set(LEARNING_CATEGORIES_STORAGE_KEY, JSON.stringify({ version: 1, groupIds: ['react-app'] }));
  const store = new LearningCategoriesStore(storage);
  assert.deepEqual(store.getSnapshot().selectedGroupIds, ['react-app']);
  assert.equal(store.getSnapshot().selectedLevel, 'all');
  assert.equal(storage.writes, 0, 'Reading legacy preferences does not rewrite them');
  assert.equal(store.setSelection(['react-app', 'browser-network'], 'practical'), true);
  const reloaded = new LearningCategoriesStore(storage);
  assert.deepEqual(reloaded.getSnapshot().selectedGroupIds, ['browser-network', 'react-app']);
  assert.equal(reloaded.getSnapshot().selectedLevel, 'practical');
  assert.equal(JSON.parse(storage.values.get(LEARNING_CATEGORIES_STORAGE_KEY)!).version, 2);
  for (const invalid of [null, { version: 1, level: 'advanced' }, { version: 2, level: 'removed' }, { version: 3, level: 'foundation' }]) {
    assert.equal(readLearningLevel(invalid), 'all');
  }
});

test('difficulty and group filters intersect while all preserves the complete catalog', () => {
  const filtered = selectLearningTerms(terms, ['react-app'], 'foundation');
  assert.ok(filtered.length > 0);
  assert.ok(filtered.every(term => term.level === 'foundation'));
  assert.ok(filtered.every(term => selectLearningTerms([term], ['react-app']).length === 1));
  assert.deepEqual(selectLearningTerms(terms, defaultLearningCategoryIds(), 'all'), terms);
});

test('curriculum keeps due reviews first and advances new cards by level, shuffling within a level', () => {
  const now = 10000;
  const due = (dueAt: number): CardProgress => ({ dueAt, interval: 1, reviews: 1, lastRating: 'good', lastReviewedAt: 1 });
  const candidates = [
    { id: 'advanced-new', level: 'advanced' }, { id: 'practical-new', level: 'practical' },
    { id: 'basic-a', level: 'foundation' }, { id: 'advanced-due', level: 'advanced' },
    { id: 'basic-b', level: 'foundation' }, { id: 'future', level: 'foundation' },
    { id: 'basic-a', level: 'foundation' }, { id: 'older-due', level: 'practical' },
  ] as const;
  const progress = { 'advanced-due': due(200), 'older-due': due(100), future: due(now + 1) };
  assert.deepEqual(buildCurriculumQueue(candidates, progress, now, () => 0), ['older-due', 'advanced-due', 'basic-b', 'basic-a', 'practical-new']);
  assert.deepEqual(buildCurriculumQueue(candidates, { ...progress, 'basic-a': due(now + 1), 'basic-b': due(now + 1) }, now, () => 0), ['older-due', 'advanced-due', 'practical-new', 'advanced-new']);
  assert.deepEqual(discoveryTerms(candidates, progress).map(term => term.id), ['basic-a', 'basic-b', 'basic-a']);
});

test('difficulty persists in memory after blocked storage and invalid changes do not discard it', () => {
  const storage = new FakeStorage(), store = new LearningCategoriesStore(storage);
  storage.writeBlocked = true;
  assert.equal(store.setSelection(['quality'], 'advanced'), false);
  assert.equal(store.getSnapshot().selectedLevel, 'advanced');
  storage.readBlocked = true; store.refreshFromStorage();
  assert.equal(store.getSnapshot().selectedLevel, 'advanced');
  assert.equal(store.setSelection([], 'foundation'), false);
  assert.equal(store.setSelection(['quality'], 'invalid' as never), false);
  assert.equal(store.getSnapshot().selectedLevel, 'advanced');
});

test('selected groups produce queue candidates without changing due-first review semantics', () => {
  const now = 10000;
  const all = [
    { id: 'new-web', category: 'html' }, { id: 'excluded-due', category: 'react' },
    { id: 'recent-due', category: 'http' }, { id: 'oldest-due', category: 'css' },
    { id: 'future-web', category: 'javascript' }, { id: 'new-net', category: 'browser' },
  ];
  const progress = (dueAt: number): CardProgress => ({ dueAt, interval: 1, reviews: 1, lastRating: 'good', lastReviewedAt: 1 });
  const candidates = selectLearningTerms(all, ['web-basics', 'browser-network']).map(term => term.id);
  assert.deepEqual(candidates, ['new-web', 'recent-due', 'oldest-due', 'future-web', 'new-net']);
  assert.deepEqual(buildQueue(candidates, {
    'excluded-due': progress(1), 'oldest-due': progress(100), 'recent-due': progress(200), 'future-web': progress(now + 1),
  }, now), ['oldest-due', 'recent-due', 'new-web', 'new-net']);
});

test('daily queue keeps due priority and stable ties while shuffling only unseen cards', () => {
  const now = 10000;
  const progress = (dueAt: number): CardProgress => ({ dueAt, interval: 1, reviews: 1, lastRating: 'good', lastReviewedAt: 1 });
  const samples = [0.9, 0.1, 0.4]; let calls = 0;
  const queue = buildLearningQueue(['a', 'recent', 'b', 'old-tie-first', 'c', 'old-tie-second', 'd'], {
    recent: progress(200), 'old-tie-first': progress(100), 'old-tie-second': progress(100),
  }, now, () => samples[calls++]);
  assert.deepEqual(queue, ['old-tie-first', 'old-tie-second', 'recent', 'b', 'c']);
  assert.equal(calls, 3, 'Only four unseen cards participate in Fisher–Yates');
});

test('daily queue excludes future reviews and duplicates, caps at five, and accepts fewer cards', () => {
  const future: CardProgress = { dueAt: 10001, interval: 1, reviews: 1, lastRating: 'good', lastReviewedAt: 1 };
  assert.deepEqual(buildLearningQueue(['future', 'a', 'a', 'b'], { future }, 10000, () => 0), ['b', 'a']);
  assert.deepEqual(buildLearningQueue(['a', 'b', 'c', 'd', 'e', 'f', 'g'], {}, 10000, () => 0), ['b', 'c', 'd', 'e', 'f']);
  assert.deepEqual(buildLearningQueue(['future', 'future'], { future }, 10000, () => { throw new Error('No unseen shuffle expected'); }), []);
  assert.deepEqual(buildLearningQueue([], {}, 10000), []);
});

test('daily queue does not reorder due-only reviews or mutate the candidate input', () => {
  const due: CardProgress = { dueAt: 1, interval: 1, reviews: 1, lastRating: 'good', lastReviewedAt: 1 };
  const ids = Object.freeze(['first', 'second', 'first']);
  assert.deepEqual(buildLearningQueue(ids, { first: due, second: due }, 10000, () => { throw new Error('Due cards do not shuffle'); }), ['first', 'second']);
  assert.deepEqual(ids, ['first', 'second', 'first']);
});

test('missing settings do not silently write defaults, while explicit valid selection survives reload', () => {
  const storage = new FakeStorage(), store = new LearningCategoriesStore(storage);
  assert.equal(storage.writes, 0);
  assert.equal(store.setSelectedGroupIds(['browser-network', 'web-basics']), true);
  assert.deepEqual(new LearningCategoriesStore(storage).getSnapshot().selectedGroupIds, ['web-basics', 'browser-network']);
});

test('an empty or all-invalid user update is rejected without losing the previous selection', () => {
  const storage = new FakeStorage(), store = new LearningCategoriesStore(storage);
  store.setSelectedGroupIds(['react-app']); const writes = storage.writes;
  assert.equal(store.setSelectedGroupIds([]), false); assert.equal(store.setSelectedGroupIds(['removed']), false);
  assert.deepEqual(store.getSnapshot().selectedGroupIds, ['react-app']); assert.equal(storage.writes, writes);
});

test('initial read failures keep learning available with all groups and an honest warning', () => {
  const storage = new FakeStorage(); storage.readBlocked = true;
  const store = new LearningCategoriesStore(storage);
  assert.deepEqual(store.getSnapshot().selectedGroupIds, defaultLearningCategoryIds());
  assert.match(store.getSnapshot().storageIssue, /읽지 못/);
  assert.deepEqual(new LearningCategoriesStore(null).getSnapshot().selectedGroupIds, defaultLearningCategoryIds());
});

test('failed writes apply only in memory, return false, and recover after a successful explicit save', () => {
  const storage = new FakeStorage(), store = new LearningCategoriesStore(storage); storage.writeBlocked = true;
  assert.equal(store.setSelectedGroupIds(['quality']), false);
  assert.deepEqual(store.getSnapshot().selectedGroupIds, ['quality']); assert.match(store.getSnapshot().storageIssue, /이 탭에서만/);
  assert.deepEqual(new LearningCategoriesStore(storage).getSnapshot().selectedGroupIds, defaultLearningCategoryIds());
  storage.writeBlocked = false; assert.equal(store.setSelectedGroupIds(['quality']), true);
  assert.equal(store.getSnapshot().storageIssue, ''); assert.deepEqual(new LearningCategoriesStore(storage).getSnapshot().selectedGroupIds, ['quality']);
});

test('external saved changes and clearing storage refresh the device preference', () => {
  const storage = new FakeStorage(), first = new LearningCategoriesStore(storage), second = new LearningCategoriesStore(storage);
  second.setSelectedGroupIds(['cs']); first.refreshFromStorage(); assert.deepEqual(first.getSnapshot().selectedGroupIds, ['cs']);
  storage.values.delete(LEARNING_CATEGORIES_STORAGE_KEY); first.refreshFromStorage(); assert.deepEqual(first.getSnapshot().selectedGroupIds, defaultLearningCategoryIds());
});

test('refresh read failure preserves a chosen in-memory scope, while malformed JSON safely resets it', () => {
  const storage = new FakeStorage(), store = new LearningCategoriesStore(storage); store.setSelectedGroupIds(['quality']);
  storage.readBlocked = true; store.refreshFromStorage(); assert.deepEqual(store.getSnapshot().selectedGroupIds, ['quality']);
  storage.readBlocked = false; storage.values.set(LEARNING_CATEGORIES_STORAGE_KEY, '{broken'); store.refreshFromStorage();
  assert.deepEqual(store.getSnapshot().selectedGroupIds, defaultLearningCategoryIds()); assert.match(store.getSnapshot().storageIssue, /전체 분야/);
});
