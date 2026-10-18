# Zeno 프론트엔드 단어장

프론트엔드 개념을 짧은 카드로 학습하고 간격을 두고 복습하는 모바일 웹 앱입니다. 카드 학습, 용어 검색과 퀴즈를 하나의 흐름으로 구성했습니다.

기존 공개 주소: [Zeno 단어장](https://ai-dev-puce.vercel.app/). 현재 배포 상태와 이 소스의 일치 여부는 별도 확인이 필요합니다.

## 주요 기능

- 7개 큰 영역·26개 세부 분야의 용어 카드 670개, 면접 답변 연습 390개.
- JavaScript·React 퀴즈 각 210개, 정답·오답 해설과 오답 복습.
- 분야·난도 선택, 최대 5장 학습과 기억 정도 평가.
- 복습 예정일 우선 학습, 검색·필터·북마크와 학습 재개.
- Google 로그인, Supabase 기반 계정별 기록 동기화.
- 게스트 기록 가져오기와 오프라인 변경 병합.
- 서비스 워커 기반 오프라인 자산 캐시, 설치 manifest.
- 시스템·라이트·다크 테마와 모바일 중심 화면.

예약 푸시 알림은 구현되지 않았습니다. 퀴즈 기록은 계정별 브라우저 저장이며, 모든 기록이 서버에 동기화되는 것은 아닙니다. 실제 iPhone 설치·오프라인 동작과 여러 기기 간 동기화는 별도 검증 대상입니다.

## 기술과 설계

React · TypeScript · Vite · Montage UI · Supabase · Service Worker를 사용합니다.

학습 로직을 UI와 분리하고, 서버 저장에는 revision과 요청 ID를 사용합니다. 오래된 기기의 변경을 최신 서버 기록과 병합하고, 응답을 받지 못한 요청을 같은 ID로 재시도하도록 구성했습니다. DB 마이그레이션과 접근 정책, 동기화 테스트 코드를 함께 포함합니다.

| 경로 | 역할 |
| --- | --- |
| `src/App.tsx`, `src/components/` | 학습·사전·퀴즈·계정 화면 |
| `src/data/` | 용어·퀴즈 콘텐츠와 분류 |
| `src/lib/study.ts` | 복습 일정과 학습 큐 |
| `src/lib/learning-store.ts`, `src/lib/cloud-study.ts` | 기기 저장과 서버 동기화 |
| `src/lib/*.test.ts` | 학습·저장·콘텐츠 로직 테스트 |
| `supabase/migrations/`, `supabase/tests/` | DB 구조·접근 정책·DB 테스트 |
| `public/sw.js` | 프로덕션 오프라인 캐시 |
| `public/licenses/`, `public/fonts/` | 배포 자산과 라이선스 |

## 실행

Node.js 22.12 이상이 필요합니다.

```sh
npm ci
npm run dev
```

개발 주소는 `http://127.0.0.1:4179`입니다. 환경 변수를 설정하지 않아도 게스트 학습을 이용할 수 있습니다. 로그인과 동기화를 사용할 때는 `.env.example`을 `.env.local`로 복사하고 Supabase 공개 설정을 등록합니다.

```sh
npm test
npm run test:db
npm run build
npm run preview
```

서비스 워커는 프로덕션 빌드에서 등록됩니다. 공개용 소스에서 `npm ci`, `npm run build`, 단위 테스트 173개와 DB 테스트를 통과했습니다. 실제 브라우저·Google 로그인·기기 간 동기화는 별도 확인 대상입니다.

## 상세 문서

- [학습 콘텐츠와 복습 규칙](docs/learning-catalog.md)
- [퀴즈 구성과 저장 방식](docs/quiz-learning.md)
- [콘텐츠 범위](docs/content-coverage.md)
- [로그인·동기화 설정](docs/google-login-setup.md)
- [브랜드와 설치 자산](docs/brand-assets.md)
- [제품 확장 방향](docs/product-direction.md)

Montage와 Prism 계열 MIT 라이선스, Pretendard·Montserrat 글꼴 라이선스는 배포 자산에 포함합니다.
