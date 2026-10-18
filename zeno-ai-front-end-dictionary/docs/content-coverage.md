# 콘텐츠 범위 점검 · 2026-10-07

기존 용어 500개·퀴즈 300개와 사용자가 제공한 JavaScript 코딩테스트, ECMAScript, Browser API, React 기본 목차를 대조해 주요 빈틈을 보강했습니다. 이번 추가분은 용어 170개·퀴즈 120개입니다. 합계는 용어 670개, 면접 답변 연습 390개, JavaScript·React 퀴즈 각 210문항입니다. 각 퀴즈 파트는 기초·실무·심화 70문항씩입니다.

## 점검 기준

| 범위 | 기존 범위와 함께 다루는 내용 | 이번 보강 초점 |
| --- | --- | --- |
| JavaScript·TypeScript | 스코프·클로저·this·프로토타입, 값 비교·변환, 배열·객체, 반복자·모듈·Promise, 타입 관계 | 큰 정수·부동소수점·희소 배열, 문자열 정규화, 클래스·메타프로그래밍, 바이트 처리, 선언·추론 계약 |
| 브라우저·웹 표준 | HTML·CSS, DOM·이벤트·렌더링, HTTP·캐시·Fetch, 저장소·Worker·Service Worker | 웹 컴포넌트의 스타일·슬롯·폼 계약, 메시지·권한·수명, 저장소, 파일·클립보드·미디어·Canvas·환경 API |
| React·앱 개발 | JSX·props·state·Hooks·Effect, 정체성·렌더·커밋, 요청 경쟁·Suspense·hydration | 합성·레거시 연동, 최신 경계 API의 버전 조건, Next.js 경로 규칙, 캐시·폼·기능 경계 |
| UI·품질·운영 | 접근성·키보드·포커스, 테스트, 성능·보안, Git·배포·관찰 | 상태·비활성·설명 연결, 브라우저 및 라이브러리 계약, 자원·권한·배포 판단 |
| CS·코딩테스트 | 자료구조·복잡도, 스택·큐, 탐색·정렬, 투 포인터·슬라이딩 윈도, BFS·DFS·DP | 그래프·정수 계산·문자열·구간 처리, 알고리즘 전제와 불변식, OS·네트워크 기본기 |

대조는 주제 단위입니다. 큰 목차의 모든 메서드·옵션을 각각 독립 카드로 만들었다는 뜻은 아닙니다. 한 카드가 여러 세부 항목을 설명하기도 합니다. 면접 출제 빈도 순위나 특정 회사의 기출 문제로 표시하지 않으며, React Native·모든 자격증 시험·모든 제삼자 라이브러리의 전체 API는 별도 범위입니다.

## 정확한 질문과 출력 표기

질문은 존댓말로 작성합니다. 여러 console.log의 출력은 순서만 암시하는 화살표 대신 첫 번째·두 번째 출력으로 줄을 나눕니다. 빈 문자열은 `"" (빈 문자열)`로 표시합니다. 코드가 `join(" → ")`처럼 문자열 안에 화살표를 직접 출력하면 실제 출력값을 보존합니다.

동기 출력 문제는 값의 결과를 실행 검사합니다. NaN·undefined·-0을 JSON 문자열 변환으로 바꾸지 않고, JSON.stringify가 코드 자체의 학습 주제일 때만 그 직렬화 결과를 답으로 사용합니다. 코드 구문 검사와 실행 검사를 구분하고, 브라우저·React·외부 라이브러리 예제의 실제 실행을 단순 파싱 성공으로 대신하지 않습니다.

문항은 네 보기·한 정답·보기별 이유·전체 해설·관련 용어·근거 문서를 갖습니다. 버전이나 실행 문맥에 따라 답이 달라질 수 있는 항목에는 조건을 명시합니다. 새 ID를 추가하고 기존 500개 용어 ID·300개 퀴즈 ID 및 정답 선택지 ID는 유지합니다.

## 신규 용어 목록

아래 목록은 이번에 독립 카드로 추가한 개념입니다. 기존 500개에 이미 포함된 개념은 이 목록에 다시 나열하지 않습니다.

### 언어·타입·코딩테스트 · 50개

- **BigInt** · 큰 정수 타입
- **Floating-point Arithmetic** · 부동소수점 계산
- **Logical Assignment** · 논리 할당 연산자
- **Automatic Semicolon Insertion** · 자동 세미콜론 삽입
- **Sparse Array** · 희소 배열
- **Array-like Object** · 유사 배열 객체
- **Regular Expression** · 정규 표현식
- **Unicode Normalization** · 유니코드 정규화
- **Intl.Collator** · 언어별 문자열 비교
- **Private Class Field** · 클래스의 비공개 필드
- **Class Inheritance** · 클래스 상속
- **JavaScript Strict Mode** · 자바스크립트 엄격 모드
- **Proxy** · 객체 동작 가로채기
- **Reflect** · 객체 기본 동작의 함수형 API
- **TypedArray** · 타입이 정해진 숫자 배열 뷰
- **DataView** · 바이트 단위의 형식별 읽기와 쓰기
- **Promise.withResolvers()** · 프로미스와 완료 함수를 함께 생성
- **Iterator Helpers** · 반복자의 지연 처리 도구
- **Declaration Merging** · 타입 선언 병합
- **Declaration File** · 타입 선언 파일
- **Type-only Import** · 타입 전용 가져오기
- **exactOptionalPropertyTypes** · 선택 속성의 생략과 undefined 구분
- **Const Type Parameter** · 리터럴을 보존하는 타입 매개변수
- **TypeScript Enum** · 열거형
- **Branded Type** · 의미를 구분하는 브랜드 타입
- **TypeScript this Parameter** · 함수의 수신자 타입 표기
- **NoInfer** · 타입 추론의 입력 차단
- **Recursive Type** · 재귀 타입
- **Deque** · 양쪽 끝에서 넣고 빼는 큐
- **Disjoint Set Union** · 서로소 집합 자료구조
- **Minimum Spanning Tree** · 최소 신장 트리
- **Bellman-Ford Algorithm** · 음수 간선을 허용하는 최단 경로
- **Floyd-Warshall Algorithm** · 모든 쌍 최단 경로
- **0-1 BFS** · 가중치가 0 또는 1인 최단 경로
- **Prefix Sum** · 누적합
- **Difference Array** · 차분 배열
- **Coordinate Compression** · 좌표 압축
- **Sweep Line** · 스위프 라인
- **Binary Search on Answer** · 정답에 대한 이분 탐색
- **Loop Invariant** · 반복문 불변식
- **Bitmask** · 비트로 집합과 상태 표현
- **Greatest Common Divisor** · 최대공약수
- **Sieve of Eratosthenes** · 에라토스테네스의 체
- **Binary Exponentiation** · 빠른 거듭제곱
- **Fenwick Tree** · 펜윅 트리
- **Segment Tree** · 세그먼트 트리
- **Strongly Connected Component** · 강한 연결 요소
- **Longest Common Subsequence** · 최장 공통 부분 수열
- **Knuth-Morris-Pratt** · KMP 문자열 검색
- **Meet in the Middle** · 중간에서 만나기

### React·앱 개발 · 50개

- **Fragment** · DOM 래퍼 없이 묶는 React 그룹
- **JSX Transform** · JSX를 실행 코드로 바꾸는 빌드 변환
- **SyntheticEvent** · React가 전달하는 이벤트 객체
- **Activity** · 숨긴 UI의 상태를 보존하는 React 경계
- **React ViewTransition** · React 갱신과 연결하는 화면 전환 경계
- **FragmentInstance** · Fragment 그룹을 조작하는 ref 핸들
- **React Root** · React 트리를 연결하는 루트
- **forwardRef** · 구버전 함수 컴포넌트의 ref 전달
- **Class Component** · 클래스 방식의 React 컴포넌트
- **Higher-Order Component** · 컴포넌트를 받아 새 컴포넌트를 반환하는 함수
- **Render Props** · UI 생성을 함수 prop에 맡기는 합성
- **Compound Component** · 여러 부분이 함께 하나의 UI 계약을 이루는 패턴
- **Next.js Template** · 탐색 때 새 수명을 만드는 공통 UI
- **Route Group** · URL에 포함되지 않는 경로 그룹
- **Parallel Route** · 한 레이아웃에서 독립적으로 구성하는 경로 슬롯
- **Intercepting Route** · 탐색 문맥에 따라 다르게 표시하는 경로
- **Catch-all Route** · 여러 경로 세그먼트를 배열로 받는 동적 경로
- **notFound()** · 경로의 누락 상태를 알리는 Next.js 제어 흐름
- **redirect()** · Next.js에서 다른 경로로 이동시키는 제어 흐름
- **generateStaticParams** · 빌드할 동적 경로 매개변수 목록
- **generateMetadata** · 서버 데이터로 만드는 Next.js 페이지 메타정보
- **cacheLife()** · Next.js 명시적 캐시의 수명 프로필
- **cacheTag()** · 캐시 결과를 갱신 대상으로 묶는 Next.js 태그
- **Next.js Prefetch** · 탐색 전에 준비하는 경로 결과
- **QueryClient** · 조회·변경 캐시를 소유하는 TanStack Query 객체
- **Query Function Contract** · 성공 데이터와 실패를 표현하는 조회 함수 계약
- **Initial Query Data** · 실제 캐시를 초기화하는 조회 데이터
- **Query Status / Fetch Status** · 데이터 상태와 요청 활동의 구분
- **Background Refetch** · 기존 데이터를 유지하며 다시 조회하는 작업
- **In-flight Query Deduplication** · 진행 중인 같은 조회의 Promise 공유
- **QueryErrorResetBoundary** · 조회 오류의 재시도 상태를 초기화하는 경계
- **Query Cache Removal** · 조회 캐시 항목을 실제로 제거하는 처리
- **setQueryData()** · 알고 있는 결과로 조회 캐시를 동기 갱신
- **Mutation Callback Lifecycle** · 변경 콜백의 관찰자 수명
- **Mutation Scope** · 같은 범위의 변경 요청을 직렬화하는 옵션
- **Query Network Mode** · 온라인 상태에 따른 조회 실행 정책
- **Redux Middleware** · dispatch 흐름 사이에 끼우는 처리
- **Redux Slice** · 상태 영역의 reducer와 action을 함께 정의
- **createEntityAdapter** · 정규화된 엔티티의 갱신과 선택 도구
- **Zustand Store Reset** · 전역 저장소를 명시적으로 초기화
- **Jotai Atom** · 값의 단위와 관계를 정의하는 설정 객체
- **Immer Draft** · 변경 표현을 불변 결과로 바꾸는 임시 상태
- **Touched / Dirty** · 폼 상호작용과 기본값 차이의 구분
- **Form Default Values** · 입력 초기값과 변경 비교의 기준
- **Schema Validation** · 런타임 입력의 구조와 값을 검증
- **Field Registration** · 폼 라이브러리와 입력을 연결하는 계약
- **Cross-field Validation** · 여러 입력 사이의 관계 검증
- **Feature Slice** · 업무 기능을 기준으로 묶는 코드 경계
- **Layer Dependency Rule** · 계층 사이의 import 방향 규칙
- **Module Public API** · 외부 모듈에 공개하는 사용 계약

### 웹 표준·플랫폼·품질·운영 · 50개

- **Shadow DOM** · 요소 내부의 독립 DOM·스타일 경계
- **HTML Template** · 필요할 때 복제하는 비활성 DOM 원본
- **Slot** · Shadow DOM의 외부 콘텐츠 삽입 지점
- **Custom Element Lifecycle** · 문서 연결·해제에 맞춘 요소 자원 수명
- **Attribute Reflection** · HTML 속성과 JavaScript 프로퍼티의 연결
- **Declarative Shadow DOM** · HTML 파서가 생성하는 Shadow DOM
- **CSS Shadow Parts** · Shadow DOM 내부 스타일의 공개 지점
- **Constructable Stylesheet** · 여러 루트가 공유하는 생성형 스타일시트
- **ElementInternals** · 사용자 정의 요소의 폼·접근성 연계 API
- **Event.composedPath()** · 경계를 고려한 이벤트 전파 경로 조회
- **CustomEvent** · 사용자 데이터를 담아 전달하는 DOM 이벤트
- **DocumentFragment** · 문서에 붙이기 전 노드를 묶는 컨테이너
- **Live vs Static DOM Collection** · DOM 변경 반영 여부가 다른 조회 목록
- **cloneNode() / importNode()** · DOM 복제와 대상 문서 문맥 선택
- **Node.isConnected** · 노드의 현재 문서 연결 여부
- **AbortSignal.any() / timeout()** · 사용자 취소와 시간 제한의 결합
- **Cache API** · 요청·응답 쌍을 명시적으로 보관하는 저장소
- **Storage Quota / Persistence** · 브라우저 저장 한도와 퇴거 정책
- **Permissions API** · 기능 권한 상태의 조회와 변화 관찰
- **Web Locks API** · 같은 출처의 탭·워커 작업 상호 배제
- **window.postMessage()** · 창·프레임 사이의 명시적인 메시지 통신
- **MessageChannel** · 두 포트가 연결된 전용 메시지 통로
- **Service Worker Lifecycle** · 설치·대기·활성화로 나뉘는 작업자 업데이트
- **Web App Manifest** · 설치된 웹 앱의 이름·아이콘·실행 정보
- **Push API** · 서버 메시지로 Service Worker를 깨우는 통신
- **Resource Hints** · 필요한 자원을 미리 알려 주는 로딩 힌트
- **Import Map** · 브라우저 모듈 이름과 주소의 대응표
- **Popover API** · 기본 열기·닫기를 제공하는 비모달 오버레이
- **inert** · 영역 전체의 상호작용과 접근성 노출 차단
- **Responsive Images** · 화면과 해상도에 맞춰 선택하는 이미지
- **content-visibility** · 화면 밖 콘텐츠의 렌더링 작업 생략
- **CSS Scroll Snap** · 스크롤이 콘텐츠 기준 위치에 맞춰지는 동작
- **Accessible Description** · 컨트롤 이름을 보충하는 접근성 설명
- **Skip Link** · 반복 탐색을 건너뛰는 본문 바로가기
- **Target Size** · 터치와 포인터가 누를 수 있는 실제 영역
- **aria-hidden** · 보조 기술에 대한 콘텐츠 노출 제어
- **PerformanceObserver** · 성능 타임라인 항목의 비동기 관찰
- **Long Animation Frame** · 50ms를 넘게 지연된 렌더링 갱신 분석
- **CSP Report-Only** · 차단 전에 정책 위반을 관찰하는 CSP 모드
- **Cross-Origin Isolation** · 교차 출처와의 공유 범위를 제한한 실행 환경
- **Permissions Policy** · 문서와 iframe의 브라우저 기능 사용 제한
- **Git Stash** · 아직 커밋하지 않은 변경의 임시 보관
- **OIDC for CI** · CI 신원을 확인해 단기 클라우드 자격 발급
- **Canary Release** · 일부 트래픽으로 검증하며 확대하는 배포
- **Process vs Thread** · 실행 자원 단위와 그 안의 실행 흐름
- **Deadlock** · 서로의 자원을 기다려 진행이 멈춘 상태
- **Virtual Memory** · 프로세스 주소와 물리 저장 위치의 분리
- **UDP** · 순서·전달 보장을 기본 제공하지 않는 데이터그램 전송
- **Referrer Policy** · 요청에 실리는 출발 페이지 정보 범위
- **HTTP Redirect** · 다른 주소로 후속 요청을 안내하는 응답

### 브라우저 주요 API · 20개

- **Blob** · 불변 바이너리 데이터 묶음
- **File** · 이름과 수정 시각을 가진 파일 데이터
- **FileReader** · 로컬 Blob·File의 비동기 읽기
- **Clipboard API** · 클립보드의 비동기 읽기·쓰기
- **Geolocation API** · 권한을 요청하는 기기 위치 정보
- **MediaDevices** · 카메라·마이크의 미디어 스트림 요청
- **MediaRecorder** · 미디어 스트림의 녹화·녹음
- **HTMLMediaElement** · audio·video 재생 상태와 이벤트
- **CanvasRenderingContext2D** · Canvas의 2차원 비트맵 그리기
- **Web Audio API** · 오디오 노드 그래프와 정밀 스케줄링
- **Notifications API** · 시스템 알림 표시와 사용자 권한
- **Fullscreen API** · 사용자 요청에 따른 요소 전체 화면
- **Screen Wake Lock API** · 활성 화면의 자동 꺼짐 방지 요청
- **Web Crypto API** · 브라우저의 암호 연산과 안전한 난수
- **TextEncoder** · 문자열의 UTF-8 바이트 변환
- **DOMParser** · 문자열에서 별도 문서 트리 만들기
- **Web Animations API** · JavaScript의 키프레임·타이밍 제어
- **matchMedia()** · 미디어 조건과 변화 관찰
- **requestIdleCallback()** · 여유 시간의 비필수 작업 예약
- **HTML Drag and Drop API** · 드래그 데이터와 드롭 대상의 계약

## 2026-10-08 React 코드 문제 보강

React의 기존 210문제 중 코드 없는 90문제에 실제 JSX·Hooks·상태·이벤트·Effect·폼·렌더링 상황을 추가했습니다. 전체 문제 수와 기존 문항 ID·정답 보기 ID는 유지합니다. React 코드 문제는 35개에서 125개로 늘었고, 빈칸 채우기 40개·코드 없이 개념을 묻는 문제 85개를 함께 제공합니다. 난도별 코드 문제는 기초 44·실무 41·심화 40개입니다.

빈칸은 코드 안에 밑줄로 표시하며 네 보기에서 들어갈 코드 또는 코드·설명 조합을 선택합니다. 문항 작성 후 정답 의미·오답 이유를 독립 교차 검토했고 코드 문법과 정답 치환의 문법을 확인했습니다. 모든 React 예제를 브라우저에서 실행했다는 의미는 아닙니다.
