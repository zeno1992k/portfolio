import { useState, type FormEvent } from 'react';
import {
  Accordion, AccordionDescription, AccordionDetails, AccordionSummary,
  ActionArea, ActionAreaButton, Box, Button, Checkbox, ContentBadge, FlexBox,
  FormControl, FormField, FormLabel, List, ListCell, ListCellContent,
  Modal, ModalClose, ModalContainer, ModalContent, ModalContentItem,
  ModalNavigation, SectionHeader, SectionMessage, TextButton, TextField, Typography,
} from '@montage-ui/core';
import { IconArrowRight } from '@montage-ui/icon';
import { terms, type Term } from '../data/terms';
import { getCategory } from '../data/categories';
import { buildNextReview, buildReviewWeek, getNextCommute, type CommutePlan } from '../lib/review-plan';
import { useCommutePlan } from '../lib/useCommutePlan';
import { dayKey, type CardProgress } from '../lib/study';

const dateLabel = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric' });
const weekdayLabel = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', weekday: 'short' });
const timeLabel = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', hour: 'numeric', minute: '2-digit' });

interface ReviewScheduleProps {
  progress: Record<string, CardProgress>;
  now: number;
  compact?: boolean;
  onTerm: (term: Term) => void;
  onStudy: () => void;
}

export function ReviewSchedule({ progress, now, compact = false, onTerm, onStudy }: ReviewScheduleProps) {
  const { plan, savePlan, issue } = useCommutePlan();
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [draft, setDraft] = useState<CommutePlan>(plan);
  const [selectedDate, setSelectedDate] = useState(() => dayKey(now));
  const week = buildReviewWeek(progress, now);
  const today = dayKey(now);
  const selected = week.find((day) => day.date === selectedDate) ?? week[0];
  const nextReview = buildNextReview(progress, now);
  const nextCommute = getNextCommute(plan, now);
  const selectedTerms = terms.filter((term) => {
    const record = progress[term.id];
    return record && (dayKey(record.dueAt) === selected.date || (selected.date === today && record.dueAt <= now));
  });
  const dueCount = terms.filter((term) => progress[term.id]?.dueAt <= now).length;

  function openSettings() {
    setDraft(plan);
    setSettingsOpened(true);
  }

  function submitPlan(event: FormEvent) {
    event.preventDefault();
    if (savePlan(draft)) setSettingsOpened(false);
  }

  return <>
    <section className={`review-schedule ${compact ? 'is-compact' : ''}`} aria-labelledby={compact ? 'home-review-title' : 'notes-review-title'}>
      <SectionHeader className="review-heading" platform="mobile" size="medium" trailingContent={<Typography as="span" variant="label2" color="semantic.primary.normal">{dueCount ? `지금 ${dueCount}개` : '나의 속도로'}</Typography>}>
        <span id={compact ? 'home-review-title' : 'notes-review-title'}>7일 복습 일정</span>
      </SectionHeader>
      <Box className="review-week-card">
        <div className="review-week" role="group" aria-label="7일 복습 일정">
          {week.map((day) => <Box
            as="button"
            type="button"
            key={day.date}
            className="review-day"
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              minWidth: 44, minHeight: 76, padding: '4px 0', border: 0, backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
            aria-label={`${dateLabel.format(day.timestamp)} 복습 일정, ${day.count}개`}
            aria-pressed={day.date === selected.date}
            onClick={() => setSelectedDate(day.date)}
          >
            <Typography as="span" variant="caption2" color="semantic.label.alternative">{day.date === today ? '오늘' : weekdayLabel.format(day.timestamp)}</Typography>
            <Box as="span" sx={(theme) => ({
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, aspectRatio: '1 / 1', borderRadius: 10000,
              backgroundColor: day.date === selected.date ? theme.semantic.primary.normal : 'transparent',
            })}>
              <Typography as="span" variant="label2" weight="medium" className={day.date === selected.date ? 'zeno-primary-content' : undefined} color={day.date === selected.date ? 'semantic.static.white' : 'semantic.label.normal'}>{Number(day.date.slice(-2))}</Typography>
            </Box>
            <Typography as="span" variant="caption2" color="semantic.label.alternative">{day.count ? `${day.count}개` : '—'}</Typography>
          </Box>)}
        </div>
        {compact ? <Typography as="p" className="review-summary" variant="body2-reading" color="semantic.label.alternative">{selected.date !== today ? `${dateLabel.format(selected.timestamp)} · 예정된 복습 ${selected.count}개` : nextReview ? nextReview.isDue ? `${nextReview.count}개 용어가 다시 볼 때를 기다려요.` : `${dateLabel.format(nextReview.timestamp)}에 ${nextReview.count}개 용어를 다시 만나요.` : '학습한 용어의 다음 복습일을 보여드려요.'}</Typography> : <div className="review-selected">
          <Typography as="p" className="review-selected-title" variant="label1" color="semantic.label.alternative">{dateLabel.format(selected.timestamp)} · {selected.count}개의 예정된 복습</Typography>
          {selectedTerms.length ? <List>{selectedTerms.map((term) => <li key={term.id}><ListCell
            as="button"
            type="button"
            role="button"
            aria-labelledby={undefined}
            sx={{ backgroundColor: 'transparent', textAlign: 'left' }}
            textProps={{ caption: getCategory(term.category).label }}
            trailingContent={<ListCellContent variant="chevron" role="presentation" aria-hidden="true" />}
            onClick={() => onTerm(term)}
            aria-label={`${term.term}, ${term.korean} 자세히 보기`}
          >{term.term}</ListCell></li>)}</List> : <Typography as="p" className="review-summary" variant="body2-reading" color="semantic.label.alternative">이날은 아직 예정된 복습이 없어요.</Typography>}
        </div>}
        {!!dueCount && <Button variant="outlined" fullWidth sx={{ marginTop: 12 }} onClick={onStudy} trailingContent={<IconArrowRight aria-hidden="true" />}>오늘 복습 시작하기</Button>}
      </Box>
      <div className="commute-plan">
        <FlexBox flexDirection="column" gap="4px" sx={{ minWidth: 0 }}>
          <Typography as="span" variant="label2" color="semantic.label.alternative">다음 학습 시간</Typography>
          <Typography as="p" variant="body2" weight="medium">{dateLabel.format(nextCommute)} {timeLabel.format(nextCommute)}</Typography>
          <Typography as="p" variant="caption1" color="semantic.label.alternative">{plan.weekdaysOnly ? '평일' : '매일'} · 출근 {plan.morning} / 퇴근 {plan.evening}</Typography>
        </FlexBox>
        <TextButton size="medium" sx={{ minHeight: 44, flexShrink: 0 }} onClick={openSettings}>시간 설정</TextButton>
      </div>
      {!compact && <>
        <Typography as="p" className="review-plan-note" variant="label2" color="semantic.label.alternative">현재 카드에 저장된 예정일을 보여드려요. 학습하면 일정이 바뀔 수 있어요.</Typography>
        <Accordion className="review-explanation">
          <AccordionSummary fillWidth>복습 간격은 어떻게 정해지나요?</AccordionSummary>
          <AccordionDetails>
            <AccordionDescription>먼저 뜻을 떠올리고, 답을 확인한 뒤 기억 정도를 골라요. 헷갈리면 하루 뒤 다시 보고, 설명할 수 있으면 간격을 조금씩 늘려요.</AccordionDescription>
            <div className="spacing-steps" aria-label="설명 가능한 카드의 다음 복습 간격">{[3, 7, 14, 30].map((days) => <ContentBadge key={days} color="accent" accentColor="semantic.primary.normal" size="medium">{days}일</ContentBadge>)}</div>
            <Typography as="p" className="review-plan-note" variant="label2" color="semantic.label.alternative">간격을 두고 다시 떠올리는 학습을 돕는 초기 복습 규칙이에요. 개인의 실제 기억률을 측정하는 수치는 아니에요.</Typography>
          </AccordionDetails>
        </Accordion>
      </>}
      {issue && <SectionMessage variant="cautionary" sx={{ marginTop: 12 }}>{issue}</SectionMessage>}
    </section>
    <Modal open={settingsOpened} onOpenChange={setSettingsOpened}>
      <ModalContainer variant="bottom" md={{ variant: 'popup' }} aria-labelledby="commute-settings-title">
        <FlexBox as="form" flex="1" flexDirection="column" onSubmit={submitPlan}>
          <ModalNavigation titleId="commute-settings-title" trailingContent={<ModalClose aria-label="학습 시간 설정 닫기" size={24} sx={{ minWidth: 44, minHeight: 44 }} />}>나의 학습 시간</ModalNavigation>
          <ModalContent>
            <ModalContentItem className="commute-settings">
              <Typography as="p" variant="body2-reading" color="semantic.label.alternative">짧게 공부하기 좋은 시간을 골라주세요.</Typography>
              <FormField>
                <FormLabel required>출근 시간</FormLabel>
                <FormControl><TextField type="time" width="100%" value={draft.morning} onChange={(event) => setDraft((value) => ({ ...value, morning: event.target.value }))} required /></FormControl>
              </FormField>
              <FormField>
                <FormLabel required>퇴근 시간</FormLabel>
                <FormControl><TextField type="time" width="100%" value={draft.evening} onChange={(event) => setDraft((value) => ({ ...value, evening: event.target.value }))} required /></FormControl>
              </FormField>
              <FormField flexDirection="row" gap="8px" alignItems="center">
                <FormControl><Checkbox checked={draft.weekdaysOnly} onCheckedChange={(weekdaysOnly) => setDraft((value) => ({ ...value, weekdaysOnly }))} /></FormControl>
                <FormLabel sx={{ minHeight: 44, display: 'flex', alignItems: 'center', flex: 1 }}>평일에만 학습할게요</FormLabel>
              </FormField>
              <Typography as="p" className="commute-settings-note" variant="label2" color="semantic.label.alternative">시간은 이 브라우저의 학습 계획에 저장돼요.<br />휴대폰 푸시 알림은 아직 연결되지 않았어요.</Typography>
              {issue && <SectionMessage variant="cautionary">{issue}</SectionMessage>}
            </ModalContentItem>
          </ModalContent>
          <ActionArea><ActionAreaButton className="zeno-primary-action" type="submit" disabled={!draft.morning || !draft.evening}>학습 시간 저장</ActionAreaButton></ActionArea>
        </FlexBox>
      </ModalContainer>
    </Modal>
  </>;
}
