import assert from 'node:assert/strict';
import test from 'node:test';
import { transformWithOxc } from 'vite';
import { categories, categoryGroups, getCategory } from '../data/categories';
import { legacyTermMetadata } from '../data/legacy-term-metadata';
import { expandedWebTerms } from '../data/expanded-web-terms';
import { expandedAppTerms } from '../data/expanded-app-terms';
import { expandedPracticeTerms } from '../data/expanded-practice-terms';
import { interviewWebTerms } from '../data/interview-web-terms';
import { interviewAppTerms } from '../data/interview-app-terms';
import { interviewPracticeTerms } from '../data/interview-practice-terms';
import { coreInterviewNotes } from '../data/core-interview-notes';
import { termKinds, termLevels } from '../data/term-levels';
import { terms } from '../data/terms';
import { filterTerms } from './catalog';
import { readState, type CardProgress } from './study';

test('the expanded catalog contains 670 distinct cards in the seven areas', () => {
  assert.equal(terms.length, 670);
  assert.equal(new Set(terms.map(term => term.id)).size, terms.length);
  assert.equal(new Set(terms.map(term => term.term.toLowerCase().trim())).size, terms.length);
  const expected = [192, 131, 160, 41, 52, 38, 56];
  categoryGroups.forEach((group, index) => {
    assert.equal(terms.filter(term => getCategory(term.category).groupId === group.id).length, expected[index], group.label);
  });
  for (const level of termLevels) assert.ok(terms.some(term => term.level === level.id), `${level.label} cards exist`);
});

test('cards have valid metadata, meaningful content and HTTPS documentation links', () => {
  const names = new Set(terms.map(term => term.term));
  for (const term of terms) {
    assert.match(term.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, term.id);
    assert.ok(categories.some(category => category.id === term.category), term.id);
    assert.ok(termLevels.some(level => level.id === term.level), term.id);
    assert.ok(termKinds.some(kind => kind.id === term.kind), term.id);
    for (const field of ['term', 'korean', 'question', 'definition', 'example', 'caution'] as const) {
      assert.ok(term[field].trim().length > 0, `${term.id}: ${field}`);
    }
    assert.ok(term.related.length >= 2, `${term.id}: related`);
    for (const name of term.related) assert.ok(names.has(name), `${term.id}: unresolved related card ${name}`);
    assert.equal(new URL(term.source).protocol, 'https:', `${term.id}: source`);
    if (!(term.id in legacyTermMetadata)) {
      assert.ok((term.tags?.length ?? 0) >= 2, `${term.id}: tags`);
      if (term.code) {
        assert.ok(term.codeLanguage, `${term.id}: code language`);
        assert.ok(term.code.split('\n').length <= 20, `${term.id}: example should fit a short card`);
      }
    }
  }
});

test('new JavaScript and React code examples parse as their declared languages', async () => {
  for (const term of terms.filter(term => !(term.id in legacyTermMetadata))) {
    if (!term.code || !['javascript', 'typescript', 'jsx', 'tsx'].includes(term.codeLanguage ?? '')) continue;
    const extension = { javascript: 'js', typescript: 'ts', jsx: 'jsx', tsx: 'tsx' }[term.codeLanguage as 'javascript' | 'typescript' | 'jsx' | 'tsx'];
    await assert.doesNotReject(() => transformWithOxc(term.code!, `${term.id}.${extension}`), term.id);
  }
});

test('search, area and difficulty filters combine and reset to the complete catalog', () => {
  const selected = filterTerms(terms, { group: 'web-basics', category: 'javascript', level: 'foundation', query: '' });
  assert.ok(selected.length > 0);
  assert.ok(selected.every(term => term.category === 'javascript' && term.level === 'foundation'));
  const matches = filterTerms(terms, { group: 'all', category: 'all', level: 'all', query: '  cLosURe  ' });
  assert.ok(matches.some(term => term.id === 'closure'));
  assert.ok(matches.some(term => term.id === 'stale-closure'));
  assert.deepEqual(filterTerms(terms, { group: 'all', category: 'all', level: 'foundation', query: 'Closure' }), []);
  assert.equal(filterTerms(terms, { group: 'all', category: 'all', query: '' }).length, 670);
});

test('interview practice combines with search, category and level without hiding the complete catalog on reset', () => {
  const all = { group: 'all', category: 'all', level: 'all', query: '' } as const;
  assert.equal(filterTerms(terms, { ...all, interviewOnly: true }).length, 390);
  const selected = filterTerms(terms, { ...all, interviewOnly: true, category: 'react', level: 'advanced' });
  assert.ok(selected.length > 0);
  assert.ok(selected.every(term => term.interview && term.category === 'react' && term.level === 'advanced'));
  assert.equal(filterTerms(terms, { ...all, interviewOnly: false }).length, 670);
  assert.deepEqual(filterTerms(terms, { ...all, interviewOnly: true, category: 'css', query: 'Closure' }), []);
});

test('all original 52 IDs retain saved bookmarks, progress, history and a resumed session', () => {
  const ids = Object.keys(legacyTermMetadata);
  assert.equal(ids.length, 52);
  const progress: CardProgress = { dueAt: 10000, interval: 1, reviews: 1, lastRating: 'good', lastReviewedAt: 1 };
  const state = {
    version: 1, bookmarks: ids,
    progress: Object.fromEntries(ids.map(id => [id, progress])),
    history: ids.map(id => ({ id, rating: 'good', at: 1 })),
    session: { ids: ids.slice(0, 5), index: 2, revealed: true, ratings: ['good', 'good'], startedAt: 1 },
  };
  const restored = readState(state, terms.map(term => term.id));
  assert.deepEqual(restored, state);
});

test('the additional 200 cards contain complete interview practice and preserve all previous 300 IDs', () => {
  const added = [...interviewWebTerms, ...interviewAppTerms, ...interviewPracticeTerms];
  assert.equal(added.length, 200);
  for (const term of added) {
    assert.ok(term.definition.length >= 40, `${term.id}: explain the mechanism`);
    for (const field of ['question', 'answer', 'followUp'] as const) {
      assert.ok((term.interview?.[field].trim().length ?? 0) >= (field === 'answer' ? 60 : 10), `${term.id}: interview ${field}`);
    }
    assert.ok(term.interview!.answer !== term.definition, `${term.id}: interview answer must add context`);
  }
  assert.equal(Object.keys(coreInterviewNotes).length, 20);
  const previousIds = [...Object.keys(legacyTermMetadata), ...expandedWebTerms.map(t => t.id), ...expandedAppTerms.map(t => t.id), ...expandedPracticeTerms.map(t => t.id)];
  assert.equal(new Set(previousIds).size, 300);
  const previous = new Set(previousIds);
  assert.ok(added.every(term => !previous.has(term.id)));
  const state = readState({ version: 1, bookmarks: previousIds, progress: {}, history: [], session: null }, terms.map(term => term.id));
  assert.deepEqual(state.bookmarks, previousIds);
  for (const id of Object.keys(coreInterviewNotes)) assert.ok(previous.has(id), id);
});
