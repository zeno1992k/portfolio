import { useEffect, useRef, useState } from 'react';
import { BottomNavigation, BottomNavigationItem, Box, Button, IconButton, List, ListCell, ListCellContent, ProgressIndicator, SectionHeader, SectionMessage, SegmentedControl, SegmentedControlItem, TextButton, TopNavigation, TopNavigationButton, Typography } from '@montage-ui/core';
import { IconApps, IconArrowLeft, IconArrowRight, IconBook, IconBookFill, IconBookmark, IconBookmarkFill, IconBulb, IconCalendar, IconCheck, IconChevronRight, IconCircleQuestion, IconCircleQuestionFill, IconClock, IconCode, IconFolder, IconGlobe, IconHome, IconHomeFill, IconLogoGoogleColor, IconMoon, IconPalette, IconPerson, IconSun } from '@montage-ui/icon';
import { terms, type Term } from './data/terms';
import { getTermLevel, learningLevelLabel, type LearningLevel } from './data/term-levels';
import { categoryGroups, getCategory, getCategoryGroup, type Category, type CategoryGroupId } from './data/categories';
import { buildQueue, canResumeSession, dayKey, scheduleReview, type Rating } from './lib/study';
import { useStudy } from './lib/useStudy';
import { ReviewSchedule } from './components/ReviewSchedule';
import { CategoryBadge, EmptyState, TermAnswer, TermMetadata } from './components/TermContent';
import { AccountPanel } from './components/AccountPanel';
import { useAuth } from './lib/AuthProvider';
import { useLearning } from './lib/LearningProvider';
import { useLearningCategories } from './lib/useLearningCategories';
import { buildCurriculumQueue, discoveryTerms, selectLearningTerms } from './lib/learning-categories';
import { useSubpage } from './lib/useSubpage';
import { LearningCategoryContent } from './components/LearningCategoryContent';
import { TermDetailContent } from './components/TermDetailContent';
import { BrandLogo } from './components/BrandLogo';
import { useAppTheme } from './lib/AppThemeProvider';
import { brand } from './lib/brand';
import { QuizTab } from './components/QuizTab';
import { DictionaryCatalog } from './components/DictionaryCatalog';

type Tab = 'today' | 'dictionary' | 'quiz' | 'notes';
const termIds = terms.map((term) => term.id);
const termMap = new Map(terms.map((term) => [term.id, term]));
const groupCounts = new Map(categoryGroups.map((group) => [group.id, terms.filter((term) => getCategory(term.category).groupId === group.id).length]));
const dateFormat = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', weekday: 'short' });
const dueFormat = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric' });

export default function App() {
  const { resolvedTheme, setPreference } = useAppTheme();
  const { data, setData, storageIssue } = useStudy();
  const { user, loading: authLoading, error: authError } = useAuth();
  const { syncStatus } = useLearning();
  const { selectedGroupIds, selectedLevel, setSelection, storageIssue: categoryStorageIssue } = useLearningCategories();
  const { subpage, openSubpage, closeSubpage } = useSubpage(termIds);
  const [accountOpen, setAccountOpen] = useState(false);
  const [tab, setTab] = useState<Tab>(() => new URLSearchParams(window.location.search).get('tab') === 'quiz' ? 'quiz' : 'today');
  const [studying, setStudying] = useState(false);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<CategoryGroupId | 'all'>('all');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [dictionaryLevel, setDictionaryLevel] = useState<LearningLevel>('all');
  const [interviewOnly, setInterviewOnly] = useState(false);
  const [notesFilter, setNotesFilter] = useState<'saved' | 'due' | 'schedule'>('saved');
  const [categoryDraft, setCategoryDraft] = useState<CategoryGroupId[]>(selectedGroupIds);
  const [levelDraft, setLevelDraft] = useState<LearningLevel>(selectedLevel);
  const [savingCategories, setSavingCategories] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [online, setOnline] = useState(navigator.onLine);
  const [offlineReady, setOfflineReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const subpageScrollRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const revealRef = useRef<HTMLButtonElement>(null);
  const ratingRef = useRef<HTMLButtonElement>(null);
  const session = data.session;
  const detail = subpage?.kind === 'term' ? termMap.get(subpage.termId) : undefined;
  const selectedTerms = selectLearningTerms(terms, selectedGroupIds, selectedLevel);
  const hasDraftTerms = categoryDraft.length > 0 && selectLearningTerms(terms, categoryDraft, levelDraft).length > 0;
  const selectedTermIds = selectedTerms.map((term) => term.id);
  const selectedIds = new Set(selectedTermIds);
  const activeTerm = session ? termMap.get(session.ids[session.index]) : undefined;
  const sessionComplete = !!session && session.index >= session.ids.length;
  const hasResume = canResumeSession(session, selectedIds);
  const queue = buildCurriculumQueue(selectedTerms, data.progress, now);
  const dueTerms = terms.filter((term) => data.progress[term.id]?.dueAt <= now);
  const selectedDueCount = selectedTerms.filter((term) => data.progress[term.id]?.dueAt <= now).length;
  const todayCount = new Set(data.history.filter((entry) => dayKey(entry.at) === dayKey(now) && selectedIds.has(entry.id)).map((entry) => entry.id)).size;
  const learnedCount = Object.keys(data.progress).length;
  const dailyIndex = Math.floor(Date.parse(`${dayKey(now)}T00:00:00Z`) / 86_400_000);
  const dailyCandidates = discoveryTerms(selectedTerms, data.progress);
  const dailyTerm = dailyCandidates[dailyIndex % dailyCandidates.length] ?? terms[dailyIndex % terms.length];
  const selectedScope = selectedGroupIds.length === categoryGroups.length ? '전체 7개 분야' : selectedGroupIds.length <= 2 ? selectedGroupIds.map((id) => getCategoryGroup(id).label).join(' · ') : `${getCategoryGroup(selectedGroupIds[0]).label} 외 ${selectedGroupIds.length - 1}개 분야`;

  useEffect(() => {
    if (authError) setAccountOpen(true);
  }, [authError]);

  useEffect(() => {
    const update = () => { setNow(Date.now()); setOnline(navigator.onLine); };
    const timer = window.setInterval(update, 60_000);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(timer); window.removeEventListener('online', update); window.removeEventListener('offline', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => { if (active) setOfflineReady(true); });
    }
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!subpage) scrollRef.current?.scrollTo({ top: 0 });
    if (!subpage && studying && activeTerm) {
      (session?.revealed ? ratingRef : revealRef).current?.focus({ preventScroll: true });
    }
  }, [tab, studying, session?.index, session?.revealed]);

  useEffect(() => {
    if (studying && !session) setStudying(false);
  }, [studying, session]);

  function showTerm(term: Term) {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    openSubpage({ kind: 'term', termId: term.id });
  }

  useEffect(() => {
    if (subpage) {
      subpageScrollRef.current?.scrollTo({ top: 0 });
      document.getElementById(subpage.kind === 'term' ? 'detail-term' : 'category-settings-heading')?.focus({ preventScroll: true });
    } else if (returnFocusRef.current?.isConnected) {
      returnFocusRef.current.focus({ preventScroll: true });
    } else if (returnFocusRef.current) {
      document.getElementById(`tab-${tab}`)?.focus({ preventScroll: true });
    }
  }, [subpage?.kind, detail?.id]);

  function openCategorySettings() {
    setCategoryDraft([...selectedGroupIds]);
    setLevelDraft(selectedLevel);
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    openSubpage({ kind: 'categories' });
  }

  async function saveCategorySettings() {
    if (!hasDraftTerms || savingCategories) return;
    const changed = levelDraft !== selectedLevel || categoryDraft.length !== selectedGroupIds.length || categoryDraft.some((id) => !selectedGroupIds.includes(id));
    setSavingCategories(true);
    try {
      const stored = setSelection(categoryDraft, levelDraft);
      if (changed) await setData((previous) => ({ ...previous, session: null }));
      if (stored) closeSubpage();
    } finally {
      setSavingCategories(false);
    }
  }

  function toggleBookmark(id: string) {
    if (authLoading) return;
    setData((prev) => ({ ...prev, bookmarks: prev.bookmarks.includes(id) ? prev.bookmarks.filter((value) => value !== id) : [...prev.bookmarks, id] }));
  }

  async function startStudy() {
    if (authLoading) return;
    if (!hasResume) {
      const ids = buildCurriculumQueue(selectedTerms, data.progress, Date.now());
      if (!ids.length) return;
      await setData((prev) => ({ ...prev, session: { ids, index: 0, revealed: false, ratings: [], startedAt: Date.now() } }));
    }
    setStudying(true);
  }

  async function startReview() {
    if (authLoading) return;
    const at = Date.now();
    const ids = buildQueue(terms.filter((term) => data.progress[term.id]?.dueAt <= at).map((term) => term.id), data.progress, at);
    if (!ids.length) return;
    await setData((previous) => ({ ...previous, session: { ids, index: 0, revealed: false, ratings: [], startedAt: at, kind: 'review' } }));
    setStudying(true);
  }

  function rate(rating: Rating) {
    if (authLoading) return;
    const at = Date.now();
    setData((prev) => {
      const current = prev.session;
      if (!current || !current.revealed || current.index >= current.ids.length) return prev;
      const id = current.ids[current.index];
      return {
        ...prev,
        progress: { ...prev.progress, [id]: scheduleReview(prev.progress[id], rating, at) },
        history: [...prev.history.slice(-999), { id, rating, at }],
        session: { ...current, index: current.index + 1, revealed: false, ratings: [...current.ratings, rating] },
      };
    });
    setNow(at);
  }

  function switchTab(next: Tab) { setTab(next); setStudying(false); }

  function selectGroup(next: CategoryGroupId | 'all') {
    setGroup(next);
    setCategory('all');
  }

  function openGroup(next: CategoryGroupId) {
    selectGroup(next);
    setDictionaryLevel('all');
    setInterviewOnly(false);
    setQuery('');
    switchTab('dictionary');
  }

  function termRows(list: Term[], preview = false) {
    return <div className="term-list">{list.map((term) => {
      const progress = data.progress[term.id];
      return <div className="term-row" key={term.id}>
        <ListCell as="button" role="button" aria-labelledby={undefined} className="term-row-main"
          sx={{ backgroundColor: 'transparent', textAlign: 'left' }} alignItems="center" verticalPadding="large" interactionPadding={0}
          onClick={() => showTerm(term)} aria-label={`${term.term}, ${term.korean} 자세히 보기`}
          textProps={{ variant: 'body1', weight: 'medium', caption: <><span>{term.korean} · {getCategory(term.category).label} · {getTermLevel(term.level).label}</span>{preview && <Typography as="span" className="term-row-definition" variant="label1-reading" color="semantic.label.neutral">{term.definition}</Typography>}{progress && <Typography as="span" display="block" variant="caption1" color="semantic.primary.normal" className="term-row-due">{progress.dueAt <= now ? '복습할 시간' : `${dueFormat.format(progress.dueAt)} 복습`}</Typography>}</>, captionProps: { variant: 'label1', color: 'semantic.label.alternative' } }}
        >{term.term}</ListCell>
        <IconButton size={24} sx={{ width: 44, height: 44, flexShrink: 0 }}
          color={data.bookmarks.includes(term.id) ? 'semantic.primary.normal' : 'semantic.label.assistive'}
          onClick={() => toggleBookmark(term.id)} aria-label={`${term.term} ${data.bookmarks.includes(term.id) ? '저장 취소' : '저장'}`} aria-pressed={data.bookmarks.includes(term.id)}>
          {data.bookmarks.includes(term.id) ? <IconBookmarkFill aria-hidden="true" /> : <IconBookmark aria-hidden="true" />}
        </IconButton>
      </div>;
    })}</div>;
  }

  const GroupIcons = [IconCode, IconGlobe, IconApps, IconPalette, IconCheck, IconFolder, IconBook];

  return <div className="app-shell">
    <header className="app-header">
      <TopNavigation className={!studying && !subpage && tab === 'today' ? 'home-navigation' : undefined} variant={studying || subpage ? 'normal' : 'display'} background={false}
        leadingContent={subpage ? <TopNavigationButton variant="icon" onClick={closeSubpage} aria-label="뒤로가기" sx={{ width: 44, height: 44, margin: -10 }}><IconArrowLeft aria-hidden="true" /></TopNavigationButton> : studying ? <TopNavigationButton variant="icon" onClick={() => setStudying(false)} aria-label="나가기"><IconArrowLeft aria-hidden="true" /></TopNavigationButton> : undefined}
        trailingContent={subpage ? undefined : studying ? <Typography variant="label1" color="semantic.label.alternative">{sessionComplete ? '완료' : `${(session?.index ?? 0) + 1} / ${session?.ids.length ?? 0}`}</Typography> : tab === 'today' ? <div className="home-header-actions"><TopNavigationButton variant="icon" onClick={() => setPreference(resolvedTheme === 'dark' ? 'light' : 'dark')} aria-label={resolvedTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'} sx={{ width: 44, height: 44 }}>{resolvedTheme === 'dark' ? <IconSun aria-hidden="true" /> : <IconMoon aria-hidden="true" />}</TopNavigationButton><TopNavigationButton variant="icon" onClick={() => { setNotesFilter('schedule'); switchTab('notes'); }} aria-label="복습 일정 보기" sx={{ width: 44, height: 44 }}><IconCalendar aria-hidden="true" /></TopNavigationButton></div> : tab === 'notes' ? <TopNavigationButton variant="icon" onClick={() => setAccountOpen(true)} aria-label="내 계정"><IconPerson aria-hidden="true" /></TopNavigationButton> : undefined}
      >{subpage ? detail ? '용어 상세' : '학습 범위 선택' : studying ? session?.kind === 'review' ? '오늘의 복습' : '오늘의 학습' : tab === 'today' ? <span className="brand-lockup"><BrandLogo className="brand-symbol" alt={brand.name} /></span> : tab === 'dictionary' ? '용어 사전' : tab === 'quiz' ? '퀴즈' : '내 학습'}</TopNavigation>
    </header>
    {storageIssue && <SectionMessage variant="cautionary" role="alert">{storageIssue}</SectionMessage>}
    {!online && <SectionMessage variant="info" role="status">오프라인이에요. 연결 없이 계속 학습할 수 있어요.</SectionMessage>}

    <div className="app-scroll" ref={scrollRef} hidden={!!subpage}>
      <main id="main-content">
        <div id="app-panel" role={studying ? undefined : 'tabpanel'} aria-labelledby={studying ? undefined : `tab-${tab}`}>
          {studying && activeTerm && session && <section className="study-page" aria-labelledby="study-term">
            <ProgressIndicator percent={session.index / session.ids.length * 100} aria-label="이번 학습 완료" />
            <div className="study-intro">
              <Typography variant="label2" color="semantic.label.alternative">오늘의 {session.ids.length}장</Typography>
              <Typography variant="label2" color="semantic.label.alternative">{session.revealed ? '내 말로 설명해 보세요' : '먼저 뜻을 떠올려 보세요'}</Typography>
            </div>
            <article className="learning-card">
              <div className="learning-card-top"><CategoryBadge category={activeTerm.category} /><TextButton size="small" color={data.bookmarks.includes(activeTerm.id) ? 'primary' : 'assistive'} onClick={() => toggleBookmark(activeTerm.id)} aria-pressed={data.bookmarks.includes(activeTerm.id)} leadingContent={data.bookmarks.includes(activeTerm.id) ? <IconBookmarkFill /> : <IconBookmark />}>{data.bookmarks.includes(activeTerm.id) ? '저장됨' : '저장'}</TextButton></div>
              <Typography as="h1" id="study-term" variant="title1" weight="bold" className="learning-term">{activeTerm.term}</Typography>
              <Typography as="p" variant="body2" color="semantic.label.alternative" className="learning-korean">{activeTerm.korean}</Typography>
              <TermMetadata term={activeTerm} />
              {session.revealed ? <TermAnswer term={activeTerm} /> : <div className="card-question">
                <Typography as="p" variant="heading2" weight="medium">{activeTerm.question}</Typography>
                <Typography as="p" variant="label1" color="semantic.label.alternative" className="card-prompt"><IconBulb width={18} height={18} aria-hidden="true" />답을 확인하기 전에 잠깐 떠올려 보세요.</Typography>
              </div>}
            </article>
          </section>}

          {studying && sessionComplete && session && <section className="completion-page">
            <Box className="completion-icon" sx={(theme) => ({ color: theme.semantic.primary.normal })}><IconCheck width={40} height={40} aria-hidden="true" /></Box>
            <Typography as="h1" variant="title2" weight="bold">{session.ids.length}장, 잘했어요.</Typography>
            <Typography as="p" variant="body2-reading" color="semantic.label.alternative" className="completion-description">오늘 익힌 개념을 다음 복습 때 다시 만나요.</Typography>
            <List className="completion-list">{session.ids.map((id, index) => <ListCell key={id} disableInteraction verticalPadding="medium" textProps={{ variant: 'body1', weight: 'medium' }} trailingContent={<ListCellContent variant="value"><Typography variant="label2" color="semantic.primary.normal">{session.ratings[index] === 'good' ? '설명 가능' : '다시 복습'}</Typography></ListCellContent>}>{termMap.get(id)?.term}</ListCell>)}</List>
            <Typography as="p" variant="label1-reading" color="semantic.label.alternative" className="completion-hint">헷갈린 용어는 하루 뒤, 설명할 수 있는 용어는 더 긴 간격으로 만나요.</Typography>
            <Button className="zeno-primary-action" size="large" fullWidth onClick={() => { setStudying(false); setTab('today'); }} trailingContent={<IconArrowRight />}>오늘 화면으로</Button>
            {queue.length > 0 && <TextButton className="extra-study-button" onClick={startStudy}>{queue.length}장 더 보기</TextButton>}
          </section>}

          {!studying && tab === 'today' && <section className="home-page">
            <div className="home-intro">
              <div className="home-context"><Typography as="p" variant="label1" weight="medium" color="semantic.label.alternative">{brand.appLabel}</Typography><Typography as="p" variant="caption1" color="semantic.label.alternative">{dateFormat.format(now)}</Typography></div>
              <Typography as="h1" variant="heading2" weight="bold">오늘도, 다섯 개만 익혀볼까요?</Typography>
              <Typography as="p" variant="body2" color="semantic.label.alternative">하루 5분으로 쌓는 프론트엔드 기본기</Typography>
            </div>
            <Box as="section" className="daily-card" aria-labelledby="daily-title" sx={(theme) => ({ backgroundColor: theme.semantic.background.normal.alternative, borderRadius: 12 })}>
              <div className="daily-card-top"><Typography variant="label1" weight="medium" color="semantic.primary.normal">오늘의 학습</Typography><Typography variant="label2" color="semantic.label.alternative">약 5분</Typography></div>
              <div className="daily-scope"><Typography as="span" variant="label2" color="semantic.label.alternative">{selectedScope} · {learningLevelLabel(selectedLevel)}</Typography><TextButton size="small" aria-label="학습 범위 선택" onClick={openCategorySettings} trailingContent={<IconChevronRight width={16} height={16} />}>범위 선택</TextButton></div>
              <Typography as="h2" id="daily-title" variant="title3" weight="bold">{hasResume ? '이어서 익혀볼까요?' : queue.length ? '오늘의 다섯 장' : '복습을 기다리고 있어요'}</Typography>
              <Typography as="p" variant="body2" color="semantic.label.alternative" className="daily-description">{hasResume ? `${session!.ids.length}장 중 ${session!.index}장을 살펴봤어요.` : selectedDueCount ? `복습할 용어 ${selectedDueCount}개부터 먼저 만나요.` : queue.length ? '뜻을 떠올리고, 내 말로 설명해 보세요.' : '용어 사전에서 언제든 다시 읽을 수 있어요.'}</Typography>
              <div className="daily-progress"><Typography variant="label2" color="semantic.label.alternative">오늘 익힌 용어</Typography><Typography variant="label1" weight="medium">{todayCount}<Typography as="span" variant="label1" color="semantic.label.assistive"> / 5</Typography></Typography></div>
              <ProgressIndicator percent={Math.min(todayCount / 5, 1) * 100} aria-label="오늘 목표" />
              <Button className="daily-start-button zeno-primary-action" fullWidth size="large" trailingContent={<IconArrowRight />} onClick={startStudy} disabled={!hasResume && !queue.length}>{hasResume ? session?.kind === 'review' ? '이어서 복습하기' : '이어서 학습하기' : queue.length ? `${queue.length}장 학습 시작` : '오늘 학습을 마쳤어요'}</Button>
            </Box>
            <ReviewSchedule progress={data.progress} now={now} compact onTerm={showTerm} onStudy={startReview} />
            <section className="browse-section">
              <SectionHeader platform="mobile" size="medium" headingTag="h2" trailingContent={<Typography variant="label2" color="semantic.label.alternative">26개 분야</Typography>}>분야별로 살펴보기</SectionHeader>
              <List className="category-list">{categoryGroups.map((value, index) => {
                const GroupIcon = GroupIcons[index];
                return <li key={value.id}><ListCell as="button" role="button" aria-labelledby={undefined} alignItems="center" verticalPadding="large" interactionPadding={0} sx={{ backgroundColor: 'transparent', textAlign: 'left' }}
                  textProps={{ variant: 'body1', weight: 'medium', caption: value.description, captionProps: { variant: 'label1', color: 'semantic.label.alternative' } }}
                  leadingContent={<ListCellContent variant="large-icon"><GroupIcon width={24} height={24} aria-hidden="true" /></ListCellContent>}
                  trailingContent={<ListCellContent variant="custom"><Typography variant="label2" color="semantic.label.alternative">{groupCounts.get(value.id)}개</Typography><IconChevronRight width={16} height={16} aria-hidden="true" /></ListCellContent>}
                  onClick={() => openGroup(value.id)} aria-label={`${value.label} 분야 보기`}>{value.label}</ListCell></li>;
              })}</List>
            </section>
            <section className="discovery-section">
              <SectionHeader platform="mobile" size="medium" headingTag="h2">오늘 눈여겨볼 용어</SectionHeader>
              <ListCell as="button" role="button" aria-labelledby={undefined} className="discovery-card" sx={{ backgroundColor: 'transparent', textAlign: 'left' }} verticalPadding="large" interactionPadding={0} textProps={{ variant: 'heading2', weight: 'bold', caption: dailyTerm.question, captionProps: { variant: 'body2-reading' } }} trailingContent={<ListCellContent variant="chevron" role="presentation" aria-hidden="true" />} onClick={() => showTerm(dailyTerm)} aria-label={`${dailyTerm.term}, ${dailyTerm.korean} 자세히 보기`}>{dailyTerm.term}</ListCell>
            </section>
            <Typography as="p" className="quiet-footer" variant="caption1" color="semantic.label.assistive">{offlineReady ? '오프라인에서도 준비됐어요.' : '매일 조금씩, 나의 속도로.'}</Typography>
          </section>}

          {!studying && tab === 'dictionary' && <DictionaryCatalog
            filter={{ query, group, category, level: dictionaryLevel, interviewOnly }}
            onChange={next => { setQuery(next.query); setGroup(next.group); setCategory(next.category); setDictionaryLevel(next.level ?? 'all'); setInterviewOnly(next.interviewOnly ?? false); }}
            renderRows={list => termRows(list, true)}
          />}

          {!studying && tab === 'quiz' && (authLoading
            ? <section className="quiz-page"><SectionMessage variant="info" role="status">퀴즈를 준비하고 있어요.</SectionMessage></section>
            : <QuizTab key={user?.id ?? 'guest'} accountId={user?.id ?? null} onTerm={showTerm} />)}

          {!studying && tab === 'notes' && <section className="notes-page">
            <Typography as="p" variant="body2" color="semantic.label.alternative">조금씩 쌓이는 나의 개념들</Typography>
            <ListCell as="button" role="button" aria-labelledby={undefined} className="account-entry" interactionPadding={0} alignItems="center" verticalPadding="large" sx={{ backgroundColor: 'transparent', textAlign: 'left' }}
              leadingContent={<ListCellContent variant="large-icon">{user ? <IconPerson width={24} height={24} aria-hidden="true" /> : <IconLogoGoogleColor width={24} height={24} aria-hidden="true" />}</ListCellContent>}
              textProps={{ variant: 'body1', weight: 'medium', caption: user ? syncStatus === 'synced' ? '계정에 학습 기록이 저장됐어요' : '기기에 저장하고 계정과 동기화해요' : '구글로 로그인하고 기록을 보관하세요', captionProps: { variant: 'label1', color: 'semantic.label.alternative' } }}
              trailingContent={<ListCellContent variant="chevron" role="presentation" aria-hidden="true" />}
              onClick={() => setAccountOpen(true)}>{user ? '내 계정과 학습 기록' : '학습 기록 이어보기'}</ListCell>
            <div className="learning-stats">
              <div><Typography variant="label1" color="semantic.label.alternative">살펴본 용어</Typography><Typography variant="title2" weight="bold">{learnedCount}<Typography as="span" variant="label1" color="semantic.label.assistive"> / {terms.length}</Typography></Typography></div>
              <div><Typography variant="label1" color="semantic.label.alternative">지금 복습할 용어</Typography><Typography variant="title2" weight="bold" color="semantic.primary.normal">{dueTerms.length}</Typography></div>
            </div>
            <SegmentedControl className="notes-tabs" size="large" value={notesFilter} onValueChange={(value) => setNotesFilter(value as 'saved' | 'due' | 'schedule')} aria-label="내 용어 목록"><SegmentedControlItem value="saved">저장 {data.bookmarks.length}</SegmentedControlItem><SegmentedControlItem value="due">복습 {dueTerms.length}</SegmentedControlItem><SegmentedControlItem value="schedule">복습 일정</SegmentedControlItem></SegmentedControl>
            {notesFilter === 'schedule' ? <ReviewSchedule progress={data.progress} now={now} onTerm={showTerm} onStudy={startReview} /> : notesFilter === 'saved' ? data.bookmarks.length ? termRows(terms.filter((term) => data.bookmarks.includes(term.id))) : <EmptyState icon="bookmark" title="기억해 두고 싶은 용어" text="카드의 저장 버튼을 누르면 여기에 모여요." action={<Button variant="outlined" color="assistive" onClick={() => switchTab('dictionary')} trailingContent={<IconArrowRight />}>용어 둘러보기</Button>} /> : dueTerms.length ? <><Button className="review-start-button zeno-primary-action" fullWidth size="large" onClick={startReview} trailingContent={<IconArrowRight />}>복습 시작하기</Button>{termRows(dueTerms)}</> : <EmptyState icon="clock" title="복습할 시간이 되면 만나요" text="평가에 맞춰 복습할 날짜를 정해둘게요." />}
            <Typography as="p" variant="caption1" color="semantic.label.assistive" className="local-note">{user ? syncStatus === 'synced' ? '학습 기록은 계정에 저장돼요. 다른 기기에서도 이어서 익힐 수 있어요.' : '학습 기록을 기기에 먼저 저장해요. 계정에 저장됐는지는 내 계정에서 확인할 수 있어요.' : <>학습 기록은 이 브라우저에 저장돼요.<br />구글로 로그인하면 계정에 보관할 수 있어요.</>}</Typography>
          </section>}
        </div>
      </main>
    </div>

    {subpage && <div className="app-scroll subpage-scroll" ref={subpageScrollRef}>
      <main>{detail ? <TermDetailContent term={detail} saved={data.bookmarks.includes(detail.id)} onToggleSave={() => toggleBookmark(detail.id)} /> : <LearningCategoryContent selected={categoryDraft} onChange={setCategoryDraft} selectedLevel={levelDraft} onLevelChange={setLevelDraft} hasSession={!!session && !sessionComplete} issue={categoryStorageIssue} />}</main>
    </div>}

    {subpage?.kind === 'categories' && <footer className="category-settings-actions"><Button className="zeno-primary-action" fullWidth size="large" disabled={!hasDraftTerms || savingCategories || authLoading} loading={savingCategories} onClick={() => { void saveCategorySettings(); }}>이 범위로 학습하기</Button></footer>}

    <AccountPanel open={accountOpen} onClose={() => setAccountOpen(false)} />

    {!subpage && studying && activeTerm && session && <footer className="study-actions">
      {session.revealed ? <><Typography as="p" variant="label2" align="center" color="semantic.label.alternative">내 말로 설명할 수 있나요?</Typography><div className="rating-buttons">
        <div className="rating-option"><Button ref={ratingRef} fullWidth variant="outlined" color="assistive" onClick={() => rate('again')}>다시 볼래요</Button><Typography as="small" variant="caption1" color="semantic.label.alternative">1일 뒤</Typography></div>
        <div className="rating-option"><Button fullWidth variant="solid" color="assistive" onClick={() => rate('hard')}>헷갈려요</Button><Typography as="small" variant="caption1" color="semantic.label.alternative">1일 뒤</Typography></div>
        <div className="rating-option"><Button className="zeno-primary-action" fullWidth onClick={() => rate('good')}>설명 가능</Button><Typography as="small" variant="caption1" color="semantic.label.alternative">{scheduleReview(data.progress[activeTerm.id], 'good', now).interval}일 뒤</Typography></div>
      </div></> : <Button className="zeno-primary-action" ref={revealRef} fullWidth size="large" aria-expanded={false} trailingContent={<IconBook />} onClick={() => setData((prev) => prev.session ? { ...prev, session: { ...prev.session, revealed: true } } : prev)}>뜻 확인하기</Button>}
    </footer>}

    {!studying && !subpage && <BottomNavigation className="bottom-nav" role="tablist" aria-label="주 메뉴" value={tab} onValueChange={(value) => switchTab(value as Tab)}
      onKeyDown={(event) => {
        const order: Tab[] = ['today', 'dictionary', 'quiz', 'notes'];
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? order[0] : event.key === 'End' ? order[order.length - 1] : order[(order.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length];
        switchTab(next);
        document.getElementById(`tab-${next}`)?.focus();
      }} sx={{ position: 'relative', bottom: 'auto', width: '100%', flexShrink: 0 }}>
      <BottomNavigationItem value="today" role="tab" tabIndex={tab === 'today' ? 0 : -1} id="tab-today" aria-controls="app-panel" aria-selected={tab === 'today'} label="오늘" icon={tab === 'today' ? <IconHomeFill /> : <IconHome />} />
      <BottomNavigationItem value="dictionary" role="tab" tabIndex={tab === 'dictionary' ? 0 : -1} id="tab-dictionary" aria-controls="app-panel" aria-selected={tab === 'dictionary'} label="용어 사전" icon={tab === 'dictionary' ? <IconBookFill /> : <IconBook />} />
      <BottomNavigationItem value="quiz" role="tab" tabIndex={tab === 'quiz' ? 0 : -1} id="tab-quiz" aria-controls="app-panel" aria-selected={tab === 'quiz'} label="퀴즈" icon={tab === 'quiz' ? <IconCircleQuestionFill /> : <IconCircleQuestion />} />
      <BottomNavigationItem value="notes" role="tab" tabIndex={tab === 'notes' ? 0 : -1} id="tab-notes" aria-controls="app-panel" aria-selected={tab === 'notes'} label="내 학습" icon={tab === 'notes' ? <IconBookmarkFill /> : <IconBookmark />} />
    </BottomNavigation>}

  </div>;
}
