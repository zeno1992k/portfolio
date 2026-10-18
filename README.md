# 포트폴리오

실제 구현한 프론트엔드 프로젝트의 공개 소스입니다. 각 폴더는 독립적으로 실행하고 Vercel 프로젝트의 Root Directory로 지정할 수 있습니다.

| 프로젝트 | 기술 | 주요 내용 | Vercel Root Directory |
| --- | --- | --- | --- |
| [Zeno Notion](toy-notion-vanilla-2026/README.md) | HTML · CSS · JavaScript | 새 문서 생성, 목록과 선택 상태 표시 | `toy-notion-vanilla-2026` |
| [ZenoTube](toy-youtube-react-2026/README.md) | React · Vite · YouTube API | 영상 검색, 상세 재생, 추가 목록 로딩 | `toy-youtube-react-2026` |
| [Zeno 프론트엔드 단어장](zeno-ai-front-end-dictionary/README.md) | React · TypeScript · Supabase | 카드 학습, 퀴즈, 복습과 기록 동기화 | `zeno-ai-front-end-dictionary` |
| [Zeno AI Docs](zeno-ai-docs/README.md) | Next.js · Nextra · MDX | 학습 문서, 코드 실습, 퀴즈와 시각화 | `zeno-ai-docs` |

## 실행 및 배포

해당 프로젝트 폴더의 README에 따라 실행합니다. 의존성 잠금 파일, 공개 자산, 테스트 코드와 DB 마이그레이션을 포함합니다. 실제 환경 변수는 `.env.example`을 참고해 로컬 또는 Vercel에 별도로 등록합니다.

| 프로젝트 | 설치 | 빌드 | 출력 |
| --- | --- | --- | --- |
| Zeno Notion | 불필요 | 불필요 | 프로젝트 루트의 정적 파일 |
| ZenoTube | `npm ci` | `npm run build` | `dist` |
| Zeno 프론트엔드 단어장 | `npm ci` | `npm run build` | `dist` |
| Zeno AI Docs | `npm ci` | `npm run build` | Next.js 설정의 정적 내보내기 |

프로젝트별 `.gitignore`는 로컬 설정·개인 메모·의존성·빌드 결과를 제외하고, `.vercelignore`는 배포에 필요 없는 파일 업로드를 제외합니다. 개별 프로젝트를 별도 저장소로 분리해도 제외 규칙이 적용됩니다.

## 검증

- Zeno Notion: JavaScript 모듈 3개 구문 검사 통과.
- ZenoTube: 린트·프로덕션 빌드 통과.
- Zeno 프론트엔드 단어장: 단위 테스트 173개·DB 테스트·프로덕션 빌드 통과.
- Zeno AI Docs: 린트·정적 페이지 생성·검색 색인·이전 주소 연결을 포함한 빌드 통과.

단어장 빌드에는 번들 크기 경고, AI Docs 린트에는 기존 주석 경고 1개가 있습니다. 실제 Vercel 배포와 외부 로그인·API 동작은 별도 확인 대상입니다.
