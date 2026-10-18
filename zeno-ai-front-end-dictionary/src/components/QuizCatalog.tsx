import { useEffect, useState, type Ref } from 'react';
import { Button, Chip, ContentBadge, List, ListCell, ListCellContent, Option, SearchField, SegmentedControl, SegmentedControlItem, Select, Typography } from '@montage-ui/core';
import { quizKindLabels, quizParts } from '../data/quizzes';
import type { QuizKind, QuizLevel, QuizPart, QuizQuestion } from '../data/quizzes/types';
import { getTermLevel, termLevels } from '../data/term-levels';
import type { QuizRecord } from '../lib/quiz';
import { filterQuizQuestions, type QuizCatalogFilter } from '../lib/quiz-catalog';

export function QuizCatalog({ questions, records, onOpen, headingRef }: {
  questions: readonly QuizQuestion[];
  records: Readonly<Record<string, QuizRecord>>;
  onOpen: (question: QuizQuestion) => void;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  const [query, setQuery] = useState('');
  const [part, setPart] = useState<QuizPart | 'all'>('all');
  const [level, setLevel] = useState<QuizLevel | 'all'>('all');
  const [kind, setKind] = useState<QuizKind | 'all'>('all');
  const [status, setStatus] = useState<QuizCatalogFilter['status']>('all');
  const [visibleCount, setVisibleCount] = useState(30);
  const filtered = filterQuizQuestions(questions, { query, part, level, kind, status }, records);

  useEffect(() => { setVisibleCount(30); }, [query, part, level, kind, status]);

  function reset() {
    setQuery(''); setPart('all'); setLevel('all'); setKind('all'); setStatus('all'); setVisibleCount(30);
  }

  return <section className="quiz-catalog" aria-label="전체 퀴즈 목록">
    <div className="quiz-intro">
      <Typography as="h2" ref={headingRef} tabIndex={-1} variant="title3" weight="bold">풀고 싶은 문제를 찾아보세요</Typography>
      <Typography as="p" variant="body2-reading" color="semantic.label.alternative">전체 {questions.length}문제. 원하는 문제를 골라 한 문제씩 풀 수도 있어요.</Typography>
    </div>
    <SearchField type="search" width="100%" value={query} onChange={event => setQuery(event.target.value)} onReset={() => setQuery('')} placeholder="주제 또는 코드 검색" aria-label="퀴즈 주제 또는 코드 검색" autoCapitalize="none" autoCorrect="off" enterKeyHint="search" />
    <div className="quiz-catalog-selects">
      <div><Typography as="label" id="quiz-catalog-part-label" variant="label1" weight="medium">파트</Typography><Select width="100%" value={part} onChange={value => setPart(value as QuizPart | 'all')} aria-labelledby="quiz-catalog-part-label"><Option value="all">전체 파트</Option>{quizParts.map(item => <Option key={item.id} value={item.id}>{item.label}</Option>)}</Select></div>
      <div><Typography as="label" id="quiz-catalog-status-label" variant="label1" weight="medium">풀이 기록</Typography><Select width="100%" value={status} onChange={value => setStatus(value as QuizCatalogFilter['status'])} aria-labelledby="quiz-catalog-status-label"><Option value="all">전체 문제</Option><Option value="unseen">미풀이</Option><Option value="correct">맞힌 문제</Option><Option value="wrong">틀린 문제</Option></Select></div>
    </div>
    <SegmentedControl className="quiz-levels" size="large" value={level} onValueChange={value => setLevel(value as QuizLevel | 'all')} aria-label="전체 퀴즈 난도 필터"><SegmentedControlItem value="all">전체</SegmentedControlItem>{termLevels.map(item => <SegmentedControlItem key={item.id} value={item.id}>{item.label}</SegmentedControlItem>)}</SegmentedControl>
    <div className="quiz-catalog-kinds" role="group" aria-label="퀴즈 유형"><Chip size="large" variant="outlined" active={kind === 'all'} aria-pressed={kind === 'all'} onClick={() => setKind('all')}>전체</Chip>{(Object.entries(quizKindLabels) as [QuizKind, string][]).map(([id, label]) => <Chip key={id} size="large" variant="outlined" active={kind === id} aria-pressed={kind === id} onClick={() => setKind(id)}>{label}</Chip>)}</div>
    <Typography as="p" className="quiz-catalog-count" variant="label1" weight="medium" role="status">{filtered.length}문제</Typography>
    {!filtered.length ? <div className="quiz-catalog-empty"><Typography as="p" variant="body2-reading" color="semantic.label.alternative">조건에 맞는 문제가 없어요.</Typography><Button variant="outlined" color="assistive" onClick={reset}>전체 문제 보기</Button></div> : <>
      <QuizCatalogList questions={filtered.slice(0, visibleCount)} records={records} onOpen={onOpen} />
      {visibleCount < filtered.length && <Button className="quiz-catalog-more" fullWidth variant="outlined" color="assistive" size="large" onClick={() => setVisibleCount(value => value + 30)}>문제 더 보기 · {Math.min(visibleCount, filtered.length)} / {filtered.length}</Button>}
    </>}
  </section>;
}

export function QuizCatalogList({ questions, records, onOpen }: {
  questions: readonly QuizQuestion[];
  records: Readonly<Record<string, QuizRecord>>;
  onOpen: (question: QuizQuestion) => void;
}) {
  return <List className="quiz-catalog-list">{questions.map(question => {
    const record = records[question.id];
    const status = record ? record.lastCorrect ? '맞힌 문제' : '틀린 문제' : '미풀이';
    const part = question.part === 'javascript' ? 'JavaScript' : 'React';
    return <li key={question.id}>
      <ListCell as="button" role="button" id={'quiz-catalog-' + question.id} aria-labelledby={undefined} className="quiz-catalog-row" verticalPadding="large" interactionPadding={0} sx={{ backgroundColor: 'transparent', textAlign: 'left' }}
        textProps={{ variant: 'body1', weight: 'medium', caption: <><Typography as="span" className="quiz-catalog-prompt" variant="label1-reading" color="semantic.label.alternative">{question.prompt}</Typography><span className="quiz-catalog-row-meta"><ContentBadge color="neutral" variant="outlined">{part}</ContentBadge><ContentBadge color="neutral" variant="outlined">{getTermLevel(question.level).label}</ContentBadge><ContentBadge color="neutral" variant="outlined">{quizKindLabels[question.kind]}</ContentBadge>{question.code && <ContentBadge color="accent" variant="outlined" accentColor="semantic.primary.normal">{question.code.includes('__BLANK__') ? '빈칸 채우기' : '코드 읽기'}</ContentBadge>}<Typography as="span" variant="caption1" color={record?.lastCorrect ? 'semantic.primary.normal' : 'semantic.label.alternative'}>{status}</Typography></span></> }}
        trailingContent={<ListCellContent variant="chevron" role="presentation" aria-hidden="true" />}
        onClick={() => onOpen(question)} aria-label={part + ' ' + getTermLevel(question.level).label + ', ' + question.topic + '. ' + question.prompt + ' ' + status + ', 문제 풀기'}>{question.topic}</ListCell>
    </li>;
  })}</List>;
}
