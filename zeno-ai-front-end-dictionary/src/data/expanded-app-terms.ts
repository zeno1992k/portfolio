import type { Term } from './terms';

export const expandedAppTerms: Term[] = [
  {
    id: 'dom-query-selector', term: 'querySelector()', korean: '선택자로 요소 찾기', category: 'browser', level: 'foundation', kind: 'api',
    question: "페이지에서 검색 입력 하나를 찾아오려면 어떻게 해야 하나요?",
    definition: 'CSS 선택자와 일치하는 첫 DOM 요소를 반환하는 메서드.',
    example: '검색 입력을 찾아 포커스를 옮기거나 현재 값을 읽는다.',
    caution: '없으면 null이다. 잘못된 선택자는 예외를 내며, 동적인 ID에는 CSS.escape가 필요할 수 있다.',
    related: ['DOM', 'Focus Management'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector', tags: ['DOM', '선택자', '요소 조회'],
    codeLanguage: 'javascript', code: `const input = document.querySelector('#search');
input?.focus();`,
  },
  {
    id: 'add-event-listener', term: 'addEventListener()', korean: '이벤트 수신 등록', category: 'browser', level: 'foundation', kind: 'api',
    question: "버튼 클릭에 반응하는 함수를 어떻게 연결할까요?",
    definition: '이벤트 대상에 특정 이벤트를 처리할 함수를 등록하는 메서드.',
    example: '저장 버튼의 클릭을 듣고, 화면을 떠날 때 같은 함수를 제거한다.',
    caution: 'removeEventListener에는 같은 함수 참조와 capture 값이 필요하다. 이름 없는 함수를 매번 만들면 다른 리스너다.',
    related: ['Event Bubbling', 'Effect Cleanup'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener', tags: ['DOM', '이벤트', '리스너'],
    codeLanguage: 'javascript', code: `const button = document.querySelector('#save');
function onSave() { console.log('저장'); }
button?.addEventListener('click', onSave);
// 화면 정리 시:
button?.removeEventListener('click', onSave);`,
  },
  {
    id: 'event-delegation', term: 'Event Delegation', korean: '이벤트 위임', category: 'browser', level: 'practical', kind: 'concept',
    question: "목록의 버튼마다 클릭 리스너를 붙여야 할까요?",
    definition: '자식에서 전파된 이벤트를 공통 부모가 받아 처리하는 방식.',
    example: '용어 목록에 리스너 하나를 두고 클릭된 저장 버튼의 ID를 확인한다.',
    caution: '모든 이벤트가 버블링하지는 않는다. closest로 찾은 요소가 해당 목록 안에 있는지도 확인한다.',
    related: ['Event Bubbling', 'Event Target / CurrentTarget'], source: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling#event_delegation', tags: ['이벤트', '목록', '위임'],
    codeLanguage: 'javascript', code: `const list = document.querySelector('#terms');
list?.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('[data-save]');
  if (button && list.contains(button)) {
    console.log(button.getAttribute('data-save'));
  }
});`,
  },
  {
    id: 'prevent-default', term: 'preventDefault()', korean: '기본 동작 취소', category: 'browser', level: 'foundation', kind: 'api',
    question: "폼 제출로 페이지가 새로 열리는 것을 막으려면 어떻게 해야 하나요?",
    definition: '취소 가능한 이벤트의 브라우저 기본 동작을 취소하는 메서드.',
    example: 'submit 이벤트에서 기본 전송을 막고 앱의 저장 함수를 호출한다.',
    caution: '이벤트 전파를 막지는 않는다. passive 리스너나 취소 불가능한 이벤트에서는 취소할 수 없다.',
    related: ['stopPropagation()', 'FormData'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault', tags: ['이벤트', '폼', '기본 동작'],
    codeLanguage: 'javascript', code: `document.querySelector('form')?.addEventListener(
  'submit', event => {
    event.preventDefault();
    console.log('앱에서 제출 처리');
  },
);`,
  },
  {
    id: 'stop-propagation', term: 'stopPropagation()', korean: '이벤트 전파 중단', category: 'browser', level: 'practical', kind: 'api',
    question: "저장 버튼 클릭이 바깥 카드 클릭까지 실행시키면 어떻게 해야 하나요?",
    definition: '이벤트가 DOM 경로의 다음 대상으로 전파되는 것을 중단하는 메서드.',
    example: '카드 안의 저장 버튼을 눌렀을 때 바깥 카드의 상세 열기가 실행되지 않게 한다.',
    caution: '기본 동작과 같은 요소의 다른 리스너는 취소하지 않는다. 남용하면 상위 이벤트 위임도 끊긴다.',
    related: ['Event Bubbling', 'preventDefault()'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation', tags: ['이벤트', '전파', '중첩 UI'],
    codeLanguage: 'javascript', code: `document.querySelector('#bookmark')?.addEventListener(
  'click', event => {
    event.stopPropagation();
    console.log('저장만 처리');
  },
);`,
  },
  {
    id: 'event-target-current-target', term: 'Event Target / CurrentTarget', korean: '발생 대상과 수신 대상', category: 'browser', level: 'foundation', kind: 'concept',
    question: "버튼 안의 아이콘을 누르면 target은 버튼일까요?",
    definition: 'target은 이벤트 대상이고 currentTarget은 현재 리스너가 연결된 대상이다.',
    example: '아이콘 클릭을 버튼 리스너가 받으면 target과 currentTarget이 다를 수 있다.',
    caution: 'currentTarget은 리스너 실행 중의 값이다. 비동기 작업에서 쓸 값은 실행 중 별도로 확보한다.',
    related: ['Event Delegation', 'addEventListener()'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget', tags: ['이벤트', 'target', 'currentTarget'],
    codeLanguage: 'javascript', code: `document.querySelector('button')?.addEventListener(
  'click', event => {
    console.log(event.target);
    console.log(event.currentTarget);
  },
);`,
  },
  {
    id: 'event-capturing', term: 'Event Capturing', korean: '이벤트 캡처 단계', category: 'browser', level: 'practical', kind: 'concept',
    question: "자식보다 상위 요소에서 클릭을 먼저 받을 수 있을까요?",
    definition: '이벤트가 대상에 도달하기 전에 DOM의 상위 경로를 따라 전달되는 단계.',
    example: '문서의 캡처 리스너로 내부 요소의 클릭을 먼저 관찰한다.',
    caution: 'capture 등록과 기본 버블 등록은 다른 단계다. 제거할 때도 capture 값을 맞춘다.',
    related: ['Event Bubbling', 'addEventListener()'], source: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling#event_capture', tags: ['이벤트', 'capture', '전파'],
    codeLanguage: 'javascript', code: `function observeClick(event) {
  console.log(event.target);
}
document.addEventListener('click', observeClick, true);
document.removeEventListener('click', observeClick, true);`,
  },
  {
    id: 'intersection-observer', term: 'IntersectionObserver', korean: '교차 상태 관찰', category: 'browser', level: 'practical', kind: 'api',
    question: "목록 끝이 화면에 가까워졌는지 매번 스크롤로 계산해야 할까요?",
    definition: '요소와 관찰 기준 영역의 교차 상태 변화를 비동기로 알려주는 API.',
    example: '목록 끝의 표시 요소가 보이면 다음 용어 묶음을 요청한다.',
    caution: '정확한 픽셀별 스크롤 추적용이 아니다. 중복 요청을 막고 필요 없을 때 disconnect한다.',
    related: ['Lazy Loading', 'DOM'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API', tags: ['관찰자', '무한 스크롤', '교차'],
    codeLanguage: 'javascript', code: `const observer = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) {
    console.log('다음 페이지를 준비');
  }
});
const end = document.querySelector('#list-end');
if (end) observer.observe(end);
// 종료 시 observer.disconnect();`,
  },
  {
    id: 'resize-observer', term: 'ResizeObserver', korean: '요소 크기 관찰', category: 'browser', level: 'practical', kind: 'api',
    question: "창 크기는 그대로인데 카드 영역만 넓어졌다면 어떻게 해야 하나요?",
    definition: '관찰하는 요소의 콘텐츠 박스나 테두리 박스 크기 변화를 알려주는 API.',
    example: '부모 패널 크기에 맞춰 차트의 표시 영역을 조정한다.',
    caution: '콜백에서 관찰 중인 요소의 크기를 계속 바꾸면 반복 갱신이 생길 수 있다. 종료 시 관찰을 해제한다.',
    related: ['Rendering Pipeline', 'IntersectionObserver'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver', tags: ['관찰자', '크기', '반응형'],
    codeLanguage: 'javascript', code: `const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    console.log(entry.contentRect.width);
  }
});
const panel = document.querySelector('#panel');
if (panel) observer.observe(panel);`,
  },
  {
    id: 'mutation-observer', term: 'MutationObserver', korean: 'DOM 변경 관찰', category: 'browser', level: 'practical', kind: 'api',
    question: "외부 위젯이 DOM을 바꾼 것을 어떻게 알까요?",
    definition: 'DOM의 자식·속성·텍스트 변경을 설정에 따라 비동기로 알려주는 API.',
    example: '앱 밖에서 삽입된 요소를 감지해 연동 상태를 확인한다.',
    caution: 'React 상태 변경을 감지하는 대체 수단이 아니다. 넓은 subtree 관찰은 불필요한 변경까지 수집한다.',
    related: ['DOM', 'Effect Cleanup'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver', tags: ['관찰자', 'DOM', '외부 위젯'],
    codeLanguage: 'javascript', code: `const observer = new MutationObserver(records => {
  console.log(records.length);
});
const host = document.querySelector('#widget');
if (host) observer.observe(host, { childList: true });
// 종료 시 observer.disconnect();`,
  },
  {
    id: 'request-animation-frame', term: 'requestAnimationFrame()', korean: '다음 화면 갱신에 맞춘 실행', category: 'browser', level: 'practical', kind: 'api',
    question: "애니메이션을 16ms 타이머로 고정해도 괜찮을까요?",
    definition: '다음 화면 다시 그리기 전에 콜백을 실행하도록 브라우저에 요청하는 API.',
    example: '시간값을 기준으로 요소 위치를 계산해 화면 주사율에 맞춰 움직인다.',
    caution: '한 번만 예약되므로 반복하려면 다시 요청한다. 프레임 수로 속도를 계산하면 주사율에 따라 달라진다.',
    related: ['Rendering Pipeline', 'Event Loop'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame', tags: ['애니메이션', '프레임', '렌더링'],
    codeLanguage: 'javascript', code: `const start = performance.now();
const dot = document.querySelector('#dot');
function frame(time) {
  if (!(dot instanceof HTMLElement)) return;
  dot.style.transform = 'translateX(' + (time - start) / 10 + 'px)';
  if (time - start < 1000) requestAnimationFrame(frame);
}
requestAnimationFrame(frame);`,
  },
  {
    id: 'web-worker', term: 'Web Worker', korean: '별도 실행 환경의 작업자', category: 'browser', level: 'advanced', kind: 'api',
    question: "큰 데이터 계산이 클릭 반응을 멈추게 한다면 어떻게 해야 하나요?",
    definition: '메인 스레드와 분리된 실행 환경에서 스크립트를 처리하는 브라우저 기능.',
    example: '큰 목록의 계산을 worker에 보내고 결과를 메시지로 돌려받는다.',
    caution: 'DOM에 직접 접근할 수 없다. 메시지 복사·전달 비용도 있으며 종료할 때 terminate한다.',
    related: ['Event Loop', 'Service Worker'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers', tags: ['스레드', '작업자', '성능'],
    codeLanguage: 'javascript', code: `// 메인 스크립트
const worker = new Worker('./calc.js');
worker.onmessage = event => console.log(event.data);
worker.postMessage([2, 4, 6]);
// calc.js
self.onmessage = event => {
  self.postMessage(event.data.reduce((sum, n) => sum + n, 0));
};`,
  },
  {
    id: 'service-worker', term: 'Service Worker', korean: '요청과 캐시를 다루는 작업자', category: 'browser', level: 'advanced', kind: 'api',
    question: "설치한 웹 앱이 오프라인에서도 열리는 기반은 무엇인가요?",
    definition: '페이지와 별도 생명주기로 실행되며 요청 처리·캐시·푸시 이벤트 등을 다룰 수 있는 스크립트.',
    example: '앱 자산을 캐시하고 네트워크가 없을 때 캐시에서 응답한다.',
    caution: '등록만으로 오프라인이나 푸시가 완성되지 않는다. 보안 컨텍스트·범위·갱신 정책을 설계해야 한다.',
    related: ['Web Worker', 'Cache-Control'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API', tags: ['PWA', '오프라인', '캐시'],
    codeLanguage: 'javascript', code: `if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .catch(error => console.error('등록 실패', error));
}`,
  },
  {
    id: 'indexeddb', term: 'IndexedDB', korean: '브라우저의 구조화된 데이터 저장소', category: 'browser', level: 'advanced', kind: 'api',
    question: "많은 학습 기록을 localStorage 문자열 하나로 저장해야 할까요?",
    definition: '객체 저장소·인덱스·트랜잭션으로 구조화된 데이터를 비동기 저장하는 브라우저 API.',
    example: '오프라인 학습 기록을 ID별로 저장하고 필요한 기록을 조회한다.',
    caution: '용량과 영구 보존은 보장되지 않는다. 스키마 변경은 버전 업그레이드 트랜잭션에서 처리한다.',
    related: ['localStorage', 'Service Worker'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API', tags: ['저장소', '오프라인', '트랜잭션'],
    codeLanguage: 'javascript', code: `const request = indexedDB.open('study', 1);
request.onupgradeneeded = () => {
  request.result.createObjectStore('cards', { keyPath: 'id' });
};
request.onsuccess = () => {
  const tx = request.result.transaction('cards', 'readwrite');
  tx.objectStore('cards').put({ id: 'closure', reviewed: true });
};`,
  },
  {
    id: 'session-storage', term: 'sessionStorage', korean: '탭 단위 세션 저장소', category: 'browser', level: 'foundation', kind: 'api',
    question: "새로고침에는 남고 탭을 닫으면 끝나는 값을 저장하려면 어떻게 해야 하나요?",
    definition: 'origin과 최상위 탭의 페이지 세션별로 문자열 값을 저장하는 Web Storage.',
    example: '한 탭에서만 유지할 임시 필터를 저장하고 새로고침 때 복원한다.',
    caution: '같은 origin이어도 탭별 저장소가 구분된다. 저장이 차단되거나 용량을 넘으면 예외가 날 수 있다.',
    related: ['localStorage', 'Origin'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage', tags: ['저장소', '탭', '세션'],
    codeLanguage: 'javascript', code: `try {
  sessionStorage.setItem('filter', 'react');
  console.log(sessionStorage.getItem('filter'));
} catch {
  console.log('이 탭의 메모리에서만 유지');
}`,
  },
  {
    id: 'history-api', term: 'History API', korean: '브라우저 방문 기록 제어', category: 'browser', level: 'practical', kind: 'api',
    question: "페이지를 새로 받지 않고 뒤로가기가 가능한 주소를 만들려면 어떻게 해야 하나요?",
    definition: '현재 탭의 방문 기록에 항목을 추가·교체하고 이동하는 브라우저 API.',
    example: '상세를 열 때 pushState로 주소를 바꾸고 popstate에서 화면을 복원한다.',
    caution: 'pushState 자체는 popstate를 발생시키지 않는다. 다른 origin의 URL은 넣을 수 없다.',
    related: ['URL State', 'Origin'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/History_API', tags: ['라우팅', '뒤로가기', '주소'],
    codeLanguage: 'javascript', code: `history.pushState({ termId: 'closure' }, '', '/terms/closure');
window.addEventListener('popstate', event => {
  console.log('복원할 상태:', event.state);
});`,
  },
  {
    id: 'http-status-code', term: 'HTTP Status Code', korean: 'HTTP 응답 상태 코드', category: 'http', level: 'foundation', kind: 'concept',
    question: "API가 성공했는지 숫자만 보고 구분할 수 있을까요?",
    definition: 'HTTP 응답의 처리 결과를 나타내는 세 자리 코드.',
    example: '201은 생성, 404는 대상을 찾지 못함, 503은 서비스가 처리할 수 없는 상태를 표현한다.',
    caution: '2xx라고 앱의 모든 작업이 완료됐다는 뜻은 아니다. 202는 수락 상태이며 fetch는 4xx에도 보통 reject되지 않는다.',
    related: ['fetch()', 'Retry'], source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status', tags: ['응답', '상태 코드', 'API'],
    codeLanguage: 'javascript', code: `const response = await fetch('/api/terms');
if (!response.ok) {
  throw new Error('HTTP ' + response.status);
}`,
  },
  {
    id: 'http-headers', term: 'HTTP Header', korean: 'HTTP 부가 정보', category: 'http', level: 'foundation', kind: 'concept',
    question: "본문 형식이나 캐시 규칙은 어디에 전달할까요?",
    definition: '요청·응답에 이름과 값으로 전달하는 메타데이터.',
    example: 'Accept로 원하는 응답 형식을 알리고 Content-Type으로 실제 본문 형식을 알린다.',
    caution: '브라우저가 직접 관리하는 헤더도 있다. 다른 origin의 응답 헤더는 CORS 규칙에 따라 읽기가 제한된다.',
    related: ['Content-Type', 'CORS'], source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers', tags: ['헤더', '요청', '응답'],
    codeLanguage: 'javascript', code: `const headers = new Headers();
headers.set('Accept', 'application/json');
await fetch('/api/terms', { headers });`,
  },
  {
    id: 'content-type', term: 'Content-Type', korean: '본문의 미디어 타입', category: 'http', level: 'foundation', kind: 'concept',
    question: "서버는 요청 본문이 JSON인지 어떻게 알까요?",
    definition: '전달되는 본문의 미디어 타입을 나타내는 HTTP 헤더.',
    example: 'JSON 요청에는 application/json을 붙이고 JSON 문자열을 본문으로 전송한다.',
    caution: '헤더를 붙인다고 객체가 JSON으로 변환되지는 않는다. FormData는 multipart boundary를 브라우저가 정하도록 둔다.',
    related: ['HTTP Header', 'FormData'], source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type', tags: ['JSON', '미디어 타입', '본문'],
    codeLanguage: 'javascript', code: `await fetch('/api/bookmarks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ termId: 'closure' }),
});`,
  },
  {
    id: 'origin', term: 'Origin', korean: '웹 출처', category: 'http', level: 'foundation', kind: 'concept',
    question: "같은 도메인이면 포트가 달라도 같은 출처일까요?",
    definition: '일반적인 웹 URL에서 프로토콜·호스트·포트의 조합으로 구분하는 출처.',
    example: 'localhost의 4179와 4180은 서로 다른 origin이어서 저장소와 접근 규칙이 구분된다.',
    caution: '경로는 origin에 포함하지 않는다. same-site와 same-origin은 서로 다른 기준이다.',
    related: ['Same-Origin Policy', 'SameSite Cookie'], source: 'https://developer.mozilla.org/en-US/docs/Glossary/Origin', tags: ['출처', '보안', 'URL'],
    codeLanguage: 'javascript', code: `const a = new URL('https://example.com/terms');
const b = new URL('https://example.com/notes');
console.log(a.origin === b.origin); // true`,
  },
  {
    id: 'preflight-request', term: 'Preflight Request', korean: '교차 출처 사전 확인 요청', category: 'http', level: 'practical', kind: 'concept',
    question: "POST 전에 브라우저가 OPTIONS를 먼저 보낸 이유는 무엇인가요?",
    definition: '특정 교차 출처 요청 전에 메서드와 헤더가 허용되는지 확인하는 CORS 요청.',
    example: '교차 출처로 JSON 본문을 보내면 브라우저가 먼저 허용 여부를 확인할 수 있다.',
    caution: '모든 교차 출처 요청에 생기는 것은 아니다. 프론트가 임의로 제거하기보다 서버 CORS 정책을 맞춘다.',
    related: ['CORS', 'Content-Type'], source: 'https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request', tags: ['CORS', 'OPTIONS', '사전 요청'],
    codeLanguage: 'http', code: `OPTIONS /api/bookmarks HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type`,
  },
  {
    id: 'credentials-mode', term: 'Fetch Credentials', korean: '요청 자격 증명 모드', category: 'http', level: 'practical', kind: 'api',
    question: "다른 origin의 API에 로그인 쿠키를 보내려면 어떻게 해야 하나요?",
    definition: 'fetch의 credentials 옵션으로 쿠키 등 자격 증명의 포함 범위를 지정하는 기능.',
    example: '쿠키 기반 교차 출처 요청에서 include를 사용하고 서버의 CORS 응답도 맞춘다.',
    caution: 'include도 SameSite·브라우저 쿠키 정책을 무시하지 못한다. 자격 증명 CORS 응답에는 와일드카드 origin을 쓰지 않는다.',
    related: ['Cookie', 'CORS', 'SameSite Cookie'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials', tags: ['fetch', '쿠키', 'credentials'],
    codeLanguage: 'javascript', code: `await fetch('https://api.example.com/me', {
  credentials: 'include',
});`,
  },
  {
    id: 'same-origin-policy', term: 'Same-Origin Policy', korean: '동일 출처 정책', category: 'http', level: 'foundation', kind: 'concept',
    question: "다른 사이트의 페이지 내용을 마음대로 읽을 수 있을까요?",
    definition: '한 origin의 문서나 스크립트가 다른 origin의 리소스와 상호작용하는 범위를 제한하는 보안 정책.',
    example: '다른 사이트 창의 DOM을 읽는 코드는 기본적으로 제한된다.',
    caution: '교차 출처 전송이나 이미지 삽입을 모두 막는 정책은 아니다. CORS는 허용된 응답 읽기를 조절하며 인증을 대신하지 않는다.',
    related: ['Origin', 'CORS', 'CSRF'], source: 'https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy', tags: ['출처', '브라우저 보안', '접근 제한'],
  },
  {
    id: 'http-idempotency', term: 'HTTP Idempotency', korean: 'HTTP 멱등성', category: 'http', level: 'practical', kind: 'concept',
    question: "네트워크 오류로 요청을 다시 보내도 같은 작업이 중복될까요?",
    definition: '동일 요청을 여러 번 실행한 서버의 의도된 효과가 한 번 실행한 것과 같은 성질.',
    example: '리소스를 같은 내용으로 교체하는 PUT은 멱등하게 설계하고 POST 재시도에는 별도 중복 방지를 둔다.',
    caution: '응답 코드가 매번 같아야 한다는 뜻은 아니다. DELETE는 멱등하지만 읽기 전용의 안전한 메서드는 아니다.',
    related: ['GET / POST', 'Retry'], source: 'https://developer.mozilla.org/en-US/docs/Glossary/Idempotent', tags: ['HTTP', '재시도', '중복 방지'],
  },
  {
    id: 'etag', term: 'ETag', korean: '리소스 표현의 버전 식별자', category: 'http', level: 'practical', kind: 'concept',
    question: "캐시된 응답이 서버의 최신 버전인지 어떻게 비교할까요?",
    definition: '서버가 특정 리소스 표현을 식별하기 위해 응답에 붙이는 검증자.',
    example: '받은 ETag를 다음 요청의 If-None-Match로 보내 변경 여부를 확인한다.',
    caution: '항상 파일 해시인 것은 아니다. 강한 ETag와 W/ 접두사가 있는 약한 ETag의 비교 규칙은 다르다.',
    related: ['Conditional Request', 'Cache-Control'], source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag', tags: ['캐시', '검증자', '버전'],
    codeLanguage: 'http', code: `HTTP/1.1 200 OK
ETag: "terms-v3"
Content-Type: application/json`,
  },
  {
    id: 'conditional-request', term: 'Conditional Request', korean: '조건부 HTTP 요청', category: 'http', level: 'practical', kind: 'concept',
    question: "바뀌지 않은 응답을 매번 다시 다운로드해야 할까요?",
    definition: 'If-None-Match·If-Match 같은 조건 헤더에 따라 처리 결과를 달리하는 요청.',
    example: '캐시 재검증에는 If-None-Match, 동시 수정 충돌 방지에는 If-Match를 사용한다.',
    caution: '304 응답에는 새 본문이 없다. 쓰기 조건이 맞지 않아 받은 412는 최신 버전을 확인해 처리한다.',
    related: ['ETag', 'Cache-Control'], source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Conditional_requests', tags: ['캐시', '304', '동시 수정'],
    codeLanguage: 'http', code: `GET /api/terms HTTP/1.1
If-None-Match: "terms-v3"

HTTP/1.1 304 Not Modified`,
  },
  {
    id: 'same-site-cookie', term: 'SameSite Cookie', korean: '사이트 기준 쿠키 전송 제한', category: 'http', level: 'practical', kind: 'concept',
    question: "다른 사이트에서 시작한 요청에도 로그인 쿠키가 붙을까요?",
    definition: '쿠키가 교차 사이트 요청에 포함되는 범위를 Strict·Lax·None으로 조절하는 속성.',
    example: '일반 로그인 세션에서 Lax를 검토하고 교차 사이트 전송이 필요하면 None과 Secure를 함께 설정한다.',
    caution: 'site는 origin과 다르다. SameSite만으로 모든 CSRF를 막지는 못하며 None은 Secure가 필요하다.',
    related: ['Cookie', 'CSRF', 'Origin'], source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value', tags: ['쿠키', 'SameSite', 'CSRF'],
    codeLanguage: 'http', code: `Set-Cookie: session=example; Path=/; Secure; HttpOnly; SameSite=Lax`,
  },
  {
    id: 'http-only-cookie', term: 'HttpOnly Cookie', korean: '스크립트 읽기를 제한한 쿠키', category: 'http', level: 'practical', kind: 'concept',
    question: "세션 쿠키를 document.cookie에서 보이지 않게 하려면 어떻게 해야 하나요?",
    definition: 'JavaScript의 쿠키 접근 API로 읽거나 수정할 수 없도록 하는 쿠키 속성.',
    example: '서버가 세션 쿠키를 HttpOnly로 발급해 스크립트의 직접 읽기를 제한한다.',
    caution: '브라우저 요청에는 여전히 쿠키가 붙을 수 있다. XSS의 모든 행동이나 CSRF를 막는 속성은 아니다.',
    related: ['Cookie', 'XSS', 'CSRF'], source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#httponly', tags: ['쿠키', '세션', 'HttpOnly'],
    codeLanguage: 'http', code: `Set-Cookie: session=example; HttpOnly; Secure; SameSite=Lax`,
  },
  {
    id: 'secure-cookie', term: 'Secure Cookie', korean: '보안 연결 전송 쿠키', category: 'http', level: 'practical', kind: 'concept',
    question: "로그인 쿠키가 일반 HTTP 요청에도 실려도 될까요?",
    definition: '쿠키를 원칙적으로 HTTPS 같은 보안 연결에서만 전송하도록 하는 속성.',
    example: '운영 로그인 쿠키에 Secure를 붙여 암호화된 연결로 전송하게 한다.',
    caution: '쿠키 값을 자체 암호화하거나 JavaScript 접근을 차단하는 속성은 아니다. localhost는 개발 예외가 있다.',
    related: ['HttpOnly Cookie', 'Cookie'], source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#secure', tags: ['쿠키', 'HTTPS', '전송 보안'],
    codeLanguage: 'http', code: `Set-Cookie: session=example; Secure; HttpOnly; SameSite=Lax`,
  },
  {
    id: 'csrf', term: 'CSRF', korean: '교차 사이트 요청 위조', category: 'http', level: 'advanced', kind: 'concept',
    question: "로그인한 사용자가 악성 사이트를 열기만 해도 요청이 실행될까요?",
    definition: '피해자의 인증 상태를 이용해 의도하지 않은 요청을 대상 사이트에 보내게 하는 공격.',
    example: '쿠키 인증의 변경 요청에는 서버가 검증하는 CSRF 토큰과 적절한 요청 출처 확인을 적용한다.',
    caution: 'CORS만으로 모든 요청 전송을 막지는 못한다. SameSite·토큰 등 보호 수단을 요청 구조에 맞춰 함께 검토한다.',
    related: ['SameSite Cookie', 'Same-Origin Policy', 'Authentication'], source: 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF', tags: ['보안', '쿠키 인증', '요청 위조'],
  },
  {
    id: 'authentication', term: 'Authentication', korean: '인증', category: 'api-backend', level: 'foundation', kind: 'concept',
    question: "이 요청을 보낸 사람이 누구인지 어떻게 확인할까요?",
    definition: '사용자나 요청 주체의 신원을 검증하는 과정.',
    example: '로그인 후 서버가 세션이나 토큰을 확인해 요청한 사용자를 식별한다.',
    caution: '로그인 성공이 모든 데이터 접근 허용을 뜻하지는 않는다. 이후 권한 확인은 인가가 담당한다.',
    related: ['Authorization', 'Access Token'], source: 'https://developer.mozilla.org/en-US/docs/Glossary/Authentication', tags: ['로그인', '신원', '인증'],
  },
  {
    id: 'authorization', term: 'Authorization', korean: '인가', category: 'api-backend', level: 'foundation', kind: 'concept',
    question: "로그인한 사용자라면 다른 사람의 학습 기록도 볼 수 있을까요?",
    definition: '요청 주체가 특정 데이터나 동작에 접근할 권한이 있는지 판단하는 과정.',
    example: '서버에서 현재 사용자와 기록 소유자를 비교해 본인 기록만 반환한다.',
    caution: '버튼을 숨기는 것은 서버 권한 검사가 아니다. 요청에 사용자가 넣은 userId를 그대로 신뢰하지 않는다.',
    related: ['Authentication', 'Row Level Security'], source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication', tags: ['권한', 'API', '인가'],
  },
  {
    id: 'access-token', term: 'Access Token', korean: '리소스 접근 토큰', category: 'api-backend', level: 'practical', kind: 'concept',
    question: "로그인 후 API마다 비밀번호를 다시 보내야 할까요?",
    definition: '보호된 리소스에 접근할 권한을 나타내는 자격 증명.',
    example: 'API에 Bearer 토큰을 보내면 서버가 유효성과 권한을 검증한다.',
    caution: '반드시 JWT 형식인 것은 아니다. Bearer 토큰은 소지자가 사용할 수 있으므로 로그·공개 저장소에 남기지 않는다.',
    related: ['Refresh Token', 'JWT', 'Authorization'], source: 'https://www.rfc-editor.org/rfc/rfc6749#section-1.4', tags: ['OAuth', '토큰', 'API 인증'],
    codeLanguage: 'http', code: `GET /api/me HTTP/1.1
Authorization: Bearer <access-token>`,
  },
  {
    id: 'refresh-token', term: 'Refresh Token', korean: '접근 토큰 갱신 자격 증명', category: 'api-backend', level: 'practical', kind: 'concept',
    question: "짧은 수명의 접근 토큰이 만료되면 매번 로그인해야 할까요?",
    definition: '인증 서버에서 새로운 접근 토큰을 발급받을 때 사용하는 자격 증명.',
    example: '인증 SDK가 만료된 접근 토큰을 갱신해 로그인 세션을 이어간다.',
    caution: '일반 리소스 API에 보내는 토큰이 아니다. 발급 여부·회전·폐기 정책은 인증 서비스마다 다르다.',
    related: ['Access Token', 'Authentication'], source: 'https://www.rfc-editor.org/rfc/rfc6749#section-1.5', tags: ['OAuth', '세션', '토큰 갱신'],
  },
  {
    id: 'oauth-authorization-code', term: 'OAuth Authorization Code', korean: '권한 코드 교환 흐름', category: 'api-backend', level: 'advanced', kind: 'concept',
    question: "로그인 제공자가 앱 주소에 짧은 code를 전달하는 이유는 무엇인가요?",
    definition: '사용자가 승인한 뒤 받은 권한 코드를 토큰 엔드포인트에서 접근 토큰으로 교환하는 OAuth 흐름.',
    example: '제공자에서 받은 code를 인증 SDK가 교환한 뒤 앱의 세션을 구성한다.',
    caution: 'OAuth 자체는 신원 인증 규격이 아니다. 로그인에는 보통 OpenID Connect를 함께 쓰며 복귀 주소도 검증한다.',
    related: ['PKCE', 'Access Token', 'Authentication'], source: 'https://www.rfc-editor.org/rfc/rfc6749#section-4.1', tags: ['OAuth', '권한 코드', '리디렉션'],
  },
  {
    id: 'pkce', term: 'PKCE', korean: '권한 코드 교환 검증', category: 'api-backend', level: 'advanced', kind: 'concept',
    question: "누군가 복귀 주소의 권한 코드를 가로채면 바로 쓸 수 있을까요?",
    definition: '권한 요청의 challenge와 토큰 교환의 verifier를 연결해 코드 탈취 사용을 어렵게 하는 OAuth 확장.',
    example: '브라우저 인증 SDK가 verifier를 보관하고 S256 challenge를 요청에 넣는다.',
    caution: '클라이언트 비밀 키를 브라우저에 숨기는 방식이 아니다. 요청을 시작한 브라우저의 verifier가 교환 시 필요하다.',
    related: ['OAuth Authorization Code', 'Access Token'], source: 'https://www.rfc-editor.org/rfc/rfc7636', tags: ['OAuth', 'S256', '코드 탈취 방어'],
  },
  {
    id: 'jwt', term: 'JWT', korean: 'JSON 웹 토큰', category: 'api-backend', level: 'practical', kind: 'concept',
    question: "토큰의 내용을 디코딩하면 그 사용자를 믿어도 될까요?",
    definition: 'JSON 형식의 claim을 전달하는 토큰 규격. 서명 또는 암호화 형태로 표현할 수 있다.',
    example: '서버가 서명·발급자·대상·만료 등을 검증한 뒤 사용자 claim을 사용한다.',
    caution: '디코딩은 검증이 아니다. 흔한 서명 JWT의 payload는 암호화되지 않으며 JWT 자체가 자동 로그인이나 권한 검사를 보장하지 않는다.',
    related: ['Access Token', 'Authentication', 'Authorization'], source: 'https://www.rfc-editor.org/rfc/rfc7519', tags: ['토큰', 'claim', '검증'],
  },
  {
    id: 'row-level-security', term: 'Row Level Security', korean: '행 단위 접근 정책', category: 'api-backend', level: 'advanced', kind: 'concept',
    question: "공개 API로 DB를 읽어도 본인 행만 보이게 하려면 어떻게 해야 하나요?",
    definition: 'PostgreSQL에서 역할과 정책에 따라 조회·변경 가능한 행을 제한하는 기능.',
    example: 'Supabase에서 인증 사용자 ID와 행의 user_id를 비교하는 본인 조회 정책을 둔다.',
    caution: 'RLS만 켜면 모든 권한 설계가 끝나는 것은 아니다. grants·쓰기 정책·RLS를 우회할 수 있는 서버 권한도 함께 검토한다.',
    related: ['Authorization', 'Authentication'], source: 'https://supabase.com/docs/guides/database/postgres/row-level-security', tags: ['PostgreSQL', 'Supabase', 'RLS', '권한'],
  },
  {
    id: 'jsx', term: 'JSX', korean: 'JavaScript 안의 UI 마크업', category: 'react', level: 'foundation', kind: 'syntax',
    question: "JavaScript 파일에서 태그처럼 보이는 코드는 HTML일까요?",
    definition: 'JavaScript 안에서 마크업 형태로 UI를 표현하도록 확장한 문법.',
    example: '중괄호에 값을 넣어 용어 이름을 제목으로 표시한다.',
    caution: 'HTML과 완전히 같지 않다. 태그를 닫고 className을 쓰며 여러 형제는 부모나 Fragment로 묶는다.',
    related: ['React Component', 'Props'], source: 'https://react.dev/learn/writing-markup-with-jsx', tags: ['React', '마크업', '중괄호'],
    codeLanguage: 'jsx', code: `function TermTitle({ name }) {
  return <h2 className="term-title">{name}</h2>;
}`,
  },
  {
    id: 'react-component', term: 'React Component', korean: 'React UI 구성 단위', category: 'react', level: 'foundation', kind: 'concept',
    question: "반복되는 용어 카드를 하나의 구성 단위로 만들려면 어떻게 해야 하나요?",
    definition: '입력을 받아 UI를 표현하는 React 구성 단위. 함수 컴포넌트는 렌더할 내용을 반환한다.',
    example: 'TermCard에 용어 정보를 전달해 여러 곳에서 같은 표시 규칙을 사용한다.',
    caution: '이름은 대문자로 시작한다. 렌더 함수 안에서 새 컴포넌트 함수를 정의하면 상태 유지에 문제가 생길 수 있다.',
    related: ['JSX', 'Props', 'Component Composition'], source: 'https://react.dev/learn/your-first-component', tags: ['React', '컴포넌트', 'UI'],
    codeLanguage: 'jsx', code: `function TermCard({ term }) {
  return <article><h2>{term.name}</h2></article>;
}
function App() {
  return <TermCard term={{ name: 'Closure' }} />;
}`,
  },
  {
    id: 'conditional-rendering', term: 'Conditional Rendering', korean: '조건부 UI 표시', category: 'react', level: 'foundation', kind: 'syntax',
    question: "로그인 여부에 따라 다른 화면을 보여주려면 어떻게 해야 하나요?",
    definition: '조건에 따라 다른 JSX를 반환하거나 일부 UI를 포함·제외하는 방식.',
    example: '로그인했으면 계정 이름을, 아니면 로그인 버튼을 보여준다.',
    caution: 'count && JSX에서 count가 0이면 0이 화면에 나올 수 있다. 불리언 조건을 명확히 만든다.',
    related: ['JSX', 'State'], source: 'https://react.dev/learn/conditional-rendering', tags: ['React', '조건', '표시'],
    codeLanguage: 'jsx', code: `function AccountLabel({ user }) {
  return user ? <p>{user.name}</p> : <p>로그인이 필요해요</p>;
}`,
  },
  {
    id: 'react-list-rendering', term: 'React List Rendering', korean: 'React 목록 표시', category: 'react', level: 'foundation', kind: 'concept',
    question: "용어 배열을 카드 목록으로 바꾸려면 어떻게 해야 하나요?",
    definition: '배열의 항목을 JSX로 변환해 반복되는 UI를 표시하는 방식.',
    example: 'terms를 map으로 순회하며 각 항목의 고유 ID를 key로 지정한다.',
    caution: 'key는 같은 형제 목록에서 안정적으로 유지해야 한다. 렌더 중 임의의 값을 만들면 항목이 새로 생성될 수 있다.',
    related: ['Array.map()', 'Key'], source: 'https://react.dev/learn/rendering-lists', tags: ['React', '목록', 'key'],
    codeLanguage: 'jsx', code: `function TermList({ terms }) {
  return <ul>{terms.map(term => (
    <li key={term.id}>{term.name}</li>
  ))}</ul>;
}`,
  },
  {
    id: 'react-event-handler', term: 'React Event Handler', korean: 'React 사용자 이벤트 처리', category: 'react', level: 'foundation', kind: 'concept',
    question: "버튼에 함수를 전달할 때 괄호를 붙이면 어떻게 될까요?",
    definition: 'onClick 같은 이벤트 prop으로 전달해 사용자 동작 때 실행하는 함수.',
    example: '저장 버튼 클릭에 현재 용어 ID를 전달하도록 함수를 연결한다.',
    caution: 'onClick={save()}는 렌더 중 실행한다. 이벤트에 연결하려면 함수 자체나 함수를 호출하는 래퍼를 전달한다.',
    related: ['Props', 'Effect vs Event Handler'], source: 'https://react.dev/learn/responding-to-events', tags: ['React', '이벤트', 'onClick'],
    codeLanguage: 'jsx', code: `function SaveButton({ id, onSave }) {
  return <button onClick={() => onSave(id)}>저장</button>;
}`,
  },
  {
    id: 'react-render', term: 'React Render', korean: '표시할 UI 계산', category: 'react', level: 'foundation', kind: 'concept',
    question: "컴포넌트가 다시 실행되면 DOM도 전부 다시 만들어질까요?",
    definition: 'React가 컴포넌트를 호출해 현재 입력으로 표시할 UI를 계산하는 단계.',
    example: '카운터 상태가 바뀌면 컴포넌트가 새 숫자를 포함한 JSX를 계산한다.',
    caution: '렌더는 DOM 변경과 다르다. 렌더 중 외부 데이터를 변경하거나 네트워크 요청을 실행하지 않는다.',
    related: ['React Commit', 'State Snapshot'], source: 'https://react.dev/learn/render-and-commit#step-2-react-renders-your-components', tags: ['React', '렌더링', '순수성'],
  },
  {
    id: 'react-commit', term: 'React Commit', korean: '계산한 UI의 DOM 반영', category: 'react', level: 'foundation', kind: 'concept',
    question: "계산된 새 UI는 언제 실제 DOM에 반영될까요?",
    definition: 'React가 렌더 결과에 맞춰 필요한 DOM 변경을 적용하는 단계.',
    example: '용어 이름만 바뀌면 해당 텍스트처럼 필요한 부분을 반영한다.',
    caution: 'React commit과 브라우저 paint도 별개다. 렌더가 실행됐어도 결과가 같으면 DOM 변경이 없을 수 있다.',
    related: ['React Render', 'Rendering Pipeline'], source: 'https://react.dev/learn/render-and-commit#step-3-react-commits-changes-to-the-dom', tags: ['React', 'DOM', 'commit'],
  },
  {
    id: 'state-snapshot', term: 'State Snapshot', korean: '렌더 시점의 상태 값', category: 'react', level: 'foundation', kind: 'concept',
    question: "setCount 뒤의 count는 바로 새 값으로 바뀔까요?",
    definition: '한 렌더의 함수와 이벤트 핸들러가 그 렌더 시점의 상태 값을 사용하는 성질.',
    example: '현재 count가 0일 때 setCount(1) 뒤의 로그도 해당 핸들러에서는 0이다.',
    caution: '오래된 렌더에서 만든 타이머도 그때 값을 볼 수 있다. 이전 상태에 따른 갱신에는 updater를 검토한다.',
    related: ['State', 'Functional State Update'], source: 'https://react.dev/learn/state-as-a-snapshot', tags: ['React', '상태', '스냅샷'],
    codeLanguage: 'jsx', code: `import { useState } from 'react';
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => {
    setCount(count + 1);
    console.log(count); // 이 렌더의 값
  }}>{count}</button>;
}`,
  },
  {
    id: 'react-batching', term: 'React Batching', korean: '상태 갱신 묶음 처리', category: 'react', level: 'practical', kind: 'concept',
    question: "한 이벤트에서 상태를 여러 번 바꾸면 매번 화면을 갱신할까요?",
    definition: '여러 상태 갱신을 묶어 불필요한 중간 렌더를 줄이는 React 처리 방식.',
    example: '필터와 페이지를 한 이벤트에서 바꿔 중간 조합을 따로 보여주지 않는다.',
    caution: '값을 즉시 바꾸는 기능은 아니다. 이전 상태를 여러 번 누적 갱신하려면 함수형 updater를 사용한다.',
    related: ['State Snapshot', 'Functional State Update'], source: 'https://react.dev/learn/queueing-a-series-of-state-updates', tags: ['React', '배칭', '상태 갱신'],
    codeLanguage: 'jsx', code: `import { useState } from 'react';
function Filters() {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  return <button onClick={() => {
    setFilter('react');
    setPage(1);
  }}>{filter} / {page}</button>;
}`,
  },
  {
    id: 'functional-state-update', term: 'Functional State Update', korean: '이전 상태로 다음 상태 계산', category: 'react', level: 'foundation', kind: 'syntax',
    question: "같은 이벤트에서 카운트를 확실히 두 번 올리려면 어떻게 해야 하나요?",
    definition: '상태 setter에 함수를 전달해 대기 중인 이전 상태에서 다음 값을 계산하는 방식.',
    example: 'setCount(n => n + 1)를 두 번 호출하면 갱신 큐에서 두 증가가 이어진다.',
    caution: 'updater는 순수하게 값을 반환해야 한다. 내부에서 API 호출이나 다른 부수 효과를 실행하지 않는다.',
    related: ['useState', 'React Batching'], source: 'https://react.dev/learn/queueing-a-series-of-state-updates#updating-the-same-state-multiple-times-before-the-next-render', tags: ['React', 'updater', '이전 상태'],
    codeLanguage: 'jsx', code: `import { useState } from 'react';
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => {
    setCount(n => n + 1);
    setCount(n => n + 1);
  }}>{count}</button>;
}`,
  },
  {
    id: 'react-state-immutability', term: 'React State Immutability', korean: 'React 상태를 새 값으로 교체', category: 'react', level: 'foundation', kind: 'concept',
    question: "상태 객체의 속성만 직접 바꾸면 화면도 바뀔까요?",
    definition: 'React 상태의 객체·배열을 직접 수정하지 않고 새 값으로 교체하는 사용 규칙.',
    example: '설정에서 퇴근 시간만 바꿀 때 기존 객체를 복사하고 해당 속성을 덮어쓴다.',
    caution: '전개 문법은 얕은 복사다. 중첩 객체를 바꿀 때는 바뀌는 경로의 객체도 새로 만들어야 한다.',
    related: ['State', 'Functional State Update'], source: 'https://react.dev/learn/updating-objects-in-state', tags: ['React', '상태', '불변성'],
    codeLanguage: 'javascript', code: `setPlan(previous => ({
  ...previous,
  evening: '19:00',
}));`,
  },
  {
    id: 'lifting-state-up', term: 'Lifting State Up', korean: '공유 상태를 부모로 이동', category: 'react', level: 'foundation', kind: 'concept',
    question: "검색 입력과 목록이 같은 검색어를 사용하게 하려면 어떻게 해야 하나요?",
    definition: '여러 컴포넌트가 공유해야 하는 상태를 가까운 공통 부모가 소유하게 하는 방식.',
    example: '부모가 검색어를 관리하고 입력에는 값·변경 함수, 목록에는 검색어를 전달한다.',
    caution: '모든 상태를 최상위로 올릴 필요는 없다. 실제로 함께 조율해야 하는 범위까지만 이동한다.',
    related: ['Props', 'Single Source of Truth'], source: 'https://react.dev/learn/sharing-state-between-components', tags: ['React', '상태 공유', '부모'],
  },
  {
    id: 'rules-of-hooks', term: 'Rules of Hooks', korean: 'Hook 호출 규칙', category: 'react', level: 'foundation', kind: 'concept',
    question: "조건에 따라 useState를 호출해도 될까요?",
    definition: 'useState·useEffect 등의 Hook을 컴포넌트나 커스텀 Hook의 최상위에서 일관되게 호출하는 규칙.',
    example: 'Hook은 항상 호출하고 조건은 Effect 내부나 반환하는 UI에 둔다.',
    caution: '일반 함수·이벤트 핸들러·조건문 안에서 보통의 Hook을 호출하지 않는다. use API에는 별도의 조건·반복 호출 예외가 있다.',
    related: ['useState', 'Custom Hook'], source: 'https://react.dev/reference/rules/rules-of-hooks', tags: ['React', 'Hooks', '호출 순서'],
  },
  {
    id: 'use-state', term: 'useState', korean: '컴포넌트 상태 Hook', category: 'react', level: 'foundation', kind: 'api',
    question: "컴포넌트가 다음 렌더에서도 기억할 값을 만들려면 어떻게 해야 하나요?",
    definition: '현재 상태 값과 다음 상태를 요청하는 setter를 제공하는 React Hook.',
    example: '카드 답을 열었는지 상태로 저장해 버튼 클릭에 따라 표시를 바꾼다.',
    caution: 'setter는 다음 렌더의 값을 요청한다. 함수 값을 상태로 저장하려면 초기화·갱신 함수와 혼동하지 않도록 래핑한다.',
    related: ['State', 'State Snapshot'], source: 'https://react.dev/reference/react/useState', tags: ['React', 'Hooks', '상태'],
    codeLanguage: 'jsx', code: `import { useState } from 'react';
function Answer() {
  const [open, setOpen] = useState(false);
  return <button onClick={() => setOpen(value => !value)}>
    {open ? '답 닫기' : '답 보기'}
  </button>;
}`,
  },
  {
    id: 'use-ref', term: 'useRef', korean: '렌더 사이의 변경 가능한 참조', category: 'react', level: 'practical', kind: 'api',
    question: "입력 DOM에 포커스를 옮길 참조를 보관하려면 어떻게 해야 하나요?",
    definition: '렌더 사이에 같은 ref 객체를 유지하며 current에 값을 보관하는 React Hook.',
    example: '입력에 ref를 연결하고 사용자 버튼 클릭에서 focus를 호출한다.',
    caution: 'current를 바꿔도 렌더를 요청하지 않는다. 화면에 표시할 값은 상태로 관리하고 렌더 중 ref 읽기·쓰기를 피한다.',
    related: ['Ref vs State', 'Focus Management'], source: 'https://react.dev/reference/react/useRef', tags: ['React', 'Hooks', 'DOM 참조'],
    codeLanguage: 'jsx', code: `import { useRef } from 'react';
function Search() {
  const input = useRef(null);
  return <>
    <input ref={input} aria-label="검색" />
    <button onClick={() => input.current?.focus()}>입력으로</button>
  </>;
}`,
  },
  {
    id: 'ref-vs-state', term: 'Ref vs State', korean: '참조와 화면 상태의 선택', category: 'react', level: 'practical', kind: 'concept',
    question: "타이머 ID와 화면의 남은 시간을 같은 방식으로 저장할까요?",
    definition: '렌더가 필요 없는 보관값에는 ref를, 화면을 바꿔야 하는 값에는 state를 사용하는 구분.',
    example: '타이머 ID는 ref에, 사용자에게 보여줄 남은 초는 상태에 둔다.',
    caution: 'ref 값을 JSX에 읽어 표시해도 ref 변경만으로 화면은 갱신되지 않는다. 상태를 우회해 UI를 동기화하려 하지 않는다.',
    related: ['useRef', 'useState'], source: 'https://react.dev/learn/referencing-values-with-refs#differences-between-refs-and-state', tags: ['React', '참조', '상태 설계'],
  },
  {
    id: 'use-context', term: 'useContext', korean: '상위 Context 값 읽기', category: 'react', level: 'practical', kind: 'api',
    question: "여러 단계의 props 전달 없이 테마를 읽으려면 어떻게 해야 하나요?",
    definition: '가장 가까운 상위 provider의 Context 값을 읽고 변경에 구독하는 React Hook.',
    example: '앱의 테마 provider 아래에서 버튼이 현재 테마를 읽는다.',
    caution: 'provider의 value가 바뀌면 사용하는 컴포넌트도 갱신된다. memo만으로 Context 변경을 차단하지 않는다.',
    related: ['Props', 'React.memo'], source: 'https://react.dev/reference/react/useContext', tags: ['React', 'Context', '상태 공유'],
    codeLanguage: 'jsx', code: `import { createContext, useContext } from 'react';
const ThemeContext = createContext('light');
function ThemeLabel() {
  const theme = useContext(ThemeContext);
  return <p>{theme}</p>;
}`,
  },
  {
    id: 'use-reducer', term: 'useReducer', korean: 'action으로 상태 갱신하기', category: 'react', level: 'practical', kind: 'api',
    question: "여러 상태 변경 규칙을 한 함수로 모으려면 어떻게 해야 하나요?",
    definition: '현재 상태와 action으로 다음 상태를 계산하는 reducer에 갱신 규칙을 맡기는 Hook.',
    example: '카드 넘김·다시 시작 같은 동작을 action으로 전달해 학습 상태를 바꾼다.',
    caution: 'reducer는 순수해야 한다. 네트워크 요청·타이머 같은 부수 효과를 reducer 안에 넣지 않는다.',
    related: ['useState', 'React State Immutability'], source: 'https://react.dev/reference/react/useReducer', tags: ['React', 'reducer', 'action'],
    codeLanguage: 'jsx', code: `import { useReducer } from 'react';
function reducer(count, action) {
  return action.type === 'next' ? count + 1 : count;
}
function Counter() {
  const [count, dispatch] = useReducer(reducer, 0);
  return <button onClick={() => dispatch({ type: 'next' })}>
    {count}
  </button>;
}`,
  },
  {
    id: 'custom-hook', term: 'Custom Hook', korean: '상태 있는 로직 재사용', category: 'react', level: 'practical', kind: 'concept',
    question: "여러 화면에서 같은 상태 로직을 재사용하려면 어떻게 해야 하나요?",
    definition: '다른 Hook을 조합해 컴포넌트에서 사용할 로직을 추출한 use로 시작하는 함수.',
    example: '열림 상태와 전환 동작을 useToggle로 묶어 여러 팝업에서 사용한다.',
    caution: '로직을 공유할 뿐 호출끼리 상태를 자동으로 공유하지는 않는다. shared state는 별도의 소유자를 정한다.',
    related: ['Rules of Hooks', 'useState'], source: 'https://react.dev/learn/reusing-logic-with-custom-hooks', tags: ['React', 'Hooks', '로직 재사용'],
    codeLanguage: 'javascript', code: `import { useState } from 'react';
function useToggle(initial = false) {
  const [open, setOpen] = useState(initial);
  const toggle = () => setOpen(value => !value);
  return { open, toggle };
}`,
  },
  {
    id: 'effect-dependencies', term: 'Effect Dependencies', korean: 'Effect가 읽는 반응형 값', category: 'react', level: 'practical', kind: 'concept',
    question: "Effect 안에서 쓰는 prop을 의존성에서 빼면 어떻게 해야 하나요?",
    definition: 'Effect가 사용하는 반응형 값을 명시해 값 변경 시 외부 동기화를 다시 실행하게 하는 목록.',
    example: 'title prop으로 문서 제목을 바꾸는 Effect는 title을 의존성에 포함한다.',
    caution: '원하는 실행 횟수에 맞춰 임의로 빼지 않는다. 불필요한 의존성은 코드 구조를 바꿔 제거하며 린터 경고를 숨기지 않는다.',
    related: ['useEffect', 'Effect Cleanup'], source: 'https://react.dev/learn/removing-effect-dependencies', tags: ['React', 'Effect', '의존성'],
    codeLanguage: 'javascript', code: `import { useEffect } from 'react';
function PageTitle({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}`,
  },
  {
    id: 'effect-cleanup', term: 'Effect Cleanup', korean: '외부 동기화 정리', category: 'react', level: 'practical', kind: 'concept',
    question: "Effect에서 만든 리스너나 타이머는 언제 해제할까요?",
    definition: 'Effect가 반환하는 함수로 이전 동기화를 정리하는 처리.',
    example: '이벤트 구독을 만들고 의존성 변경으로 다시 구독하기 전이나 화면 제거 때 해제한다.',
    caution: '언마운트 때만 실행되는 함수가 아니다. 의존성 변경 전에도 실행되며 개발 StrictMode의 추가 점검에도 대응해야 한다.',
    related: ['useEffect', 'StrictMode', 'addEventListener()'], source: 'https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed', tags: ['React', 'Effect', '정리'],
    codeLanguage: 'javascript', code: `import { useEffect } from 'react';
function OnlineLogger() {
  useEffect(() => {
    const onOnline = () => console.log('다시 연결');
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);
  return null;
}`,
  },
  {
    id: 'effect-vs-event', term: 'Effect vs Event Handler', korean: '외부 동기화와 사용자 행동 구분', category: 'react', level: 'practical', kind: 'concept',
    question: "저장 버튼 클릭을 Effect로 처리해야 할까요?",
    definition: '화면의 현재 상태에 따른 외부 동기화는 Effect로, 특정 사용자 행동의 처리는 이벤트 핸들러로 구분하는 설계.',
    example: '저장 요청은 클릭 핸들러에서 보내고, 브라우저 이벤트 구독은 Effect에서 설정한다.',
    caution: 'props에서 계산할 수 있는 값도 Effect로 다시 state에 넣을 필요는 없다. 요청마다 원인과 생명주기를 먼저 구분한다.',
    related: ['useEffect', 'React Event Handler', 'Derived State'], source: 'https://react.dev/learn/you-might-not-need-an-effect', tags: ['React', 'Effect', '이벤트 설계'],
  },
  {
    id: 'strict-mode', term: 'StrictMode', korean: '개발 중 추가 오류 점검', category: 'react', level: 'practical', kind: 'api',
    question: "개발 환경에서 렌더와 Effect가 추가 실행되는 이유는 무엇인가요?",
    definition: '자식 트리에 개발 전용 검사와 경고를 적용하는 React 컴포넌트.',
    example: '추가 렌더나 구독 정리 점검으로 순수하지 않은 계산과 누락된 cleanup을 찾는다.',
    caution: '프로덕션에서 매번 두 번 실행하는 기능이 아니다. 일부 하위 트리의 적용은 루트 적용과 점검 동작이 다를 수 있다.',
    related: ['React Render', 'Effect Cleanup'], source: 'https://react.dev/reference/react/StrictMode', tags: ['React', '개발 검사', '순수성'],
    codeLanguage: 'jsx', code: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>,
);`,
  },
  {
    id: 'react-memo', term: 'React.memo', korean: '같은 props의 렌더 최적화', category: 'react', level: 'advanced', kind: 'api',
    question: "부모가 갱신될 때 값이 같은 무거운 카드도 다시 계산해야 할까요?",
    definition: 'props가 같을 때 부모 갱신으로 인한 재렌더를 건너뛸 수 있도록 컴포넌트를 감싸는 API.',
    example: '측정으로 비용이 확인된 카드에 memo를 적용하고 props 참조도 안정적으로 유지한다.',
    caution: '렌더 생략의 보장은 아니다. 자체 state·Context 변경은 갱신하며 React Compiler를 쓰면 수동 memo 필요성이 줄어든다.',
    related: ['Props', 'useMemo', 'useCallback'], source: 'https://react.dev/reference/react/memo', tags: ['React', '메모이제이션', '성능'],
    codeLanguage: 'jsx', code: `import { memo } from 'react';
const TermTitle = memo(function TermTitle({ name }) {
  return <h2>{name}</h2>;
});`,
  },
  {
    id: 'use-memo', term: 'useMemo', korean: '계산 결과 재사용', category: 'react', level: 'advanced', kind: 'api',
    question: "의존성이 같은 큰 목록 계산을 반복하지 않으려면 어떻게 해야 하나요?",
    definition: '의존성이 바뀌지 않은 렌더 사이에서 계산 결과를 재사용하는 React Hook.',
    example: '비용을 측정한 목록 필터 계산을 캐시하고 관련 입력이 바뀔 때 다시 계산한다.',
    caution: '상태 보존의 의미적 보장이 아닌 성능 최적화다. 계산은 순수해야 하며 모든 값에 무조건 적용하지 않는다.',
    related: ['React.memo', 'Derived State'], source: 'https://react.dev/reference/react/useMemo', tags: ['React', '계산 캐시', '성능'],
    codeLanguage: 'jsx', code: `import { useMemo } from 'react';
function Results({ terms, query }) {
  const visible = useMemo(
    () => terms.filter(term => term.name.includes(query)),
    [terms, query],
  );
  return <p>{visible.length}개</p>;
}`,
  },
  {
    id: 'use-callback', term: 'useCallback', korean: '함수 참조 재사용', category: 'react', level: 'advanced', kind: 'api',
    question: "memo 컴포넌트에 전달하는 함수가 매번 새 참조라면 어떻게 해야 하나요?",
    definition: '의존성이 바뀌지 않은 렌더 사이에서 함수 참조를 재사용하는 React Hook.',
    example: 'memo로 최적화한 하위 카드에 전달할 저장 콜백의 참조를 유지한다.',
    caution: '함수 실행 결과를 캐시하지 않는다. 오래된 값을 막으려면 의존성을 정확히 쓰며 Compiler 사용 시 필요성이 줄어든다.',
    related: ['React.memo', 'useMemo'], source: 'https://react.dev/reference/react/useCallback', tags: ['React', '함수 참조', '성능'],
    codeLanguage: 'jsx', code: `import { memo, useCallback, useState } from 'react';
const SaveButton = memo(function SaveButton({ onSave }) {
  return <button onClick={onSave}>저장</button>;
});
function Card({ id }) {
  const [saved, setSaved] = useState(null);
  const onSave = useCallback(() => setSaved(id), [id]);
  return <><SaveButton onSave={onSave} /><p>{saved ?? '없음'}</p></>;
}`,
  },
  {
    id: 'suspense', term: 'Suspense', korean: '대기 중 UI 경계', category: 'react', level: 'practical', kind: 'api',
    question: "아직 준비되지 않은 하위 UI 대신 무엇을 보여줄까요?",
    definition: '자식의 지원되는 비동기 작업이 대기할 때 fallback UI를 표시하는 React 컴포넌트.',
    example: 'lazy로 불러오는 화면을 Suspense로 감싸 로딩 안내를 표시한다.',
    caution: 'Effect 안의 일반 fetch를 자동으로 감지하지 않는다. Suspense를 지원하는 데이터 소스나 lazy 등과 사용한다.',
    related: ['Lazy Loading', 'Error Boundary'], source: 'https://react.dev/reference/react/Suspense', tags: ['React', '로딩', 'fallback'],
    codeLanguage: 'jsx', code: `import { lazy, Suspense } from 'react';
const Report = lazy(() => import('./Report'));
function App() {
  return <Suspense fallback={<p>준비 중…</p>}>
    <Report />
  </Suspense>;
}`,
  },
  {
    id: 'error-boundary', term: 'Error Boundary', korean: '하위 렌더 오류 경계', category: 'react', level: 'practical', kind: 'concept',
    question: "한 화면의 렌더 오류가 앱 전체를 무너뜨리지 않게 하려면 어떻게 해야 하나요?",
    definition: '하위 컴포넌트의 렌더 오류 등을 받아 오류용 UI를 보여주는 React 경계.',
    example: '학습 화면 주변에 경계를 두어 오류가 나면 다시 시도할 안내를 표시한다.',
    caution: '이벤트 핸들러나 일반 비동기 콜백의 오류를 모두 잡지 않는다. 그런 실패는 해당 작업에서 별도로 처리한다.',
    related: ['Suspense', 'Error Tracking'], source: 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary', tags: ['React', '오류 처리', 'fallback'],
    codeLanguage: 'jsx', code: `import { Component } from 'react';
class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <p>화면을 표시하지 못했어요</p>
      : this.props.children;
  }
}`,
  },
  {
    id: 'next-app-router', term: 'App Router', korean: 'Next.js app 디렉터리 라우터', category: 'nextjs', level: 'practical', kind: 'tool',
    question: "Next.js의 app 폴더는 어떤 규칙으로 화면 주소가 될까요?",
    definition: 'app 디렉터리의 폴더와 특수 파일로 경로·레이아웃·로딩 등을 구성하는 Next.js 라우터.',
    example: 'app/terms/page.tsx로 /terms 화면을 만들고 layout.tsx로 공통 UI를 둔다.',
    caution: 'Pages Router의 pages 규칙과 구분한다. 같은 Next.js라도 사용하는 라우터의 문서와 API를 확인한다.',
    related: ['Next.js Layout', 'Next.js Dynamic Route'], source: 'https://nextjs.org/docs/app', tags: ['Next.js', 'App Router', '파일 라우팅'],
    codeLanguage: 'text', code: `app/
  layout.tsx
  page.tsx
  terms/
    page.tsx`,
  },
  {
    id: 'react-server-component', term: 'Server Component', korean: '서버에서 실행되는 UI 컴포넌트', category: 'nextjs', level: 'advanced', kind: 'concept',
    question: "데이터 조회와 UI 계산을 브라우저 밖에서 할 수 있을까요?",
    definition: '서버 환경에서 실행해 UI 결과를 전달하는 React 컴포넌트. Next.js App Router의 페이지와 레이아웃은 기본적으로 이 방식이다.',
    example: '서버에서 용어 데이터를 조회하고 결과를 클라이언트 버튼의 props로 전달한다.',
    caution: '브라우저 이벤트·useState·window를 직접 쓸 수 없다. 클라이언트로 전달하는 값에는 비밀 데이터를 넣지 않는다.',
    related: ['Client Component', 'App Router'], source: 'https://nextjs.org/docs/app/getting-started/server-and-client-components', tags: ['Next.js', 'App Router', 'RSC', '서버'],
    codeLanguage: 'jsx', code: `// app/terms/page.jsx
export default async function Page() {
  const response = await fetch('https://api.example.com/terms');
  if (!response.ok) throw new Error('용어 조회 실패');
  const terms = await response.json();
  return <p>{terms.length}개 용어</p>;
}`,
  },
  {
    id: 'react-client-component', term: 'Client Component', korean: '클라이언트 상호작용 컴포넌트', category: 'nextjs', level: 'practical', kind: 'concept',
    question: "App Router에서 클릭·상태·브라우저 API는 어디에 둘까요?",
    definition: 'Next.js App Router에서 클라이언트 번들에 포함되어 상태와 이벤트 같은 상호작용을 담당하는 컴포넌트.',
    example: '서버가 만든 용어 목록 안에 저장 상태를 다루는 클라이언트 버튼을 배치한다.',
    caution: '브라우저에서만 최초 렌더된다는 뜻은 아니다. 초기 HTML은 서버에서 미리 만들 수 있어 렌더 중 window 접근에 주의한다.',
    related: ['use client', 'Server Component', 'Hydration'], source: 'https://nextjs.org/docs/app/getting-started/server-and-client-components#how-do-server-and-client-components-work-in-nextjs', tags: ['Next.js', 'App Router', '상호작용'],
  },
  {
    id: 'use-client-directive', term: 'use client', korean: '클라이언트 모듈 경계 선언', category: 'nextjs', level: 'practical', kind: 'syntax',
    question: "useState가 있는 Next.js 파일에 선언이 필요한 이유는 무엇인가요?",
    definition: '파일 상단에서 서버와 클라이언트 모듈 그래프의 경계를 지정하는 지시문.',
    example: '상태를 사용하는 버튼 파일의 import 위에 use client를 선언한다.',
    caution: '모든 자식 파일에 반복할 필요는 없다. 경계 아래 import도 클라이언트 번들에 포함되며 서버가 전달하는 props는 React가 직렬화할 수 있어야 한다.',
    related: ['Client Component', 'Props'], source: 'https://nextjs.org/docs/app/api-reference/directives/use-client', tags: ['Next.js', 'App Router', '모듈 경계'],
    codeLanguage: 'jsx', code: `'use client';
import { useState } from 'react';
export default function AnswerButton() {
  const [open, setOpen] = useState(false);
  return <button onClick={() => setOpen(value => !value)}>
    {open ? '닫기' : '답 보기'}
  </button>;
}`,
  },
  {
    id: 'next-layout', term: 'Next.js Layout', korean: '경로 사이의 공통 UI', category: 'nextjs', level: 'practical', kind: 'concept',
    question: "여러 App Router 페이지에서 같은 헤더를 유지하려면 어떻게 해야 하나요?",
    definition: 'Next.js App Router의 layout 파일로 하위 경로의 children을 감싸는 공통 UI.',
    example: '루트 레이아웃에 문서 구조를 두고 학습 영역 레이아웃에 공통 탐색을 둔다.',
    caution: '공통 레이아웃은 탐색 중 보존될 수 있다. 매 탐색마다 새로 시작해야 하는 UI와 구분하며 루트는 html·body를 포함한다.',
    related: ['App Router', 'Component Composition'], source: 'https://nextjs.org/docs/app/getting-started/layouts-and-pages#creating-a-layout', tags: ['Next.js', 'App Router', '레이아웃'],
    codeLanguage: 'jsx', code: `// app/layout.jsx
export default function RootLayout({ children }) {
  return <html lang="ko"><body>{children}</body></html>;
}`,
  },
  {
    id: 'next-loading-ui', term: 'Next.js Loading UI', korean: '경로의 즉시 로딩 안내', category: 'nextjs', level: 'practical', kind: 'concept',
    question: "App Router 경로의 콘텐츠를 기다리는 동안 무엇을 보여줄까요?",
    definition: 'loading 파일로 경로 세그먼트의 대기 UI를 만들고 Suspense 경계와 스트리밍에 연결하는 기능.',
    example: 'app/terms/loading.tsx에 용어 목록의 로딩 안내를 둔다.',
    caution: '준비된 캐시나 미리 가져온 콘텐츠가 있으면 보이지 않을 수 있다. 모든 컴포넌트의 fetch를 자동으로 관리하는 기능은 아니다.',
    related: ['Suspense', 'App Router'], source: 'https://nextjs.org/docs/app/api-reference/file-conventions/loading', tags: ['Next.js', 'App Router', '스트리밍'],
    codeLanguage: 'jsx', code: `// app/terms/loading.jsx
export default function Loading() {
  return <p role="status">용어를 불러오는 중이에요</p>;
}`,
  },
  {
    id: 'next-route-handler', term: 'Route Handler', korean: 'App Router HTTP 처리 함수', category: 'nextjs', level: 'practical', kind: 'api',
    question: "Next.js 앱 안에서 JSON API를 만들려면 어떻게 해야 하나요?",
    definition: 'App Router의 route 파일에서 GET·POST 같은 HTTP 메서드 함수로 요청과 응답을 처리하는 기능.',
    example: 'app/api/terms/route.ts의 GET 함수에서 용어 목록 JSON을 반환한다.',
    caution: 'UI 페이지 컴포넌트와 구분한다. 변경 API에는 서버 인증·인가·입력 검증이 필요하고 같은 경로의 page 파일과 충돌하지 않게 구성한다.',
    related: ['REST API', 'Authorization'], source: 'https://nextjs.org/docs/app/api-reference/file-conventions/route', tags: ['Next.js', 'App Router', 'HTTP API'],
    codeLanguage: 'typescript', code: `// app/api/terms/route.ts
export async function GET() {
  return Response.json([{ id: 'closure', name: 'Closure' }]);
}`,
  },
  {
    id: 'next-dynamic-route', term: 'Next.js Dynamic Route', korean: '동적인 경로 세그먼트', category: 'nextjs', level: 'practical', kind: 'syntax',
    question: "용어마다 /terms/아이디 주소를 만들려면 어떻게 해야 하나요?",
    definition: 'App Router에서 대괄호 폴더 이름으로 URL의 변하는 세그먼트를 params로 받는 규칙.',
    example: 'app/terms/[id]/page.tsx에서 id로 용어 상세를 조회한다.',
    caution: 'params는 사용자 입력이므로 존재 여부를 검증한다. 현재 App Router의 params는 Promise이므로 서버에서 await로 읽는다.',
    related: ['App Router', 'Validation'], source: 'https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes', tags: ['Next.js', 'App Router', 'params'],
    codeLanguage: 'tsx', code: `// app/terms/[id]/page.tsx
export default async function Page({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <h1>{id}</h1>;
}`,
  },
  {
    id: 'next-link', term: 'Next.js Link', korean: 'Next.js 경로 이동 컴포넌트', category: 'nextjs', level: 'practical', kind: 'api',
    question: "앱 내부 경로를 전체 새로고침 없이 이동하려면 어떻게 해야 하나요?",
    definition: '링크 의미를 유지하며 클라이언트 탐색과 경로 미리 가져오기를 지원하는 Next.js 컴포넌트.',
    example: 'App Router 용어 목록의 각 제목을 Link로 상세 경로에 연결한다.',
    caution: '클릭 동작은 링크로 표현하고 작업 실행은 버튼으로 표현한다. 미리 가져오기와 스크롤 동작은 옵션·환경에 따라 달라진다.',
    related: ['App Router', 'History API'], source: 'https://nextjs.org/docs/app/api-reference/components/link', tags: ['Next.js', 'App Router', '탐색'],
    codeLanguage: 'jsx', code: `import Link from 'next/link';
export default function TermLink() {
  return <Link href="/terms/closure">Closure</Link>;
}`,
  },
  {
    id: 'next-server-action', term: 'Server Action', korean: '서버에서 실행하는 변경 동작', category: 'nextjs', level: 'advanced', kind: 'concept',
    question: "App Router 폼의 저장 처리를 서버 함수로 연결하려면 어떻게 해야 하나요?",
    definition: 'Next.js App Router에서 데이터 변경 동작으로 사용하는 비동기 Server Function.',
    example: 'use server로 선언한 함수를 폼 action에 연결해 서버에서 저장을 처리한다.',
    caution: 'use server는 인증·인가를 자동 제공하지 않는다. 서버에서 매번 사용자 권한과 입력을 검증하며 비밀 값을 클라이언트로 반환하지 않는다.',
    related: ['FormData', 'Authorization', 'Server Component'], source: 'https://nextjs.org/docs/app/getting-started/mutating-data', tags: ['Next.js', 'App Router', 'Server Function'],
    codeLanguage: 'typescript', code: `'use server';
import { requireUser, saveOwnedBookmark } from './data';
export async function saveBookmark(formData: FormData) {
  const user = await requireUser();
  const id = formData.get('termId');
  if (typeof id !== 'string') throw new Error('잘못된 입력');
  await saveOwnedBookmark(user.id, id);
}`,
  },
  {
    id: 'query-key', term: 'Query Key', korean: '서버 조회 캐시의 식별 키', category: 'server-state', level: 'practical', kind: 'concept',
    question: "서로 다른 검색어의 응답이 같은 캐시에 섞이지 않게 하려면 어떻게 해야 하나요?",
    definition: 'TanStack Query에서 조회 결과를 식별하는 직렬화 가능한 배열 키.',
    example: '용어 검색에 쓰인 query를 키에 포함해 검색어별 캐시를 구분한다.',
    caution: 'queryFn이 의존하는 변수가 바뀌면 키도 구분해야 한다. 사용자별 데이터는 사용자 범위도 고려한다.',
    related: ['Query Invalidation', 'staleTime'], source: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-keys', tags: ['TanStack Query', '캐시', 'queryKey'],
    codeLanguage: 'javascript', code: `const queryKey = ['terms', { query: 'react', page: 1 }];`,
  },
  {
    id: 'query-stale-time', term: 'staleTime', korean: '조회 데이터를 신선하게 보는 시간', category: 'server-state', level: 'practical', kind: 'api',
    question: "같은 목록을 열 때마다 다시 조회하는 빈도를 줄이려면 어떻게 해야 하나요?",
    definition: 'TanStack Query가 조회 데이터를 fresh로 취급하는 기간을 정하는 옵션.',
    example: '변경이 잦지 않은 목록에 1분을 설정해 신선한 캐시를 재사용한다.',
    caution: '서버 데이터가 실제로 최신임을 보장하는 시간은 아니다. 시간이 지났다고 즉시 삭제하거나 타이머로 자동 조회하는 뜻도 아니다.',
    related: ['gcTime', 'Query Invalidation'], source: 'https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults', tags: ['TanStack Query', '신선도', 'staleTime'],
    codeLanguage: 'jsx', code: `import { useQuery } from '@tanstack/react-query';
import { getTerms } from './api';
function TermCount() {
  const query = useQuery({
    queryKey: ['terms'],
    queryFn: getTerms,
    staleTime: 60_000,
  });
  return <p>{query.data?.length ?? 0}개</p>;
}`,
  },
  {
    id: 'query-gc-time', term: 'gcTime', korean: '비활성 조회 캐시의 보관 시간', category: 'server-state', level: 'practical', kind: 'api',
    question: "더 이상 표시하지 않는 조회 데이터는 언제 캐시에서 없어질까요?",
    definition: 'TanStack Query v5에서 비활성 조회 캐시가 정리되기까지 보관할 시간을 정하는 옵션.',
    example: '사용하지 않는 용어 목록 캐시를 일정 시간 남겨 빠른 재방문에 활용한다.',
    caution: '데이터의 신선도를 정하는 staleTime과 다르다. 활성 상태로 사용 중인 쿼리의 만료 시계를 뜻하지 않는다.',
    related: ['staleTime', 'Query Key'], source: 'https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults', tags: ['TanStack Query', 'v5', '캐시 정리'],
    codeLanguage: 'jsx', code: `import { useQuery } from '@tanstack/react-query';
import { getTerms } from './api';
function TermCount() {
  const query = useQuery({
    queryKey: ['terms'],
    queryFn: getTerms,
    gcTime: 5 * 60_000,
  });
  return <p>{query.data?.length ?? 0}개</p>;
}`,
  },
  {
    id: 'query-use-mutation', term: 'useMutation', korean: '서버 변경 작업의 상태 관리', category: 'server-state', level: 'practical', kind: 'api',
    question: "저장 요청의 진행·성공·실패를 관리하려면 어떻게 해야 하나요?",
    definition: 'TanStack Query에서 생성·수정·삭제 같은 비동기 변경 작업의 실행과 상태를 관리하는 Hook.',
    example: '북마크 저장 동안 버튼을 잠그고 성공 후 관련 조회를 무효화한다.',
    caution: '변경이 성공했다고 모든 조회 캐시가 자동 갱신되지는 않는다. 중복 요청과 실패 안내도 별도로 설계한다.',
    related: ['Query Invalidation', 'Optimistic Update'], source: 'https://tanstack.com/query/latest/docs/framework/react/guides/mutations', tags: ['TanStack Query', 'mutation', '서버 변경'],
    codeLanguage: 'jsx', code: `import { useMutation } from '@tanstack/react-query';
import { saveBookmark } from './api';
function SaveButton({ id }) {
  const mutation = useMutation({ mutationFn: saveBookmark });
  return <button disabled={mutation.isPending}
    onClick={() => mutation.mutate(id)}>
    {mutation.isPending ? '저장 중' : '저장'}
  </button>;
}`,
  },
  {
    id: 'optimistic-update', term: 'Optimistic Update', korean: '서버 응답 전의 예상 UI 반영', category: 'server-state', level: 'advanced', kind: 'concept',
    question: "저장 응답을 기다리지 않고 별 아이콘을 먼저 켜도 될까요?",
    definition: '변경 성공을 예상해 서버 응답보다 먼저 UI나 캐시에 결과를 반영하는 방식.',
    example: '북마크를 먼저 표시하고 실패하면 되돌리거나 오류와 재시도를 안내한다.',
    caution: '서버 저장 완료와 다르다. TanStack Query에서 캐시를 바꿀 때는 진행 중 조회·이전 스냅샷·롤백·재검증을 함께 다룬다.',
    related: ['useMutation', 'Query Invalidation'], source: 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates', tags: ['TanStack Query', '낙관적 갱신', '롤백'],
  },
  {
    id: 'dependent-query', term: 'Dependent Query', korean: '앞선 결과에 의존하는 조회', category: 'server-state', level: 'practical', kind: 'concept',
    question: "사용자 ID를 얻은 뒤 학습 기록을 조회하려면 어떻게 해야 하나요?",
    definition: '앞선 데이터나 실행 조건이 준비된 뒤 시작하는 조회. TanStack Query에서는 enabled 등으로 조건을 지정한다.',
    example: 'userId가 있을 때만 해당 사용자 기록 쿼리를 실행한다.',
    caution: 'enabled는 클라이언트 실행 조건이며 서버 권한 검사가 아니다. 불필요한 직렬 요청은 응답 대기를 늘릴 수 있다.',
    related: ['Query Key', 'Authorization'], source: 'https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries', tags: ['TanStack Query', 'enabled', '의존 조회'],
    codeLanguage: 'jsx', code: `import { useQuery } from '@tanstack/react-query';
import { getProgress } from './api';
function Progress({ userId }) {
  const query = useQuery({
    queryKey: ['progress', userId],
    queryFn: () => getProgress(userId),
    enabled: Boolean(userId),
  });
  return <p>{query.data?.completed ?? 0}개 완료</p>;
}`,
  },
  {
    id: 'query-cancellation', term: 'Query Cancellation', korean: '불필요한 조회 중단', category: 'server-state', level: 'practical', kind: 'concept',
    question: "검색어가 바뀐 뒤 이전 검색 요청을 계속 기다려야 할까요?",
    definition: '사용하지 않을 조회 작업을 취소하는 처리. TanStack Query는 queryFn에 AbortSignal을 제공한다.',
    example: '전달받은 signal을 fetch에 연결해 조회 취소 때 네트워크 작업도 중단하게 한다.',
    caution: 'signal을 소비하지 않으면 네트워크 요청까지 자동 중단된다고 볼 수 없다. 취소는 이미 끝난 서버 변경을 되돌리는 기능도 아니다.',
    related: ['AbortController', 'fetch()'], source: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation', tags: ['TanStack Query', 'AbortSignal', '취소'],
    codeLanguage: 'jsx', code: `import { useQuery } from '@tanstack/react-query';
function TermCount() {
  const query = useQuery({
    queryKey: ['terms'],
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/terms', { signal });
      if (!response.ok) throw new Error('조회 실패');
      return response.json();
    },
  });
  return <p>{query.data?.length ?? 0}개</p>;
}`,
  },
  {
    id: 'single-source-of-truth', term: 'Single Source of Truth', korean: '한 상태의 기준 소유자', category: 'client-state', level: 'foundation', kind: 'concept',
    question: "같은 검색어를 입력과 목록이 각각 저장하면 무엇이 문제일까요?",
    definition: '같은 정보를 여러 곳에서 따로 관리하지 않고 기준이 되는 소유자를 정하는 설계.',
    example: '검색어는 부모 하나가 소유하고 입력과 목록이 그 값을 사용한다.',
    caution: '모든 상태를 한 전역 객체에 넣으라는 뜻은 아니다. 각각의 상태마다 필요한 공유 범위와 소유자를 정한다.',
    related: ['Lifting State Up', 'Derived State'], source: 'https://react.dev/learn/sharing-state-between-components#a-single-source-of-truth-for-each-state', tags: ['상태 설계', '소유자', 'React'],
  },
  {
    id: 'derived-state', term: 'Derived State', korean: '기존 값에서 계산되는 상태', category: 'client-state', level: 'foundation', kind: 'concept',
    question: "완료 개수를 진도와 별도 상태로 저장해야 할까요?",
    definition: '기존 props나 상태로부터 계산해 얻을 수 있는 값.',
    example: '진도 객체에서 완료 개수를 계산해 표시하고 별도의 완료 개수 state를 두지 않는다.',
    caution: '중복 상태는 한쪽만 갱신돼 어긋나기 쉽다. 비싼 계산이면 측정 후 캐시를 검토하되 원본과 계산값을 구분한다.',
    related: ['Single Source of Truth', 'useMemo'], source: 'https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state', tags: ['상태 설계', '파생 값', 'React'],
    codeLanguage: 'jsx', code: `function Progress({ cards }) {
  const completed = cards.filter(card => card.done).length;
  return <p>{completed}개 완료</p>;
}`,
  },
  {
    id: 'state-colocation', term: 'State Colocation', korean: '사용 범위 가까이에 상태 두기', category: 'client-state', level: 'practical', kind: 'concept',
    question: "카드 하나의 열림 상태까지 앱 전체가 관리해야 할까요?",
    definition: '상태를 필요한 컴포넌트나 가까운 공유 부모에 두어 영향을 받는 범위를 맞추는 설계.',
    example: '한 카드의 설명 펼침은 그 카드가 관리하고, 여러 카드의 선택은 공통 부모가 관리한다.',
    caution: '가까이 둔다고 같은 값을 여러 곳에 복제하지 않는다. 조율할 필요가 생기면 공통 부모로 상태를 올린다.',
    related: ['Lifting State Up', 'Single Source of Truth'], source: 'https://react.dev/learn/sharing-state-between-components', tags: ['상태 설계', '지역 상태', 'React'],
  },
  {
    id: 'use-sync-external-store', term: 'useSyncExternalStore', korean: '외부 저장소 구독 Hook', category: 'client-state', level: 'advanced', kind: 'api',
    question: "React 밖의 저장소 변경을 화면과 일관되게 연결하려면 어떻게 해야 하나요?",
    definition: '외부 저장소의 구독 함수와 스냅샷 읽기 함수를 연결하는 React Hook.',
    example: '구독을 제공하는 학습 저장소의 진도를 React 화면에서 읽는다.',
    caution: '변경이 없으면 같은 스냅샷을 반환해야 한다. 매번 새 객체를 만들면 반복 렌더가 생길 수 있으며 서버 렌더에는 서버 스냅샷도 고려한다.',
    related: ['State', 'React State Immutability'], source: 'https://react.dev/reference/react/useSyncExternalStore', tags: ['React', '외부 저장소', '구독'],
    codeLanguage: 'jsx', code: `import { useSyncExternalStore } from 'react';
function Progress({ store }) {
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
  );
  return <p>{snapshot.completed}개 완료</p>;
}`,
  },
  {
    id: 'controlled-input', term: 'Controlled Input', korean: '상태가 값을 관리하는 입력', category: 'forms', level: 'foundation', kind: 'concept',
    question: "입력창 값과 검색 상태를 항상 같게 하려면 어떻게 해야 하나요?",
    definition: 'React 상태 같은 값으로 value·checked를 전달하고 변경 이벤트로 그 값을 갱신하는 입력 방식.',
    example: '검색어 state를 value에 넣고 onChange에서 입력값을 즉시 반영한다.',
    caution: '텍스트 value를 처음 undefined로 두었다가 문자열로 바꾸지 않는다. 체크박스는 value 대신 checked를 제어한다.',
    related: ['Uncontrolled Input', 'useState'], source: 'https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable', tags: ['React', '폼', '제어 입력'],
    codeLanguage: 'jsx', code: `import { useState } from 'react';
function SearchField() {
  const [query, setQuery] = useState('');
  return <input aria-label="검색" value={query}
    onChange={event => setQuery(event.target.value)} />;
}`,
  },
  {
    id: 'uncontrolled-input', term: 'Uncontrolled Input', korean: 'DOM이 현재 값을 관리하는 입력', category: 'forms', level: 'foundation', kind: 'concept',
    question: "입력마다 상태를 갱신하지 않고 제출 때 값을 읽으려면 어떻게 해야 하나요?",
    definition: '현재 입력값은 DOM이 관리하고 React는 defaultValue·defaultChecked 등으로 초기값을 주는 방식.',
    example: '폼에 초기 검색어를 넣고 제출 때 FormData로 최종 값을 읽는다.',
    caution: 'defaultValue는 초기값이며 매 변경을 제어하지 않는다. 같은 입력을 사용 중 제어·비제어 방식으로 전환하지 않는다.',
    related: ['Controlled Input', 'FormData'], source: 'https://react.dev/reference/react-dom/components/input#providing-an-initial-value-for-an-input', tags: ['React', '폼', '비제어 입력'],
    codeLanguage: 'jsx', code: `function SearchField() {
  return <input name="query" defaultValue="react"
    aria-label="검색" />;
}`,
  },
  {
    id: 'form-data', term: 'FormData', korean: '폼의 이름과 값 묶음', category: 'forms', level: 'foundation', kind: 'api',
    question: "폼 입력과 첨부 파일을 함께 전송하려면 어떻게 해야 하나요?",
    definition: '폼의 이름·값 쌍과 파일 등을 담아 전송할 수 있는 브라우저 API.',
    example: '제출한 form으로 FormData를 만들고 name이 있는 입력의 값을 읽는다.',
    caution: 'name이 없거나 disabled인 필드는 수집되지 않는다. multipart 전송의 Content-Type은 boundary를 붙이도록 브라우저에 맡긴다.',
    related: ['Content-Type', 'Uncontrolled Input'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData', tags: ['폼', '파일', '전송'],
    codeLanguage: 'jsx', code: `function SearchForm() {
  return <form onSubmit={event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log(data.get('query'));
  }}>
    <input name="query" aria-label="검색" />
    <button type="submit">검색</button>
  </form>;
}`,
  },
  {
    id: 'server-side-validation', term: 'Server-side Validation', korean: '서버에서 다시 검증하기', category: 'forms', level: 'practical', kind: 'concept',
    question: "브라우저에서 입력을 검사했는데 서버 검사도 필요할까요?",
    definition: '클라이언트가 보낸 입력을 서버가 타입·범위·업무 규칙에 맞는지 다시 검사하는 처리.',
    example: '용어 ID가 문자열인지와 실제로 존재하는 용어인지 서버에서 확인한 뒤 저장한다.',
    caution: '클라이언트 검사는 우회할 수 있다. 형식 검증과 별개로 로그인·소유자 권한도 서버에서 확인한다.',
    related: ['Validation', 'Authorization'], source: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation', tags: ['폼', '서버', '입력 검증'],
    codeLanguage: 'typescript', code: `function readTermId(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('용어 ID가 필요합니다');
  }
  return value;
}
// 이후 실제 용어 존재 여부와 사용자 권한도 검사한다.`,
  },
  {
    id: 'component-composition', term: 'Component Composition', korean: '컴포넌트 조합', category: 'architecture', level: 'foundation', kind: 'concept',
    question: "카드 틀은 같고 안의 내용만 다를 때 어떻게 재사용할까요?",
    definition: '작은 컴포넌트를 props나 children으로 결합해 더 큰 UI를 구성하는 방식.',
    example: '공통 Panel에 제목과 children을 전달해 용어 설명과 복습 안내에 재사용한다.',
    caution: '조합이 모든 것을 하나의 범용 컴포넌트로 만들라는 뜻은 아니다. 역할이 다른 UI는 적절한 경계를 유지한다.',
    related: ['Props', 'React Component'], source: 'https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children', tags: ['React', '구조', 'children'],
    codeLanguage: 'jsx', code: `function Panel({ title, children }) {
  return <section><h2>{title}</h2>{children}</section>;
}
function Answer() {
  return <Panel title="뜻"><p>변수를 기억하는 함수</p></Panel>;
}`,
  },
  {
    id: 'one-way-data-flow', term: 'One-Way Data Flow', korean: '위에서 아래로 흐르는 UI 데이터', category: 'architecture', level: 'foundation', kind: 'concept',
    question: "자식이 부모의 상태를 바꾸고 싶으면 props를 수정할까요?",
    definition: '부모의 데이터를 props로 내려보내고 자식은 콜백으로 변경 의도를 전달하는 React 설계 흐름.',
    example: '부모가 선택값을 내려주고 자식의 onSelect 콜백을 받아 부모 상태를 갱신한다.',
    caution: '자식이 props 객체를 직접 수정하지 않는다. 화면이 바뀌는 기준 소유자는 유지하면서 필요한 이벤트만 전달한다.',
    related: ['Props', 'Lifting State Up'], source: 'https://react.dev/learn/thinking-in-react#step-5-add-inverse-data-flow', tags: ['React', '데이터 흐름', '콜백'],
    codeLanguage: 'jsx', code: `function Choice({ selected, onSelect }) {
  return <button aria-pressed={selected}
    onClick={() => onSelect(!selected)}>선택</button>;
}`,
  },
  {
    id: 'component-boundary', term: 'Component Boundary', korean: '역할에 맞춘 컴포넌트 경계', category: 'architecture', level: 'practical', kind: 'concept',
    question: "큰 화면을 어느 지점에서 컴포넌트로 나누면 좋을까요?",
    definition: 'UI의 책임과 데이터 구조를 기준으로 각 컴포넌트가 담당할 범위를 정하는 것.',
    example: '검색 입력·필터·용어 목록처럼 역할이 다른 부분을 나누고 공유 상태의 부모를 정한다.',
    caution: '줄 수만으로 기계적으로 분리하지 않는다. 데이터가 과도하게 왕복하거나 책임이 모호해지면 경계를 다시 검토한다.',
    related: ['Separation of Concerns', 'Component Composition'], source: 'https://react.dev/learn/thinking-in-react#step-1-break-the-ui-into-a-component-hierarchy', tags: ['React', '구조', '책임'],
  },
];
