# Zeno Notion

프레임워크 없이 HTML, CSS, JavaScript의 ES Modules로 만드는 문서 작업 공간입니다. 문서 데이터, 화면 표시, 이벤트 연결을 파일별로 나누었습니다.

## 현재 구현

- 사이드바, 문서 목록, 문서 제목·설명과 상단 경로 표시.
- 새 페이지 생성과 생성한 문서의 선택·화면 반영.
- 선택된 목록 항목의 `aria-current` 표시.
- CSS 토큰·초기화·기본 스타일·배치·컴포넌트 스타일 분리.

문서 내용 편집, 기존 문서 클릭 전환, 영구 저장, 검색, 설정과 휴지통은 아직 구현되지 않았습니다. 새 문서는 메모리에 저장되어 새로고침하면 초기화됩니다.

## 코드 구조

| 파일 | 역할 |
| --- | --- |
| `index.html` | 시맨틱 페이지 구조와 모듈 진입점 |
| `src/document-store.js` | 문서 데이터와 선택 상태, 문서 생성 |
| `src/document-view.js` | 문서 본문·경로·목록 렌더링 |
| `src/main.js` | 이벤트 연결과 화면 갱신 |
| `styles/` | 공통 값과 화면 스타일 |
| `assets/` | 로고와 아이콘 이미지 |

## 실행

이 폴더를 루트로 정적 HTTP 서버를 실행한 후 접속합니다. ES Modules를 사용하므로 HTML 파일을 직접 열기보다 HTTP 서버로 확인합니다. Python이 설치되어 있다면 다음과 같이 실행할 수 있습니다.

```sh
python -m http.server 8080
```

브라우저에서 `http://localhost:8080`으로 접속합니다. JavaScript 모듈 3개의 구문 검사를 통과했습니다. 실제 브라우저 동작은 별도 확인 대상입니다.


## Vercel

Root Directory를 `toy-notion-vanilla-2026`, Framework Preset을 Other로 선택합니다. 빌드 명령은 비워 두고 프로젝트 루트의 `index.html`을 정적 파일로 배포합니다.

