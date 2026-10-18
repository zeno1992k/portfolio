import type { ReactNode } from 'react';
import { ContentBadge, FallbackView, FallbackViewContent, FlexBox, SectionHeader, Typography } from '@montage-ui/core';
import { IconBookmark, IconBulb, IconClock, IconSearch } from '@montage-ui/icon';
import { getCategory, type Category } from '../data/categories';
import type { Term } from '../data/terms';
import { getTermKind, getTermLevel } from '../data/term-levels';
import { CodeExample } from './CodeExample';

export function TermAnswer({ term }: { term: Term }) {
  return <div className="term-answer">
    <Typography as="p" variant="body1-reading" weight="regular" className="definition">{term.definition}</Typography>

    <section className="answer-section">
      <SectionHeader size="xsmall" platform="mobile" headingTag="h2">실무에서는</SectionHeader>
      <Typography as="p" variant="body2-reading" weight="regular">{term.example}</Typography>
    </section>

    {term.code && <section className="answer-section">
      <SectionHeader size="xsmall" platform="mobile" headingTag="h2">작은 예시</SectionHeader>
      <CodeExample code={term.code} language={term.codeLanguage} />
    </section>}

    <section className="answer-section caution">
      <SectionHeader size="xsmall" platform="mobile" headingTag="h2" headingContent={<IconBulb width={20} height={20} aria-hidden="true" />}>헷갈리지 않기</SectionHeader>
      <Typography as="p" variant="body2-reading" weight="regular">{term.caution}</Typography>
    </section>

    {term.interview && <section className="answer-section interview-section" aria-label="면접 답변 연습">
      <SectionHeader size="xsmall" platform="mobile" headingTag="h2">면접 답변 연습</SectionHeader>
      <Typography as="p" variant="body2-reading" weight="medium">{term.interview.question}</Typography>
      <details key={term.id} className="interview-answer">
        <summary>답변 예시 보기</summary>
        <Typography as="p" variant="body2-reading" weight="regular">{term.interview.answer}</Typography>
        <Typography as="h3" variant="label2" weight="medium" color="semantic.label.alternative">이어서 생각하기</Typography>
        <Typography as="p" variant="body2-reading" weight="regular">{term.interview.followUp}</Typography>
      </details>
    </section>}

    {!!term.tags?.length && <FlexBox className="term-tags" gap="8px" flexWrap="wrap" aria-label="관련 태그">
      {term.tags.map((tag) => <ContentBadge key={tag} variant="outlined" color="neutral">{tag}</ContentBadge>)}
    </FlexBox>}
  </div>;
}

export function CategoryBadge({ category }: { category: Category }) {
  const label = getCategory(category).label;
  return <ContentBadge color="accent" accentColor="semantic.primary.normal" size="small" className="category-badge" title={label}>{label}</ContentBadge>;
}

export function TermMetadata({ term }: { term: Term }) {
  return <FlexBox className="term-metadata" gap="6px" flexWrap="wrap" aria-label="학습 정보">
    <ContentBadge color="neutral" size="small">{getTermLevel(term.level).label}</ContentBadge>
    <ContentBadge color="neutral" variant="outlined" size="small">{getTermKind(term.kind).label}</ContentBadge>
  </FlexBox>;
}

export function EmptyState({ icon, title, text, action }: { icon: 'bookmark' | 'clock' | 'search'; title: string; text: string; action?: ReactNode }) {
  const Icon = icon === 'bookmark' ? IconBookmark : icon === 'clock' ? IconClock : IconSearch;
  return <FallbackView platform="mobile" padding="compact" width="100%" className="empty-state">
    <FallbackViewContent>
      <Icon width={32} height={32} aria-hidden="true" />
      <FlexBox flexDirection="column" gap="10px">
        <Typography as="h2" variant="headline1" weight="bold" align="center">{title}</Typography>
        <Typography as="p" variant="body2-reading" weight="regular" color="semantic.label.alternative" align="center">{text}</Typography>
      </FlexBox>
      {action}
    </FallbackViewContent>
  </FallbackView>;
}
