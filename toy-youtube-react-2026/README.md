# ZenoTube

YouTube API로 영상 목록을 조회하고, 검색부터 상세 재생 화면으로 이동하는 React 프로젝트입니다.

## 주요 기능

- 인기 영상 목록과 키워드 검색, 영상 상세 경로 `/watch/:videoId`.
- IntersectionObserver를 이용한 추가 로딩과 더 보기 버튼.
- 페이지 토큰 기반 조회, 영상 ID 기준 중복 제거.
- AbortController로 검색 변경 시 이전 요청 취소.
- 초기·추가 로딩 상태, 스켈레톤, 빈 목록과 오류 안내.
- 반응형 카드 목록과 dialog 기반 모바일 메뉴.

카테고리 버튼은 화면만 구성된 상태이며 필터 기능은 연결되지 않았습니다.

## 기술과 구조

React, React Router, Vite, Tailwind CSS, YouTube Data API를 사용합니다.

| 파일 | 역할 |
| --- | --- |
| `src/App.jsx` | 검색 상태, 목록 요청, 요청 취소, 경로 구성 |
| `src/components/Content.jsx` | 목록·오류·로딩 표시와 추가 로딩 감지 |
| `src/components/VideoDetail.jsx` | 영상 상세 조회와 화면 |
| `src/components/VideoPlayer.jsx` | 영상 재생 영역 |
| `api/videos.js` | 서버 환경 변수로 YouTube API 호출 |
| `vite.config.js` | 개발 서버의 `/api` 프록시 |

## 실행

```sh
npm ci
npm run dev
```

개발 설정은 `/api` 요청을 로컬 API 서버 `http://localhost:3001`로 전달합니다. `.env.example`을 `.env.local`로 복사하고 `YOUTUBE_API_KEY`를 등록한 뒤, 별도 터미널에서 API 서버를 실행합니다.

```sh
npm run dev:api
```

API 서버 실행에는 Node.js의 `--env-file` 지원이 필요합니다. 화면의 목록·검색 기능은 API 응답과 사용 한도에 영향을 받습니다.

독립 배포 시 `api/videos.js`를 처리하는 서버 환경에 `YOUTUBE_API_KEY`를 등록합니다. `.env.example`에는 변수 이름만 제공합니다. 클라이언트에 API 키를 넣지 않습니다. `vercel.json`은 `/watch/:videoId` 상세 주소를 React 진입 페이지로 연결합니다. Vercel Root Directory는 `toy-youtube-react-2026`으로 지정합니다.

```sh
npm run lint
npm run build
npm run preview
```

공개용 소스에서 `npm ci`, `npm run lint`, `npm run build`를 통과했습니다. 실제 YouTube API 응답과 배포 환경의 동작은 별도 확인 대상입니다.
