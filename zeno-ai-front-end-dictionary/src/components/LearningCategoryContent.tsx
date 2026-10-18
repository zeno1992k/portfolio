import { Checkbox, SectionMessage, SegmentedControl, SegmentedControlItem, TextButton, Typography } from '@montage-ui/core';
import { categoryGroups, getCategory, type CategoryGroupId } from '../data/categories';
import { terms } from '../data/terms';
import { termLevels, type LearningLevel } from '../data/term-levels';
import { useCategoryDragSelection } from '../lib/useCategoryDragSelection';

interface LearningCategoryContentProps {
  selected: CategoryGroupId[];
  onChange: (selected: CategoryGroupId[]) => void;
  selectedLevel: LearningLevel;
  onLevelChange: (level: LearningLevel) => void;
  hasSession: boolean;
  issue: string;
}

export function LearningCategoryContent({ selected, onChange, selectedLevel, onLevelChange, hasSession, issue }: LearningCategoryContentProps) {
  const allSelected = categoryGroups.every((group) => selected.includes(group.id));
  const selectedCount = terms.filter(term => selected.includes(getCategory(term.category).groupId) && (selectedLevel === 'all' || term.level === selectedLevel)).length;
  const { listRef, dragging, handlers } = useCategoryDragSelection(selected, onChange);

  return <section className="learning-category-page" aria-labelledby="category-settings-heading">
    <div className="category-settings-intro">
      <Typography as="h1" id="category-settings-heading" tabIndex={-1} variant="title3" weight="bold">오늘은 어떤 분야를 익힐까요?</Typography>
      <Typography as="p" variant="body2-reading" color="semantic.label.alternative">관심 있는 분야를 함께 골라주세요.<br />선택한 분야에서 최대 다섯 장을 준비해요.</Typography>
    </div>
    <div className="learning-level-setting">
      <Typography as="h2" variant="label1" weight="medium">학습 난도</Typography>
      <SegmentedControl size="large" value={selectedLevel} onValueChange={(value) => onLevelChange(value as LearningLevel)} aria-label="학습 난도">
        <SegmentedControlItem value="all">기초부터</SegmentedControlItem>
        {termLevels.map(level => <SegmentedControlItem key={level.id} value={level.id}>{level.label}</SegmentedControlItem>)}
      </SegmentedControl>
      <Typography as="p" variant="label1-reading" color="semantic.label.alternative">{selectedLevel === 'all' ? '기초 → 실무 → 심화 순으로 새 용어를 만나요. 같은 난도 안에서는 섞어서 골라요.' : `${termLevels.find(level => level.id === selectedLevel)!.description}을 골라요.`}</Typography>
    </div>
    <div className="category-settings-summary">
      <Typography variant="label1" color="semantic.label.alternative" role="status">{selected.length}개 분야 · {selectedCount}개 용어</Typography>
      <TextButton size="small" sx={{ minHeight: 44 }} onClick={() => onChange(allSelected ? [] : categoryGroups.map((group) => group.id))}>{allSelected ? '전체 선택 해제' : '전체 선택'}</TextButton>
    </div>
    <Typography as="p" id="category-drag-hint" className="category-drag-hint" variant="label2" color="semantic.label.alternative">체크박스에서 위아래로 쓸어 여러 분야를 선택할 수 있어요.</Typography>
    <div ref={listRef} className="learning-category-list" role="group" aria-label="오늘 학습할 분야" aria-describedby="category-drag-hint" data-dragging={dragging || undefined} {...handlers}>
      {categoryGroups.map((group) => {
        const labelId = `learning-category-${group.id}-label`;
        const count = terms.filter((term) => getCategory(term.category).groupId === group.id && (selectedLevel === 'all' || term.level === selectedLevel)).length;
        return <div className="learning-category-option" data-drag-select-row={group.id} key={group.id}>
          <Checkbox id={`learning-category-${group.id}`} data-drag-select-id={group.id} aria-labelledby={labelId} checked={selected.includes(group.id)} onCheckedChange={(checked) => onChange(checked ? [...new Set([...selected, group.id])] : selected.filter((id) => id !== group.id))} sx={{ minWidth: 44, minHeight: 44, flexShrink: 0, touchAction: 'none' }} />
          <label id={labelId} htmlFor={`learning-category-${group.id}`} className="learning-category-label">
            <Typography as="span" variant="body1" weight="medium">{group.label}</Typography>
            <Typography as="span" variant="caption1" color="semantic.label.alternative">{group.description}</Typography>
          </label>
          <Typography as="span" variant="label2" color="semantic.label.alternative" className="learning-category-count">{count}개</Typography>
        </div>;
      })}
    </div>
    {!selected.length && <SectionMessage variant="cautionary" role="status">학습할 분야를 하나 이상 골라주세요.</SectionMessage>}
    {!!selected.length && !selectedCount && <SectionMessage variant="cautionary" role="status">선택한 분야에는 이 난도의 용어가 아직 없어요. 다른 난도나 분야를 골라주세요.</SectionMessage>}
    <Typography as="p" className="category-settings-note" variant="label1-reading" color="semantic.label.alternative">선택한 범위에서 복습할 용어를 먼저 만나요. 학습 분야와 난도는 이 기기에 저장해요.</Typography>
    {hasSession && <Typography as="p" className="category-settings-note" variant="label1-reading" color="semantic.label.alternative">분야나 난도를 바꾸면 진행 중인 학습 대신 새 카드를 준비해요. 이미 익힌 기록과 저장한 용어는 이어져요.</Typography>}
    {issue && <SectionMessage variant="cautionary" role="alert">{issue}</SectionMessage>}
  </section>;
}
