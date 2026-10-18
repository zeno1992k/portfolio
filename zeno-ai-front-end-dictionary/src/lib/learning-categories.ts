import { categories, categoryGroups, type CategoryGroupId } from '../data/categories';
import { buildQueue, type CardProgress } from './study';
import { termLevels, type LearningLevel, type TermLevel } from '../data/term-levels';

export const LEARNING_CATEGORIES_STORAGE_KEY = 'commute-frontend-learning-categories-v1';

export interface LearningCategoriesSnapshot {
  selectedGroupIds: CategoryGroupId[];
  selectedLevel: LearningLevel;
  storageIssue: string;
}

export interface LearningCategoriesStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const READ_ISSUE = '학습 분야 설정을 읽지 못했어요. 이 탭에서 선택한 분야로 계속 학습할 수 있어요.';
const WRITE_ISSUE = '학습 분야를 저장하지 못했어요. 선택한 분야는 이 탭에서만 사용할 수 있어요.';
const categoryToGroup = new Map<string, CategoryGroupId>(categories.map(category => [category.id, category.groupId]));

export function defaultLearningCategoryIds(): CategoryGroupId[] {
  return categoryGroups.map(group => group.id);
}

function validSelection(value: unknown): CategoryGroupId[] {
  if (!Array.isArray(value)) return [];
  const selected = new Set(value.filter((id): id is string => typeof id === 'string'));
  return categoryGroups.filter(group => selected.has(group.id)).map(group => group.id);
}

/** Restore only known groups. Empty or unsupported saved data keeps learning available. */
export function readLearningCategories(value: unknown): CategoryGroupId[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return defaultLearningCategoryIds();
  const record = value as Record<string, unknown>;
  const selection = record.version === 1 || record.version === 2 ? validSelection(record.groupIds) : [];
  return selection.length ? selection : defaultLearningCategoryIds();
}

export function readLearningLevel(value: unknown): LearningLevel {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return 'all';
  const record = value as Record<string, unknown>;
  return record.version === 2 && isLearningLevel(record.level) ? record.level : 'all';
}

function isLearningLevel(value: unknown): value is LearningLevel {
  return value === 'all' || termLevels.some(level => level.id === value);
}

/** Filtering preserves input order, leaving review priority and shuffling to buildQueue. */
export function selectLearningTerms<T extends { category: string; level?: TermLevel }>(
  terms: readonly T[],
  selectedGroupIds: readonly string[],
  level: LearningLevel = 'all',
): T[] {
  const selected = validSelection(selectedGroupIds);
  const groups = new Set(selected.length ? selected : defaultLearningCategoryIds());
  return terms.filter(term => {
    const group = categoryToGroup.get(term.category);
    return group !== undefined && groups.has(group) && (level === 'all' || term.level === level);
  });
}

function shuffled(ids: readonly string[], random: () => number): string[] {
  const result = [...ids];
  for (let index = result.length - 1; index > 0; index--) {
    const sample = random();
    const bounded = Number.isFinite(sample) ? Math.max(0, Math.min(1 - Number.EPSILON, sample)) : 0;
    const swapIndex = Math.floor(bounded * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

/** Due reviews keep their priority; only unseen cards are shuffled for today's five. */
export function buildLearningQueue(
  ids: readonly string[],
  progress: Record<string, CardProgress>,
  now: number,
  random: () => number = Math.random,
): string[] {
  const unique = [...new Set(ids)];
  const reviewed = unique.filter(id => Object.prototype.hasOwnProperty.call(progress, id));
  const unseen = shuffled(unique.filter(id => !Object.prototype.hasOwnProperty.call(progress, id)), random);
  return buildQueue([...reviewed, ...unseen], progress, now);
}

/** Reviews first, then new cards from foundation to advanced, shuffled within each level. */
export function buildCurriculumQueue(
  terms: readonly { id: string; level: TermLevel }[],
  progress: Record<string, CardProgress>,
  now: number,
  random: () => number = Math.random,
): string[] {
  const unique = [...new Map(terms.map(term => [term.id, term])).values()];
  const reviewed = unique.filter(term => Object.prototype.hasOwnProperty.call(progress, term.id)).map(term => term.id);
  const unseen = termLevels.flatMap(level => shuffled(unique.filter(term => term.level === level.id && !Object.prototype.hasOwnProperty.call(progress, term.id)).map(term => term.id), random));
  return buildQueue([...reviewed, ...unseen], progress, now);
}

export function discoveryTerms<T extends { id: string; level: TermLevel }>(terms: readonly T[], progress: Record<string, CardProgress>): T[] {
  for (const level of termLevels) {
    const unseen = terms.filter(term => term.level === level.id && !Object.prototype.hasOwnProperty.call(progress, term.id));
    if (unseen.length) return unseen;
  }
  return [...terms];
}

/** A device preference, independent of accounts and cloud study snapshots. */
export class LearningCategoriesStore {
  private snapshot: LearningCategoriesSnapshot = { selectedGroupIds: defaultLearningCategoryIds(), selectedLevel: 'all', storageIssue: '' };
  private listeners = new Set<() => void>();

  constructor(private readonly storage: LearningCategoriesStorage | null) {
    this.refreshFromStorage();
  }

  getSnapshot = (): LearningCategoriesSnapshot => this.snapshot;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private publish(selectedGroupIds: CategoryGroupId[], selectedLevel: LearningLevel, storageIssue: string) {
    this.snapshot = { selectedGroupIds, selectedLevel, storageIssue };
    for (const listener of this.listeners) listener();
  }

  refreshFromStorage = (): void => {
    let serialized: string | null;
    try {
      if (!this.storage) throw new Error('Storage unavailable');
      serialized = this.storage.getItem(LEARNING_CATEGORIES_STORAGE_KEY);
    } catch {
      this.publish([...this.snapshot.selectedGroupIds], this.snapshot.selectedLevel, READ_ISSUE);
      return;
    }
    try {
      const parsed: unknown = serialized ? JSON.parse(serialized) : null;
      this.publish(readLearningCategories(parsed), readLearningLevel(parsed), '');
    } catch {
      this.publish(defaultLearningCategoryIds(), 'all', '저장된 학습 분야를 확인하지 못해 전체 분야를 선택했어요.');
    }
  };

  /** Returns true only for a valid nonempty selection that was saved to the device. */
  setSelectedGroupIds = (ids: readonly string[]): boolean => {
    return this.setSelection(ids, this.snapshot.selectedLevel);
  };

  setSelection = (ids: readonly string[], level: LearningLevel): boolean => {
    const selection = validSelection(ids);
    if (!selection.length || !isLearningLevel(level)) return false;
    let saved = false;
    try {
      if (!this.storage) throw new Error('Storage unavailable');
      this.storage.setItem(LEARNING_CATEGORIES_STORAGE_KEY, JSON.stringify({ version: 2, groupIds: selection, level }));
      saved = true;
    } catch { /* The preference still applies to this tab; persistence is reported below. */ }
    this.publish(selection, level, saved ? '' : WRITE_ISSUE);
    return saved;
  };
}
