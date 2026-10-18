# Zeno AI Docs

Next.js와 Nextra 기반의 웹 개발 학습 문서 사이트입니다. MDX 문서에 코드 실습, 퀴즈와 시각화 컴포넌트를 연결합니다.

기존 공개 주소: [Zeno Docs](https://zeno.it.kr/).

## 구현 기능

- 폴더와 `_meta.js` 기반 문서 메뉴와 탐색 구조.
- MDX 본문과 공통 문서 레이아웃.
- Sandpack 코드 실습, 퀴즈, 도표·수식·악보 등의 문서 컴포넌트.
- Supabase 인증 관련 컴포넌트와 읽음 상태 표시.
- sitemap·robots, 검색 색인과 이전 문서 주소 연결.

## 기술과 구조

Next.js · React · TypeScript · Nextra · MDX · Tailwind CSS를 사용합니다.

| 경로 | 역할 |
| --- | --- |
| `content/` | 학습 문서와 메뉴 설정 |
| `app/[[...mdxPath]]/page.tsx` | 문서 페이지 연결 |
| `app/components/` | 문서 UI와 학습 컴포넌트 |
| `mdx-components.tsx` | MDX 컴포넌트 등록 |
| `scripts/gen-home-data.js` | 문서에서 홈 목록 데이터 생성 |
| `scripts/export-legacy-redirects.js` | 이전 주소용 정적 페이지 생성 |
| `public/` | 이미지·실습 자료 등 공개 자산 |
| `next.config.ts`, `vercel.json` | 정적 내보내기와 배포 설정 |

## 실행

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm run build
```

개발·빌드 전에 홈 데이터를 생성하며, 빌드 후 Pagefind 검색 색인과 이전 문서 주소의 이동 페이지를 만듭니다. 정적 출력은 `out/`에 생성됩니다.

로그인 기능에는 `.env.example`의 Supabase 공개 설정이 필요합니다. 배포 도메인을 지정할 때 `NEXT_PUBLIC_SITE_URL`을 설정할 수 있습니다.

## Vercel

Root Directory를 `zeno-ai-docs`, Framework Preset을 Next.js로 선택합니다. 설치·빌드 명령은 `vercel.json`을 따릅니다. 이 저장소에 환경 변수의 실제 값은 포함하지 않습니다.

## 검증

공개용 소스에서 `npm ci`, `npm run lint`, `npm run build`를 통과했습니다. 정적 페이지 465개를 생성하고 Pagefind가 457개 문서를 색인했으며, 이전 문서 주소 319개의 이동 페이지를 생성했습니다. 린트에는 기존의 사용하지 않는 eslint-disable 주석 경고 1개가 남아 있습니다. 실제 배포 도메인의 로그인과 브라우저 동작은 별도 확인 대상입니다.
