import { TextButton, Typography } from '@montage-ui/core';
import { IconArrowRight, IconBookmark, IconBookmarkFill } from '@montage-ui/icon';
import type { Term } from '../data/terms';
import { CategoryBadge, TermAnswer, TermMetadata } from './TermContent';

interface TermDetailContentProps {
  term: Term;
  saved: boolean;
  onToggleSave: () => void;
}

export function TermDetailContent({ term, saved, onToggleSave }: TermDetailContentProps) {
  return <section className="term-detail-page" aria-labelledby="detail-term">
    <article className="learning-card">
      <div className="learning-card-top">
        <CategoryBadge category={term.category} />
        <TextButton
          size="small"
          color={saved ? 'primary' : 'assistive'}
          sx={{ minHeight: 44, flexShrink: 0 }}
          onClick={onToggleSave}
          aria-label={`${term.term} ${saved ? '저장 취소' : '저장'}`}
          aria-pressed={saved}
          leadingContent={saved ? <IconBookmarkFill aria-hidden="true" /> : <IconBookmark aria-hidden="true" />}
        >{saved ? '저장됨' : '저장'}</TextButton>
      </div>

      <Typography as="h1" id="detail-term" tabIndex={-1} variant="title1" weight="bold" className="learning-term">{term.term}</Typography>
      <Typography as="p" variant="body2" color="semantic.label.alternative" className="learning-korean">{term.korean}</Typography>
      <TermMetadata term={term} />

      <TermAnswer term={term} />

      <div className="detail-related">
        <Typography as="h2" variant="label2" weight="medium" color="semantic.label.alternative">연결되는 개념</Typography>
        <Typography as="p" variant="body2" color="semantic.label.neutral">{term.related.join(' · ')}</Typography>
      </div>
      <TextButton as="a" className="source-link" size="small" href={term.source} target="_blank" rel="noopener noreferrer" trailingContent={<IconArrowRight aria-hidden="true" />}>공식 문서 읽기</TextButton>
    </article>
  </section>;
}
