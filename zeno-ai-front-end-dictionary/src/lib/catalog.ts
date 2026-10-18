import { getCategory, getCategoryGroup, type Category, type CategoryGroupId } from '../data/categories';
import type { Term } from '../data/terms';
import type { LearningLevel } from '../data/term-levels';

export interface CatalogFilter {
  group: CategoryGroupId | 'all';
  category: Category | 'all';
  query: string;
  level?: LearningLevel;
  interviewOnly?: boolean;
}

export function filterTerms(list: Term[], filter: CatalogFilter) {
  const normalized = filter.query.trim().toLocaleLowerCase();
  return list.filter((term) => {
    const category = getCategory(term.category);
    if (filter.group !== 'all' && category.groupId !== filter.group) return false;
    if (filter.category !== 'all' && term.category !== filter.category) return false;
    if (filter.level && filter.level !== 'all' && term.level !== filter.level) return false;
    if (filter.interviewOnly && !term.interview) return false;
    const searchable = [term.term, term.korean, term.definition, category.label,
      getCategoryGroup(category.groupId).label, ...(term.tags ?? [])].join(' ').toLocaleLowerCase();
    return searchable.includes(normalized);
  });
}
