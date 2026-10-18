'use client'

import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'

// 읽은 문서 기록: { "/web/react/react_1/01_intro": "2026-10-05" }
const STORAGE_KEY = 'zeno-docs:read'
const CHANGE_EVENT = 'zeno-docs:read-change'

type ReadMap = Record<string, string>

const EMPTY: ReadMap = {}
let cachedRaw: string | null = null
let cachedMap: ReadMap = EMPTY

function getReadMap(): ReadMap {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return EMPTY
  }

  if (raw === cachedRaw) return cachedMap

  cachedRaw = raw
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null
    cachedMap =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as ReadMap)
        : EMPTY
  } catch {
    cachedMap = EMPTY
  }

  return cachedMap
}

function saveReadMap(map: ReadMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    return
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  // storage: 다른 탭에서 바뀐 경우, CHANGE_EVENT: 같은 탭에서 바뀐 경우
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)

  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

function useReadMap() {
  return useSyncExternalStore(subscribe, getReadMap, () => EMPTY)
}

// 한글 경로가 인코딩 여부와 무관하게 같은 키가 되도록 디코딩해서 저장한다.
function toDocKey(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, '') || '/'

  try {
    return decodeURI(trimmed)
  } catch {
    return trimmed
  }
}

function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

function hrefSelector(href: string) {
  const escaped = href.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

  return `aside a[href="${escaped}"]::after`
}

export function ReadStatusButton() {
  const pathname = usePathname()
  const readMap = useReadMap()

  if (pathname === '/') return null

  const docKey = toDocKey(pathname)
  const readAt = readMap[docKey]
  const isRead = Boolean(readAt)

  const toggle = () => {
    const next = { ...getReadMap() }

    if (next[docKey]) delete next[docKey]
    else next[docKey] = today()

    saveReadMap(next)
  }

  return (
    <div className="docs-read-status">
      <button
        aria-pressed={isRead}
        className="docs-read-button"
        onClick={toggle}
        type="button"
      >
        <span aria-hidden="true" className="docs-read-box">
          {isRead && (
            <svg fill="none" height="12" viewBox="0 0 12 12" width="12">
              <path
                d="M2.5 6.2 5 8.7l4.5-5.2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          )}
        </span>
        {isRead ? `읽음 · ${readAt}` : '읽음으로 표시'}
      </button>
    </div>
  )
}

// 사이드바는 Nextra가 그리므로, 읽은 문서 링크에 ✓를 붙이는 CSS만 주입한다.
export function ReadStatusSidebarMarks() {
  const readMap = useReadMap()
  const selectors = Object.keys(readMap).flatMap((docKey) => {
    const encoded = encodeURI(docKey)

    return encoded === docKey
      ? [hrefSelector(docKey)]
      : [hrefSelector(docKey), hrefSelector(encoded)]
  })

  if (selectors.length === 0) return null

  return (
    <style>{`${selectors.join(',')}{content:'✓';flex:none;margin-left:auto;padding-left:8px;color:var(--x-color-primary-600);font-weight:700}`}</style>
  )
}
