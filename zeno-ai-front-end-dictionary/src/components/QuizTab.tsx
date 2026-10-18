import { useEffect, useRef, useState, type Ref } from 'react';
import { Box, Button, ContentBadge, ProgressIndicator, RadioGroup, RadioGroupItem, SectionHeader, SectionMessage, SegmentedControl, SegmentedControlItem, TextButton, Typography } from '@montage-ui/core';
import { IconArrowRight, IconCheck, IconChevronRight, IconRefresh } from '@montage-ui/icon';
import { quizKindLabels, quizParts, quizQuestions } from '../data/quizzes';
import type { QuizChoice, QuizChoiceId, QuizLevel, QuizPart, QuizQuestion } from '../data/quizzes/types';
import { terms, type Term } from '../data/terms';
import { getTermLevel, termLevels } from '../data/term-levels';
import { advanceQuizSession, confirmQuizAnswer, createQuizSession, getQuizPool, getQuizSummary, loadQuizState, quizStorageKey, saveQuizState, selectQuizChoice, type QuizAnswer, type QuizState } from '../lib/quiz';
import { CodeExample } from './CodeExample';
import { QuizCatalog } from './QuizCatalog';
import { gradeSingleQuiz } from '../lib/quiz-catalog';

const questionMap = new Map(quizQuestions.map(question => [question.id, question]));
const termMap = new Map(terms.map(term => [term.id, term]));
const choiceLetters = ['A', 'B', 'C', 'D'];
const quizLevelDescriptions = {
  foundation: '값, 문법, 컴포넌트의 기본부터 차근차근',
  practical: '앱에서 자주 마주치는 상황과 코드의 선택',
  advanced: '동작 원리와 복잡한 상황을 한 단계 깊게',
};

function quizStorage() {
  try { return typeof window === 'undefined' ? null : window.localStorage; }
  catch { return null; }
}

function sessionId() {
  return typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function QuizTab({ accountId, onTerm }: { accountId: string | null; onTerm: (term: Term) => void }) {
  const storageKey = quizStorageKey(accountId);
  const [initial] = useState(() => loadQuizState(quizStorage(), storageKey, quizQuestions));
  const [state, setState] = useState(initial.state);
  const stateRef = useRef(state);
  const [storageIssue, setStorageIssue] = useState(initial.storageIssue);
  const [screen, setScreen] = useState<'setup' | 'catalog' | 'single' | 'play' | 'result' | 'review'>(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('view') === 'list' ? 'catalog' : initial.state.session?.status === 'in-progress' ? 'play' : 'setup');
  const [part, setPart] = useState<QuizPart>(initial.state.session?.part ?? 'javascript');
  const [level, setLevel] = useState<QuizLevel>(initial.state.session?.level ?? 'foundation');
  const [reviewIndex, setReviewIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [drill, setDrill] = useState<QuizState | null>(null);
  const drillRef = useRef<QuizState | null>(null);
  const catalogPosition = useRef({ scrollTop: 0, questionId: '' });
  const restoreCatalog = useRef(false);
  const session = state.session;
  const activeQuestion = session ? questionMap.get(session.questionIds[session.index]) : undefined;
  const pool = getQuizPool(state, quizQuestions, { part, level, mode: 'all' });
  const wrongPool = getQuizPool(state, quizQuestions, { part, level, mode: 'wrong' });
  const records = pool.flatMap(question => state.records[question.id] ? [state.records[question.id]] : []);
  const attempts = records.reduce((sum, record) => sum + record.attempts, 0);
  const correct = records.reduce((sum, record) => sum + record.correct, 0);
  const summary = session ? getQuizSummary(session) : null;
  const resultWrongPool = session ? getQuizPool(state, quizQuestions, { part: session.part, level: session.level, mode: 'wrong' }) : [];
  const lastSummary = state.history[0];
  const canResumeSelected = session?.status === 'in-progress' && session.part === part && session.level === level;
  const singleSession = drill?.session;
  const singleQuestion = singleSession ? questionMap.get(singleSession.questionIds[0]) : undefined;
  const reviewQuestion = session ? questionMap.get(session.questionIds[reviewIndex]) : undefined;

  useEffect(() => {
    if (screen === 'catalog' && restoreCatalog.current) {
      const previousRow = document.getElementById('quiz-catalog-' + catalogPosition.current.questionId);
      sectionRef.current?.closest('.app-scroll')?.scrollTo({ top: previousRow ? catalogPosition.current.scrollTop : 0 });
      (previousRow ?? headingRef.current)?.focus({ preventScroll: true });
      restoreCatalog.current = false;
      return;
    }
    sectionRef.current?.closest('.app-scroll')?.scrollTo({ top: 0 });
    if (document.activeElement?.getAttribute('role') !== 'tab') headingRef.current?.focus({ preventScroll: true });
  }, [screen, session?.id, session?.index, singleSession?.id, reviewIndex]);

  function commit(next: QuizState) {
    if (next === stateRef.current) return;
    stateRef.current = next;
    setState(next);
    if (!saveQuizState(quizStorage(), storageKey, next)) {
      setStorageIssue('퀴즈 기록을 저장하지 못했어요. 현재 화면에서는 계속 풀 수 있어요.');
    }
  }

  function start(mode: 'all' | 'wrong') {
    const next = createQuizSession(stateRef.current, quizQuestions, { part, level, mode }, {
      id: sessionId(), now: Date.now(), random: Math.random,
    });
    if (next === stateRef.current || !next.session) return;
    commit(next);
    setScreen('play');
  }

  function nextQuestion() {
    const next = advanceQuizSession(stateRef.current, quizQuestions, Date.now());
    commit(next);
    if (next.session?.status === 'completed') setScreen('result');
  }

  function openSingle(question: QuizQuestion) {
    catalogPosition.current = { scrollTop: sectionRef.current?.closest('.app-scroll')?.scrollTop ?? 0, questionId: question.id };
    const next = createQuizSession(stateRef.current, [question], { part: question.part, level: question.level, mode: 'all' }, { id: sessionId(), now: Date.now(), random: Math.random });
    drillRef.current = next;
    setDrill(next);
    setScreen('single');
  }

  function chooseSingle(choiceId: QuizChoiceId) {
    if (!drillRef.current) return;
    const next = selectQuizChoice(drillRef.current, choiceId);
    drillRef.current = next;
    setDrill(next);
  }

  function confirmSingle() {
    const current = drillRef.current;
    if (!current?.session || current.session.answers[0]) return;
    const next = confirmQuizAnswer(current, quizQuestions, Date.now());
    const answer = next.session?.answers[0];
    if (!answer || next === current) return;
    drillRef.current = next;
    setDrill(next);
    commit(gradeSingleQuiz(stateRef.current, quizQuestions, current.session.questionIds[0], answer.choiceId, { id: current.session.id, now: answer.answeredAt, random: Math.random }));
  }

  function returnToCatalog() {
    restoreCatalog.current = true;
    setScreen('catalog');
  }

  return <section className="quiz-page" ref={sectionRef}>
    {storageIssue && <SectionMessage variant="cautionary" role="alert">{storageIssue}</SectionMessage>}
    {(screen === 'setup' || screen === 'catalog') && <SegmentedControl className="quiz-view-switch" size="large" value={screen} onValueChange={value => setScreen(value as 'setup' | 'catalog')} aria-label="퀴즈 보기 방식"><SegmentedControlItem value="setup">5문제 연습</SegmentedControlItem><SegmentedControlItem value="catalog">문제 찾아 풀기</SegmentedControlItem></SegmentedControl>}
    {(screen === 'catalog' || screen === 'single') && <div hidden={screen !== 'catalog'}><QuizCatalog questions={quizQuestions} records={state.records} onOpen={openSingle} headingRef={screen === 'catalog' ? headingRef : undefined} /></div>}

    {screen === 'single' && singleSession && singleQuestion && <>
      <div className="quiz-play-meta"><Typography variant="label2" color="semantic.label.alternative">한 문제 풀이 · {singleQuestion.part === 'javascript' ? 'JavaScript' : 'React'} · {getTermLevel(singleQuestion.level).label}</Typography><TextButton size="small" onClick={returnToCatalog}>문제 목록으로</TextButton></div>
      <QuizQuestionCard key={singleSession.id} question={singleQuestion} orderedChoiceIds={singleSession.optionOrders[0]} selectedChoiceId={singleSession.selectedChoiceId} answer={singleSession.answers[0]} position={1} total={1} headingRef={headingRef} onChoose={chooseSingle} onConfirm={confirmSingle} onNext={returnToCatalog} nextLabel="목록으로 돌아가기" onTerm={onTerm} />
    </>}

    {screen === 'setup' && <>
      <div className="quiz-intro">
        <Typography as="h2" ref={headingRef} tabIndex={-1} variant="title3" weight="bold">부담 없이, 5문제씩 연습해요</Typography>
        <Typography as="p" variant="body2-reading" color="semantic.label.alternative">파트와 단계를 고르면 무작위 5문제가 나와요. 특정 개념만 연습하려면 ‘문제 찾아 풀기’를 이용하세요.</Typography>
      </div>
      <SegmentedControl className="quiz-parts" size="large" value={part} onValueChange={value => setPart(value as QuizPart)} aria-label="퀴즈 파트">
        {quizParts.map(item => <SegmentedControlItem key={item.id} value={item.id}>{item.label}</SegmentedControlItem>)}
      </SegmentedControl>
      <Typography as="p" variant="label1-reading" color="semantic.label.alternative" className="quiz-part-description">{quizParts.find(item => item.id === part)!.description}</Typography>
      <SectionHeader size="xsmall" platform="mobile" headingTag="h3">어느 단계부터 풀까요?</SectionHeader>
      <SegmentedControl className="quiz-levels" size="large" value={level} onValueChange={value => setLevel(value as QuizLevel)} aria-label="퀴즈 난도">
        {termLevels.map(item => <SegmentedControlItem key={item.id} value={item.id}>{item.label}</SegmentedControlItem>)}
      </SegmentedControl>
      <Typography as="p" variant="label1-reading" color="semantic.label.alternative" className="quiz-level-guide">처음이라면 기초부터 시작하세요. 실무는 코드 활용, 심화는 동작 원리와 복잡한 상황을 다뤄요.</Typography>
      <Box className="quiz-start-card" sx={theme => ({ backgroundColor: theme.semantic.background.normal.alternative, borderRadius: 12 })}>
        <div className="quiz-card-meta"><ContentBadge color="accent" accentColor="semantic.primary.normal">{getTermLevel(level).label}</ContentBadge><Typography variant="label2" color="semantic.label.alternative">{pool.length}문제 준비됨</Typography></div>
        <Typography as="h3" variant="heading1" weight="bold">{part === 'javascript' ? 'JavaScript' : 'React'} 다섯 문제</Typography>
        <Typography as="p" variant="body2-reading" color="semantic.label.alternative" className="quiz-card-description">{quizLevelDescriptions[level]}</Typography>
        <div className="quiz-topic-preview" aria-label="문제 주제 예시">{pool.slice(0, 3).map(question => <ContentBadge key={question.id} color="neutral" variant="outlined">{question.topic}</ContentBadge>)}</div>
        {session?.status === 'in-progress' && <Typography as="p" variant="label1-reading" color="semantic.label.alternative" className="quiz-card-description">진행 중인 연습이 있어요. 새 연습을 시작하면 아직 끝내지 않은 세트는 교체돼요.</Typography>}
        <Button className="zeno-primary-action" size="large" fullWidth disabled={!pool.length} onClick={() => canResumeSelected ? setScreen('play') : start('all')} trailingContent={<IconArrowRight />}>{canResumeSelected ? '이어서 풀기' : '5문제 풀기'}</Button>
        {canResumeSelected && <TextButton className="quiz-resume" size="medium" onClick={() => start('all')}>새로운 5문제로 시작하기</TextButton>}
        {session?.status === 'in-progress' && !canResumeSelected && <TextButton className="quiz-resume" size="medium" onClick={() => { setPart(session.part); setLevel(session.level); setScreen('play'); }} trailingContent={<IconChevronRight />}>{session.part === 'javascript' ? 'JavaScript' : 'React'} · {getTermLevel(session.level).label} 이어서 풀기</TextButton>}
      </Box>
      <div className="quiz-stats" aria-label="선택한 단계의 퀴즈 기록">
        <div><Typography variant="label2" color="semantic.label.alternative">풀어본 문제</Typography><Typography variant="title3" weight="bold">{records.length}<Typography as="span" variant="label1" color="semantic.label.assistive"> / {pool.length}</Typography></Typography></div>
        <div><Typography variant="label2" color="semantic.label.alternative">누적 정답률</Typography><Typography variant="title3" weight="bold">{attempts ? Math.round(correct / attempts * 100) + '%' : '—'}</Typography></div>
      </div>
      <section className="quiz-wrong-section">
        <SectionHeader size="small" platform="mobile" headingTag="h3" trailingContent={<Typography variant="label2" color="semantic.label.alternative">{wrongPool.length}문제</Typography>}>틀린 문제, 한 번 더</SectionHeader>
        <Typography as="p" variant="body2-reading" color="semantic.label.alternative">{wrongPool.length ? '해설을 읽은 뒤 다시 풀어보면 더 오래 기억할 수 있어요.' : '한 세트를 마치면 헷갈렸던 문제를 여기에서 다시 풀 수 있어요.'}</Typography>
        {!!wrongPool.length && <Button size="large" fullWidth variant="outlined" color="assistive" onClick={() => start('wrong')} leadingContent={<IconRefresh />}>오답 {Math.min(wrongPool.length, 5)}문제 다시 풀기</Button>}
      </section>
      {lastSummary && <Typography as="p" variant="label1-reading" color="semantic.label.alternative" className="quiz-last-result">최근 퀴즈 · {lastSummary.part === 'javascript' ? 'JavaScript' : 'React'} {getTermLevel(lastSummary.level).label} · {lastSummary.total}문제 중 {lastSummary.correct}개 정답</Typography>}
      {summary && <TextButton size="small" onClick={() => setScreen('result')} trailingContent={<IconChevronRight />}>세트 결과 다시 보기</TextButton>}
    </>}

    {screen === 'play' && session && activeQuestion && <>
      <div className="quiz-play-meta"><Typography variant="label2" color="semantic.label.alternative">{session.mode === 'wrong' ? '오답 연습' : '5문제 연습'} · {session.part === 'javascript' ? 'JavaScript' : 'React'} · {getTermLevel(session.level).label}</Typography><TextButton size="small" onClick={() => setScreen('setup')}>잠시 멈추기</TextButton></div>
      <ProgressIndicator percent={(session.index + Number(!!session.answers[session.index])) / session.questionIds.length * 100} aria-label="이번 퀴즈 진행" />
      <QuizQuestionCard
        key={activeQuestion.id}
        question={activeQuestion}
        orderedChoiceIds={session.optionOrders[session.index]}
        selectedChoiceId={session.selectedChoiceId}
        answer={session.answers[session.index]}
        position={session.index + 1}
        total={session.questionIds.length}
        headingRef={headingRef}
        onChoose={value => commit(selectQuizChoice(stateRef.current, value))}
        onConfirm={() => commit(confirmQuizAnswer(stateRef.current, quizQuestions, Date.now()))}
        onNext={nextQuestion}
        onTerm={onTerm}
      />
    </>}

    {screen === 'result' && summary && session && <>
      <div className="quiz-result-icon"><IconCheck width={32} height={32} aria-hidden="true" /></div>
      <Typography as="h2" ref={headingRef} tabIndex={-1} variant="title2" weight="bold">{summary.total}문제 중 {summary.correct}개 맞혔어요</Typography>
      <Typography as="p" variant="body2-reading" color="semantic.label.alternative" className="quiz-result-description">{summary.correct === summary.total ? '모두 풀었어요. 다른 단계에도 도전해보세요.' : '틀린 문제의 이유까지 확인하면 다음에는 더 잘 풀 수 있어요.'}</Typography>
      <QuizResultList questions={session.questionIds.map(id => questionMap.get(id)!)} answers={session.answers} onReview={index => { setReviewIndex(index); setScreen('review'); }} />
      <div className="quiz-result-actions">
        {resultWrongPool.length > 0 && <><Typography as="p" variant="label1-reading" color="semantic.label.alternative">이 단계에서 이전에 틀린 문제도 함께 복습해요.</Typography><Button className="zeno-primary-action" size="large" fullWidth onClick={() => { setPart(session.part); setLevel(session.level); const next = createQuizSession(stateRef.current, quizQuestions, { part: session.part, level: session.level, mode: 'wrong' }, { id: sessionId(), now: Date.now(), random: Math.random }); commit(next); if (next.session?.status === 'in-progress') setScreen('play'); }} leadingContent={<IconRefresh />}>이 단계 오답 {Math.min(resultWrongPool.length, 5)}문제 다시 풀기</Button></>}
        <Button size="large" fullWidth variant="outlined" color="assistive" onClick={() => setScreen('setup')}>파트와 단계 고르기</Button>
      </div>
    </>}
    {screen === 'review' && summary && session && reviewQuestion && <>
      <div className="quiz-play-meta"><Typography variant="label2" color="semantic.label.alternative">완료한 문제 복습 · {session.part === 'javascript' ? 'JavaScript' : 'React'} · {getTermLevel(session.level).label}</Typography><TextButton size="small" onClick={() => setScreen('result')}>결과 목록으로</TextButton></div>
      <QuizQuestionCard key={'review-' + reviewQuestion.id} question={reviewQuestion} orderedChoiceIds={session.optionOrders[reviewIndex]} selectedChoiceId={session.answers[reviewIndex]!.choiceId} answer={session.answers[reviewIndex]} position={reviewIndex + 1} total={session.questionIds.length} headingRef={headingRef} autoFocusFeedback={false} onChoose={() => {}} onConfirm={() => {}} onNext={() => setScreen('result')} nextLabel="결과 목록으로 돌아가기" onTerm={onTerm} />
    </>}
    <Typography as="p" variant="caption1" color="semantic.label.alternative" className="quiz-storage-note">퀴즈 기록은 이 브라우저에 저장돼요.</Typography>
  </section>;
}

export function QuizResultList({ questions, answers, onReview }: {
  questions: readonly QuizQuestion[]; answers: readonly (QuizAnswer | null)[]; onReview: (index: number) => void;
}) {
  return <div className="quiz-result-list">{questions.map((question, index) => {
    const answer = answers[index];
    if (!answer) return null;
    return <article key={question.id} className="quiz-result-item">
      <div><Typography as="h3" variant="body2-reading" weight="medium">{index + 1}. {question.topic}</Typography><ContentBadge color={answer.correct ? 'accent' : 'neutral'} accentColor="semantic.primary.normal">{answer.correct ? '정답' : '오답'}</ContentBadge></div>
      <Typography as="p" variant="label1-reading" color="semantic.label.alternative">{question.prompt}</Typography>
      <TextButton size="small" onClick={() => onReview(index)} aria-label={question.topic + ' 문제와 해설 다시 보기'} trailingContent={<IconChevronRight />}>문제와 해설 다시 보기</TextButton>
    </article>;
  })}</div>;
}

export function QuizQuestionCard({ question, orderedChoiceIds, selectedChoiceId, answer, position, total, headingRef, autoFocusFeedback = true, onChoose, onConfirm, onNext, nextLabel, onTerm }: {
  question: QuizQuestion; orderedChoiceIds: QuizChoiceId[]; selectedChoiceId: QuizChoiceId | null; answer: QuizAnswer | null;
  position: number; total: number; headingRef?: Ref<HTMLHeadingElement>; autoFocusFeedback?: boolean;
  onChoose: (value: QuizChoiceId) => void; onConfirm: () => void; onNext: () => void; nextLabel?: string; onTerm: (term: Term) => void;
}) {
  const feedbackRef = useRef<HTMLHeadingElement>(null);
  const choices = orderedChoiceIds.map(id => question.choices.find(choice => choice.id === id)).filter((choice): choice is QuizChoice => !!choice);
  const correctChoice = choices.find(choice => choice.id === question.correctChoiceId)!;
  const selectedChoice = answer ? choices.find(choice => choice.id === answer.choiceId) : undefined;
  const correctLetter = choiceLetters[choices.findIndex(choice => choice.id === question.correctChoiceId)];
  useEffect(() => {
    if (autoFocusFeedback && answer && document.activeElement?.getAttribute('role') !== 'tab') feedbackRef.current?.focus();
  }, [answer?.choiceId, autoFocusFeedback]);

  return <article className="quiz-question-card">
    <div className="quiz-question-meta"><Typography variant="label1" weight="medium" color="semantic.primary.normal">문제 {position} / {total}</Typography><span className="quiz-question-types">{question.code && <ContentBadge color="accent" variant="outlined" accentColor="semantic.primary.normal">{question.code.includes('__BLANK__') ? '빈칸 채우기' : '코드 읽기'}</ContentBadge>}<ContentBadge color="neutral" variant="outlined">{quizKindLabels[question.kind]}</ContentBadge></span></div>
    <Typography as="h2" ref={headingRef} tabIndex={-1} id={'quiz-question-' + question.id} variant="heading1" weight="bold" className="quiz-prompt">{question.prompt}</Typography>
    {question.code && <CodeExample code={question.code} language={question.codeLanguage} blankToken="__BLANK__" />}
    {!answer && <Typography as="p" variant="label1-reading" color="semantic.label.alternative" className="quiz-answer-guide">보기 하나를 고른 뒤 ‘정답 확인하기’를 눌러주세요. 확인 전에는 답을 바꿀 수 있어요.</Typography>}
    <form onSubmit={event => { event.preventDefault(); if (!answer && selectedChoiceId) onConfirm(); }}>
      <RadioGroup className="quiz-choices" orientation="vertical" name={'quiz-' + question.id} value={selectedChoiceId ?? ''} onValueChange={value => onChoose(value as QuizChoiceId)} disabled={!!answer} aria-labelledby={'quiz-question-' + question.id}>
        {choices.map((choice, index) => {
          const result = answer ? choice.id === question.correctChoiceId ? 'correct' : choice.id === answer.choiceId ? 'incorrect' : undefined : undefined;
          const inputId = 'quiz-' + question.id + '-' + choice.id;
          return <div className="quiz-choice" key={choice.id} data-selected={selectedChoiceId === choice.id ? '' : undefined} data-result={result}>
            <RadioGroupItem id={inputId} value={choice.id} aria-labelledby={inputId + '-label'} sx={{ flexShrink: 0 }} />
            <label htmlFor={inputId} id={inputId + '-label'}><Typography as="span" variant="label1" weight="bold" className="quiz-choice-letter">{choiceLetters[index]}</Typography><Typography as="span" variant="body2-reading" className="quiz-choice-text">{choice.text}</Typography>{result && <Typography as="span" variant="caption1" weight="medium" className="quiz-choice-result">{result === 'correct' ? '정답' : '내 답'}</Typography>}</label>
          </div>;
        })}
      </RadioGroup>
      {!answer && <Button className="zeno-primary-action quiz-confirm" type="submit" size="large" fullWidth disabled={!selectedChoiceId}>정답 확인하기</Button>}
    </form>
    {answer && <section className="quiz-feedback" aria-label="정답과 해설">
      <SectionMessage variant={answer.correct ? 'positive' : 'info'} role="status">{answer.correct ? '맞았어요!' : '괜찮아요. 이유를 같이 살펴봐요.'}</SectionMessage>
      <Typography as="h3" ref={feedbackRef} tabIndex={-1} variant="body1-reading" weight="bold" className="quiz-correct-answer">정답 {correctLetter} · {correctChoice.text}</Typography>
      <Typography as="p" variant="body2-reading">{question.explanation}</Typography>
      {!answer.correct && selectedChoice && <div className="quiz-mistake-note"><Typography as="p" variant="label1-reading" color="semantic.label.alternative">고른 답이 다른 이유</Typography><Typography as="p" variant="body2-reading">{selectedChoice.explanation}</Typography></div>}
      <details className="quiz-choice-explanations"><summary>모든 보기의 이유 살펴보기</summary>{choices.map((choice, index) => <div key={choice.id}><Typography as="h4" variant="label1" weight="medium" className="quiz-choice-explanation-title">{choiceLetters[index]} · {choice.text}</Typography><Typography as="p" variant="label1-reading" color="semantic.label.alternative">{choice.explanation}</Typography></div>)}</details>
      {!!question.relatedTermIds.length && <Typography as="p" variant="label1" weight="medium">헷갈렸다면 관련 용어를 읽어보세요</Typography>}
      <div className="quiz-related-terms">{question.relatedTermIds.map(id => termMap.get(id)).filter((term): term is Term => !!term).map(term => <TextButton key={term.id} size="small" onClick={() => onTerm(term)} trailingContent={<IconChevronRight />}>{term.term}</TextButton>)}</div>
      <TextButton as="a" href={question.source} target="_blank" rel="noopener noreferrer" size="small" className="quiz-source">참고 문서로 더 알아보기 ↗</TextButton>
      <Button className="zeno-primary-action quiz-next" type="button" size="large" fullWidth onClick={onNext} trailingContent={<IconArrowRight />}>{nextLabel ?? (position === total ? '결과 보기' : '다음 문제')}</Button>
    </section>}
  </article>;
}
