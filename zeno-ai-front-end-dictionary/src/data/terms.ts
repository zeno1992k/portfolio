import type { Category } from './categories';
import { foundationTerms } from './foundation-terms';
import { qualityTerms } from './quality-terms';
import type { TermKind, TermLevel } from './term-levels';
import { legacyTermMetadata } from './legacy-term-metadata';
import { expandedWebTerms } from './expanded-web-terms';
import { expandedAppTerms } from './expanded-app-terms';
import { expandedPracticeTerms } from './expanded-practice-terms';
import { interviewWebTerms } from './interview-web-terms';
import { interviewAppTerms } from './interview-app-terms';
import { interviewPracticeTerms } from './interview-practice-terms';
import { coreInterviewNotes } from './core-interview-notes';
import { coverageLanguageTerms } from './coverage-language-terms';
import { coverageReactTerms } from './coverage-react-terms';
import { coveragePlatformTerms } from './coverage-platform-terms';
import { coverageBrowserApiTerms } from './coverage-browser-apis';

export interface Term {
  id: string;
  term: string;
  korean: string;
  category: Category;
  level: TermLevel;
  kind: TermKind;
  question: string;
  definition: string;
  example: string;
  code?: string;
  codeLanguage?: 'javascript' | 'typescript' | 'jsx' | 'tsx' | 'css' | 'html' | 'http' | 'ini' | 'text';
  caution: string;
  related: string[];
  source: string;
  tags?: string[];
  interview?: {
    question: string;
    answer: string;
    followUp: string;
  };
}

export type LegacyTerm = Omit<Term, 'level' | 'kind'>;

const coreTerms: LegacyTerm[] = [
  {
    id: 'closure',
    term: 'Closure',
    korean: '클로저',
    category: 'javascript',
    question: "함수가 끝난 뒤에도 그 안의 변수를 기억할 수 있을까요?",
    definition: '함수가 자신이 만들어진 범위의 변수에 계속 접근할 수 있도록 함수와 주변 환경이 함께 묶인 것.',
    example: '카운터 함수를 만들면, 반환된 함수가 호출될 때마다 바깥의 count를 이어서 사용한다.',
    codeLanguage: 'javascript',
    code: `function makeCounter() {
  let count = 0;
  return () => ++count;
}
const next = makeCounter();
next(); // 1
next(); // 2`,
    caution: '값의 복사본을 저장하는 것이 아니다. 같은 변수를 공유하는 클로저는 변경된 값도 볼 수 있다.',
    related: ['Debounce', 'State'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures',
  },
  {
    id: 'event-loop',
    term: 'Event Loop',
    korean: '이벤트 루프',
    category: 'javascript',
    question: "setTimeout을 먼저 써도 Promise.then이 먼저 실행되는 이유는 무엇인가요?",
    definition: '태스크와 마이크로태스크를 처리하며 JavaScript 실행과 브라우저 작업의 진행을 조율하는 구조.',
    example: '아래 예제는 동기 코드 A, Promise의 마이크로태스크 B, 타이머 태스크 C 순서로 출력된다.',
    codeLanguage: 'javascript',
    code: `console.log('A');
setTimeout(() => console.log('C'), 0);
Promise.resolve().then(() => {
  console.log('B');
});
// 첫 번째 출력: A
// 두 번째 출력: B
// 세 번째 출력: C`,
    caution: '0ms는 즉시 실행을 뜻하지 않는다. 오래 걸리는 동기 코드는 클릭 처리와 화면 갱신도 늦춘다.',
    related: ['Promise', 'Rendering Pipeline'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide',
  },
  {
    id: 'promise',
    term: 'Promise',
    korean: '프로미스',
    category: 'javascript',
    question: "아직 도착하지 않은 API 결과를 어떻게 다룰까요?",
    definition: '작업이 나중에 성공하거나 실패할 결과를 나타내는 객체.',
    example: 'API 응답을 기다린 뒤 데이터를 읽고, 실패하면 다시 시도할 안내를 보여준다.',
    codeLanguage: 'javascript',
    code: `fetch('/api/terms')
  .then(response => {
    if (!response.ok) throw new Error('응답 오류');
    return response.json();
  })
  .then(terms => console.log(terms))
  .catch(() => console.log('다시 시도해 주세요'));`,
    caution: 'Promise 자체가 작업을 별도 스레드로 옮기지는 않는다. fetch는 HTTP 404에도 보통 성공 상태로 이행한다.',
    related: ['Event Loop', 'GET / POST'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
  },
  {
    id: 'debounce',
    term: 'Debounce',
    korean: '디바운스',
    category: 'javascript',
    question: "검색창에서 글자를 칠 때마다 요청을 보내야 할까요?",
    definition: '짧은 간격의 여러 호출을 묶어 설정한 시점에 한 번 실행하는 기법.',
    example: '이 예제는 마지막 입력 후 300ms 동안 새 입력이 없을 때 검색을 실행한다.',
    codeLanguage: 'javascript',
    code: `let timer;
function onSearch(value) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log('검색:', value);
  }, 300);
}
onSearch('클로저');`,
    caution: '일정 간격으로 실행하는 throttle과 다르다. React에서는 렌더마다 타이머 변수를 새로 만들지 않도록 관리한다.',
    related: ['Closure', 'Event Loop'],
    source: 'https://developer.mozilla.org/en-US/docs/Glossary/Debounce',
  },
  {
    id: 'union-type',
    term: 'Union Type',
    korean: '유니온 타입',
    category: 'typescript',
    question: "로딩 상태를 아무 문자열이나 넣을 수 없게 하려면 어떻게 해야 하나요?",
    definition: '여러 타입 중 하나가 될 수 있는 값을 | 기호로 표현한 타입.',
    example: '요청 상태를 idle, loading, success로 제한해 오타와 잘못된 상태를 잡는다.',
    codeLanguage: 'typescript',
    code: `type Status = 'idle' | 'loading' | 'success';
let status: Status = 'idle';
status = 'loading';
// status = 'done'; // 타입 오류`,
    caution: 'A | B는 두 타입의 모든 속성을 바로 쓸 수 있다는 뜻이 아니다. 공통 속성을 쓰거나 타입을 좁혀야 한다.',
    related: ['Narrowing', 'unknown'],
    source: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types',
  },
  {
    id: 'narrowing',
    term: 'Narrowing',
    korean: '타입 좁히기',
    category: 'typescript',
    question: "string일 수도 number일 수도 있는 값에 문자열 메서드를 쓰려면 어떻게 해야 하나요?",
    definition: '조건 검사와 코드 흐름을 통해 가능한 타입의 범위를 더 구체적으로 줄이는 과정.',
    example: 'typeof로 문자열인지 확인한 블록 안에서만 toUpperCase를 호출한다.',
    codeLanguage: 'typescript',
    code: `function format(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value.toFixed(0);
}`, 
    caution: 'if (value)는 빈 문자열과 0도 제외한다. 필요한 조건을 정확히 검사해야 한다.',
    related: ['Union Type', 'unknown'],
    source: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
  },
  {
    id: 'generic',
    term: 'Generic',
    korean: '제네릭',
    category: 'typescript',
    question: "재사용 함수에서 입력 타입과 반환 타입의 관계를 지키려면 어떻게 해야 하나요?",
    definition: '타입을 매개변수로 받아 여러 타입에 같은 구조를 적용하면서 타입 간 관계를 유지하는 방법.',
    example: '배열의 첫 값을 가져오는 함수가 문자열 배열에서는 문자열을 반환하도록 만든다.',
    codeLanguage: 'typescript',
    code: `function first<T>(items: T[]): T | undefined {
  return items[0];
}
const word = first(['Closure', 'Promise']);
// word: string | undefined`,
    caution: 'T가 실제 실행 중 값을 검증해 주지는 않는다. 빈 배열처럼 런타임에 생길 경우도 타입에 반영해야 한다.',
    related: ['Union Type', 'unknown'],
    source: 'https://www.typescriptlang.org/docs/handbook/2/functions.html#generic-functions',
  },
  {
    id: 'unknown',
    term: 'unknown',
    korean: '알 수 없는 타입',
    category: 'typescript',
    question: "외부에서 받은 값을 확인하기 전에 사용해도 될까요?",
    definition: '어떤 값도 받을 수 있지만, 사용하려면 타입을 먼저 확인하거나 좁혀야 하는 타입.',
    example: '외부에서 받은 값이 문자열인지 검사한 뒤 대문자로 바꾼다.',
    codeLanguage: 'typescript',
    code: `function readLabel(value: unknown) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return '이름 없음';
}`, 
    caution: 'any처럼 타입 검사를 끄지 않는다. as로 단언한다고 실제 데이터가 검증되는 것도 아니다.',
    related: ['Narrowing', 'Generic'],
    source: 'https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown',
  },
  {
    id: 'props',
    term: 'Props',
    korean: '컴포넌트에 전달하는 값',
    category: 'react',
    question: "같은 카드 컴포넌트에 서로 다른 용어를 보여주려면 어떻게 해야 하나요?",
    definition: '부모가 자식 컴포넌트에 전달하는 데이터와 함수 등의 입력값.',
    example: 'Card에 term을 전달하면 카드 구조를 재사용하면서 제목만 바꿀 수 있다.',
    codeLanguage: 'tsx',
    code: `type Props = { term: string };
function Card({ term }: Props) {
  return <h2>{term}</h2>;
}
// 사용: <Card term="Closure" />`,
    caution: 'props는 읽기 전용이다. 자식이 직접 바꾸는 대신 부모가 전달한 변경 함수를 호출한다.',
    related: ['State', 'Key'],
    source: 'https://react.dev/learn/passing-props-to-a-component',
  },
  {
    id: 'state',
    term: 'State',
    korean: '컴포넌트의 기억',
    category: 'react',
    question: "카드의 답을 열었다는 상태를 다음 렌더에서도 기억하려면 어떻게 해야 하나요?",
    definition: '렌더 사이에 유지되고, 업데이트하면 React에 새 렌더를 요청하는 컴포넌트의 데이터.',
    example: '답 열기 버튼을 누르면 열린 상태를 저장하고 버튼 문구를 바꾼다.',
    codeLanguage: 'jsx',
    code: `function AnswerButton() {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(v => !v)}>
      {open ? '답 닫기' : '답 보기'}
    </button>
  );
}`, 
    caution: 'setState 직후 현재 함수의 변수가 바로 바뀌지는 않는다. 객체와 배열은 직접 수정하지 말고 새 값으로 갱신한다.',
    related: ['Props', 'useEffect'],
    source: 'https://react.dev/learn/state-a-components-memory',
  },
  {
    id: 'use-effect',
    term: 'useEffect',
    korean: '외부 시스템과 동기화',
    category: 'react',
    question: "React 밖의 타이머나 이벤트 구독은 어디서 연결하고 정리할까요?",
    definition: '컴포넌트가 커밋된 뒤 외부 시스템과 동기화하는 코드를 실행하는 React Hook.',
    example: '컴포넌트가 표시되는 동안 창 크기 변경을 구독하고, 사라질 때 해제한다.',
    codeLanguage: 'javascript',
    code: `useEffect(() => {
  const onResize = () => console.log(innerWidth);
  window.addEventListener('resize', onResize);
  return () => {
    window.removeEventListener('resize', onResize);
  };
}, []);`,
    caution: '파생값은 렌더 중 계산하면 된다. const doubled = count * 2에는 Effect가 필요 없다. 화면 paint 뒤 실행된다고 항상 보장되지는 않는다.',
    related: ['State', 'Event Bubbling'],
    source: 'https://react.dev/reference/react/useEffect',
  },
  {
    id: 'key',
    term: 'Key',
    korean: '목록 항목의 식별자',
    category: 'react',
    question: "목록 순서가 바뀌어도 React가 같은 카드를 알아보려면 어떻게 해야 하나요?",
    definition: '형제 목록 항목을 구별해 추가·삭제·이동 시 기존 항목과 대응시키는 안정적인 식별자.',
    example: '단어 카드를 정렬할 때 배열 위치 대신 단어의 고유 id를 사용한다.',
    codeLanguage: 'jsx',
    code: `const cards = terms.map(term => (
  <article key={term.id}>
    <h2>{term.term}</h2>
  </article>
));`,
    caution: '렌더마다 random 값으로 key를 만들면 안 된다. 순서가 변하는 목록의 index도 피한다. key는 자식 props로 전달되지 않는다.',
    related: ['Props', 'State'],
    source: 'https://react.dev/learn/rendering-lists',
  },
  {
    id: 'box-model',
    term: 'Box Model',
    korean: '박스 모델',
    category: 'css',
    question: "width가 200px인데 실제 카드가 더 넓어지는 이유는 무엇인가요?",
    definition: '요소의 영역을 콘텐츠, 안쪽 여백, 테두리, 바깥 여백으로 구분하는 모델.',
    example: 'border-box를 쓰면 지정한 width 안에 padding과 border가 포함된다.',
    codeLanguage: 'css',
    code: `.card {
  box-sizing: border-box;
  width: 200px;
  padding: 16px;
  border: 1px solid #ddd;
}`, 
    caution: 'margin은 border-box의 width 안에도 포함되지 않는다. 기본 content-box에서는 padding과 border가 width에 더해진다.',
    related: ['Flexbox', 'Grid'],
    source: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model',
  },
  {
    id: 'flexbox',
    term: 'Flexbox',
    korean: '플렉스 레이아웃',
    category: 'css',
    question: "아이콘과 제목을 한 줄에서 자연스럽게 정렬하려면 어떻게 해야 하나요?",
    definition: '한 번에 행 또는 열 한 축을 중심으로 공간 배분과 정렬을 다루는 레이아웃 방식.',
    example: '헤더의 제목과 버튼을 양 끝에 놓고 세로 중앙을 맞춘다.',
    codeLanguage: 'css',
    code: `.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}`, 
    caution: '주축은 flex-direction에 따라 바뀐다. 줄바꿈된 각 줄의 칸을 함께 맞추려면 Grid가 더 적합할 수 있다.',
    related: ['Grid', 'Box Model'],
    source: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox',
  },
  {
    id: 'grid',
    term: 'Grid',
    korean: '그리드 레이아웃',
    category: 'css',
    question: "카드 목록의 행과 열을 함께 맞추려면 어떻게 해야 하나요?",
    definition: '행과 열의 두 축을 함께 정의하고 요소를 배치하는 CSS 레이아웃 방식.',
    example: '단어 카드를 같은 너비의 두 열로 배치하고 사이 간격을 일정하게 둔다.',
    codeLanguage: 'css',
    code: `.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}`, 
    caution: '1fr만 쓰면 긴 콘텐츠의 최소 너비 때문에 열이 늘어날 수 있다. minmax(0, 1fr)도 콘텐츠 줄바꿈까지 해결하지는 않는다.',
    related: ['Flexbox', 'Box Model'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout',
  },
  {
    id: 'specificity',
    term: 'Specificity',
    korean: '선택자 명시도',
    category: 'css',
    question: "뒤에 쓴 CSS인데 앞의 스타일을 덮어쓰지 못하는 이유는 무엇인가요?",
    definition: '캐스케이드의 앞선 우선순위 조건이 같을 때, 선택자가 얼마나 구체적인지 비교하는 값.',
    example: '같은 레이어의 일반 선언에서는 .card보다 #term의 명시도가 높아 색상을 결정한다.',
    codeLanguage: 'css',
    code: `#term {
  color: coral;
}
.card {
  color: navy;
}`, 
    caution: '명시도가 모든 우선순위를 결정하지는 않는다. 출처, !important, 캐스케이드 레이어 등을 먼저 비교한다.',
    related: ['DOM', 'Box Model'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity',
  },
  {
    id: 'dom',
    term: 'DOM',
    korean: '문서 객체 모델',
    category: 'browser',
    question: "JavaScript는 HTML 화면을 어떤 구조로 읽고 바꿀까요?",
    definition: '문서의 요소와 텍스트 등을 노드 트리로 나타내고 코드에서 다룰 수 있게 하는 인터페이스.',
    example: '선택한 제목 요소의 textContent를 바꾸면 문서 내용도 바뀐다.',
    codeLanguage: 'javascript',
    code: `const title = document.querySelector('h1');
if (title) {
  title.textContent = '오늘의 용어';
}`, 
    caution: 'DOM은 화면의 픽셀이나 원본 HTML 문자열 그 자체가 아니다. 외부 문자열을 innerHTML로 넣으면 XSS 위험이 생길 수 있다.',
    related: ['Event Bubbling', 'Rendering Pipeline'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model',
  },
  {
    id: 'event-bubbling',
    term: 'Event Bubbling',
    korean: '이벤트 버블링',
    category: 'browser',
    question: "카드 안의 버튼을 눌렀는데 카드의 클릭 이벤트도 실행되는 이유는 무엇인가요?",
    definition: '버블링하는 이벤트가 대상 요소에서 처리된 뒤 조상 요소 방향으로 전파되는 단계.',
    example: '안쪽 버튼에서 전파를 멈추면 바깥 카드의 클릭 핸들러가 이어서 실행되지 않는다.',
    codeLanguage: 'javascript',
    code: `card.addEventListener('click', () => {
  console.log('카드 클릭');
});
button.addEventListener('click', event => {
  event.stopPropagation();
  console.log('버튼 클릭');
});`,
    caution: '모든 이벤트가 버블링하지는 않는다. stopPropagation은 링크 이동 같은 기본 동작을 막지 않으며, 그 목적에는 preventDefault를 쓴다.',
    related: ['DOM', 'useEffect'],
    source: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling',
  },
  {
    id: 'rendering-pipeline',
    term: 'Rendering Pipeline',
    korean: '브라우저 렌더링 과정',
    category: 'browser',
    question: "CSS를 바꾸면 브라우저는 화면을 다시 어떻게 만들까요?",
    definition: '문서와 스타일을 해석해 배치를 계산하고, 그린 결과를 합성해 화면으로 보여주는 과정.',
    example: 'width 변경은 배치 계산을 일으킬 수 있다. 움직임에는 transform을 사용하고 실제 성능을 측정한다.',
    codeLanguage: 'css',
    code: `.card {
  transition: transform 180ms ease;
}
.card.is-raised {
  transform: translateY(-4px);
}`, 
    caution: '모든 변경이 Layout → Paint → Composite를 전부 거치지는 않는다. transform도 언제나 합성만 한다고 단정할 수 없다.',
    related: ['DOM', 'Event Loop'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work',
  },
  {
    id: 'local-storage',
    term: 'localStorage',
    korean: '브라우저 로컬 저장소',
    category: 'browser',
    question: "브라우저를 닫았다 열어도 학습 위치를 기억하려면 어떻게 해야 하나요?",
    definition: '같은 출처에서 접근하는 문자열 키와 값을 브라우저 세션을 넘어 저장하는 Web Storage API.',
    example: '마지막으로 본 카드 id를 저장해 다음 방문에서 이어서 학습한다.',
    codeLanguage: 'javascript',
    code: `localStorage.setItem('last-term', 'closure');
const id = localStorage.getItem('last-term');
console.log(id); // 'closure'`,
    caution: '저장은 실패하거나 사용자 설정으로 지워질 수 있다. 동기 API이므로 큰 데이터를 자주 쓰지 말고 민감한 인증 정보도 저장하지 않는다.',
    related: ['Cookie', 'State'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
  },
  {
    id: 'http-methods',
    term: 'GET / POST',
    korean: 'HTTP 요청 메서드',
    category: 'http',
    question: "데이터를 읽는 요청과 새로 제출하는 요청은 어떻게 구분할까요?",
    definition: 'GET은 리소스 표현을 요청하고, POST는 서버가 처리하도록 데이터를 제출하는 HTTP 메서드.',
    example: '용어 목록은 GET으로 읽고, 새 용어 등록 데이터는 POST 본문에 담아 보낸다.',
    codeLanguage: 'javascript',
    code: `const response = await fetch('/api/terms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ term: 'Closure' }),
});
if (!response.ok) throw new Error('저장 실패');`,
    caution: 'POST는 생성에만 쓰는 메서드가 아니다. GET은 서버 상태 변경을 요청하는 용도로 쓰지 않으며, POST 자체가 데이터를 암호화해 주지도 않는다.',
    related: ['Promise', 'CORS'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods',
  },
  {
    id: 'cache-control',
    term: 'Cache-Control',
    korean: 'HTTP 캐시 제어',
    category: 'http',
    question: "서버 응답을 언제 다시 받아야 하는지 어떻게 알려줄까요?",
    definition: 'HTTP 요청과 응답에서 캐시 저장 및 재사용 규칙을 지정하는 헤더.',
    example: '공개 용어 목록 응답에 max-age=3600을 주면 캐시가 이를 한 시간 동안 신선한 응답으로 취급한다.',
    codeLanguage: 'http',
    code: `HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=3600`,
    caution: 'no-cache는 저장 금지가 아니라 재사용 전 재검증을 요구한다. 저장하지 않게 하려면 no-store를 쓴다.',
    related: ['GET / POST', 'Cookie'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control',
  },
  {
    id: 'cors',
    term: 'CORS',
    korean: '교차 출처 리소스 공유',
    category: 'http',
    question: "다른 서버의 API 응답을 브라우저에서 읽지 못하는 이유는 무엇인가요?",
    definition: '다른 출처의 웹 페이지가 서버 응답에 접근할 수 있도록 허용 정보를 주고받는 HTTP 헤더 기반 체계.',
    example: 'API 서버가 학습 앱의 출처를 허용하는 응답 헤더를 내려주면 앱에서 해당 응답을 읽을 수 있다.',
    codeLanguage: 'http',
    code: `HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://study.example
Vary: Origin
Content-Type: application/json`,
    caution: 'CORS는 모든 요청 자체를 막는 방화벽이 아니다. 일부 요청에는 preflight가 필요하며, 자격 증명 요청에서는 허용 출처에 *를 쓸 수 없다.',
    related: ['GET / POST', 'Cookie'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS',
  },
  {
    id: 'cookie',
    term: 'Cookie',
    korean: '쿠키',
    category: 'http',
    question: "서버는 요청을 보낸 사용자의 로그인 상태를 어떻게 이어갈까요?",
    definition: '브라우저에 저장되고 조건에 맞는 HTTP 요청에 자동으로 포함되는 작은 데이터.',
    example: '서버가 세션 식별자를 쿠키로 내려주면 이후 요청에서 해당 세션을 확인할 수 있다.',
    codeLanguage: 'http',
    code: `HTTP/1.1 200 OK
Set-Cookie: session=example; Path=/; HttpOnly; Secure; SameSite=Lax
Content-Type: application/json`,
    caution: 'HttpOnly는 JavaScript의 쿠키 읽기를 막는다. CSRF나 XSS를 모두 해결하지는 않으므로 Secure, SameSite와 서버 검증도 함께 고려한다.',
    related: ['localStorage', 'CORS'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies',
  },
];

// A card has one primary topic. Tags connect concepts across topics without
// duplicating cards or splitting their saved learning history.
const coreTags: Record<string, string[]> = {
  closure: ['스코프', '함수', '상태'],
  'event-loop': ['비동기', '브라우저', '성능'],
  promise: ['비동기', 'API'],
  debounce: ['함수', '성능', '검색'],
  'union-type': ['타입 표현', '상태'],
  narrowing: ['타입 검사', '검증'],
  generic: ['타입 재사용', '함수'],
  unknown: ['타입 안전성', '검증'],
  props: ['컴포넌트', '데이터 흐름'],
  state: ['컴포넌트', '클라이언트 상태'],
  'use-effect': ['Hooks', '외부 시스템'],
  key: ['목록', '렌더링', '식별자'],
  'box-model': ['크기', '여백', '레이아웃'],
  flexbox: ['레이아웃', '정렬'],
  grid: ['레이아웃', '반응형'],
  specificity: ['캐스케이드', '선택자'],
  dom: ['문서 구조', 'JavaScript'],
  'event-bubbling': ['이벤트', 'JavaScript'],
  'rendering-pipeline': ['렌더링', '성능'],
  'local-storage': ['저장소', '상태', '보안'],
  'http-methods': ['요청', '응답', 'API'],
  'cache-control': ['캐시', '성능'],
  cors: ['출처', '브라우저', '보안'],
  cookie: ['인증', '세션', '보안'],
};

const functionTerms: LegacyTerm[] = [
  {
    id: 'array-map',
    term: 'Array.map()',
    korean: '각 요소를 변환해 새 배열 만들기',
    category: 'javascript',
    question: "용어 목록에서 이름만 꺼내 새 배열로 만들려면 어떻게 해야 하나요?",
    definition: '배열의 각 요소에 함수를 적용하고, 그 반환값으로 새 배열을 만드는 메서드.',
    example: '용어 객체 목록에서 이름을 꺼내 검색 추천 목록이나 카드 제목으로 사용한다.',
    codeLanguage: 'javascript',
    code: `const words = [
  { id: 'closure', term: 'Closure' },
  { id: 'promise', term: 'Promise' },
];
const names = words.map(word => word.term);
// ['Closure', 'Promise']`,
    caution: '중괄호를 쓴 콜백에서 return을 빠뜨리면 결과에 undefined가 들어간다. 원본 객체를 콜백 안에서 직접 수정하지 않는다.',
    related: ['Array.filter()', 'Key'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map',
    tags: ['map 함수', '배열 변환', '콜백'],
  },
  {
    id: 'array-filter',
    term: 'Array.filter()',
    korean: '조건에 맞는 요소만 남기기',
    category: 'javascript',
    question: "아직 한 번도 공부하지 않은 카드만 모으려면 어떻게 해야 하나요?",
    definition: '콜백의 검사 결과가 참으로 취급되는 요소만 골라 새 배열로 반환하는 메서드.',
    example: '학습 횟수가 0인 카드만 남겨 새로 배울 목록을 만든다.',
    codeLanguage: 'javascript',
    code: `const cards = [
  { term: 'Closure', reviews: 0 },
  { term: 'Promise', reviews: 3 },
];
const unseen = cards.filter(card => card.reviews === 0);
// [{ term: 'Closure', reviews: 0 }]`,
    caution: '선택된 요소가 객체라면 원본과 같은 객체를 참조한다. 배열이 새로 생겨도 객체 내부까지 복제되는 것은 아니다.',
    related: ['Array.map()', 'Array.find()'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter',
    tags: ['filter 함수', '배열 필터', '조건'],
  },
  {
    id: 'array-reduce',
    term: 'Array.reduce()',
    korean: '요소를 누적해 하나의 결과 만들기',
    category: 'javascript',
    question: "며칠 동안 공부한 카드 수의 합계를 구하려면 어떻게 해야 하나요?",
    definition: '이전 계산 결과와 현재 요소를 콜백에 전달해, 배열을 하나의 결과값으로 누적하는 메서드.',
    example: '하루별 학습량을 더해 이번 주에 공부한 카드 수를 보여준다.',
    codeLanguage: 'javascript',
    code: `const dailyCounts = [5, 3, 4];
const total = dailyCounts.reduce(
  (sum, count) => sum + count,
  0,
);
// 12`,
    caution: '빈 배열에 초기값 없이 호출하면 TypeError가 발생한다. 합계는 0처럼 목적에 맞는 초기값을 지정한다.',
    related: ['Array.map()', 'Array.filter()'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce',
    tags: ['reduce 함수', '누적', '초기값'],
  },
  {
    id: 'array-find',
    term: 'Array.find()',
    korean: '조건에 맞는 첫 요소 찾기',
    category: 'javascript',
    question: "선택한 id와 같은 용어 카드 하나만 찾으려면 어떻게 해야 하나요?",
    definition: '조건을 만족하는 첫 번째 요소를 반환하는 메서드. 찾는 요소가 없으면 undefined를 반환한다.',
    example: '카드 목록에서 사용자가 선택한 id를 찾아 상세 화면에 보여준다.',
    codeLanguage: 'javascript',
    code: `const cards = [
  { id: 'closure', term: 'Closure' },
  { id: 'promise', term: 'Promise' },
];
const selected = cards.find(card => card.id === 'closure');
const title = selected?.term ?? '용어 없음';`,
    caution: '찾았다고 가정하고 속성을 바로 읽으면 오류가 날 수 있다. undefined를 처리하고, 모든 일치 항목이 필요하면 filter를 쓴다.',
    related: ['Array.filter()', 'Narrowing'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find',
    tags: ['find 함수', '검색', 'undefined'],
  },
  {
    id: 'promise-all',
    term: 'Promise.all()',
    korean: '여러 비동기 결과 함께 기다리기',
    category: 'javascript',
    question: "서로 독립적인 API 두 개를 함께 요청하고 결과를 받으려면 어떻게 해야 하나요?",
    definition: '여러 Promise가 모두 성공하면 입력 순서의 결과 배열로 이행하는 Promise를 반환하는 메서드. 하나라도 실패하면 처음 발생한 실패 이유로 거부된다.',
    example: '용어 목록과 학습 기록을 함께 요청하고, 둘 다 도착하면 화면에 사용한다.',
    codeLanguage: 'javascript',
    code: `const requests = ['/api/terms', '/api/progress'].map(
  async url => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('응답 오류');
    return response.json();
  },
);
const [words, progress] = await Promise.all(requests);`,
    caution: '하나가 실패해도 나머지 작업이 자동 취소되지는 않는다. 성공·실패를 포함한 모든 결과가 필요하면 Promise.allSettled를 사용한다.',
    related: ['Promise', 'fetch()'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all',
    tags: ['비동기', '동시 요청', '실패 처리'],
  },
  {
    id: 'abort-controller',
    term: 'AbortController',
    korean: '비동기 작업의 취소 신호 보내기',
    category: 'browser',
    question: "검색어가 바뀌어 더 이상 필요 없는 이전 요청을 취소하려면 어떻게 해야 하나요?",
    definition: 'signal을 전달받는 비동기 작업에 취소를 알리는 객체. fetch처럼 취소 신호를 지원하는 작업에 사용할 수 있다.',
    example: '새 검색 요청을 보내거나 화면을 떠날 때 이전 fetch 요청을 취소한다.',
    codeLanguage: 'javascript',
    code: `const controller = new AbortController();
fetch('/api/terms', { signal: controller.signal })
  .catch(error => {
    if (error.name === 'AbortError') return;
    console.error(error);
  });
controller.abort(); // 이 예제에서는 즉시 취소`,
    caution: '이미 취소된 signal은 다시 사용할 수 없다. 새 작업에는 새 컨트롤러를 만들고, 취소로 발생한 AbortError를 일반 실패와 구분한다.',
    related: ['fetch()', 'useEffect'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal#aborting_a_fetch_operation_using_an_explicit_signal',
    tags: ['요청 취소', 'AbortSignal', '검색'],
  },
  {
    id: 'url-search-params',
    term: 'URLSearchParams',
    korean: 'URL 검색 매개변수 다루기',
    category: 'browser',
    question: "검색어와 페이지 번호를 URL에 안전하게 담으려면 어떻게 해야 하나요?",
    definition: 'URL의 검색 매개변수를 읽고, 추가·수정하고, 쿼리 문자열로 변환하는 API.',
    example: 'category=react와 한글 검색어를 직접 문자열로 이어 붙이지 않고 매개변수로 만들어 전달한다.',
    codeLanguage: 'javascript',
    code: `const params = new URLSearchParams({
  category: 'react',
  q: '타입 검사',
});
params.set('page', '2');
const query = params.toString();
console.log(params.get('category')); // 'react'`,
    caution: 'params를 바꿔도 주소창이 자동으로 바뀌지는 않는다. 전체 URL을 읽을 때는 new URL(주소).searchParams를 사용한다.',
    related: ['URL State', 'fetch()'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams',
    tags: ['쿼리 문자열', '검색 매개변수', 'URL'],
  },
  {
    id: 'fetch',
    term: 'fetch()',
    korean: '네트워크 요청 보내기',
    category: 'http',
    question: "서버의 용어 목록을 받아 화면에 사용하려면 어떻게 해야 하나요?",
    definition: '네트워크 요청을 보내고 응답을 나타내는 Response로 이행하는 Promise를 반환하는 API.',
    example: '용어 API를 호출하고 상태 코드를 확인한 뒤 JSON 응답을 읽는다.',
    codeLanguage: 'javascript',
    code: `const response = await fetch('/api/terms');
if (!response.ok) {
  throw new Error('용어를 불러오지 못했어요');
}
const words = await response.json();`,
    caution: '404나 500 응답만으로 Promise가 거부되지는 않는다. response.ok를 확인하고, json()으로 본문을 읽는 작업도 기다려야 한다.',
    related: ['Promise', 'GET / POST'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
    tags: ['API 요청', 'Response', 'JSON'],
  },
];

const legacyTerms: LegacyTerm[] = [
  ...coreTerms.map((term) => ({ ...term, tags: coreTags[term.id] ?? [] })),
  ...foundationTerms,
  ...qualityTerms,
  ...functionTerms,
];

const catalog: Term[] = [
  ...legacyTerms.map(term => {
    const metadata = legacyTermMetadata[term.id];
    if (!metadata) throw new Error(`Missing learning metadata for ${term.id}`);
    return { ...term, ...metadata };
  }),
  ...expandedWebTerms,
  ...expandedAppTerms,
  ...expandedPracticeTerms,
  ...interviewWebTerms,
  ...interviewAppTerms,
  ...interviewPracticeTerms,
  ...coverageLanguageTerms,
  ...coverageReactTerms,
  ...coveragePlatformTerms,
  ...coverageBrowserApiTerms,
];

export const terms: Term[] = catalog.map(term => coreInterviewNotes[term.id]
  ? { ...term, interview: coreInterviewNotes[term.id] }
  : term);
