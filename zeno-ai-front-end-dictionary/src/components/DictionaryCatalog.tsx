import { useEffect, useState, type ReactNode } from 'react';
import { Button, Chip, Option, SearchField, SegmentedControl, SegmentedControlItem, Select, TextButton, Typography } from '@montage-ui/core';
import { categoriesInGroup, categoryGroups, getCategory, getCategoryGroup } from '../data/categories';
import { getTermLevel, termLevels, type LearningLevel } from '../data/term-levels';
import { terms, type Term } from '../data/terms';
import { filterTerms, type CatalogFilter } from '../lib/catalog';
import { EmptyState } from './TermContent';

const PAGE_SIZE = 30;
const groupCounts = new Map(categoryGroups.map(group => [group.id, terms.filter(term => getCategory(term.category).groupId === group.id).length]));

export function DictionaryCatalog({ filter, onChange, renderRows }: {
  filter: CatalogFilter;
  onChange: (filter: CatalogFilter) => void;
  renderRows: (terms: Term[]) => ReactNode;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { query, group, category, level = 'all', interviewOnly = false } = filter;
  const filtered = filterTerms(terms, filter);
  const hasFilters = !!query.trim() || group !== 'all' || category !== 'all' || level !== 'all' || interviewOnly;
  const extraFilterCount = Number(level !== 'all') + Number(interviewOnly);
  const scope = [
    category !== 'all' ? getCategory(category).label : group !== 'all' ? getCategoryGroup(group).label : '전체 분야',
    level !== 'all' ? getTermLevel(level).label : '전체 난도',
    interviewOnly ? '면접 연습 포함' : '',
  ].filter(Boolean).join(' · ');

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [query, group, category, level, interviewOnly]);

  const reset = () => onChange({ query: '', group: 'all', category: 'all', level: 'all', interviewOnly: false });

  return <section className="dictionary-page">
    <div className="catalog-intro">
      <Typography as="h1" variant="title3" weight="bold">궁금한 개념을 찾아보세요</Typography>
      <Typography as="p" variant="body2-reading" color="semantic.label.alternative">짧은 뜻을 살펴보고, 용어를 누르면 예시와 자세한 설명을 볼 수 있어요.</Typography>
    </div>
    <SearchField type="search" width="100%" value={query} onChange={event => onChange({ ...filter, query: event.target.value })} onReset={() => onChange({ ...filter, query: '' })} placeholder="용어 또는 뜻 검색 · 예: 클로저" aria-label="용어 또는 뜻 검색" autoCapitalize="none" autoCorrect="off" enterKeyHint="search" />
    <div className="category-select">
      <Typography as="label" id="category-group-label" variant="label1" weight="medium">분야</Typography>
      <Select width="100%" aria-labelledby="category-group-label" value={group} onChange={value => onChange({ ...filter, group: value as CatalogFilter['group'], category: 'all' })}>
        <Option value="all">전체 분야 · {terms.length}개</Option>
        {categoryGroups.map(item => <Option key={item.id} value={item.id}>{item.label} · {groupCounts.get(item.id)}개</Option>)}
      </Select>
    </div>
    {group !== 'all' && <div className="filter-chips" role="group" aria-label="세부 분야">
      <Chip size="large" variant="outlined" active={category === 'all'} aria-pressed={category === 'all'} onClick={() => onChange({ ...filter, category: 'all' })}>분야 전체</Chip>
      {categoriesInGroup(group).map(item => <Chip key={item.id} size="large" variant="outlined" active={category === item.id} aria-pressed={category === item.id} onClick={() => onChange({ ...filter, category: item.id })}>{item.label}</Chip>)}
    </div>}
    <details className="catalog-filters">
      <summary>난도·면접 필터{extraFilterCount > 0 && <span className="catalog-filter-count">{extraFilterCount}개 적용</span>}</summary>
      <div className="catalog-filter-body">
        <Typography as="p" variant="label1" weight="medium">난도</Typography>
        <SegmentedControl className="dictionary-levels" size="large" value={level} onValueChange={value => onChange({ ...filter, level: value as LearningLevel })} aria-label="용어 난도 필터">
          <SegmentedControlItem value="all">전체</SegmentedControlItem>
          {termLevels.map(item => <SegmentedControlItem key={item.id} value={item.id}>{item.label}</SegmentedControlItem>)}
        </SegmentedControl>
        <Typography as="p" variant="label1-reading" color="semantic.label.alternative">{level === 'all' ? '처음이라면 기초부터, 업무에 필요한 개념은 실무에서 찾아보세요.' : getTermLevel(level).description}</Typography>
        <Chip className="catalog-interview-chip" size="large" variant="outlined" active={interviewOnly} aria-pressed={interviewOnly} onClick={() => onChange({ ...filter, interviewOnly: !interviewOnly })}>면접 답변이 있는 용어만</Chip>
      </div>
    </details>
    <div className="catalog-results-heading">
      <Typography as="p" variant="label1" weight="medium" role="status">{filtered.length}개의 용어{query.trim() && ` · “${query.trim()}”`}</Typography>
      {hasFilters && <TextButton size="small" onClick={reset}>검색·필터 초기화</TextButton>}
    </div>
    <Typography as="p" className="catalog-scope" variant="caption1" color="semantic.label.alternative">{scope}</Typography>
    {filtered.length ? <>
      {renderRows(filtered.slice(0, visibleCount))}
      {visibleCount < filtered.length && <Button className="catalog-more" fullWidth size="large" variant="outlined" color="assistive" onClick={() => setVisibleCount(count => count + PAGE_SIZE)}>용어 더 보기 · {Math.min(visibleCount, filtered.length)} / {filtered.length}</Button>}
    </> : <EmptyState icon="search" title="찾는 용어가 없어요" text="검색어를 짧게 바꾸거나 적용한 필터를 초기화해 보세요." action={<Button variant="outlined" color="assistive" onClick={reset}>전체 용어 보기</Button>} />}
  </section>;
}
