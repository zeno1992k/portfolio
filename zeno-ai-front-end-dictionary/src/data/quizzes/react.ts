import type { QuizQuestion } from './types';

export const reactQuizzes: QuizQuestion[] = [
  {
    id: 'react-jsx-fragment', part: 'react', level: 'foundation', kind: 'concept',
    topic: 'JSX · Fragment',
    prompt: "제목과 설명을 함께 반환하되 추가 DOM 래퍼를 만들지 않으려고 합니다. return의 빈칸에 넣을 JSX는 무엇인가요?",
    codeLanguage: "jsx", code: "export default function Intro() {\n  return (\n    __BLANK__\n  );\n}",
    choices: [{"id":"a","text":"<><h1>퀴즈</h1><p>시작해요</p></>","explanation":"Fragment는 여러 자식을 묶어 반환하면서 DOM에 별도의 감싸는 요소를 추가하지 않습니다."},{"id":"b","text":"<div><h1>퀴즈</h1><p>시작해요</p></div>","explanation":"유효한 JSX이지만 div 요소가 추가되므로 문제의 조건을 충족하지 않습니다."},{"id":"c","text":"<h1>퀴즈</h1><p>시작해요</p>","explanation":"서로 인접한 JSX 요소를 이 형태로 하나의 반환 표현식에 나열할 수 없습니다. 묶어 주어야 합니다."},{"id":"d","text":"<><h1>퀴즈</h1><p>시작해요</>","explanation":"JSX는 태그를 명시적으로 닫아야 합니다. p의 닫는 태그가 빠져 있습니다."}],
    correctChoiceId: 'a',
    explanation: "JSX는 UI를 나타내는 표현식입니다. Fragment의 짧은 문법인 <>...</>로 형제 요소를 묶으면 불필요한 div 없이 제목과 설명을 반환할 수 있습니다. 단, 목록에서 Fragment 자체에 key를 줘야 한다면 이름 있는 Fragment 문법을 사용합니다.",
    relatedTermIds: ['jsx', 'react-component'],
    source: 'https://react.dev/learn/writing-markup-with-jsx',
  },
  {
    id: 'react-zero-condition', part: 'react', level: 'foundation', kind: 'concept',
    topic: '조건부 렌더링',
    prompt: "items가 빈 배열일 때 아래 컴포넌트가 표시하는 것은 무엇인가요?",
    codeLanguage: 'jsx',
    code: `function EmptyList() {
  const items = [];
  return <section>{items.length && <p>목록 있음</p>}</section>;
}`,
    choices: [
      { id: 'a', text: '빈 section만 표시한다', explanation: "false는 표시되지 않지만 이 표현식의 결과는 false가 아닌 숫자 0입니다." },
      { id: 'b', text: 'section 안에 숫자 0을 표시한다', explanation: "0 && 오른쪽 표현식의 결과는 0이며 React는 숫자 0을 화면에 표시합니다." },
      { id: 'c', text: '목록 있음이라는 문구를 표시한다', explanation: "items.length가 0이므로 &&의 오른쪽 JSX는 선택되지 않습니다." },
      { id: 'd', text: '배열이 비었으므로 렌더 오류가 발생한다', explanation: "빈 배열의 length를 읽는 것은 유효하며 숫자도 React가 표시할 수 있는 자식입니다." },
    ],
    correctChoiceId: 'b',
    explanation: "&&는 조건을 무조건 true나 false로 반환하는 연산자가 아닙니다. 왼쪽이 0이면 그 0이 결과로 남습니다. 빈 목록에서 아무것도 표시하지 않으려면 items.length > 0 && ...처럼 왼쪽을 명시적인 boolean으로 만듭니다.",
    relatedTermIds: ['conditional-rendering', 'jsx'],
    source: 'https://react.dev/learn/conditional-rendering',
  },
  {
    id: 'react-props-update-owner', part: 'react', level: 'foundation', kind: 'practical',
    topic: 'Props · 변경 요청',
    prompt: "부모가 state로 관리하는 user를 자식에게 전달했습니다. 아래 이름 변경 코드를 단방향 데이터 흐름에 맞게 고치는 방법은 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nfunction Profile({ user }) {\n  return <button onClick={() => { user.name = '민지'; }}>\n    {user.name}\n  </button>;\n}\nexport default function App() {\n  const [user, setUser] = useState({ name: '지수' });\n  return <Profile user={user} />;\n}",
    choices: [{"id":"a","text":"자식에서 user.name을 직접 변경한다","explanation":"props로 받은 객체를 변경하면 부모의 상태 스냅샷까지 훼손하며 React의 상태 갱신 경로를 거치지 않습니다."},{"id":"b","text":"자식에서 props.user를 새 객체로 재할당하면 부모도 갱신된다","explanation":"자식의 지역 변수 재할당은 부모의 state setter 호출이 아니므로 부모의 상태를 바꾸지 않습니다."},{"id":"c","text":"부모가 변경 콜백을 전달하고, 자식은 새 이름을 콜백에 전달한다","explanation":"값의 소유자인 부모가 새 state를 만들고 자식은 변경 의도를 전달하여 데이터 흐름을 유지합니다."},{"id":"d","text":"DOM의 이름 글자만 바꾸고 user 값은 그대로 둔다","explanation":"직접 바꾼 DOM과 React가 계산하는 UI가 달라져 다음 렌더에서 불일치가 생길 수 있습니다."}],
    correctChoiceId: 'c',
    explanation: "props는 해당 렌더에서 읽는 입력값으로 다룹니다. 부모는 onNameChange 같은 콜백 안에서 setUser(prev => ({ ...prev, name }))로 새 상태를 만들고, 자식은 클릭이나 입력 이벤트에서 콜백을 호출합니다. 읽는 값과 변경 책임을 함께 추적할 수 있는 구조입니다.",
    relatedTermIds: ['props', 'single-source-of-truth', 'react-state-immutability'],
    source: 'https://react.dev/learn/passing-props-to-a-component',
  },
  {
    id: 'react-pass-click-handler', part: 'react', level: 'foundation', kind: 'practical',
    topic: '이벤트 핸들러',
    prompt: "save는 렌더 중 실행하지 않고 버튼을 클릭할 때 id와 함께 호출해야 합니다. 빈칸에 넣을 속성은 무엇인가요?",
    codeLanguage: "jsx", code: "export default function SaveButton({ id, save }) {\n  return <button __BLANK__>저장</button>;\n}",
    choices: [{"id":"a","text":"onClick={save()}","explanation":"save()는 JSX를 계산할 때 실행됩니다. 클릭 핸들러에는 호출 결과가 전달됩니다."},{"id":"b","text":"onClick={save(id)}","explanation":"인자를 전달하더라도 이 위치의 함수 호출은 렌더 중 실행됩니다."},{"id":"c","text":"onClick=\"save\"","explanation":"React의 이벤트 prop은 함수가 필요합니다. 함수 이름 문자열이 이벤트 핸들러로 실행되지 않습니다."},{"id":"d","text":"onClick={() => save(id)}","explanation":"화살표 함수를 전달하면 클릭 이벤트가 발생했을 때 그 함수 안에서 save(id)가 실행됩니다."}],
    correctChoiceId: 'd',
    explanation: "React 이벤트 prop에는 함수 자체를 전달합니다. 인자가 필요 없다면 onClick={save}, 특정 id를 넘기려면 onClick={() => save(id)}로 작성합니다. 렌더는 UI를 계산하는 과정이므로 저장 요청 같은 사용자 행동을 그 안에서 실행하지 않습니다.",
    relatedTermIds: ['react-event-handler', 'effect-vs-event', 'render-purity'],
    source: 'https://react.dev/learn/responding-to-events',
  },
  {
    id: 'react-snapshot-two-updates', part: 'react', level: 'foundation', kind: 'concept',
    topic: 'State 스냅샷',
    prompt: "초기 count는 0입니다. 버튼을 한 번 클릭하고 상태 갱신이 반영되면 버튼의 숫자는 무엇인가요?",
    codeLanguage: 'jsx',
    code: `import { useState } from 'react';
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => {
    setCount(count + 1);
    setCount(count + 1);
  }}>{count}</button>;
}`,
    choices: [
      { id: 'a', text: '1', explanation: "두 호출 모두 같은 렌더의 count 값 0을 읽으므로 각각 1로 교체하라는 갱신을 요청합니다." },
      { id: 'b', text: '2', explanation: "setCount 호출이 현재 이벤트 핸들러의 count 변수를 즉시 1로 바꾸지는 않습니다." },
      { id: 'c', text: '0', explanation: "이벤트 중에는 0을 읽지만 요청한 상태 갱신이 반영된 다음 렌더에서는 1을 읽습니다." },
      { id: 'd', text: 'StrictMode에서는 반드시 4', explanation: "StrictMode의 개발 점검이 사용자 클릭 이벤트를 두 번 실행하여 점수를 늘리는 기능은 아닙니다." },
    ],
    correctChoiceId: 'a',
    explanation: "이벤트 핸들러는 자신이 만들어진 렌더의 상태 스냅샷을 읽습니다. setter 호출은 다음 렌더를 요청하며 현재 count를 재할당하지 않습니다. 같은 이벤트 안에서 이전 갱신 결과를 이어서 사용하려면 함수형 업데이트가 필요합니다.",
    relatedTermIds: ['state-snapshot', 'react-batching', 'state'],
    source: 'https://react.dev/learn/state-as-a-snapshot',
  },
  {
    id: 'react-functional-update-chain', part: 'react', level: 'foundation', kind: 'concept',
    topic: '함수형 State 업데이트',
    prompt: "초기 count는 0입니다. 버튼을 한 번 클릭한 뒤 갱신이 반영된 숫자는 무엇인가요?",
    codeLanguage: 'jsx',
    code: `import { useState } from 'react';
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => {
    setCount(n => n + 1);
    setCount(n => n + 1);
    setCount(n => n + 1);
  }}>{count}</button>;
}`,
    choices: [
      { id: 'a', text: '1', explanation: "이 문제는 고정된 count + 1 값을 세 번 전달하지 않습니다. 각 updater가 앞의 갱신 결과를 받습니다." },
      { id: 'b', text: '3', explanation: "업데이트 큐에서 0 → 1 → 2 → 3 순서로 이전 결과를 이어서 계산합니다." },
      { id: 'c', text: '6', explanation: "StrictMode가 순수 updater를 추가 호출하더라도 점검 결과 하나를 버리므로 올바른 상태가 두 배가 되지 않습니다." },
      { id: 'd', text: '실행 순서를 알 수 없어 숫자를 예측할 수 없다', explanation: "같은 상태에 전달한 동기 updater는 큐에 등록한 순서에 따라 계산됩니다." },
    ],
    correctChoiceId: 'b',
    explanation: "함수형 업데이트는 해당 렌더의 count를 직접 읽는 대신 큐의 이전 상태를 인자로 받습니다. 여러 갱신을 연결하거나 비동기 콜백에서 이전 상태를 기준으로 변경할 때 유용합니다. updater는 상태 계산만 수행하며 요청 전송 같은 부수 효과를 넣지 않습니다.",
    relatedTermIds: ['functional-state-update', 'react-batching', 'render-purity'],
    source: 'https://react.dev/learn/queueing-a-series-of-state-updates',
  },
  {
    id: 'react-stable-list-key', part: 'react', level: 'foundation', kind: 'practical',
    topic: '목록 · Key',
    prompt: "각 상품의 id는 고유하고 바뀌지 않습니다. 정렬·삭제 이후에도 편집 중인 입력을 상품과 연결하려면 key의 빈칸에 무엇을 넣어야 하나요?",
    codeLanguage: "jsx", code: "export default function Products({ products }) {\n  return <ul>{products.map((product, index) => (\n    <li key={__BLANK__}>\n      <input defaultValue={product.name} />\n    </li>\n  ))}</ul>;\n}",
    choices: [{"id":"a","text":"index","explanation":"정렬이나 삭제 후 같은 index가 다른 상품을 가리켜 이전 행의 상태가 엉뚱한 상품에 연결될 수 있습니다."},{"id":"b","text":"Math.random()","explanation":"매번 key가 달라지면 행을 새로 만든 것으로 취급하여 입력 상태를 잃을 수 있습니다."},{"id":"c","text":"product.id","explanation":"안정적인 id는 위치가 바뀌어도 같은 상품 행을 식별하므로 상태를 올바른 항목에 연결합니다."},{"id":"d","text":"\"product\"","explanation":"같은 목록의 형제 요소에는 서로 다른 key가 필요합니다. 동일한 key는 항목을 구별할 수 없습니다."}],
    correctChoiceId: 'c',
    explanation: "key는 목록의 항목과 이전 UI를 대응시키는 식별자입니다. 이 조건에서는 DB id가 고유하고 안정적이므로 적합합니다. key는 일반 prop으로 자식에 전달되지 않으므로 자식이 상품 id를 읽어야 한다면 id도 별도 prop으로 넘깁니다.",
    relatedTermIds: ['key', 'react-list-rendering', 'state-identity'],
    source: 'https://react.dev/learn/rendering-lists',
  },
  {
    id: 'react-nested-state-copy', part: 'react', level: 'foundation', kind: 'practical',
    topic: '상태 불변성 · 중첩 객체',
    prompt: "버튼을 클릭하면 city만 서울로 바꾸려고 합니다. 기존 name과 address.street를 유지하고 원본을 변경하지 않는 빈칸의 코드는 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport default function Address() {\n  const [person, setPerson] = useState({\n    name: '민지', address: { city: '부산', street: '중앙로' },\n  });\n  return <>\n    <p>{person.name}: {person.address.city} {person.address.street}</p>\n    <button onClick={() => __BLANK__}>서울로 변경</button>\n  </>;\n}",
    choices: [{"id":"a","text":"person.address.city = \"서울\"","explanation":"기존 중첩 객체를 직접 변경하여 이전 상태와 같은 객체를 공유하는 값까지 바꿉니다."},{"id":"b","text":"setPerson({ ...person, address: { city: \"서울\" } })","explanation":"address를 city만 가진 새 객체로 교체하므로 기존 address.street가 사라집니다."},{"id":"c","text":"setPerson(prev => { prev.address.city = \"서울\"; return prev; })","explanation":"함수형 setter라도 prev를 직접 변경하고 같은 객체를 반환하면 불변 갱신이 아닙니다."},{"id":"d","text":"setPerson(prev => ({ ...prev, address: { ...prev.address, city: \"서울\" } }))","explanation":"변경되는 경로의 객체를 각각 복사하여 이전 값을 훼손하지 않고 다른 속성을 유지합니다."}],
    correctChoiceId: 'd',
    explanation: "객체 spread는 한 단계만 복사합니다. 중첩된 city를 바꾸려면 바깥 person과 안쪽 address를 새 객체로 만들고 나머지 속성을 각각 복사합니다. 실제 앱에서는 상태 구조를 평평하게 정리하여 깊은 복사를 줄이는 방법도 고려합니다.",
    relatedTermIds: ['react-state-immutability', 'shallow-copy', 'state-normalization'],
    source: 'https://react.dev/learn/updating-objects-in-state',
  },
  {
    id: 'react-controlled-text-input', part: 'react', level: 'foundation', kind: 'practical',
    topic: '폼 · Controlled Input',
    prompt: "아래 입력은 타이핑해도 name state가 갱신되지 않습니다. 입력값을 문자열 state로 제어하며 즉시 반영하려면 어떤 구성이 필요한가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport default function NameForm() {\n  const [name, setName] = useState('');\n  return <input value={name} />;\n}",
    choices: [{"id":"a","text":"문자열 state를 value에 연결하고 onChange에서 입력값으로 갱신한다","explanation":"React가 입력값의 기준을 소유하며 변경 이벤트 때 state를 갱신해 다음 값이 화면에 반영됩니다."},{"id":"b","text":"value만 전달하고 onChange는 생략한다","explanation":"변경 시 state가 갱신되지 않아 사용자가 수정할 수 있는 controlled 입력이 되지 않습니다."},{"id":"c","text":"defaultValue를 바꾸면 DOM 입력값도 매번 덮어써진다","explanation":"defaultValue는 uncontrolled 입력의 초기값입니다. 이후 값 관리 방식이 value와 다릅니다."},{"id":"d","text":"처음엔 undefined를 value로 주고 입력 후 문자열로 전환한다","explanation":"uncontrolled에서 controlled로 바뀌는 방식입니다. controlled 텍스트 입력은 처음부터 문자열 값을 유지합니다."}],
    correctChoiceId: 'a',
    explanation: "예를 들어 useState(\"\")로 시작하고 value={name}, onChange={e => setName(e.target.value)}를 연결합니다. input의 value를 직접 관리한다면 입력 이벤트에서 동기적으로 갱신해야 합니다. 체크박스의 제어 값은 문자열 value 대신 checked라는 점도 구별합니다.",
    relatedTermIds: ['controlled-input', 'uncontrolled-input', 'use-state'],
    source: 'https://react.dev/reference/react-dom/components/input',
  },
  {
    id: 'react-hook-before-return', part: 'react', level: 'foundation', kind: 'concept',
    topic: 'Hook 호출 규칙',
    prompt: "visible이 렌더 사이에 바뀔 수 있습니다. 아래 조기 return 코드를 고쳐 Hook 호출 순서를 유지하는 방법은 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport default function Toggle({ visible }) {\n  if (!visible) return null;\n  const [on, setOn] = useState(false);\n  return <button onClick={() => setOn(prev => !prev)}>\n    {on ? '켜짐' : '꺼짐'}\n  </button>;\n}",
    choices: [{"id":"a","text":"if (visible) 안에서만 useState를 호출한다","explanation":"visible이 바뀌면 렌더마다 호출하는 Hook 수와 순서가 달라져 일반 Hook 호출 규칙을 위반합니다."},{"id":"b","text":"useState를 최상위에서 호출한 뒤 if (!visible) return null을 둔다","explanation":"렌더마다 같은 위치에서 Hook을 호출한 뒤 표시 여부를 결정하므로 호출 순서가 유지됩니다."},{"id":"c","text":"클릭 이벤트 안에서 useState를 호출한다","explanation":"이벤트 핸들러는 컴포넌트 렌더나 커스텀 Hook 실행 문맥이 아니므로 useState를 호출할 수 없습니다."},{"id":"d","text":"목록을 map하면서 항목마다 useState를 호출한다","explanation":"반복문 속 Hook은 목록 길이에 따라 호출 수가 달라집니다. 항목별 상태는 자식 컴포넌트에서 관리합니다."}],
    correctChoiceId: 'b',
    explanation: "useState 같은 일반 Hook은 함수 컴포넌트나 커스텀 Hook의 최상위에서 호출합니다. 반복문·조건문·조기 return 뒤에 놓으면 렌더 간 순서를 유지할 수 없습니다. React의 use API에는 조건부 호출을 허용하는 별도 규칙이 있지만 useState에는 적용되지 않습니다.",
    relatedTermIds: ['rules-of-hooks', 'use-state', 'custom-hook'],
    source: 'https://react.dev/reference/rules/rules-of-hooks',
  },
  {
    id: 'react-shared-tab-state', part: 'react', level: 'practical', kind: 'practical',
    topic: '공유 상태 · 상태 끌어올리기',
    prompt: "아래에서 탭 버튼을 눌러도 Panel은 처음 탭을 계속 표시합니다. 두 컴포넌트가 같은 선택 상태를 사용하게 하려면 어떻게 바꾸는 것이 적절한가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nfunction Tabs() {\n  const [tab, setTab] = useState('js');\n  return <button onClick={() => setTab('react')}>{tab}</button>;\n}\nfunction Panel() {\n  const [tab] = useState('js');\n  return <p>{tab}</p>;\n}\nexport function Page() { return <><Tabs /><Panel /></>; }",
    choices: [
      { id: 'a', text: '각 컴포넌트에 selectedTab state를 따로 만들고 Effect로 서로 복사한다', explanation: "동일한 상태를 두 곳에 두면 갱신 타이밍이 달라져 불일치가 생기며 동기화 코드도 필요해집니다." },
      { id: 'b', text: '탭 버튼이 콘텐츠 패널의 DOM을 직접 교체한다', explanation: "React가 계산하는 패널의 입력과 DOM이 분리되어 상태 흐름을 추적하기 어려워집니다." },
      { id: 'c', text: '가장 가까운 공통 부모가 선택 상태를 갖고 값과 변경 콜백을 내려준다', explanation: "부모에 하나의 기준 값을 두면 버튼 선택과 콘텐츠 표시가 같은 상태를 읽을 수 있습니다." },
      { id: 'd', text: '두 자식의 state 변수 이름을 같게 하면 자동으로 공유된다', explanation: "변수 이름이 같아도 각 컴포넌트의 state는 독립적이며 자동으로 연결되지 않습니다." },
    ],
    correctChoiceId: 'c',
    explanation: "함께 변해야 하는 상태는 공통 부모로 끌어올리는 것이 기본적인 해법입니다. 부모의 selectedTab을 각 자식에 전달하고 버튼은 변경 콜백으로 선택을 요청합니다. 공유 범위가 넓어질 때 Context나 저장소를 검토할 수 있지만 이 작은 화면에 반드시 필요하지는 않습니다.",
    relatedTermIds: ['lifting-state-up', 'single-source-of-truth', 'props'],
    source: 'https://react.dev/learn/sharing-state-between-components',
  },
  {
    id: 'react-derived-filter-results', part: 'react', level: 'practical', kind: 'practical',
    topic: '파생 상태 · 검색 결과',
    prompt: "items와 query가 바뀔 때 현재 검색 결과를 표시하려고 합니다. 필터 비용은 작습니다. 별도 결과 상태나 동기화 없이 빈칸에 넣을 적절한 계산은 무엇인가요?",
    codeLanguage: "jsx", code: "export function SearchResults({ items, query }) {\n  const visible = __BLANK__;\n  return <ul>{visible.map(item =>\n    <li key={item.id}>{item.name}</li>\n  )}</ul>;\n}",
    choices: [{"id":"a","text":"filteredItems state를 새로 만들고 Effect에서 결과를 저장합니다.","explanation":"원본에서 계산 가능한 값을 별도 state로 저장하면 원본 변경 뒤 추가 갱신과 동기화가 필요해집니다."},{"id":"b","text":"처음 마운트한 결과만 ref에 보관해 사용합니다.","explanation":"items나 query가 바뀌어도 ref의 결과가 자동으로 다시 계산되지 않아 화면이 오래된 값을 표시합니다."},{"id":"c","text":"items에서 일치하지 않는 항목을 직접 삭제합니다.","explanation":"화면에 보여 줄 부분집합을 계산하려다 원본 데이터를 훼손하여 검색어를 지워도 복구하기 어렵습니다."},{"id":"d","text":"items.filter(item => item.name.includes(query))","explanation":"원본과 query를 기준으로 결과를 바로 계산하므로 별도의 결과 state와 동기화 Effect가 필요 없습니다."}],
    correctChoiceId: 'd',
    explanation: "필터 결과는 현재 items와 query에서 바로 계산할 수 있습니다. 렌더의 빈칸에 filter를 두면 입력 변화에 맞게 결과가 계산되며 별도 상태와 Effect로 결과를 복제할 필요가 없습니다.",
    relatedTermIds: ['derived-state', 'use-memo', 'effect-vs-event'],
    source: 'https://react.dev/learn/you-might-not-need-an-effect',
  },
  {
    id: 'react-ref-no-render', part: 'react', level: 'practical', kind: 'concept',
    topic: 'Ref와 화면 갱신',
    prompt: "초기 화면은 0이고 다른 state·props 갱신은 없습니다. 버튼을 한 번 누른 직후 화면 숫자는 무엇인가요?",
    codeLanguage: 'jsx',
    code: `import { useRef } from 'react';
function Counter() {
  const count = useRef(0);
  return <button onClick={() => {
    count.current += 1;
  }}>{count.current}</button>;
}`,
    choices: [
      { id: 'a', text: '0 그대로다', explanation: "ref.current를 바꿔도 React의 렌더를 요청하지 않으므로 이미 표시된 숫자는 바뀌지 않습니다." },
      { id: 'b', text: '1로 자동 갱신된다', explanation: "ref는 변경 가능한 값을 보관하지만 state setter처럼 화면 갱신을 요청하지 않습니다." },
      { id: 'c', text: '브라우저가 버튼 안의 참조를 감지해서 계속 증가한다', explanation: "DOM에 표시된 값은 렌더가 계산한 결과입니다. ref 객체의 변경을 DOM이 자동 구독하지 않습니다." },
      { id: 'd', text: 'ref.current는 읽기 전용이므로 오류가 난다', explanation: "이벤트 핸들러에서 ref.current를 변경할 수 있습니다. 문제는 그 변경만으로 렌더가 발생하지 않는다는 점입니다." },
    ],
    correctChoiceId: 'a',
    explanation: "ref는 타이머 ID나 DOM 참조처럼 화면에 직접 반영할 필요가 없는 값을 보관할 때 적합합니다. 이 예제의 ref 내부 값은 1이지만 화면은 0으로 남습니다. 숫자가 UI의 기준 값이라면 useState를 사용하며 렌더에서 ref.current에 의존하는 구조도 피합니다.",
    relatedTermIds: ['use-ref', 'ref-vs-state', 'use-state'],
    source: 'https://react.dev/learn/referencing-values-with-refs',
  },
  {
    id: 'react-effect-subscription-cleanup', part: 'react', level: 'practical', kind: 'practical',
    topic: 'Effect · 이벤트 구독 정리',
    prompt: "컴포넌트가 화면을 떠난 뒤 resize 이벤트에서 onResize가 실행되지 않게 하려 합니다. 빈칸에 넣을 정리 함수는 무엇인가요?",
    codeLanguage: 'jsx',
    code: `import { useEffect } from 'react';
function ResizeLogger() {
  useEffect(() => {
    const onResize = () => console.log(window.innerWidth);
    window.addEventListener('resize', onResize);
    // 이곳에서 정리 함수를 반환한다.
  }, []);
  return <p>화면 너비 기록</p>;
}`,
    choices: [
      { id: 'a', text: 'return () => window.removeEventListener("resize", () => {});', explanation: "등록했던 onResize와 다른 함수 참조를 전달하므로 해당 리스너를 제거하지 못합니다." },
      { id: 'b', text: 'return () => window.removeEventListener("resize", onResize);', explanation: "등록했던 이벤트 유형과 같은 콜백 참조로 해제하여 이 Effect의 구독을 정리합니다." },
      { id: 'c', text: 'return window.removeEventListener("resize", onResize);', explanation: "제거 함수를 즉시 호출해 구독을 바로 해제합니다. 이후 정리 시 실행할 함수를 반환하는 형태가 아닙니다." },
      { id: 'd', text: 'return () => window.addEventListener("resize", onResize);', explanation: "정리 시 구독을 제거하지 않고 등록하려 하므로 원래 리스너가 남습니다." },
    ],
    correctChoiceId: 'b',
    explanation: "Effect의 setup에서 만든 구독은 cleanup에서 해제합니다. React는 컴포넌트가 제거될 때뿐 아니라 의존성이 바뀌어 다시 setup하기 전에도 이전 cleanup을 실행합니다. 빈 의존성 배열을 쓰더라도 구독 해제를 생략할 근거가 되지는 않습니다.",
    relatedTermIds: ['effect-cleanup', 'use-effect', 'add-event-listener'],
    source: 'https://react.dev/learn/synchronizing-with-effects',
  },
  {
    id: 'react-effect-reactive-dependency', part: 'react', level: 'practical', kind: 'practical',
    topic: 'Effect 의존성',
    prompt: "createConnection은 모듈 최상위의 안정적인 함수입니다. roomId가 바뀌면 기존 방을 떠나 새 방에 연결해야 합니다. 의존성 배열은 무엇인가요?",
    codeLanguage: 'jsx',
    code: `import { useEffect } from 'react';
import { createConnection } from './chat';
function Chat({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect();
  }, /* 의존성 배열 */);
  return <p>{roomId}</p>;
}`,
    choices: [
      { id: 'a', text: '[]', explanation: "roomId가 바뀌어도 Effect가 다시 동기화되지 않아 이전 방의 연결이 남습니다." },
      { id: 'b', text: '[connection]', explanation: "connection은 Effect 내부에서 만들어진 지역 변수라서 바깥 의존성 배열에서 읽을 수 없습니다." },
      { id: 'c', text: '[roomId]', explanation: "Effect가 읽는 반응형 입력인 roomId를 포함하면 변경 시 이전 연결을 정리하고 새 연결을 만듭니다." },
      { id: 'd', text: '[roomId.length]', explanation: "같은 길이의 다른 방 이름으로 변경되면 배열 값이 같아 재연결하지 않습니다." },
    ],
    correctChoiceId: 'c',
    explanation: "의존성은 원하는 실행 횟수에 맞춰 임의로 고르는 값이 아니라 Effect가 읽는 반응형 값에 따라 정합니다. 여기서는 roomId가 props이며 모듈 최상위 함수는 렌더마다 새로 생기는 값이 아닙니다. roomId 변경 후 cleanup과 setup으로 외부 연결을 새 입력에 맞춥니다.",
    relatedTermIds: ['effect-dependencies', 'effect-cleanup', 'props'],
    source: 'https://react.dev/reference/react/useEffect',
  },
  {
    id: 'react-request-race-ignore', part: 'react', level: 'practical', kind: 'practical',
    topic: '비동기 요청 · 응답 경합',
    prompt: "loadResult는 query별 Promise를 반환하는 안정적인 함수입니다. A 요청 뒤 query가 B로 바뀌고 B 응답이 먼저 왔습니다. 이 코드의 ignore 정리가 막는 것은 무엇인가요?",
    codeLanguage: 'jsx',
    code: `import { useEffect, useState } from 'react';
import { loadResult } from './api';
function Search({ query }) {
  const [result, setResult] = useState('');
  useEffect(() => {
    let ignore = false;
    loadResult(query).then(value => {
      if (!ignore) setResult(value);
    });
    return () => { ignore = true; };
  }, [query]);
  return <p>{result}</p>;
}`,
    choices: [
      { id: 'a', text: '브라우저가 A의 HTTP 요청을 보내는 일 자체', explanation: "ignore는 결과 반영 조건입니다. 이미 시작한 HTTP 요청을 전송 전으로 되돌리거나 취소하지 않습니다." },
      { id: 'b', text: '서버가 A 요청을 처리하는 일', explanation: "클라이언트 지역 변수의 변경은 서버 작업 취소 신호가 아닙니다." },
      { id: 'c', text: 'B의 정상 응답이 setResult를 호출하는 일', explanation: "B Effect는 새 ignore 변수를 false로 시작합니다. A의 cleanup이 B의 지역 변수를 바꾸지 않습니다." },
      { id: 'd', text: '늦게 온 A 응답이 B의 결과를 덮어쓰는 일', explanation: "A Effect의 cleanup이 A 콜백이 읽는 ignore를 true로 바꿔 오래된 결과의 state 반영을 막습니다." },
    ],
    correctChoiceId: 'd',
    explanation: "각 Effect 실행은 별도의 ignore 변수를 가집니다. query가 바뀌면 이전 Effect를 정리하므로 이전 요청의 늦은 결과를 무시할 수 있습니다. 실제 요청 중단에는 AbortController 같은 별도 수단이 필요하며, 실무에서는 오류·로딩 상태와 캐시도 함께 처리합니다.",
    relatedTermIds: ['use-effect', 'effect-cleanup', 'abort-controller'],
    source: 'https://react.dev/reference/react/useEffect',
  },
  {
    id: 'react-memo-object-prop', part: 'react', level: 'practical', kind: 'concept',
    topic: 'Memo · 참조 동일성',
    prompt: "React Compiler를 쓰지 않습니다. 부모 count만 바뀌는데 memo가 Row의 렌더를 건너뛰지 못하는 직접 원인은 무엇인가요?",
    codeLanguage: 'jsx',
    code: `import { memo, useState } from 'react';
const Row = memo(function Row({ options }) {
  return <p>{options.theme}</p>;
});
function Parent() {
  const [count, setCount] = useState(0);
  return <>
    <button onClick={() => setCount(n => n + 1)}>{count}</button>
    <Row options={{ theme: 'light' }} />
  </>;
}`,
    choices: [
      { id: 'a', text: '부모 렌더마다 options 객체가 새 참조로 만들어진다', explanation: "기본 memo 비교는 각 prop을 Object.is로 비교합니다. 내용이 같아도 새 객체 참조는 다른 prop입니다." },
      { id: 'b', text: 'memo는 문자열을 가진 prop에는 적용되지 않는다', explanation: "prop 안에 문자열이 있다는 이유로 memo가 무효가 되지는 않습니다. 이 문제는 객체 참조의 변화입니다." },
      { id: 'c', text: 'memo가 객체의 모든 필드를 깊게 비교해서 같다며 렌더한다', explanation: "기본 동작은 자동 깊은 비교가 아닙니다. 각 prop의 참조 동일성을 기준으로 비교합니다." },
      { id: 'd', text: '함수 컴포넌트에는 memo를 사용할 수 없다', explanation: "memo는 함수 컴포넌트를 감싸 같은 props에서 렌더를 건너뛰는 최적화에 사용할 수 있습니다." },
    ],
    correctChoiceId: 'a',
    explanation: "options={{ theme: \"light\" }}는 Parent가 실행될 때마다 새 객체를 만듭니다. 단순 theme 문자열을 prop으로 전달하거나 적절히 참조를 안정화할 수 있습니다. memo는 정확성을 위한 필수 장치가 아니라 성능 최적화이므로 측정 없이 모든 컴포넌트에 붙이지 않습니다.",
    relatedTermIds: ['react-memo', 'use-memo', 'react-profiler'],
    source: 'https://react.dev/reference/react/memo',
  },
  {
    id: 'react-label-use-id', part: 'react', level: 'practical', kind: 'practical',
    topic: '입력 접근성 · useId',
    prompt: "EmailField를 같은 페이지에 여러 번 렌더하고 SSR도 사용합니다. input과 label에는 아래처럼 같은 id를 전달합니다. 중복을 피하고 서버·클라이언트 구조에서 안정적인 ID를 얻으려면 빈칸을 어떻게 채워야 하나요?",
    codeLanguage: "jsx", code: "import { useId } from 'react';\nexport function EmailField() {\n  const id = __BLANK__;\n  return <div>\n    <label htmlFor={id}>이메일</label>\n    <input id={id} name=\"email\" />\n  </div>;\n}",
    choices: [{"id":"a","text":"\"email\"을 모든 인스턴스에 반복해서 사용합니다.","explanation":"문서 안에서 같은 id를 반복하면 label이 의도한 입력과 일대일로 연결되지 않을 수 있습니다."},{"id":"b","text":"useId()","explanation":"동일 인스턴스의 두 요소를 연결하면서 여러 인스턴스의 ID 충돌을 피할 수 있습니다."},{"id":"c","text":"id와 htmlFor를 각각 Math.random()으로 만듭니다.","explanation":"서로 다른 값이 만들어져 연결이 깨질 수 있으며 서버 렌더와 hydration의 일관성도 보장되지 않습니다."},{"id":"d","text":"label을 제거하고 placeholder만 사용합니다.","explanation":"placeholder는 입력값이 있으면 사라지고 label을 대신하는 안정적인 접근성 이름으로 의존하면 안 됩니다."}],
    correctChoiceId: 'b',
    explanation: "useId로 만든 같은 id를 label의 htmlFor와 input의 id에 연결하면 입력의 의미를 보조 기술과 사용자에게 전달할 수 있습니다. 서버 렌더에도 맞는 접근성 ID를 만드는 용도입니다. 목록의 key는 데이터의 안정적인 ID를 사용하며 useId를 key 생성기로 쓰지 않습니다.",
    relatedTermIds: ['use-id', 'accessible-name', 'controlled-input'],
    source: 'https://react.dev/reference/react/useId',
  },
  {
    id: 'react-custom-hook-independent-state', part: 'react', level: 'practical', kind: 'concept',
    topic: '커스텀 Hook · 상태 재사용',
    prompt: "A와 B 컴포넌트가 아래 useToggle을 각각 한 번 호출했습니다. A에서만 toggle을 실행하면 B의 on 값은 무엇인가요?",
    codeLanguage: 'jsx',
    code: `import { useState } from 'react';
function useToggle() {
  const [on, setOn] = useState(false);
  return { on, toggle: () => setOn(value => !value) };
}`,
    choices: [
      { id: 'a', text: '함수 이름이 같으므로 A와 함께 true가 된다', explanation: "커스텀 Hook 함수가 같아도 호출한 각 컴포넌트의 상태는 별도로 만들어집니다." },
      { id: 'b', text: 'Hook이 전역 상태라서 마지막 호출 값으로 덮어써진다', explanation: "여기의 useState는 전역 저장소가 아니라 각 호출 위치에 연결된 React 상태입니다." },
      { id: 'c', text: 'false 그대로다', explanation: "커스텀 Hook은 로직을 재사용하며 A와 B의 useState 상태 자체를 자동 공유하지 않습니다." },
      { id: 'd', text: '같은 Hook을 두 컴포넌트에서 호출하면 오류가 난다', explanation: "각 컴포넌트의 최상위에서 같은 커스텀 Hook을 호출하는 것은 정상적인 사용입니다." },
    ],
    correctChoiceId: 'c',
    explanation: "커스텀 Hook으로 반복되는 상태 관리 로직을 추출할 수 있지만 useState 호출은 각 컴포넌트 인스턴스에 독립적으로 연결됩니다. 상태를 함께 바꾸려면 공통 부모에서 한 번 관리하거나 Context·외부 store 같은 공유 경로가 별도로 필요합니다.",
    relatedTermIds: ['custom-hook', 'use-state', 'lifting-state-up'],
    source: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
  },
  {
    id: 'react-reducer-purity', part: 'react', level: 'practical', kind: 'practical',
    topic: 'Reducer · 부수 효과',
    prompt: "add 액션의 item을 장바구니에 추가합니다. saveCart는 API 함수, setOtherCart는 다른 컴포넌트의 setter이며 둘 다 prop으로 전달됩니다. reducer가 순수하게 새 상태만 계산하도록 빈칸을 채우는 코드는 무엇인가요?",
    codeLanguage: "jsx", code: "import { useReducer } from 'react';\nexport function Cart({ saveCart, setOtherCart }) {\n  function reducer(state, action) {\n    if (action.type !== 'add') return state;\n    return __BLANK__;\n  }\n  const [cart, dispatch] = useReducer(reducer, []);\n  return <button onClick={() => dispatch({\n    type: 'add', item: { id: 1, name: '책' }\n  })}>담기 {cart.length}</button>;\n}",
    choices: [{"id":"a","text":"(saveCart(action.item), state.push(action.item), state)","explanation":"reducer는 렌더 계산 과정에서 실행될 수 있습니다. 외부 요청과 기존 상태 변경은 순수 계산이 아닙니다."},{"id":"b","text":"setOtherCart(state)","explanation":"다른 갱신을 시작하는 부수 효과를 섞으면 action에서 다음 상태를 계산하는 책임을 벗어납니다."},{"id":"c","text":"[...state, { ...action.item, id: Date.now() }]","explanation":"현재 시각을 reducer에서 읽으면 같은 상태와 action으로 같은 결과를 만드는 성질을 잃습니다. 필요한 ID는 action에 담아 전달합니다."},{"id":"d","text":"[...state, action.item]","explanation":"순수 reducer는 입력을 변경하지 않고 다음 상태를 반환하며 외부 요청은 이벤트나 필요한 동기화 코드에서 처리합니다."}],
    correctChoiceId: 'd',
    explanation: "reducer는 상태 전이 규칙을 한곳에서 계산하기 위한 함수입니다. 항목 ID 생성이나 저장 요청은 사용자 이벤트 등에서 수행하고 필요한 값을 action으로 넘깁니다. 개발 StrictMode에서 reducer가 추가 호출되어도 순수 계산이라면 잘못된 중복 요청이 발생하지 않습니다.",
    relatedTermIds: ['use-reducer', 'render-purity', 'react-state-immutability'],
    source: 'https://react.dev/reference/react/useReducer',
  },
  {
    id: 'react-render-side-effect', part: 'react', level: 'advanced', kind: 'practical',
    topic: '렌더 순수성 · 동시 렌더링',
    prompt: "아래 Payment는 함수 컴포넌트입니다. pay는 실제 결제 요청을 시작합니다. 이 코드를 렌더할 때 위험한 이유로 가장 적절한 것은 무엇인가요?",
    codeLanguage: "jsx", code: "import { pay } from \"./payment-api.js\";\nfunction Payment({ orderId }) {\n  pay(orderId);\n  return <button>결제</button>;\n}",
    choices: [
      { id: 'a', text: 'React는 렌더를 중단·재시도할 수 있어 실제 표시되지 않은 렌더에서도 요청이 나갈 수 있다', explanation: "렌더 실행 횟수와 사용자 행동·커밋 횟수는 같지 않습니다. 렌더에서 결제를 실행하면 재계산이 외부 변경을 만듭니다." },
      { id: 'b', text: '함수 컴포넌트는 어떤 이벤트에서도 네트워크 요청을 할 수 없다', explanation: "사용자의 결제 이벤트에서 요청을 수행할 수 있습니다. 문제는 요청을 렌더 계산에 넣었다는 점입니다." },
      { id: 'c', text: 'JSX를 반환하면 이전에 시작한 요청이 자동으로 취소된다', explanation: "JSX 반환은 이미 시작한 네트워크 요청을 취소하는 신호가 아닙니다." },
      { id: 'd', text: '프로덕션 렌더는 정확히 한 번만 실행되므로 개발에서만 위험하다', explanation: "프로덕션에서도 재렌더와 중단 가능한 렌더가 있습니다. 순수성은 개발 점검만을 위한 조건이 아닙니다." },
    ],
    correctChoiceId: 'a',
    explanation: "렌더는 같은 입력에서 UI를 계산하는 과정으로 유지합니다. 결제처럼 명시적인 사용자 행동은 이벤트 핸들러에서 실행하고 서버에서도 중복 처리 방지를 설계합니다. 외부 구독을 화면 상태에 맞추는 작업은 Effect가 적절할 수 있지만 결제 요청을 무조건 마운트 Effect로 옮기는 것이 해법은 아닙니다.",
    relatedTermIds: ['render-purity', 'concurrent-rendering', 'effect-vs-event'],
    source: 'https://react.dev/reference/rules/components-and-hooks-must-be-pure',
  },
  {
    id: 'react-transition-input-priority', part: 'react', level: 'advanced', kind: 'practical',
    topic: 'Transition · 입력 반응성',
    prompt: "아래 controlled 검색 input과 무거운 Results의 갱신을 함께 처리하고 있습니다. 입력이 즉시 따라오게 하면서 목록 렌더에 Transition을 적용하려면 어떤 수정이 적절한가요?",
    codeLanguage: "jsx", code: "import { useState, startTransition } from \"react\";\nimport { Results } from \"./Results.js\";\nfunction Search() {\n  const [text, setText] = useState(\"\");\n  const [query, setQuery] = useState(\"\");\n  function change(event) {\n    const next = event.target.value;\n    startTransition(() => { setText(next); setQuery(next); });\n  }\n  return <><input value={text} onChange={change} /><Results query={query} /></>;\n}",
    choices: [
      { id: 'a', text: 'input의 value를 관리하는 유일한 state 갱신을 Transition에 넣는다', explanation: "controlled 입력에 즉시 반영해야 하는 state 갱신은 Transition으로 처리하면 안 됩니다." },
      { id: 'b', text: '입력 문자열은 즉시 갱신하고, 목록이 쓰는 별도 상태를 Transition에서 갱신한다', explanation: "입력은 즉시 따라오고 무거운 UI의 갱신은 긴급하지 않은 렌더 작업으로 표시할 수 있습니다." },
      { id: 'c', text: 'startTransition으로 감싼 계산은 자동으로 Web Worker에서 실행된다', explanation: "Transition은 React 렌더 갱신의 우선순위를 다루며 JavaScript 계산을 다른 스레드로 옮기지 않습니다." },
      { id: 'd', text: 'Transition을 사용하면 API 요청 횟수도 자동으로 줄어든다', explanation: "렌더 갱신의 우선순위와 네트워크 요청 빈도 제어는 다른 문제입니다. 요청 감소가 필요하면 별도로 설계합니다." },
    ],
    correctChoiceId: 'b',
    explanation: "입력값을 관리하는 state는 입력 이벤트에서 즉시 갱신해야 합니다. 목록용 상태를 분리해 Transition으로 갱신하거나 useDeferredValue로 목록에 전달하는 값을 늦게 따라오게 만들 수 있습니다. 이미 이벤트 핸들러에서 오래 걸리는 동기 계산 자체는 Transition만으로 비동기화되지 않습니다.",
    relatedTermIds: ['use-transition', 'controlled-input', 'concurrent-rendering'],
    source: 'https://react.dev/reference/react/useTransition',
  },
  {
    id: 'react-deferred-not-debounce', part: 'react', level: 'advanced', kind: 'concept',
    topic: 'DeferredValue · 요청 빈도',
    prompt: "Results는 query가 바뀌면 해당 검색 결과를 표시하는 컴포넌트입니다. 아래 useDeferredValue만으로 보장되는 동작은 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState, useDeferredValue } from \"react\";\nimport { Results } from \"./Results.js\";\nfunction Search() {\n  const [query, setQuery] = useState(\"\");\n  const deferredQuery = useDeferredValue(query);\n  return <>\n    <input value={query} onChange={e => setQuery(e.target.value)} />\n    <Results query={deferredQuery} />\n  </>;\n}",
    choices: [
      { id: 'a', text: 'API 요청이 정확히 300ms에 한 번으로 제한된다', explanation: "useDeferredValue에는 고정 debounce 지연이 없으며 요청 빈도 제한을 보장하지 않습니다." },
      { id: 'b', text: 'query 변경 때 이전 HTTP 요청이 반드시 취소된다', explanation: "deferred 렌더는 HTTP 요청 취소 신호를 생성하지 않습니다. 요청 취소는 별도로 처리합니다." },
      { id: 'c', text: 'UI 일부가 이전 값을 유지한 채 새 값을 백그라운드 렌더로 따라올 수 있다', explanation: "값을 사용하는 UI의 갱신을 미루어 긴급한 입력을 우선하며 백그라운드 렌더는 중단될 수 있습니다." },
      { id: 'd', text: '백그라운드 렌더가 끝날 때까지 사용자 타이핑을 막는다', explanation: "목적은 입력 같은 긴급한 갱신을 우선 처리하는 것이며 타이핑을 잠그는 기능이 아닙니다." },
    ],
    correctChoiceId: 'c',
    explanation: "useDeferredValue는 데이터 요청을 줄이는 debounce가 아니라 UI 일부의 렌더를 뒤따라오게 하는 도구입니다. 요청 수 감소에는 debounce나 캐시 전략 등을 별도로 적용합니다. 작업량이 적으면 지연이 거의 보이지 않을 수도 있으며 항상 일정 시간 늦어지는 기능은 아닙니다.",
    relatedTermIds: ['use-deferred-value', 'debounce', 'concurrent-rendering'],
    source: 'https://react.dev/reference/react/useDeferredValue',
  },
  {
    id: 'react-external-store-snapshot-cache', part: 'react', level: 'advanced', kind: 'practical',
    topic: '외부 Store · Snapshot',
    prompt: "store.subscribe는 정상적으로 구독하고 해제 함수를 반환합니다. store.items가 그대로여도 아래 getSnapshot은 새 객체를 반환합니다. 적절한 수정은 무엇인가요?",
    codeLanguage: "jsx", code: "import { useSyncExternalStore } from \"react\";\nimport { store } from \"./store.js\";\nconst getSnapshot = () => ({ items: store.items });\nfunction List() {\n  const snapshot = useSyncExternalStore(store.subscribe, getSnapshot);\n  return <p>{snapshot.items.length}</p>;\n}",
    choices: [
      { id: 'a', text: '계속 새 객체를 반환하고 React가 깊은 비교로 걸러 주길 기대한다', explanation: "getSnapshot 결과는 Object.is로 비교됩니다. 매번 새 객체면 실제 저장소 변경이 없어도 다른 값으로 보입니다." },
      { id: 'b', text: '첫 객체를 영원히 반환하여 실제 저장소 변경도 숨긴다', explanation: "실제 변경이 생겼을 때는 새 스냅샷을 제공해야 구독자가 갱신됩니다. 영구 고정하면 UI가 오래된 값을 읽습니다." },
      { id: 'c', text: 'subscribe의 해제 함수를 없앤다', explanation: "스냅샷의 참조 문제를 해결하지 못하며 구독을 정리하지 않는 문제까지 추가합니다." },
      { id: 'd', text: '실제 변경이 없을 때 같은 불변 스냅샷을 반환하고 변경 시 새 스냅샷을 만든다', explanation: "변경 여부와 스냅샷 참조를 맞추어 불필요한 반복 갱신을 막고 실제 변경은 전달합니다." },
    ],
    correctChoiceId: 'd',
    explanation: "외부 저장소의 스냅샷은 변경되지 않은 동안 같은 값을 반환해야 합니다. 불변 데이터라면 저장된 객체 자체를 반환할 수 있고 가변 저장소라면 변경 버전별 불변 스냅샷을 캐시합니다. 새 객체를 매 호출마다 만들면 무한 갱신 오류가 발생할 수 있습니다.",
    relatedTermIds: ['use-sync-external-store', 'tearing', 'store-selector'],
    source: 'https://react.dev/reference/react/useSyncExternalStore',
  },
  {
    id: 'react-hydration-initial-match', part: 'react', level: 'advanced', kind: 'practical',
    topic: 'SSR · Hydration',
    prompt: "서버는 Clock으로 시각을 표시했고, 클라이언트 hydration의 Date.now()는 서버 렌더와 다른 값을 반환했습니다. 아래 코드의 초기 불일치를 해결하는 원칙은 무엇인가요?",
    codeLanguage: "jsx", code: "import { hydrateRoot } from \"react-dom/client\";\nfunction Clock() {\n  return <time>{Date.now()}</time>;\n}\nhydrateRoot(document.getElementById(\"root\"), <Clock />);",
    choices: [
      { id: 'a', text: '서버와 첫 클라이언트 렌더가 같은 데이터를 사용하게 하고 이후 클라이언트에서 갱신한다', explanation: "초기 출력 일치를 확보한 뒤 필요한 최신 시각 갱신을 처리하여 hydration의 전제를 지킵니다." },
      { id: 'b', text: '모든 요소에 suppressHydrationWarning을 붙여 문제를 숨긴다', explanation: "이 prop은 제한적인 탈출구이며 전체 데이터 불일치를 고치는 일반 해결책이 아닙니다." },
      { id: 'c', text: 'hydrateRoot가 모든 다른 속성을 항상 정확히 패치하므로 그대로 둔다', explanation: "React는 모든 속성 불일치가 패치될 것을 보장하지 않습니다. mismatch는 고쳐야 할 버그로 다룹니다." },
      { id: 'd', text: '첫 클라이언트 렌더를 Math.random()으로 만들어 서버와 우연히 맞춘다', explanation: "비결정적인 값을 추가하면 출력 일치 조건을 더 악화시킵니다." },
    ],
    correctChoiceId: 'a',
    explanation: "hydration은 서버에서 만들어진 UI에 클라이언트 React를 연결합니다. 같은 초기 데이터를 직렬화해 전달하거나 초기에는 동일한 자리표시자를 사용하고 마운트 후 갱신합니다. 시각뿐 아니라 브라우저 전용 조건·로케일 차이·잘못된 HTML 구조도 초기 불일치의 원인이 될 수 있습니다.",
    relatedTermIds: ['hydration', 'react-render', 'render-purity'],
    source: 'https://react.dev/reference/react-dom/client/hydrateRoot',
  },
  {
    id: 'react-error-boundary-click', part: 'react', level: 'advanced', kind: 'concept',
    topic: 'Error Boundary · 적용 범위',
    prompt: "ErrorBoundary는 하위 렌더 오류를 처리하는 정상적인 오류 경계입니다. 아래 일반 onClick 예외에는 Transition이 사용되지 않았습니다. 맞는 설명은 무엇인가요?",
    codeLanguage: "jsx", code: "import { ErrorBoundary } from \"./ErrorBoundary.js\";\nfunction App() {\n  return <ErrorBoundary fallback={<p>문제가 발생했습니다.</p>}>\n    <button onClick={() => { throw new Error(\"저장 실패\"); }}>저장</button>\n  </ErrorBoundary>;\n}",
    choices: [
      { id: 'a', text: '모든 이벤트 예외가 Error Boundary의 fallback으로 자동 전환된다', explanation: "Error Boundary는 일반 이벤트 핸들러의 예외를 자동으로 잡지 않습니다." },
      { id: 'b', text: '핸들러에서 try/catch 등으로 처리해야 하며 렌더 오류 처리와 구별한다', explanation: "이벤트 처리 중 오류는 해당 동작의 실패 상태를 처리하고 사용자에게 안내할 경로가 필요합니다." },
      { id: 'c', text: 'Error Boundary가 버튼 클릭 이벤트를 자동으로 다시 실행한다', explanation: "Error Boundary의 역할은 재클릭이나 요청 재시도 자동화가 아닙니다." },
      { id: 'd', text: '같은 오류를 하위 컴포넌트 렌더 중 던져도 Error Boundary가 잡지 못한다', explanation: "하위 렌더 오류에 fallback UI를 제공하는 것이 Error Boundary의 주요 사용 목적입니다." },
    ],
    correctChoiceId: 'b',
    explanation: "일반 이벤트 핸들러의 예외와 하위 트리의 렌더 오류는 처리 경로가 다릅니다. 저장 실패라면 이벤트 안에서 실패를 잡아 에러 메시지나 재시도 상태를 갱신합니다. 현재 React에는 useTransition의 startTransition 내부 오류 등 별도 예외가 있으므로 모든 비동기·이벤트 오류를 한 문장으로 일반화하지 않습니다.",
    relatedTermIds: ['error-boundary', 'react-event-handler', 'try-catch'],
    source: 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary',
  },
  {
    id: 'react-strict-mode-effect-cycle', part: 'react', level: 'advanced', kind: 'concept',
    topic: 'StrictMode · 개발 중 Effect 점검',
    prompt: "개발 모드에서 아래처럼 앱 루트를 StrictMode로 감쌌습니다. Chat의 최초 Effect가 setup → cleanup → setup을 거치는 이유는 무엇인가요?",
    codeLanguage: "jsx", code: "import { StrictMode, useEffect } from \"react\";\nimport { createRoot } from \"react-dom/client\";\nimport { openConnection } from \"./connection.js\";\nfunction Chat() {\n  useEffect(() => {\n    const connection = openConnection();\n    return () => connection.close();\n  }, []);\n  return <p>연결 상태</p>;\n}\ncreateRoot(document.getElementById(\"root\")).render(<StrictMode><Chat /></StrictMode>);",
    choices: [
      { id: 'a', text: '프로덕션에서도 모든 클릭과 요청을 정확히 두 번 실행하기 위해서', explanation: "개발 점검을 프로덕션의 이벤트 실행 횟수 규칙으로 해석하면 안 됩니다." },
      { id: 'b', text: 'React가 useEffect를 지원하지 않아 다른 Hook으로 바꾸라는 뜻이다', explanation: "Effect 자체가 잘못됐다는 뜻이 아닙니다. 외부 동기화의 setup과 cleanup 대칭을 점검합니다." },
      { id: 'c', text: '정리 로직이 setup의 작업을 되돌리는지 추가로 점검하기 위해서', explanation: "개발에서 추가 setup·cleanup 주기를 실행하여 구독 누수와 정리 누락 같은 문제를 드러냅니다." },
      { id: 'd', text: '의존성 배열이 비었으면 cleanup을 생략해도 된다는 뜻이다', explanation: "빈 배열이어도 컴포넌트 제거 시 자원을 정리해야 합니다. 추가 주기는 오히려 정리 누락을 찾습니다." },
    ],
    correctChoiceId: 'c',
    explanation: "루트 StrictMode의 개발 점검은 외부 연결·구독이 정상적으로 정리되고 다시 만들어질 수 있는지 확인합니다. ref 플래그로 두 번째 setup만 막는 방식은 실제 정리 누락을 숨길 수 있습니다. 프로덕션에는 이 개발용 추가 주기가 적용되지 않으며 StrictMode 범위에 따라 점검 동작의 조건도 구별해야 합니다.",
    relatedTermIds: ['strict-mode', 'effect-cleanup', 'use-effect'],
    source: 'https://react.dev/reference/react/StrictMode',
  },
  {
    id: 'react-context-memo-consumer', part: 'react', level: 'advanced', kind: 'concept',
    topic: 'Context · Memo 소비자',
    prompt: "App의 theme prop이 light에서 dark로 바뀌었습니다. ThemeButton에는 별도 props가 없습니다. 아래 memo 소비자의 동작으로 맞는 설명은 무엇인가요?",
    codeLanguage: "jsx", code: "import { createContext, useContext, memo } from \"react\";\nconst ThemeContext = createContext(\"light\");\nconst ThemeButton = memo(function ThemeButton() {\n  const theme = useContext(ThemeContext);\n  return <button>{theme}</button>;\n});\nfunction App({ theme }) {\n  return <ThemeContext value={theme}><ThemeButton /></ThemeContext>;\n}",
    choices: [
      { id: 'a', text: 'memo가 모든 갱신을 막아 계속 light를 읽는다', explanation: "memo는 같은 props의 렌더 최적화이며 소비하는 Context 값 변경을 차단하지 않습니다." },
      { id: 'b', text: 'Context를 읽는 컴포넌트는 memo로 감쌀 수 없어 오류가 난다', explanation: "두 API를 함께 사용할 수 있습니다. 다만 Context 변경을 props 비교만으로 막지는 못합니다." },
      { id: 'c', text: 'Context는 처음 읽은 값을 고정하므로 remount해야 dark를 읽는다', explanation: "useContext는 상위 Provider 값을 구독하며 이후 변경에도 최신 값을 읽습니다." },
      { id: 'd', text: 'Context 변경에 따라 ThemeButton도 새 값 dark를 읽으며 갱신된다', explanation: "소비하는 Context 값이 바뀌면 React가 소비자에 새 값을 전달합니다. 동일 props만으로 이 갱신을 생략하지 않습니다." },
    ],
    correctChoiceId: 'd',
    explanation: "memo를 붙였더라도 컴포넌트 자신의 state나 소비하는 Context는 갱신 원인이 될 수 있습니다. Provider에 객체를 전달한다면 매 렌더의 새 참조도 소비자 갱신을 유발할 수 있으므로 값 구조와 참조를 검토합니다. Context는 정확성을 위해 최신 값을 전달하며 최적화는 그 위에서 설계합니다.",
    relatedTermIds: ['use-context', 'context-value-identity', 'react-memo'],
    source: 'https://react.dev/reference/react/useContext',
  },
  {
    id: 'react-key-reset-draft', part: 'react', level: 'advanced', kind: 'practical',
    topic: '상태 정체성 · Form 리셋',
    prompt: "문서를 바꿀 때 Editor의 지역 초안을 새로 초기화하려고 합니다. 빈칸에 넣을 값과 그 동작 설명의 조합으로 적절한 것은 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState } from \"react\";\nfunction Editor({ documentId }) {\n  const [draft, setDraft] = useState(\"\");\n  return <input value={draft} onChange={e => setDraft(e.target.value)} />;\n}\nfunction Page({ documentId }) {\n  return <Editor key={__BLANK__} documentId={documentId} />;\n}",
    choices: [{"id":"a","text":"documentId — 문서 ID가 바뀌면 Editor를 다른 인스턴스로 취급하여 초안을 새로 만듭니다.","explanation":"같은 위치·타입이어도 key가 바뀌면 이전 하위 상태를 이어받지 않습니다."},{"id":"b","text":"documentId — Editor가 key를 일반 prop으로 읽어 기존 초안의 문서 이름만 바꿉니다.","explanation":"key는 일반 prop으로 전달되지 않으며 상태의 정체성 판단에 사용됩니다."},{"id":"c","text":"documentId — React가 이전 초안을 서버에 자동 저장한 뒤 초기화합니다.","explanation":"key 변경은 상태 초기화에 영향을 주지만 서버 저장 기능을 자동 제공하지 않습니다."},{"id":"d","text":"documentId — 같은 컴포넌트 타입이므로 문서가 바뀌어도 초안은 항상 유지됩니다.","explanation":"상태 보존은 타입뿐 아니라 위치와 key에 영향을 받으므로 이 설명은 틀립니다."}],
    correctChoiceId: 'a',
    explanation: "문서마다 독립적인 편집 상태가 필요하면 문서 ID를 key로 사용하여 상태 경계를 분명하게 만들 수 있습니다. 단, 하위 입력과 포커스도 새로 생성되고 저장하지 않은 초안이 사라질 수 있으므로 UX 요구를 함께 검토합니다. 매 렌더에 무작위 key를 만드는 것은 이런 의도적인 전환과 다릅니다.",
    relatedTermIds: ['state-identity', 'key', 'controlled-input'],
    source: 'https://react.dev/learn/preserving-and-resetting-state',
  },
  {
    id: 'react-suspense-effect-fetch', part: 'react', level: 'advanced', kind: 'concept',
    topic: 'Suspense · 데이터 로딩',
    prompt: "아래 fetch는 성공한다고 가정하며, 다른 suspend 원인은 없습니다. useEffect로 데이터를 받는 List를 Suspense로 감싸면 이 요청 동안 fallback이 자동 표시되나요?",
    codeLanguage: "jsx", code: "import { useEffect, useState, Suspense } from \"react\";\nfunction List() {\n  const [items, setItems] = useState(null);\n  useEffect(() => {\n    let active = true;\n    fetch(\"/api/items\").then(r => r.json()).then(data => {\n      if (active) setItems(data);\n    });\n    return () => { active = false; };\n  }, []);\n  return items ? <p>{items.length}개</p> : <p>준비 중</p>;\n}\nfunction App() {\n  return <Suspense fallback={<p>로딩 중</p>}><List /></Suspense>;\n}",
    choices: [
      { id: 'a', text: '그렇다. 모든 fetch Promise는 자동으로 상위 Suspense에 등록된다', explanation: "일반 Effect 안에서 시작한 fetch는 렌더에서 기다리는 Suspense 자원으로 자동 등록되지 않습니다." },
      { id: 'b', text: '아니다. Effect의 일반 fetch는 자동 감지되지 않으므로 별도 로딩 UI나 Suspense를 지원하는 데이터 경로가 필요하다', explanation: "Suspense는 지원하는 자원 읽기나 lazy 컴포넌트처럼 실제로 suspend하는 렌더를 처리합니다." },
      { id: 'c', text: 'fetch가 끝나지 않아도 fallback이 영원히 표시되며 컴포넌트는 렌더되지 않는다', explanation: "이 컴포넌트는 정상적으로 초기 UI를 반환하므로 일반 Effect fetch만으로 영구 suspend하지 않습니다." },
      { id: 'd', text: 'Suspense는 CSS 로딩에만 쓰이며 React 컴포넌트에는 쓸 수 없다', explanation: "컴포넌트 코드 lazy 로딩과 Suspense를 지원하는 자원 읽기에도 사용할 수 있습니다." },
    ],
    correctChoiceId: 'b',
    explanation: "Suspense 경계는 하위 렌더가 지원하는 방식으로 준비되지 않았음을 알릴 때 fallback을 표시합니다. Effect에서 fetch한 결과를 state에 넣는 전통적인 방식은 로딩·오류 상태를 직접 관리해야 합니다. React 19의 use로 Promise를 읽는 방식도 지원하지만 Promise 수명과 캐시를 올바르게 관리하는 데이터 경로가 필요합니다.",
    relatedTermIds: ['suspense', 'use-effect', 'react-use-resource'],
    source: 'https://react.dev/reference/react/Suspense',
  },
];
