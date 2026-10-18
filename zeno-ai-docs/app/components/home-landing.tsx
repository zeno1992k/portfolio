'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Button, Chip, SearchField, Typography } from '@montage-ui/core'
import { IconArrowRight, IconChevronRight } from '@montage-ui/icon'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BrandLogo } from './brand-logo'
import { MontageScope } from './montage-scope'
import {
  SiDaisyui,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiRadixui,
  SiReact,
  SiShadcnui,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si'
import { TbBook, TbCode, TbWorldWww } from 'react-icons/tb'
import styles from './home-library.module.css'
// content/ 폴더를 스캔해 자동 생성되는 데이터 (scripts/gen-home-data.js — npm run dev/build 시 갱신)
import homeData from './home-data.json'

type PreviewKind = 'code' | 'browser' | 'sets' | 'chart' | 'sql'
type AccentColor = 'blue' | 'green' | 'red' | 'amber'
type Series = {
  title: string
  description: string
  href: string
  documentCount: number
  preview: PreviewKind
  accent: AccentColor
}

type SeriesGroup = {
  title: string
  description: string
  order: string
  series: Series[]
}

type Logo = { Icon: typeof SiReact; color: string }

const techLogos = [
  { label: 'JavaScript', Icon: SiJavascript, color: '#d4a900' },
  { label: 'React', Icon: SiReact, color: '#149eca' },
  { label: 'Next.js', Icon: SiNextdotjs, color: 'var(--icon-neutral)' },
  { label: 'Node.js', Icon: SiNodedotjs, color: '#339933' },
  { label: 'TypeScript', Icon: SiTypescript, color: '#3178c6' },
  { label: 'shadcn/ui', Icon: SiShadcnui, color: 'var(--icon-neutral)' },
  { label: 'daisyUI', Icon: SiDaisyui, color: '#1ad1a5' },
]
// 로고가 적어도 넓은 화면에서 띠가 끊기지 않도록 한 세트에 두 번 싣는다.
const tickerLogos = [...techLogos, ...techLogos]
const groups = homeData.groups as SeriesGroup[]

// 파트 제목으로 대표 로고를 고른다 (home-data.json은 자동 생성이라 여기서 매핑)
function groupLogo(title: string): Logo {
  if (title.includes('JavaScript')) return { Icon: SiJavascript, color: '#d4a900' }
  if (title.includes('TypeScript')) return { Icon: SiTypescript, color: '#3178c6' }
  if (title.includes('UI Libraries')) return { Icon: SiTailwindcss, color: '#06b6d4' }
  if (title.includes('Next.js')) return { Icon: SiNextdotjs, color: 'var(--icon-neutral)' }
  if (title.includes('React')) return { Icon: SiReact, color: '#149eca' }
  return { Icon: TbBook, color: '#4b5563' }
}

// 과목 폴더명 → 카드 로고
const seriesLogos: Record<string, Logo> = {
  ECMAscript: { Icon: SiJavascript, color: '#d4a900' },
  web_apis: { Icon: TbWorldWww, color: '#d4a900' },
  coding_test: { Icon: TbCode, color: '#d4a900' },
  typescript_fundamentals: { Icon: SiTypescript, color: '#3178c6' },
  typescript_2: { Icon: SiTypescript, color: '#3178c6' },
  typescript_3: { Icon: SiTypescript, color: '#3178c6' },
  react_1: { Icon: SiReact, color: '#149eca' },
  react_2: { Icon: SiReact, color: '#149eca' },
  react_3: { Icon: SiReact, color: '#149eca' },
  nextjs_1: { Icon: SiNextdotjs, color: 'var(--icon-neutral)' },
  nextjs_2: { Icon: SiNextdotjs, color: 'var(--icon-neutral)' },
  nextjs_3: { Icon: SiNextdotjs, color: 'var(--icon-neutral)' },
  tailwind_css: { Icon: SiTailwindcss, color: '#06b6d4' },
  shadcn_ui: { Icon: SiShadcnui, color: 'var(--icon-neutral)' },
  radix_ui: { Icon: SiRadixui, color: 'var(--icon-neutral)' },
  daisy_ui: { Icon: SiDaisyui, color: '#1ad1a5' },
}

function seriesLogo(href: string): Logo {
  const slug = decodeURIComponent(href).split('/').filter(Boolean).slice(-2)[0] ?? ''
  return seriesLogos[slug] ?? { Icon: TbBook, color: '#4b5563' }
}
const firstDocHref = groups[0]?.series[0]?.href ?? '#series'
const seriesTotal = groups.reduce((n, g) => n + g.series.length, 0)

function GridJunctions({ bottom = false, top = false }: { bottom?: boolean; top?: boolean }) {
  return (
    <>
      {top && <span aria-hidden="true" className={`${styles.gridJunction} ${styles.gridJunctionLeft} ${styles.gridJunctionTop}`} data-grid-junction />}
      {top && <span aria-hidden="true" className={`${styles.gridJunction} ${styles.gridJunctionRight} ${styles.gridJunctionTop}`} data-grid-junction />}
      {bottom && <span aria-hidden="true" className={`${styles.gridJunction} ${styles.gridJunctionLeft} ${styles.gridJunctionBottom}`} data-grid-junction />}
      {bottom && <span aria-hidden="true" className={`${styles.gridJunction} ${styles.gridJunctionRight} ${styles.gridJunctionBottom}`} data-grid-junction />}
    </>
  )
}
export function HomeLanding() {
  const rootRef = useRef<HTMLElement>(null)
  const [query, setQuery] = useState('')
  const [activeGroup, setActiveGroup] = useState('all')

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR')

    return groups.flatMap((group) => {
      if (activeGroup !== 'all' && activeGroup !== group.order) return []

      const series = group.series.filter((item) => {
        if (!normalizedQuery) return true
        return `${group.title} ${group.description} ${item.title} ${item.description}`
          .toLocaleLowerCase('ko-KR')
          .includes(normalizedQuery)
      })

      return series.length ? [{ ...group, series }] : []
    })
  }, [activeGroup, query])

  const resultTotal = filteredGroups.reduce((total, group) => total + group.series.length, 0)
  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const context = gsap.context(() => {
      gsap
        .timeline({ defaults: { duration: 0.6, ease: 'power2.out' } })
        .from('[data-gsap="overview-copy"]', { autoAlpha: 0, y: 14 })
        .from('[data-gsap="overview-panel"]', { autoAlpha: 0, y: 14 }, 0.08)

      gsap.utils.toArray<HTMLElement>('[data-gsap="scroll-reveal"]').forEach((element) => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 18,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 84%',
            once: true,
          },
        })
      })
    }, root)

    return () => context.revert()
  }, [])

  useEffect(() => {
    document.body.classList.add('home-page')
    const junctions = rootRef.current?.querySelectorAll<HTMLElement>('[data-grid-junction]') ?? []
    let lastRotation = 0

    const rotateJunctions = () => {
      const now = window.performance.now()
      if (now - lastRotation < 650) return
      lastRotation = now

      junctions.forEach((junction) => {
        delete junction.dataset.active
        void junction.offsetWidth
        junction.dataset.active = 'true'
      })
    }

    window.addEventListener('scroll', rotateJunctions, { passive: true })
    return () => {
      window.removeEventListener('scroll', rotateJunctions)
      document.body.classList.remove('home-page')
    }
  }, [])

  const showComingSoon = (name: string) => {
    window.alert(`${name}는 준비 중입니다.`)
  }

  const scrollToLibrary = () => {
    document.getElementById('series')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <MontageScope>
      <main ref={rootRef} className={`home-landing ${styles.home}`}>
        <div className={styles.frame}>
          <section className={styles.overview} aria-labelledby="home-title">
            <div className={styles.overviewCopy} data-gsap="overview-copy">
              <div className={styles.brandEyebrow}>
                <BrandLogo priority size={24} />
                <span>ZENO AI DOCS</span>
                <small>PERSONAL LEARNING LIBRARY</small>
              </div>
              <Typography as="h1" id="home-title" variant="title1" weight="bold">
                필요한 개념을 찾고,<br />바로 읽고 익히세요.
              </Typography>
              <Typography as="p" variant="body2" color="semantic.label.alternative">
                웹 개발 자료를 한곳에서 검색하고 순서대로 학습할 수 있습니다.
              </Typography>
              <div className={styles.actions}>
                <Button className={styles.primaryAction} size="large" trailingContent={<IconArrowRight aria-hidden="true" />} onClick={scrollToLibrary}>
                  학습 자료 찾기
                </Button>
                <Link className={styles.secondaryAction} href={firstDocHref}>첫 문서 읽기</Link>
              </div>
            </div>

            <div className={styles.overviewMedia} data-gsap="overview-panel" aria-hidden="true">
              <video className={styles.overviewVideo} autoPlay loop muted playsInline preload="metadata">
                <source src="/pong-work.mp4" type="video/mp4" />
              </video>
            </div>
            <GridJunctions bottom />
          </section>

          <section className={styles.catalog} id="series" aria-labelledby="series-title">
            <header className={styles.catalogHeader} data-gsap="scroll-reveal">
              <div>
                <Typography as="span" variant="label2" weight="bold" color="semantic.primary.normal">LEARNING LIBRARY</Typography>
                <Typography as="h2" id="series-title" variant="title2" weight="bold">배울 내용을 선택하세요</Typography>
                <Typography as="p" variant="body2" color="semantic.label.alternative">과목명이나 주제를 검색하거나 영역별로 좁혀보세요.</Typography>
              </div>
              <div className={styles.libraryTotal} aria-label={`전체 ${seriesTotal}개 시리즈`}>
                <strong>{seriesTotal}</strong>
                <span>SERIES</span>
              </div>
            </header>

            <div className={styles.catalogTools} data-gsap="scroll-reveal">
              <SearchField
                className={styles.searchField}
                type="search"
                size="medium"
                width="100%"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onReset={() => setQuery('')}
                placeholder="과목 또는 주제 검색"
                aria-label="과목 또는 주제 검색"
                autoCapitalize="none"
                autoCorrect="off"
                enterKeyHint="search"
              />
              <div className={styles.filters} role="group" aria-label="학습 영역 필터">
                <Chip size="large" variant="outlined" active={activeGroup === 'all'} aria-pressed={activeGroup === 'all'} onClick={() => setActiveGroup('all')}>전체</Chip>
                {groups.map((group) => (
                  <Chip key={group.order} size="large" variant="outlined" active={activeGroup === group.order} aria-pressed={activeGroup === group.order} onClick={() => setActiveGroup(group.order)}>
                    {group.title}
                  </Chip>
                ))}
              </div>
            </div>

            <div className={styles.resultMeta} aria-live="polite">
              <span>{activeGroup === 'all' ? '전체 영역' : groups.find((group) => group.order === activeGroup)?.title}</span>
              <strong>{resultTotal}개 시리즈</strong>
            </div>

            {filteredGroups.map((group) => (
              <section className={styles.group} data-gsap="scroll-reveal" key={group.title} aria-labelledby={`group-${group.order}`}>
                <span className={`${styles.groupJoint} ${styles.groupJointLeft}`} aria-hidden="true" data-grid-junction />
                <span className={`${styles.groupJoint} ${styles.groupJointRight}`} aria-hidden="true" data-grid-junction />
                <header className={styles.groupHeader}>
                  <div className={styles.groupTitle}>
                    {(() => { const { Icon, color } = groupLogo(group.title); return <Icon aria-hidden="true" className={styles.groupLogo} style={{ color }} /> })()}
                    <div>
                      <span className={styles.groupMeta}>
                        <b>{group.order}</b>
                        <small>{group.description}</small>
                      </span>
                      <h3 id={`group-${group.order}`}>{group.title}</h3>
                    </div>
                  </div>
                </header>
                <div className={styles.seriesGrid}>
                  {group.series.map((series) => (
                    <Link className={styles.seriesCard} href={series.href} key={series.title}>
                      <span className={styles.cardLogoWrap}>
                        {(() => { const { Icon, color } = seriesLogo(series.href); return <Icon aria-hidden="true" className={styles.cardLogo} style={{ color }} /> })()}
                      </span>
                      <span className={styles.cardBody}>
                        <span className={styles.cardHeading}>
                          <strong>{series.title}</strong>
                          <small>{String(series.documentCount).padStart(2, '0')} DOCS</small>
                        </span>
                        <span className={styles.cardDescription}>{series.description}</span>
                      </span>
                      <IconChevronRight className={styles.cardArrow} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </section>
            ))}

            {resultTotal === 0 && (
              <div className={styles.emptyState}>
                <Typography as="h3" variant="heading2" weight="bold">일치하는 학습 자료가 없습니다.</Typography>
                <Typography as="p" variant="body2" color="semantic.label.alternative">검색어를 바꾸거나 전체 영역에서 다시 찾아보세요.</Typography>
                <Button variant="outlined" color="assistive" onClick={() => { setQuery(''); setActiveGroup('all') }}>전체 자료 보기</Button>
              </div>
            )}
          </section>

          <section className={styles.closing} data-gsap="scroll-reveal" aria-labelledby="closing-title">
            <GridJunctions top />
            <div className={styles.closingCopy}>
              <span>KEEP LEARNING</span>
              <h2 id="closing-title">오늘의 한 문서가<br />내일의 감각이 됩니다.</h2>
              <p>현재 {groups.length}개 영역, {seriesTotal}개 시리즈를 정리했습니다.</p>
            </div>
            <div className={styles.closingLinks}>
              <Link href={firstDocHref}><span><small>START</small>첫 문서 읽기</span><IconArrowRight aria-hidden="true" /></Link>
              <Link href="#series"><span><small>LIBRARY</small>시리즈 전체 보기</span><IconArrowRight aria-hidden="true" /></Link>
            </div>
          </section>

          <footer className={styles.siteFooter}>
            <GridJunctions top />
            <div className={styles.footerIdentity}>
              <span><BrandLogo size={20} /> Zeno AI Docs</span>
              <p>읽고, 이해하고, 다시 꺼내 보는 개인 학습 문서.</p>
            </div>
            <nav aria-label="외부 링크" className={styles.footerNav}>
              <a href="https://zeno1992k.tistory.com/" target="_blank" rel="noreferrer">Blog</a>
              <Link href="/portfolio" onClick={(event) => { event.preventDefault(); showComingSoon('Portfolio') }}>Portfolio</Link>
              <a href="https://github.com/zeno1992k" target="_blank" rel="noreferrer">GitHub</a>
            </nav>
            <small className={styles.copyright}>© 2026 Zeno AI Docs</small>
            <div className={styles.studyTicker} aria-hidden="true">
              <div className={styles.tickerTrack}>
                {[0, 1].map((set) => (
                  <div className={styles.tickerSet} key={set}>
                    {tickerLogos.map(({ label, Icon, color }, index) => (
                      <span key={`${set}-${index}`}>
                        <Icon style={{ color }} />
                        <b>{label}</b>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </footer>
        </div>
      </main>
    </MontageScope>
  )
}
