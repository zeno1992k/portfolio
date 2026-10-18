import type { QuizChoice, QuizQuestion, QuizLevel } from './types';
import { reactAdvancedExtraQuizzes } from './react-extra-advanced';

type Pair = [text: string, explanation: string];
type Draft = Omit<QuizQuestion, 'part' | 'level' | 'choices' | 'correctChoiceId'> & {
  correct: Pair;
  wrong: [Pair, Pair, Pair];
};

/** Drafts identify the correct answer explicitly; rotate its displayed position. */
function build(drafts: Draft[], level: QuizLevel): QuizQuestion[] {
  return drafts.map(({ correct, wrong, ...draft }, index) => {
    const correctIndex = index % 4;
    const ordered = [...wrong];
    ordered.splice(correctIndex, 0, correct);
    const choices = ordered.map(([text, explanation], i) => ({
      id: (['a', 'b', 'c', 'd'] as const)[i], text, explanation,
    })) as [QuizChoice, QuizChoice, QuizChoice, QuizChoice];
    return { ...draft, part: 'react', level, choices, correctChoiceId: choices[correctIndex].id };
  });
}

const foundation: Draft[] = [
  {
    id: 'react-extra-capital-component', kind: 'concept', topic: '컴포넌트 이름',
    prompt: "선언된 Profile 함수를 React 컴포넌트로 렌더하려고 합니다. return의 빈칸에 넣을 JSX는 무엇인가요?",
    codeLanguage: "jsx", code: "function Profile() {\n  return <p>프로필</p>;\n}\nexport default function App() {\n  return __BLANK__;\n}",
    correct: ["<Profile />","대문자로 시작한 이름은 JSX에서 해당 컴포넌트 변수를 가리킵니다."],
    wrong: [["<profile />","소문자로 시작하면 함수 Profile이 아니라 문자열 태그 이름으로 해석됩니다."],["<\"Profile\" />","태그 이름을 문자열 리터럴 문법으로 쓰는 JSX는 유효하지 않습니다."],["<profile function={Profile} />","function prop을 전달한다고 소문자 태그가 Profile 컴포넌트로 바뀌지 않습니다."]],
    explanation: "JSX는 내장 태그와 사용자 컴포넌트를 이름으로 구별합니다. 사용자 컴포넌트는 대문자로 시작하고 JSX에서 함수 변수로 참조합니다.",
    relatedTermIds: ['jsx', 'react-component'], source: 'https://react.dev/learn/your-first-component',
  },
  {
    id: 'react-extra-component-invocation', kind: 'concept', topic: 'React가 컴포넌트 호출',
    prompt: "profiles의 각 id는 고유합니다. Hook을 사용하는 Profile을 일반 함수로 직접 호출하지 않고 React가 렌더하게 하려면 빈칸에 무엇을 넣어야 하나요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nfunction Profile({ user }) {\n  const [draft, setDraft] = useState(user.name);\n  return <li><input value={draft}\n    onChange={event => setDraft(event.target.value)} /></li>;\n}\nexport default function Profiles({ profiles }) {\n  return <ul>{__BLANK__}</ul>;\n}",
    correct: ["profiles.map(p => <Profile key={p.id} user={p} />)","JSX로 구성하면 각 Profile을 React가 별도 컴포넌트로 렌더하고 상태를 관리합니다."],
    wrong: [["profiles.map(p => Profile({ user: p }))","직접 호출은 React의 컴포넌트 경계를 우회하며 Hook 호출 순서도 목록 변화에 영향을 받습니다."],["Profile.call(null, profiles)","call로 실행해도 React가 관리하는 컴포넌트 경계가 만들어지는 것은 아닙니다."],["profiles.map(p => new Profile(p))","함수 컴포넌트는 개발자가 new로 UI 인스턴스를 만드는 방식이 아닙니다."]],
    explanation: "컴포넌트 함수를 직접 실행하지 않고 JSX로 React에게 렌더를 맡깁니다. 이 방식은 상태의 정체성과 Hook 실행을 컴포넌트 경계에 연결합니다.",
    relatedTermIds: ['react-component', 'rules-of-hooks'], source: 'https://react.dev/reference/rules/react-calls-components-and-hooks',
  },
  {
    id: 'react-extra-return-null-state', kind: 'concept', topic: '숨김과 제거',
    prompt: "Child의 숫자를 바꾼 뒤 표시 전환 버튼으로 숨겼다가 다시 표시합니다. 부모 트리에서 Child와 key가 유지되는 아래 코드의 count state는 어떻게 되나요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nfunction Child({ visible }) {\n  const [count, setCount] = useState(0);\n  if (!visible) return null;\n  return <button onClick={() => setCount(prev => prev + 1)}>{count}</button>;\n}\nexport default function App() {\n  const [visible, setVisible] = useState(true);\n  return <>\n    <button onClick={() => setVisible(prev => !prev)}>표시 전환</button>\n    <Child key=\"counter\" visible={visible} />\n  </>;\n}",
    correct: ["컴포넌트가 유지되는 동안 보존된다","null은 출력이 없다는 뜻이며 부모 트리에서 컴포넌트 자체를 제거한 것과 다릅니다."],
    wrong: [["매번 초기화된다","표시할 DOM이 없다는 이유만으로 컴포넌트의 상태가 제거되지는 않습니다."],["전역 state로 옮겨진다","return null은 상태 소유권을 다른 저장소로 옮기는 동작이 아닙니다."],["useState 호출이 자동 취소된다","렌더에서 이미 호출한 Hook이 null 반환 때문에 취소되는 것은 아닙니다."]],
    explanation: "상태는 화면의 DOM 개수보다 React 트리의 컴포넌트 정체성과 관련됩니다. 부모가 Child를 조건부로 제거하면 상태가 사라지지만 Child가 null을 반환하는 경우와는 구별합니다.",
    relatedTermIds: ['conditional-rendering', 'state-identity'], source: 'https://react.dev/learn/preserving-and-resetting-state',
  },
  {
    id: 'react-extra-children-slot', kind: 'concept', topic: 'children 슬롯',
    prompt: "App이 Panel 태그 사이에 전달한 설명을 section 안에 표시하려고 합니다. props의 빈칸에 넣을 이름은 무엇인가요?",
    codeLanguage: "jsx", code: "function Panel(props) {\n  return <section>{props.__BLANK__}</section>;\n}\nexport default function App() {\n  return <Panel><p>설명</p></Panel>;\n}",
    correct: ["children","컴포넌트 태그 사이에 중첩한 JSX는 children prop으로 전달됩니다."],
    wrong: [["content","content는 직접 정한 prop 이름이며 JSX 중첩만으로 자동 생성되지 않습니다."],["innerHTML","중첩한 JSX는 React 노드이며 기본적으로 HTML 문자열로 바뀌어 전달되지 않습니다."],["key","key는 항목의 정체성에 쓰이며 중첩한 표시 내용의 prop이 아닙니다."]],
    explanation: "children을 사용하면 Panel이 공통 테두리나 레이아웃을 맡고 호출자가 내용을 구성할 수 있습니다. 전달된 내용을 문자열로 다시 만들 필요 없이 JSX 안에서 표시합니다.",
    relatedTermIds: ['props', 'component-boundary'], source: 'https://react.dev/learn/passing-props-to-a-component',
  },
  {
    id: 'react-extra-prop-default-null', kind: 'concept', topic: 'Props 기본값',
    prompt: "아래 App에서 Badge를 렌더합니다. 매개변수 기본값이 있는 Badge 안의 count 값은 무엇인가요?",
    codeLanguage: "jsx", code: "function Badge({ count = 5 }) {\n  return <span>{count}</span>;\n}\nexport default function App() {\n  return <Badge count={null} />;\n}",
    correct: ["null","구조 분해의 기본값은 누락되거나 undefined인 경우에만 적용됩니다."],
    wrong: [["5","null은 명시적으로 전달한 값이므로 구조 분해 기본값을 사용하지 않습니다."],["0","React가 null prop을 자동으로 숫자 0으로 바꾸지는 않습니다."],["문자열 \"null\"","JSX의 중괄호로 전달한 null은 문자열 리터럴이 아닙니다."]],
    explanation: "기본값은 모든 비어 보이는 값에 적용되는 규칙이 아닙니다. null까지 기본 숫자로 처리하려면 별도로 nullish 조건을 설계합니다.",
    relatedTermIds: ['props', 'destructuring', 'nullish-coalescing'], source: 'https://react.dev/learn/passing-props-to-a-component',
  },
  {
    id: 'react-extra-jsx-expression-prop', kind: 'concept', topic: 'JSX 표현식 전달',
    prompt: "App에는 title 변수도 있지만 JSX 속성에는 따옴표를 사용했습니다. Card가 받는 title 값은 무엇인가요?",
    codeLanguage: "jsx", code: "function Card({ title }) {\n  return <h2>{title}</h2>;\n}\nexport default function App() {\n  const title = 'React';\n  return <Card title=\"title\" />;\n}",
    correct: ["문자열 \"title\"","따옴표 속 값은 변수 참조가 아니라 그대로 전달하는 문자열입니다."],
    wrong: [["문자열 \"React\"","변수 title 값을 넘기려면 title={title}처럼 중괄호를 사용해야 합니다."],["undefined","문자열 리터럴을 명시적으로 전달했으므로 값이 없는 prop이 아닙니다."],["함수 title","문자열 prop 전달이 같은 이름의 함수를 찾는 동작은 아닙니다."]],
    explanation: "JSX 따옴표는 정적인 문자열을 전달합니다. JavaScript 변수나 계산 결과를 prop으로 넘기려면 중괄호 안에 표현식을 씁니다.",
    relatedTermIds: ['jsx', 'props'], source: 'https://react.dev/learn/javascript-in-jsx-with-curly-braces',
  },
  {
    id: 'react-extra-text-html-escape', kind: 'practical', topic: '문자열 출력과 HTML',
    prompt: "text가 \"<b>React</b>\"일 때 <p>{text}</p>는 어떻게 표시되나요?",
    codeLanguage: 'jsx', code: `function Message() {
  const text = '<b>React</b>';
  return <p>{text}</p>;
}`,
    correct: ['태그 문자까지 포함한 텍스트로 표시한다', "일반 문자열 자식은 HTML로 파싱되지 않으므로 b 요소가 생성되지 않습니다."],
    wrong: [['React가 굵게 표시된다', "HTML 문자열을 실제 마크업으로 삽입하는 별도 API를 사용한 상황이 아닙니다."], ['문자열이 코드로 실행된다', "중괄호는 변수 값을 읽지만 그 문자열 내용을 JavaScript 코드로 실행하지 않습니다."], ['문자열 자식을 받을 수 없어 오류가 난다', "문자열은 정상적인 React 자식 노드로 표시할 수 있습니다."]],
    explanation: "사용자 문자열은 일반 텍스트로 표시하는 것이 기본 경로입니다. HTML 삽입이 필요하면 별도 API의 보안 조건을 검토하고 신뢰하지 않는 내용을 그대로 넣지 않습니다.",
    relatedTermIds: ['jsx', 'xss', 'output-encoding'], source: 'https://react.dev/reference/react-dom/components/common',
  },
  {
    id: 'react-extra-class-name', kind: 'concept', topic: 'DOM 속성 이름',
    prompt: "JSX에서 기존 CSS 클래스인 card를 div에 연결하는 React prop은 무엇인가요?",
    correct: ['className="card"', "React DOM의 CSS 클래스 연결에 사용하는 prop 이름은 className입니다."],
    wrong: [['cssClass="card"', "내장 div에서 cssClass는 표준 클래스 연결 prop이 아닙니다."], ['style="card"', "style은 클래스 문자열이 아니라 인라인 스타일 객체를 전달하는 prop입니다."], ['classList="card"', "classList는 DOM에서 사용하는 객체 이름이며 JSX 클래스 prop을 대신하지 않습니다."]],
    explanation: "내장 DOM 태그의 클래스는 className에 문자열로 지정합니다. CSS Module을 사용해도 최종 클래스 문자열을 className으로 전달하는 점은 같습니다.",
    relatedTermIds: ['jsx', 'css-modules'], source: 'https://react.dev/reference/react-dom/components/common',
  },
  {
    id: 'react-extra-style-object', kind: 'concept', topic: '인라인 Style 객체',
    prompt: "red라는 변수는 선언하지 않았습니다. 빈칸에 넣어 배경색을 red로 지정할 수 있는 유효한 JSX 속성은 무엇인가요?",
    codeLanguage: "jsx", code: "export default function Preview() {\n  return <div __BLANK__>미리보기</div>;\n}",
    correct: ["style={{ backgroundColor: \"red\" }}","바깥 중괄호는 JSX 표현식, 안쪽 중괄호는 camelCase 속성을 가진 객체입니다."],
    wrong: [["style=\"background-color: red\"","React의 style prop은 CSS 선언 문자열 대신 객체를 받습니다."],["style={{ backgroundColor: red }}","red가 선언된 변수가 아니라면 참조 오류가 납니다. 색상 문자열은 따옴표가 필요합니다."],["style={{ background: { color: \"red\" } }}","일반 CSS 속성값은 이런 중첩 객체 구조로 지정하지 않습니다."]],
    explanation: "React style 객체에서는 backgroundColor 같은 camelCase 키를 사용합니다. 반복되는 디자인 규칙은 클래스와 디자인 토큰으로 관리하는 편이 유지보수에 유리할 수 있습니다.",
    relatedTermIds: ['jsx', 'css-modules'], source: 'https://react.dev/learn/javascript-in-jsx-with-curly-braces',
  },
  {
    id: 'react-extra-aria-spelling', kind: 'concept', topic: 'ARIA 속성 표기',
    prompt: "아이콘만 있는 닫기 버튼에 접근성 이름을 지정하는 JSX 속성 표기는 무엇인가요?",
    correct: ['aria-label="닫기"', "aria-* 속성은 JSX에서도 HTML처럼 하이픈을 유지합니다."],
    wrong: [['ariaLabel="닫기"', "ARIA 속성은 일반 React DOM camelCase 변환의 예외입니다."], ['label="닫기"', "button의 label 속성만으로 접근성 이름을 전달하는 표준 경로가 되지 않습니다."], ['data-label="닫기"', "data-*는 임의 데이터를 보관하지만 접근성 이름을 자동 생성하지 않습니다."]],
    explanation: "aria-label은 아이콘 버튼의 기능을 보조 기술에 알려 줄 수 있습니다. 눈에 보이는 텍스트가 있다면 그 의미와 접근성 이름을 일치시키고 아이콘 자체의 장식 정보를 중복 읽게 만들지 않습니다.",
    relatedTermIds: ['accessible-name', 'aria'], source: 'https://react.dev/learn/writing-markup-with-jsx',
  },
  {
    id: 'react-extra-map-return', kind: 'concept', topic: '목록 map 반환',
    prompt: "items.map(item => { <li key={item.id}>{item.name}</li>; })가 목록을 표시하지 않는 이유는 무엇인가요?",
    codeLanguage: 'jsx', code: `function List({ items }) {
  return <ul>{items.map(item => {
    <li key={item.id}>{item.name}</li>;
  })}</ul>;
}`,
    correct: ['블록 본문에서 JSX를 return하지 않았다', "화살표 함수의 중괄호 블록은 자동 반환하지 않아 각 항목의 결과가 undefined입니다."],
    wrong: [['li에는 key를 사용할 수 없다', "목록의 li에도 key를 지정할 수 있으며 여기의 key는 문제가 아닙니다."], ['map은 React에서 금지되어 있다', "map은 목록 UI를 만드는 일반적인 패턴입니다."], ['item.name을 prop으로만 전달해야 한다', "문자열 값을 JSX 자식으로 표시할 수 있습니다."]],
    explanation: "블록 본문에는 return <li ...>...</li>가 필요합니다. 간단한 표현식이라면 item => (<li ...>...</li>)로 암시적으로 반환할 수 있습니다.",
    relatedTermIds: ['array-map', 'react-list-rendering'], source: 'https://react.dev/learn/rendering-lists',
  },
  {
    id: 'react-extra-key-outer-node', kind: 'practical', topic: '목록의 바깥 Key',
    prompt: "아래 map이 직접 반환하는 요소에는 key가 없습니다. 목록 항목의 정체성을 유지하려면 key를 어느 위치에 지정해야 하나요?",
    codeLanguage: "jsx", code: "function Row({ item }) {\n  return <input defaultValue={item.name} />;\n}\nexport default function Rows({ items }) {\n  return <section>{items.map(item => (\n    <div><Row key={item.id} item={item} /></div>\n  ))}</section>;\n}",
    correct: ["map이 직접 반환하는 div에 지정한다","형제 목록을 구성하는 바깥 요소가 key를 가져야 React가 항목 경계를 구별합니다."],
    wrong: [["Row에만 지정하면 충분하다","Row의 key는 각 div 내부의 관계이며 바깥 div 목록의 식별자를 대신하지 못합니다."],["div의 모든 자식에 같은 key를 복사한다","필요한 목록 경계에 key를 두는 문제이지 모든 자식에 복사하는 문제가 아닙니다."],["key를 CSS className으로 옮긴다","CSS 클래스는 React 목록 식별자와 다른 기능입니다."]],
    explanation: "key는 해당 목록에서 React가 직접 비교하는 형제 요소에 둡니다. 한 항목에서 여러 요소를 반환한다면 이름 있는 Fragment에 key를 줄 수 있습니다.",
    relatedTermIds: ['key', 'react-list-rendering', 'jsx'], source: 'https://react.dev/learn/rendering-lists',
  },
  {
    id: 'react-extra-key-local-scope', kind: 'concept', topic: 'Key 유일성 범위',
    prompt: "서로 다른 두 목록에 id가 \"1\"인 항목이 각각 있습니다. 각 목록 내부 id는 모두 다릅니다. key=\"1\"을 양쪽에 사용할 수 있나요?",
    correct: ['사용할 수 있다. 각 형제 목록 안에서 유일하면 된다', "key는 전체 사이트의 전역 식별자가 아니라 해당 형제 목록에서 항목을 구분합니다."],
    wrong: [['사이트 전체에서 key는 절대 중복되면 안 된다', "서로 다른 부모 아래의 독립된 목록까지 전역 key 유일성을 요구하지 않습니다."], ['key가 숫자가 아니므로 사용할 수 없다', "문자열 key를 정상적으로 사용할 수 있습니다."], ['같은 key면 두 목록이 자동 병합된다', "key가 같아도 다른 부모의 목록이 자동으로 하나가 되지 않습니다."]],
    explanation: "목록의 key는 형제끼리 고유해야 하며 데이터 생명주기 동안 안정적으로 유지합니다. 서로 다른 목록에 같은 ID가 있어도 같은 형제 관계가 아니면 충돌로 보지 않습니다.",
    relatedTermIds: ['key', 'reconciliation'], source: 'https://react.dev/learn/rendering-lists',
  },
  {
    id: 'react-extra-custom-event-prop', kind: 'practical', topic: '도메인 이벤트 Prop',
    prompt: "Toolbar가 호출자의 저장 동작을 받게 하려 합니다. 사용자 컴포넌트의 onSave prop에 관한 설명은 무엇인가요?",
    correct: ['Toolbar가 내부 버튼 이벤트에서 onSave를 호출하도록 구현해야 한다', "사용자 컴포넌트의 prop은 계약이며 React가 이름만 보고 자동 이벤트 연결을 하지 않습니다."],
    wrong: [['onSave라는 이름이면 모든 자식 버튼에 자동 연결된다', "내장 DOM 이벤트와 사용자 컴포넌트의 임의 콜백 prop은 구별해야 합니다."], ['onSave는 예약어이므로 사용할 수 없다', "사용자 컴포넌트는 동작을 설명하는 콜백 prop 이름을 정할 수 있습니다."], ['onSave에는 함수 대신 함수 이름 문자열을 넣는다', "실행할 동작을 전달하려면 실제 함수 값을 전달합니다."]],
    explanation: "사용자 컴포넌트는 onSave 같은 도메인 이름으로 동작을 요청받을 수 있습니다. 내부 버튼의 onClick에서 그 함수를 호출하여 UI 구현과 실제 저장 로직을 연결합니다.",
    relatedTermIds: ['props', 'react-event-handler', 'component-boundary'], source: 'https://react.dev/learn/responding-to-events',
  },
  {
    id: 'react-extra-current-target-button', kind: 'practical', topic: '이벤트 수신 요소',
    prompt: "button 안의 span을 클릭했습니다. 클릭 핸들러가 연결된 button의 data-id를 읽으려면 빈칸에 무엇을 넣어야 하나요?",
    codeLanguage: "jsx", code: "export default function SelectButton({ onSelect }) {\n  function handleClick(event) {\n    const id = __BLANK__;\n    onSelect(id);\n  }\n  return <button data-id=\"42\" onClick={handleClick}>\n    <span>선택</span>\n  </button>;\n}",
    correct: ["event.currentTarget.dataset.id","currentTarget은 핸들러가 연결되어 현재 이벤트를 받는 button을 가리킵니다."],
    wrong: [["event.target.dataset.id","target은 실제 클릭한 span일 수 있으므로 button의 속성을 보장하지 않습니다."],["event.children.dataset.id","React 이벤트 객체에 이런 자식 속성 접근 API는 없습니다."],["event.nativeEvent.type.id","이벤트 유형은 문자열이며 button의 데이터 속성을 보관하지 않습니다."]],
    explanation: "target과 currentTarget은 중첩된 요소를 클릭할 때 다를 수 있습니다. 핸들러가 붙은 요소의 속성을 읽으려면 currentTarget을 사용합니다.",
    relatedTermIds: ['event-target-current-target', 'react-event-handler'], source: 'https://react.dev/reference/react-dom/components/common',
  },
  {
    id: 'react-extra-prevent-default-form', kind: 'practical', topic: '폼 기본 제출',
    prompt: "브라우저의 기본 제출 이동을 막고 save로 데이터를 전달하려고 합니다. 빈칸에 넣을 코드는 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport default function Editor({ save }) {\n  const [, setSaved] = useState(false);\n  function handleSubmit(event) {\n    __BLANK__;\n    save(new FormData(event.currentTarget));\n  }\n  return <form onSubmit={handleSubmit}>\n    <input name=\"title\" />\n    <button type=\"submit\">저장</button>\n  </form>;\n}",
    correct: ["event.preventDefault()","기본 제출 동작을 취소하여 앱에서 직접 저장 흐름을 처리할 수 있습니다."],
    wrong: [["event.stopPropagation()","전파 중지와 기본 동작 취소는 다르며 기본 제출 이동을 취소하지 않습니다."],["return false","React 이벤트 핸들러에서 false 반환이 기본 동작 취소를 대신하지 않습니다."],["setSaved(true)","React 상태 갱신은 브라우저 기본 제출을 취소하는 신호가 아닙니다."]],
    explanation: "React의 일반 onSubmit 핸들러에서는 preventDefault로 기본 제출을 취소합니다. 서버로 직접 제출하는 폼이나 React form Action을 쓰는 경우에는 해당 제출 모델에 맞게 설계합니다.",
    relatedTermIds: ['prevent-default', 'form', 'react-event-handler'], source: 'https://react.dev/learn/responding-to-events',
  },
  {
    id: 'react-extra-form-button-type', kind: 'practical', topic: '폼 안의 보조 버튼',
    prompt: "미리보기 버튼은 preview만 실행해야 합니다. 폼을 제출하거나 현재 입력값을 초기화하지 않도록 type의 빈칸에 무엇을 넣어야 하나요?",
    codeLanguage: "jsx", code: "export default function DraftForm({ preview }) {\n  return <form>\n    <input name=\"title\" defaultValue=\"초안\" />\n    <button type={__BLANK__} onClick={preview}>미리보기</button>\n  </form>;\n}",
    correct: ["\"button\"","보조 동작 버튼임을 명시하여 기본 submit 버튼으로 동작하지 않게 합니다."],
    wrong: [["\"submit\"","제출 버튼으로 동작하므로 문제의 요구와 반대입니다."],["undefined","type을 undefined로 주면 속성이 생략되어 form 안의 button은 기본 제출 버튼으로 동작합니다."],["\"reset\"","reset은 제출하지 않지만 현재 입력값을 기본값으로 돌리므로 미리보기만 실행하는 조건을 충족하지 않습니다."]],
    explanation: "폼 안에서 저장·제출이 아닌 버튼은 type=\"button\"을 명시합니다. UI에서 버튼이 수행하는 역할과 브라우저 기본 동작을 맞추면 의도치 않은 제출을 예방합니다.",
    relatedTermIds: ['form', 'react-event-handler'], source: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button',
  },
  {
    id: 'react-extra-state-initial-prop', kind: 'concept', topic: '초기 Props와 State',
    prompt: "useState(initialTitle)로 초안을 만들었습니다. 컴포넌트의 정체성을 유지한 채 부모가 initialTitle만 바꾸면 초안 state는 어떻게 되나요?",
    codeLanguage: 'jsx', code: `import { useState } from 'react';
function Editor({ initialTitle }) {
  const [draft, setDraft] = useState(initialTitle);
  return <input aria-label="제목" value={draft}
    onChange={e => setDraft(e.target.value)} />;
}`,
    correct: ['기존 초안 state가 자동으로 새 prop으로 교체되지는 않는다', "useState의 초기값은 초기화에 사용되며 후속 prop 변화의 자동 동기화 규칙이 아닙니다."],
    wrong: [['매 렌더마다 state가 initialTitle로 초기화된다', "그렇게 동작하면 사용자가 수정한 초안이 부모 렌더마다 사라지게 됩니다."], ['initialTitle이 바뀌면 컴포넌트가 반드시 remount된다', "같은 타입·위치·key라면 prop 변경만으로 정체성이 바뀌지는 않습니다."], ['문자열 prop은 state 초기값으로 사용할 수 없다', "문자열도 정상적인 state 초기값으로 사용할 수 있습니다."]],
    explanation: "initial이라는 이름은 이후 변경을 무시하는 초기값 계약을 표현할 수 있습니다. 부모 값이 항상 화면의 기준이라면 불필요하게 복사한 state 대신 prop을 직접 읽는 설계를 검토합니다.",
    relatedTermIds: ['use-state', 'props', 'single-source-of-truth'], source: 'https://react.dev/reference/react/useState',
  },
  {
    id: 'react-extra-lazy-state-initializer', kind: 'concept', topic: 'State 초기화 비용',
    prompt: "query가 바뀌어 재렌더되더라도 createItems를 불필요하게 다시 실행하지 않으려 합니다. items를 배열로 초기화하는 useState 빈칸에는 무엇을 넣어야 하나요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nfunction createItems() {\n  return ['React', 'JavaScript'];\n}\nexport default function Search() {\n  const [query, setQuery] = useState('');\n  const [items] = useState(__BLANK__);\n  return <><input value={query} onChange={event => setQuery(event.target.value)} />\n    <p>{items.filter(item => item.includes(query)).join(', ')}</p></>;\n}",
    correct: ["createItems","함수 자체를 초기화 함수로 전달하면 초기화 시 React가 실행합니다."],
    wrong: [["createItems()","함수를 렌더 중 즉시 호출하므로 state가 초기값을 무시해도 계산은 실행됩니다."],["() => createItems","createItems의 결과가 아니라 함수 자체를 state 값으로 저장하게 됩니다."],["\"createItems\"","함수 이름 문자열은 초기화 함수를 실행하지 않습니다."]],
    explanation: "비용 있는 초기 계산은 lazy initializer로 전달합니다. 개발 StrictMode에서는 순수성 점검을 위해 초기화 함수를 추가 호출할 수 있으므로 정확히 한 번 실행된다는 외부 부수 효과 가정은 피합니다.",
    relatedTermIds: ['use-state', 'strict-mode', 'render-purity'], source: 'https://react.dev/reference/react/useState',
  },
  {
    id: 'react-extra-same-state-value', kind: 'concept', topic: '동일한 State 값',
    prompt: "현재 count는 3입니다. 다른 갱신 없이 setCount(3)를 호출하면 React의 기본 처리에 관한 설명은 무엇인가요?",
    correct: ['Object.is로 같은 값이면 해당 state 변경에 따른 재렌더를 생략할 수 있다', "동일 값 갱신은 새 상태가 아니므로 React가 컴포넌트와 자식의 재렌더를 건너뛰는 최적화를 합니다."],
    wrong: [['setter를 호출했으므로 DOM을 반드시 새로 만든다', "setter 호출 횟수가 새 DOM 생성 횟수와 일치하지 않습니다."], ['숫자 state는 항상 문자열로 바뀐다', "React가 숫자를 문자열 state로 자동 변환하지 않습니다."], ['같은 값을 넣으면 오류가 발생한다', "같은 값으로 갱신을 요청하는 것은 허용되며 일반적인 최적화 대상입니다."]],
    explanation: "React는 새 state와 현재 state를 Object.is로 비교합니다. 같은 값이면 렌더를 생략할 수 있지만 일부 경우 컴포넌트 함수를 호출한 뒤 결과를 버릴 수 있으므로 함수 호출 횟수로 부수 효과를 설계하지 않습니다.",
    relatedTermIds: ['use-state', 'object-is', 'react-render'], source: 'https://react.dev/reference/react/useState',
  },
  {
    id: 'react-extra-append-state-array', kind: 'practical', topic: '목록 상태 추가',
    prompt: "새 item을 배열 마지막에 추가하고 이전 배열을 변경하지 않으려고 합니다. 버튼 핸들러의 빈칸에 넣을 코드는 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport default function List({ item }) {\n  const [items, setItems] = useState([]);\n  return <>\n    <button onClick={() => __BLANK__}>추가</button>\n    <p>항목 수: {items.length}</p>\n  </>;\n}",
    correct: ["setItems(prev => [...prev, item])","기존 항목을 새 배열에 복사한 뒤 새 항목을 넣어 불변 갱신합니다."],
    wrong: [["setItems(items.push(item))","push는 기존 배열을 변경하고 새 배열이 아니라 길이 숫자를 반환합니다."],["items[items.length] = item","기존 state 배열을 직접 바꾸며 React setter 갱신 경로도 거치지 않습니다."],["setItems(prev => [item, prev])","기존 배열을 펼치지 않아 중첩 배열을 만들며 추가 위치도 요구와 다릅니다."]],
    explanation: "배열 state는 새 배열로 교체합니다. 이전 상태를 이어서 계산할 때 함수형 setter와 spread를 함께 사용하면 이전 배열을 훼손하지 않고 항목을 추가할 수 있습니다.",
    relatedTermIds: ['react-state-immutability', 'spread-syntax', 'functional-state-update'], source: 'https://react.dev/learn/updating-arrays-in-state',
  },
  {
    id: 'react-extra-remove-state-array', kind: 'practical', topic: '목록 상태 삭제',
    prompt: "id가 deletedId인 항목만 제거하고 다른 항목과 이전 배열을 유지하려고 합니다. 빈칸에 넣을 코드는 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport default function List() {\n  const [items, setItems] = useState([{ id: 'a' }, { id: 'b' }]);\n  const deletedId = 'a';\n  const index = items.findIndex(item => item.id === deletedId);\n  return <>\n    <button onClick={() => __BLANK__}>제거</button>\n    <p>항목 수: {items.length}</p>\n  </>;\n}",
    correct: ["setItems(prev => prev.filter(item => item.id !== deletedId))","남길 항목을 filter로 골라 새 배열을 만들고 이전 배열은 그대로 유지합니다."],
    wrong: [["items.splice(index, 1)","splice는 기존 배열을 변경하며 이 호출만으로 React 상태 갱신을 요청하지 않습니다."],["setItems(prev => prev.find(item => item.id !== deletedId))","find는 남길 전체 목록이 아니라 처음 일치하는 항목 하나를 반환합니다."],["setItems(prev => prev.map(() => null))","해당 항목만 삭제하는 대신 모든 항목을 null로 바꿉니다."]],
    explanation: "목록 삭제는 삭제할 항목을 제외한 새 배열을 만드는 작업입니다. filter 조건을 유지할 항목 기준으로 작성하면 배열 인덱스 변화와 관계없이 ID로 삭제할 수 있습니다.",
    relatedTermIds: ['array-filter', 'react-state-immutability'], source: 'https://react.dev/learn/updating-arrays-in-state',
  },
  {
    id: 'react-extra-update-state-array-row', kind: 'practical', topic: '목록 항목 교체',
    prompt: "targetId는 기존 항목의 ID입니다. 아래 코드는 배열만 복사하고 항목 객체를 직접 바꿉니다. 대상의 done만 갱신하면서 이전 객체를 유지할 수정은 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport default function Todos() {\n  const [items, setItems] = useState([{ id: 'a', done: false }]);\n  const targetId = 'a';\n  function markDone() {\n    const next = [...items];\n    next.find(item => item.id === targetId).done = true;\n    setItems(next);\n  }\n  return <button onClick={markDone}>{items[0].done ? '완료' : '할 일'}</button>;\n}",
    correct: ["map에서 대상 항목만 { ...item, done: true }로 교체한다","배열과 변경 항목은 새 값으로 만들고 나머지 항목 참조는 유지할 수 있습니다."],
    wrong: [["모든 item.done을 직접 true로 바꾼다","대상만 변경하지도 않고 기존 항목 객체를 직접 수정합니다."],["filter로 targetId 항목만 반환한다","목록의 다른 항목이 제거되므로 상태 변경 요구와 다릅니다."],["배열만 복사한 뒤 복사본의 대상 item.done을 직접 바꾼다","배열의 얕은 복사에서는 항목 객체가 공유되므로 이전 객체까지 바뀝니다."]],
    explanation: "배열을 복사하는 것과 배열 속 객체를 복사하는 것은 다릅니다. map으로 대상 항목을 새 객체로 교체하면 기존 상태를 보존하면서 필요한 부분만 변경합니다.",
    relatedTermIds: ['array-map', 'shallow-copy', 'react-state-immutability'], source: 'https://react.dev/learn/updating-arrays-in-state',
  },
  {
    id: 'react-extra-toggle-functional-state', kind: 'practical', topic: '이전 Boolean 반전',
    prompt: "save가 정상 완료될 때의 최신 open state를 반전해야 합니다. 기다리는 동안 open이 바뀔 수도 있을 때 빈칸에 넣을 갱신은 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport default function Toggle({ save }) {\n  const [open, setOpen] = useState(false);\n  async function handleSave() {\n    await save();\n    __BLANK__;\n  }\n  return <button onClick={handleSave}>{open ? '열림' : '닫힘'}</button>;\n}",
    correct: ["setOpen(prev => !prev)","업데이트 큐가 제공하는 이전 상태를 반전하여 오래된 렌더의 open 값에 의존하지 않습니다."],
    wrong: [["setOpen(!open)","콜백이 과거 렌더의 open을 캡처했다면 최신 상태 기준 반전이 아닐 수 있습니다."],["open = !open","open은 const 바인딩이므로 재대입할 수 없습니다. 지역 변수 대입은 React state를 갱신하는 경로도 아닙니다."],["setOpen(prev => prev)","이전 값을 그대로 반환하므로 반전되지 않습니다."]],
    explanation: "다음 상태가 이전 상태에 의존한다면 함수형 업데이트로 그 관계를 표현합니다. 콜백이 오래된 렌더에서 만들어졌더라도 updater 인자는 큐의 이전 상태를 기준으로 제공됩니다.",
    relatedTermIds: ['functional-state-update', 'stale-closure'], source: 'https://react.dev/reference/react/useState',
  },
  {
    id: 'react-extra-reducer-dispatch-action', kind: 'concept', topic: 'Reducer Action',
    prompt: "const [cart, dispatch] = useReducer(reducer, [])에서 dispatch({ type: \"clear\" })는 무엇을 전달하나요?",
    correct: ['reducer가 다음 상태를 계산할 때 사용할 action', "dispatch는 변경 의도를 action으로 보내고 reducer가 현재 state와 함께 처리합니다."],
    wrong: [['cart 배열을 즉시 빈 배열로 직접 재할당한다', "action은 상태 값 자체를 즉시 재할당하는 명령이 아닙니다. reducer의 처리 규칙이 필요합니다."], ['브라우저의 기본 clear 이벤트', "이 객체는 앱이 정한 action이며 DOM 이벤트를 자동 발생시키지 않습니다."], ['서버에 자동으로 전송하는 요청 본문', "useReducer는 네트워크 전송을 자동 구현하는 API가 아닙니다."]],
    explanation: "action의 type과 데이터 구조는 앱이 정합니다. reducer에서 clear action을 처리해 빈 배열을 반환해야 장바구니 상태가 비워집니다.",
    relatedTermIds: ['use-reducer', 'state'], source: 'https://react.dev/reference/react/useReducer',
  },
  {
    id: 'react-extra-updater-missing-return', kind: 'concept', topic: 'Updater 반환값',
    prompt: "setCount(prev => { prev + 1; })에서 숫자가 정상 증가하지 않는 이유는 무엇인가요?",
    codeLanguage: 'jsx', code: `import { useState } from 'react';
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => {
    setCount(prev => { prev + 1; });
  }}>{count}</button>;
}`,
    correct: ['updater가 계산한 값을 return하지 않는다', "블록 함수가 undefined를 반환하므로 이전 값에 1을 더한 결과가 새 상태로 전달되지 않습니다."],
    wrong: [['함수형 updater에서는 덧셈을 사용할 수 없다', "숫자 상태를 이전 값에 더하여 계산하는 패턴은 정상적으로 사용할 수 있습니다."], ['prev는 항상 0으로 고정된다', "prev는 큐의 이전 상태이며 항상 초기값만 받는 변수가 아닙니다."], ['React가 + 연산자를 자동으로 제거한다', "이 문제는 연산자 제거가 아니라 JavaScript 함수의 반환 규칙입니다."]],
    explanation: "setCount(prev => prev + 1)이나 블록 안의 return prev + 1로 다음 값을 반환합니다. updater에서 계산식을 실행만 해 두면 React가 그 식을 자동 반환하지 않습니다.",
    relatedTermIds: ['functional-state-update', 'arrow-function'], source: 'https://react.dev/reference/react/useState',
  },
  {
    id: 'react-extra-checkbox-controlled', kind: 'practical', topic: 'Checkbox 제어값',
    prompt: "체크 여부를 boolean state로 제어하려고 합니다. onChange에서 setChecked에 전달할 빈칸의 값은 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport default function Consent() {\n  const [checked, setChecked] = useState(false);\n  return <input type=\"checkbox\" name=\"consent\" checked={checked}\n    onChange={event => setChecked(__BLANK__)} />;\n}",
    correct: ["event.target.checked","체크 여부는 boolean checked 값이며 이를 상태로 갱신합니다."],
    wrong: [["event.target.value","체크박스의 value는 제출 값으로 체크 여부와 다릅니다."],["event.target.textContent","체크박스의 텍스트 내용은 선택 여부를 나타내지 않습니다."],["event.target.name","name은 폼 필드 이름이며 선택 여부가 아닙니다."]],
    explanation: "controlled 체크박스는 checked={agreed}와 onChange에서의 boolean 갱신을 연결합니다. 텍스트 input의 value 제어와 구별해야 합니다.",
    relatedTermIds: ['controlled-input', 'form'], source: 'https://react.dev/reference/react-dom/components/input',
  },
  {
    id: 'react-extra-controlled-select', kind: 'practical', topic: 'Select 선택값',
    prompt: "React에서 단일 선택 select를 state로 제어할 때 적절한 구성은 무엇인가요?",
    correct: ['select의 value를 state에 연결하고 onChange에서 새 value를 갱신한다', "선택 기준은 상위 select의 value이며 변경 시 state를 갱신합니다."],
    wrong: [['매 option에 selected를 직접 토글한다', "React는 개별 option의 selected 대신 select의 value 또는 defaultValue로 선택을 지정합니다."], ['select의 children에 선택한 문자열만 넣는다', "선택할 option 요소와 선택값 제어가 필요하며 children 문자열만으로 대체되지 않습니다."], ['value만 연결하고 사용자의 변경은 모두 무시한다', "수정 가능한 controlled select라면 변경 이벤트에서 상태를 갱신해야 합니다."]],
    explanation: "React는 select 요소에서 선택값을 일관되게 관리하도록 value를 사용합니다. 초기 선택만 지정하고 DOM에 관리 맡기려면 defaultValue를 사용합니다.",
    relatedTermIds: ['controlled-input', 'form-data'], source: 'https://react.dev/reference/react-dom/components/select',
  },
  {
    id: 'react-extra-textarea-value', kind: 'practical', topic: 'Textarea 값',
    prompt: "React에서 수정 가능한 controlled textarea의 내용을 지정할 때 사용하는 것은 무엇인가요?",
    correct: ['value와 onChange', "value가 현재 내용을 나타내고 onChange가 state 갱신을 연결합니다."],
    wrong: [['textarea 태그 사이 문자열만 매번 변경한다', "React textarea의 초기값·제어값은 children 대신 defaultValue 또는 value로 지정합니다."], ['checked와 onClick', "checked는 텍스트 내용을 제어하는 prop이 아닙니다."], ['placeholder만 전달한다', "placeholder는 값이 비었을 때 보이는 안내이며 입력 내용을 나타내는 상태가 아닙니다."]],
    explanation: "textarea에서도 controlled 값은 문자열로 유지합니다. HTML의 태그 사이 초기 내용 문법과 React의 value/defaultValue 사용법을 구별합니다.",
    relatedTermIds: ['controlled-input', 'form'], source: 'https://react.dev/reference/react-dom/components/textarea',
  },
  {
    id: 'react-extra-form-data-name', kind: 'practical', topic: 'FormData 필드 이름',
    prompt: "사용자가 이메일을 입력하고 제출했지만 save에 전달한 FormData에는 email 항목이 없습니다. 아래 input에서 빠진 것은 무엇인가요?",
    codeLanguage: "jsx", code: "export default function EmailForm({ save }) {\n  function handleSubmit(event) {\n    event.preventDefault();\n    const data = new FormData(event.currentTarget);\n    save(data);\n  }\n  return <form onSubmit={handleSubmit}>\n    <input id=\"email\" type=\"email\" defaultValue=\"user@example.com\" />\n    <button type=\"submit\">저장</button>\n  </form>;\n}",
    correct: ["제출할 필드의 키를 지정하는 name이 없다","FormData는 제출 가능한 폼 컨트롤의 name을 항목 이름으로 사용합니다."],
    wrong: [["id가 영문이면 FormData가 제외한다","영문 id 자체가 제외 조건은 아닙니다. 폼 필드 name이 필요합니다."],["value가 문자열이면 FormData에 들어가지 않는다","문자열 입력값은 FormData에서 일반적으로 사용하는 값입니다."],["React input은 FormData로 절대 읽을 수 없다","React가 렌더한 실제 폼 요소도 FormData로 읽을 수 있습니다."]],
    explanation: "id는 label 연결이나 DOM 식별에 쓰고 name은 제출 데이터의 키를 나타냅니다. disabled 컨트롤 등 다른 제외 조건도 있으므로 필드 이름과 제출 가능 상태를 함께 확인합니다.",
    relatedTermIds: ['form-data', 'form', 'label'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData',
  },
  {
    id: 'react-extra-uncontrolled-submit-read', kind: 'practical', topic: 'Uncontrolled 제출 읽기',
    prompt: "사용자가 이메일을 수정한 뒤 제출합니다. 입력마다 state를 만들지 않고 아래 저장 코드가 실제 현재 값들을 읽도록 고치는 방법은 무엇인가요?",
    codeLanguage: "jsx", code: "export default function EmailForm({ save }) {\n  const defaultEmail = 'user@example.com';\n  function handleSubmit(event) {\n    event.preventDefault();\n    save({ email: defaultEmail });\n  }\n  return <form onSubmit={handleSubmit}>\n    <input name=\"email\" defaultValue={defaultEmail} />\n    <button type=\"submit\">저장</button>\n  </form>;\n}",
    correct: ["onSubmit에서 new FormData(event.currentTarget)를 만든다","제출 핸들러의 currentTarget은 폼이며 그 시점의 제출 가능한 필드값을 읽을 수 있습니다."],
    wrong: [["처음 렌더의 defaultValue만 저장해 전송한다","사용자가 수정한 현재 DOM 값과 초기값이 다를 수 있습니다."],["event.target.children 전체를 JSON.stringify한다","DOM 자식 구조는 제출 데이터 계약이 아니며 폼 필드값을 올바르게 직렬화하지 않습니다."],["입력마다 name을 제거한다","name을 제거하면 FormData에 해당 필드가 포함되지 않습니다."]],
    explanation: "제출 시점에만 값이 필요하다면 FormData가 uncontrolled 입력을 읽는 단순한 경로가 됩니다. 화면이 입력값에 즉시 반응해야 하는 기능은 controlled state와의 역할 분담을 검토합니다.",
    relatedTermIds: ['uncontrolled-input', 'form-data'], source: 'https://react.dev/reference/react-dom/components/input',
  },
  {
    id: 'react-extra-submit-handler-location', kind: 'practical', topic: '제출 이벤트 연결',
    prompt: "버튼 클릭뿐 아니라 텍스트 입력 중 Enter 제출도 같은 저장 로직으로 처리하려 합니다. 적절한 이벤트 연결 위치는 무엇인가요?",
    correct: ['form의 onSubmit', "폼의 제출 이벤트를 처리하면 submit 버튼과 기본 Enter 제출 경로를 같은 흐름으로 받을 수 있습니다."],
    wrong: [['저장 버튼의 onMouseDown만 사용한다', "마우스 누름 이벤트만 처리하면 키보드 제출 경로를 놓칩니다."], ['페이지 최상위의 모든 keydown을 저장으로 처리한다', "폼과 무관한 키 입력이나 다른 동작까지 저장 요청으로 해석할 수 있습니다."], ['label의 onClick만 사용한다', "label 클릭은 입력과의 연결 동작이며 폼 제출의 공통 이벤트가 아닙니다."]],
    explanation: "제출을 폼의 onSubmit에서 처리하면 사용자 입력 수단에 관계없이 일관된 흐름을 만들기 쉽습니다. 보조 버튼은 type=\"button\", 제출 버튼은 type=\"submit\"으로 역할을 명확하게 둡니다.",
    relatedTermIds: ['form', 'react-event-handler', 'semantic-html'], source: 'https://react.dev/reference/react-dom/components/input',
  },
  {
    id: 'react-extra-stop-click-bubble', kind: 'practical', topic: '클릭 전파 중지',
    prompt: "저장 버튼을 클릭하면 save만 실행하고 부모의 openDetails는 실행하지 않아야 합니다. 빈칸에 넣을 코드는 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport default function Card({ save, openDetails }) {\n  const [buttonKey, setButtonKey] = useState(0);\n  function handleSave(event) {\n    __BLANK__;\n    save();\n  }\n  return <article onClick={openDetails}>\n    <button key={buttonKey} onClick={handleSave}>저장</button>\n  </article>;\n}",
    correct: ["event.stopPropagation()","버블링 전파를 중지하여 같은 클릭을 부모 카드의 핸들러가 처리하지 않게 합니다."],
    wrong: [["event.preventDefault()","기본 동작 취소는 부모로의 이벤트 전파 중지와 다른 기능입니다."],["setButtonKey(prev => prev + 1)","목록 key 변경은 이미 발생한 이벤트의 버블링을 막지 않습니다."],["event.currentTarget.textContent = \"저장됨\"","버튼 표시 문구는 이벤트 전파 경로를 바꾸지 않습니다."]],
    explanation: "기본 동작과 이벤트 전파를 각각 구별하여 필요한 처리를 적용합니다. 상호작용 요소를 중첩한 UI는 HTML 구조와 키보드 접근성도 함께 검토합니다.",
    relatedTermIds: ['stop-propagation', 'react-event-handler'], source: 'https://react.dev/learn/responding-to-events',
  },
  {
    id: 'react-extra-focus-dom-ref', kind: 'practical', topic: 'DOM Ref로 Focus',
    prompt: "버튼으로 input에 포커스를 주려고 하지만 inputRef가 DOM 노드와 연결되지 않았습니다. 아래 ref 연결을 고치는 방법은 무엇인가요?",
    codeLanguage: "jsx", code: "import { useRef } from 'react';\nexport default function FocusForm() {\n  const inputRef = useRef(null);\n  return <>\n    <input />\n    <button onClick={() => inputRef.current?.focus()}>입력으로 이동</button>\n  </>;\n}",
    correct: ["input에 ref={inputRef}, 클릭에서 inputRef.current?.focus()","React가 DOM 노드를 ref에 연결하고 이벤트에서 그 노드의 focus 메서드를 호출합니다."],
    wrong: [["input에 value={inputRef}를 지정한다","value는 입력 내용의 제어 값이며 DOM 노드를 ref에 연결하는 prop이 아닙니다."],["컴포넌트 렌더 본문에서 항상 focus()를 호출한다","렌더 중 DOM 부수 효과를 실행하지 않으며 최초 렌더에는 노드가 아직 연결되지 않을 수 있습니다."],["inputRef를 함수처럼 호출한다","useRef 결과는 current 속성을 가진 객체이며 DOM 메서드는 current의 노드에서 호출합니다."]],
    explanation: "ref는 React가 관리하는 DOM 노드를 필요한 명령형 동작에 연결합니다. 포커스나 스크롤은 이벤트 또는 적절한 Effect에서 수행하며 UI 내용을 직접 덮어쓰는 방식과 구별합니다.",
    relatedTermIds: ['use-ref', 'focus-management'], source: 'https://react.dev/learn/manipulating-the-dom-with-refs',
  },
  {
    id: 'react-extra-context-nearest-provider', kind: 'concept', topic: 'Context 탐색',
    prompt: "ThemeContext 기본값은 light입니다. 상위 Provider는 dark, 더 가까운 Provider는 blue를 제공합니다. 그 안의 소비자가 읽는 값은 무엇인가요?",
    codeLanguage: 'jsx', code: `import { createContext, useContext } from 'react';
const ThemeContext = createContext('light');
function Label() {
  return <p>{useContext(ThemeContext)}</p>;
}
function App() {
  return <ThemeContext value="dark">
    <ThemeContext value="blue"><Label /></ThemeContext>
  </ThemeContext>;
}`,
    correct: ['blue', "useContext는 소비자 위의 가장 가까운 해당 Context Provider 값을 읽습니다."],
    wrong: [['dark', "더 바깥 Provider가 있어도 가까운 Provider가 값을 제공하면 그 값을 읽습니다."], ['light', "기본값은 위에 일치하는 Provider가 없을 때 사용합니다."], ['dark와 blue가 자동 합쳐진 값', "Context는 중첩 값을 자동 병합하지 않고 가까운 Provider 값을 그대로 사용합니다."]],
    explanation: "Context는 트리를 따라 위쪽의 일치하는 Provider를 찾습니다. 일부 영역에 다른 테마나 설정을 적용하려면 가까운 Provider로 값을 재정의할 수 있습니다.",
    relatedTermIds: ['use-context', 'props'], source: 'https://react.dev/reference/react/useContext',
  },
  {
    id: 'react-extra-context-undefined-provider', kind: 'concept', topic: 'Context 기본값 조건',
    prompt: "createContext(\"light\")의 Provider가 value={undefined}를 명시적으로 제공합니다. 그 아래 useContext 결과는 무엇인가요?",
    correct: ['undefined', "Provider가 존재하므로 기본값이 아니라 명시적으로 전달한 undefined를 읽습니다."],
    wrong: [['light', "기본값은 Provider가 없을 때 쓰이며 undefined 값의 대체 규칙이 아닙니다."], ['null', "React가 undefined를 자동으로 null로 변환하지 않습니다."], ['부모 DOM의 color 문자열', "Context는 CSS를 자동 탐색하여 값을 채우지 않습니다."]],
    explanation: "Context 기본값은 Provider의 존재 여부에 따라 사용됩니다. 누락한 값과 Provider가 전달한 undefined를 혼동하지 않도록 타입과 공급자 계약을 정합니다.",
    relatedTermIds: ['use-context', 'nullish-coalescing'], source: 'https://react.dev/reference/react/useContext',
  },
  {
    id: 'react-extra-element-description', kind: 'concept', topic: 'React Element',
    prompt: "const node = <p>안녕</p>를 실행하는 것만으로 브라우저 DOM에 p가 즉시 추가되나요?",
    correct: ['아니다. node는 React에 전달할 UI 설명이다', "React Element를 만든 것과 React가 실제 트리에 렌더·커밋하는 단계는 다릅니다."],
    wrong: [['즉시 document.body 끝에 추가된다', "JSX 표현식 자체에는 DOM 삽입 대상이나 커밋 요청이 없습니다."], ['즉시 네트워크로 HTML을 보낸다', "요소 생성은 서버 요청을 자동 수행하지 않습니다."], ['JSX는 항상 문자열만 만든다', "일반 JSX 요소는 React Element를 만들며 단순 HTML 문자열과 다릅니다."]],
    explanation: "React Element는 무엇을 표시할지 설명하는 가벼운 값입니다. 이를 컴포넌트가 반환하거나 root에 전달하면 React가 렌더와 커밋을 통해 DOM에 반영합니다.",
    relatedTermIds: ['jsx', 'react-render', 'react-commit'], source: 'https://react.dev/reference/react/createElement',
  },
  {
    id: 'react-extra-render-vs-dom-change', kind: 'concept', topic: 'Render와 DOM 변경',
    prompt: "상위 state 변화로 자식 함수가 다시 실행되었지만 반환한 UI가 이전과 같습니다. DOM이 반드시 전부 교체되나요?",
    correct: ['아니다. 렌더 계산 후 필요한 DOM 변화만 커밋한다', "함수 재실행과 DOM 노드 전체 교체는 같은 동작이 아닙니다."],
    wrong: [['함수 실행마다 모든 DOM이 항상 새로 생성된다', "재렌더에서는 이전 결과와 비교하여 필요한 변경을 반영합니다."], ['자식 재렌더는 JavaScript 없이 CSS로만 실행된다', "함수 컴포넌트의 UI 계산은 JavaScript 실행 과정입니다."], ['DOM이 바뀌지 않았으니 컴포넌트 함수도 실행되지 않았다', "UI 계산이 실행되어도 결과가 같으면 DOM 변경이 필요 없을 수 있습니다."]],
    explanation: "React 렌더는 다음 UI를 계산하고 커밋은 그 계산을 DOM에 반영합니다. 렌더 횟수와 실제 DOM 변경 비용을 구별하면 성능 측정 결과를 해석하기 쉽습니다.",
    relatedTermIds: ['react-render', 'react-commit', 'reconciliation'], source: 'https://react.dev/learn/render-and-commit',
  },
  {
    id: 'react-extra-object-child', kind: 'concept', topic: '표시할 데이터 변환',
    prompt: "user = { name: \"민지\" }일 때 이름을 화면에 표시하는 올바른 JSX는 무엇인가요?",
    correct: ['<p>{user.name}</p>', "객체 속성의 문자열 값을 자식으로 전달하여 이름을 표시합니다."],
    wrong: [['<p>{user}</p>', "일반 객체를 React 자식으로 그대로 표시할 수 없습니다. 원하는 속성을 선택해야 합니다."], ['<p user={user} />', "객체를 DOM prop에 전달하는 것이 이름을 내용으로 표시하는 동작은 아닙니다."], ['<p>{"user.name"}</p>', "따옴표 속 내용은 표현식이 아니라 문자열 user.name을 그대로 표시합니다."]],
    explanation: "서버 응답 객체를 받은 뒤 UI에서 표시할 필드를 선택합니다. React 요소와 일반 데이터 객체는 다르므로 객체 전체를 자식으로 넘기는 오류를 피합니다.",
    relatedTermIds: ['jsx', 'props'], source: 'https://react.dev/learn/javascript-in-jsx-with-curly-braces',
  },
  {
    id: 'react-extra-function-state-value', kind: 'concept', topic: '함수를 State에 저장',
    prompt: "handler 함수를 실행 결과가 아닌 state 값 자체로 저장하려 합니다. 초기화 방식은 무엇인가요?",
    codeLanguage: 'jsx', code: `import { useState } from 'react';
function handler() { console.log('저장'); }
function ActionButton() {
  const [savedHandler] = useState(() => handler);
  return <button onClick={savedHandler}>저장</button>;
}`,
    correct: ['useState(() => handler)', "바깥 함수를 initializer로 실행한 결과 handler 함수가 실제 state 값이 됩니다."],
    wrong: [['useState(handler)', "함수 인자는 initializer로 해석되어 React가 handler를 실행합니다."], ['useState(handler())', "렌더 중 handler를 즉시 호출하고 그 결과를 전달합니다."], ['useState("handler")', "실제 함수 값이 아니라 이름 문자열을 저장합니다."]],
    explanation: "useState는 초기 함수 인자를 특별히 initializer로 취급합니다. 함수 자체를 값으로 저장해야 하면 함수를 반환하는 래퍼를 전달하여 의도를 구별합니다.",
    relatedTermIds: ['use-state', 'arrow-function'], source: 'https://react.dev/reference/react/useState',
  },
];

const practical: Draft[] = [
  {
    id: 'react-extra-local-draft-state', kind: 'practical', topic: '상태 배치 · 입력 초안',
    prompt: "SearchBox는 value·onChange·onSubmit을 받는 입력 UI이고 LargeResults는 큰 결과 화면입니다. 아래 검색 초안은 제출 때만 결과 조회에 필요합니다. 타이핑마다 Page 전체가 갱신되는 범위를 줄이려면 무엇을 우선 바꾸나요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nimport { SearchBox, LargeResults } from './ui';\nexport function Page({ onSearch }) {\n  const [draft, setDraft] = useState('');\n  return <>\n    <SearchBox value={draft} onChange={setDraft}\n      onSubmit={() => onSearch(draft)} />\n    <LargeResults />\n  </>;\n}",
    correct: ['초안 state를 SearchBox 가까이에 두고 제출 콜백으로 확정값을 전달한다', "사용 범위에 맞게 상태를 배치하여 무관한 큰 부모의 매 입력 갱신을 줄입니다."],
    wrong: [['입력값을 모든 상위 컴포넌트에 복사한다', "중복 state와 더 넓은 갱신 범위를 만들어 문제를 키웁니다."], ['모든 함수에 useCallback만 붙인다', "상태 소유자가 큰 부모라는 구조를 바꾸지 않으며 함수를 감싸는 것만으로 해결되지 않습니다."], ['input의 onChange를 제거한다', "입력 초안이 정상 갱신되지 않아 사용자 기능 자체가 손상됩니다."]],
    explanation: "상태는 실제로 필요한 범위 가까이에 둡니다. 확정된 검색 조건은 제출 이벤트로 상위에 전달하면 초안과 공유 결과의 책임이 구별됩니다.",
    relatedTermIds: ['state-colocation', 'component-boundary', 'controlled-input'], source: 'https://react.dev/reference/react/memo',
  },
  {
    id: 'react-extra-selected-entity-id', kind: 'practical', topic: '엔티티와 선택 상태',
    prompt: "items는 부모가 최신 상품 객체로 갱신합니다. 아래에서 상품 이름이 바뀌어도 선택 상세는 이전 객체를 표시할 수 있습니다. selectedItem의 저장 구조를 어떻게 바꾸는 것이 적절한가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport function Catalog({ items }) {\n  const [selectedItem, setSelectedItem] = useState(items[0] ?? null);\n  return <>\n    {items.map(item => <button key={item.id}\n      onClick={() => setSelectedItem(item)}>{item.name}</button>)}\n    <p>{selectedItem?.name}</p>\n  </>;\n}",
    correct: ['선택한 ID만 저장하고 현재 items에서 해당 상품을 찾는다', "엔티티의 기준 값을 한곳에 두고 선택 관계만 ID로 표현하면 복사본 불일치를 줄입니다."],
    wrong: [['상품 이름을 선택 식별자로 사용한다', "이름이 수정되거나 중복될 수 있어 안정적인 선택 식별자가 아닙니다."], ['상세 화면 DOM의 글자만 수동 교체한다', "데이터 기준 값은 여전히 불일치하며 다음 렌더에서 문제가 재발합니다."], ['수정 때마다 선택 객체만 갱신하고 items는 그대로 둔다', "목록의 기준 값을 오래된 상태로 남겨 반대 방향의 불일치를 만듭니다."]],
    explanation: "선택 상태와 실제 엔티티 데이터는 서로 다른 책임입니다. 안정적인 selectedId를 저장하고 최신 엔티티를 조회하면 동일 데이터를 두 군데서 동기화할 필요가 줄어듭니다.",
    relatedTermIds: ['state-normalization', 'single-source-of-truth'], source: 'https://react.dev/learn/choosing-the-state-structure',
  },
  {
    id: 'react-extra-group-related-coordinate', kind: 'practical', topic: '함께 변하는 상태',
    prompt: "아래 x와 y는 항상 같은 포인터 이벤트에서 함께 갱신됩니다. 두 상태 방식도 동작할 수 있지만, 두 값이 하나의 위치라는 관계를 상태 구조에 표현하려면 어떤 변경이 적절한가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport function PointerPosition() {\n  const [x, setX] = useState(0);\n  const [y, setY] = useState(0);\n  return <div style={{ height: 120 }} onPointerMove={event => {\n    setX(event.clientX);\n    setY(event.clientY);\n  }}>{x}, {y}</div>;\n}",
    correct: ['position이라는 { x, y } 상태로 함께 관리한다', "항상 같이 변하는 값을 묶으면 한 좌표만 갱신하고 다른 값을 빠뜨리는 실수를 줄입니다."],
    wrong: [['x만 저장하고 y는 항상 x와 같다고 가정한다', "두 값이 함께 변해도 같은 숫자라는 뜻은 아니므로 실제 좌표 정보를 잃습니다."], ['y를 변경할 때마다 x를 0으로 초기화한다', "포인터의 실제 위치와 다른 조합을 만드는 규칙입니다."], ['x와 y를 부모 props에 직접 대입한다', "props는 상태 setter가 아니며 입력값의 소유권을 훼손합니다."]],
    explanation: "항상 함께 갱신되는 값은 position이라는 { x, y } 상태로 묶어 관계를 표현할 수 있습니다. 두 setter가 반드시 오류를 낸다는 뜻은 아니며, 하나의 위치를 한 번에 갱신하는 상태 계약을 만드는 선택입니다. 객체의 일부만 바꿀 때는 나머지 필드 보존도 확인해야 합니다.",
    relatedTermIds: ['state', 'react-state-immutability'], source: 'https://react.dev/learn/choosing-the-state-structure',
  },
  {
    id: 'react-extra-request-status-model', kind: 'practical', topic: '모순 없는 요청 상태',
    prompt: "save는 Promise를 반환합니다. 아래 boolean 조합은 이전 실패를 지우지 않아 저장 성공 후에도 오류와 성공이 함께 true가 될 수 있습니다. 한 요청의 상호 배타적인 진행 상태를 표현하도록 어떻게 바꾸는 것이 적절한가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport function SaveButton({ save }) {\n  const [loading, setLoading] = useState(false);\n  const [success, setSuccess] = useState(false);\n  const [error, setError] = useState(false);\n  async function submit() {\n    setLoading(true);\n    try { await save(); setSuccess(true); }\n    catch { setError(true); }\n    finally { setLoading(false); }\n  }\n  return <button onClick={submit}>{JSON.stringify({ loading, success, error })}</button>;\n}",
    correct: ['status를 idle/loading/success/error 중 하나로 관리한다', "한 번에 하나의 상태를 선택하는 모델로 허용되지 않는 조합을 줄입니다."],
    wrong: [['boolean 상태를 더 많이 추가한다', "가능한 조합이 늘어 잘못된 상태를 허용하는 구조가 더 복잡해집니다."], ['모든 boolean을 true로 초기화한다', "초기부터 서로 모순되는 로딩·성공·오류 UI를 만들 수 있습니다."], ['오류 값을 성공 데이터 필드에 그대로 넣는다', "실패와 성공 계약을 구별하지 않아 렌더 조건을 해석하기 어려워집니다."]],
    explanation: "서로 배타적인 상태는 단일 상태 값이나 구분된 타입으로 표현합니다. 데이터와 오류를 함께 모델링하면 어떤 상태에서 어떤 정보가 유효한지도 명확해집니다.",
    relatedTermIds: ['finite-state-machine', 'discriminated-union', 'use-reducer'], source: 'https://react.dev/learn/choosing-the-state-structure',
  },
  {
    id: 'react-extra-context-reducer-responsibility', kind: 'practical', topic: 'Reducer와 Context 역할',
    prompt: "cartReducer는 이미 정의된 순수 상태 계산 함수입니다. 아래에서 useReducer와 CartContext가 맡는 역할을 구별한 설명은 무엇인가요?",
    codeLanguage: "jsx", code: "import { createContext, useReducer } from 'react';\nimport { cartReducer } from './cart-reducer';\nexport const CartContext = createContext(null);\nexport function CartProvider({ children }) {\n  const [cart, dispatch] = useReducer(cartReducer, []);\n  return <CartContext.Provider value={{ cart, dispatch }}>\n    {children}\n  </CartContext.Provider>;\n}",
    correct: ['reducer는 상태 전이를 계산하고 Context는 값과 dispatch의 전달 경로를 제공한다', "변경 규칙과 트리 내부 전달을 각각 다른 책임으로 이해합니다."],
    wrong: [['Context가 모든 reducer action을 자동 정의한다', "Context는 action이나 상태 변경 규칙을 생성하지 않습니다."], ['reducer가 하위 컴포넌트를 DOM에서 직접 검색한다', "reducer의 계산 책임과 UI 트리 탐색은 관계가 없습니다."], ['Context를 쓰면 장바구니 데이터가 자동 영구 저장된다', "트리 전달과 브라우저·서버 영구 저장은 별도 기능입니다."]],
    explanation: "reducer와 Context는 함께 사용할 수 있지만 서로를 대신하지 않습니다. 상태 구조와 action 계약을 먼저 정하고 필요한 소비자에게 전달합니다.",
    relatedTermIds: ['use-reducer', 'use-context', 'single-source-of-truth'], source: 'https://react.dev/learn/scaling-up-with-reducer-and-context',
  },
  {
    id: 'react-extra-hook-enabled-effect', kind: 'practical', topic: '조건부 외부 동기화',
    prompt: "subscribe는 구독을 시작하고 정리 함수를 반환하는 prop이며, enabled는 켜짐 상태입니다. Hook 호출 순서를 유지하면서 꺼진 상태에는 구독을 시작하지 않도록 빈칸을 처리하는 적절한 방법은 무엇인가요?",
    codeLanguage: "jsx", code: "import { useEffect } from 'react';\nexport function Feed({ enabled, subscribe }) {\n  useEffect(() => {\n    __BLANK__;\n    return subscribe();\n  }, [enabled, subscribe]);\n  return <p>{enabled ? '켜짐' : '꺼짐'}</p>;\n}",
    correct: ["if (!enabled) return","Hook 호출은 고정하면서 외부 작업의 실행 여부만 조건으로 결정합니다."],
    wrong: [["useEffect 호출 전체를 if (enabled) 안으로 옮깁니다.","enabled 변경에 따라 일반 Hook 호출 순서가 바뀝니다."],["enabled가 false면 useEffect 대신 useState를 호출합니다.","렌더별 Hook 종류 변경도 호출 계약을 깨뜨립니다."],["subscribe 함수 안에서 useEffect를 호출합니다.","일반 콜백 실행 문맥은 컴포넌트나 커스텀 Hook의 최상위가 아닙니다."]],
    explanation: "조건부로 실행할 작업과 조건부 Hook 호출을 구별합니다. Effect가 enabled를 읽으면 의존성에도 반영하고 enabled 변경 시 기존 구독을 정리하도록 설계합니다.",
    relatedTermIds: ['custom-hook', 'rules-of-hooks', 'effect-cleanup'], source: 'https://react.dev/reference/rules/rules-of-hooks',
  },
  {
    id: 'react-extra-ssr-storage-read', kind: 'practical', topic: 'SSR와 브라우저 저장소',
    prompt: "아래 Profile은 서버에서도 렌더해야 하지만 서버에는 window가 없습니다. 서버와 초기 클라이언트 UI를 맞춘 뒤 name을 읽도록 바꾸는 기본 대응은 무엇인가요?",
    codeLanguage: "jsx", code: "export function Profile() {\n  const name = window.localStorage.getItem('name') ?? '';\n  return <p>{name || '이름을 불러오는 중입니다'}</p>;\n}",
    correct: ['서버에서도 같은 초기 UI를 만들고 클라이언트 마운트 후 저장소 값을 읽어 반영한다', "서버에 없는 브라우저 API를 클라이언트 실행 단계로 옮기고 초기 출력의 일관성도 지킵니다."],
    wrong: [['서버 전역에 window라는 빈 객체만 만든다', "빈 객체는 실제 localStorage API와 사용자별 데이터 계약을 제공하지 못합니다."], ['렌더마다 try/catch로 오류만 무시하면 hydration도 항상 맞는다', "예외를 숨겨도 서버와 클라이언트 초기 데이터 차이가 해결된다는 보장은 없습니다."], ['브라우저 저장소를 읽으면 모든 데이터가 자동 서버에 동기화된다', "localStorage는 브라우저별 저장소이며 서버 동기화 기능이 아닙니다."]],
    explanation: "Effect는 서버 렌더에서 실행되지 않으므로 브라우저 저장소를 읽는 클라이언트 단계로 사용할 수 있습니다. 서버·첫 클라이언트 출력이 일치하도록 초기값을 정하고 이후 사용자 설정을 적용합니다.",
    relatedTermIds: ['local-storage', 'use-effect', 'hydration'], source: 'https://react.dev/reference/react/useEffect',
  },
  {
    id: 'react-extra-interval-updater', kind: 'practical', topic: 'Interval과 최신 상태',
    prompt: "매초 count를 증가시키는 Effect에서 count 의존성을 빼되 오래된 count를 캡처하지 않으려 합니다. interval 콜백의 갱신은 무엇인가요?",
    codeLanguage: 'jsx', code: `import { useEffect, useState } from 'react';
function Timer() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <p>{count}</p>;
}`,
    correct: ['setCount(n => n + 1)', "updater가 이전 상태를 받아 계산하므로 Effect가 count 값을 직접 읽지 않습니다."],
    wrong: [['setCount(count + 1)와 빈 의존성 배열', "콜백이 초기 렌더의 count를 계속 읽어 같은 값으로 갱신할 수 있습니다."], ['count += 1', "렌더의 지역 변수 수정은 React state 갱신 요청을 대신하지 않습니다."], ['setCount(n => { n += 1; })', "변경된 값을 반환하지 않아 undefined가 다음 상태가 됩니다."]],
    explanation: "함수형 setter로 이전 상태를 계산하면 interval을 count 변경마다 다시 만들 필요를 줄일 수 있습니다. 타이머는 cleanup에서 clearInterval로 정리해야 합니다.",
    relatedTermIds: ['stale-closure', 'functional-state-update', 'effect-cleanup'], source: 'https://react.dev/learn/removing-effect-dependencies',
  },
  {
    id: 'react-extra-effect-object-inside', kind: 'practical', topic: 'Effect 객체 의존성',
    prompt: "createConnection은 외부 모듈의 연결 함수입니다. roomId가 같아도 다른 부모 갱신 때 재연결됩니다. 아래 options의 생성 위치와 Effect 의존성을 어떻게 바꾸는 것이 적절한가요?",
    codeLanguage: "jsx", code: "import { useEffect } from 'react';\nimport { createConnection } from './chat';\nexport function Room({ roomId }) {\n  const options = { roomId };\n  useEffect(() => {\n    const connection = createConnection(options);\n    connection.connect();\n    return () => connection.disconnect();\n  }, [options]);\n  return <p>{roomId}</p>;\n}",
    correct: ['options 객체를 Effect 안에서 만들고 roomId를 의존성에 둔다', "Effect 밖의 매 렌더 새 객체 의존성을 제거하며 실제 반응형 입력의 변경은 추적합니다."],
    wrong: [['의존성 배열을 무조건 비운다', "roomId 변경도 추적하지 않아 외부 연결이 오래된 방을 유지할 수 있습니다."], ['roomId를 전역 변수로 직접 덮어쓴다', "상태 추적을 우회하며 여러 컴포넌트의 값을 섞을 수 있습니다."], ['객체가 같아 보이므로 lint 경고만 삭제한다', "내용이 같아도 참조가 매번 달라지는 동작은 남습니다."]],
    explanation: "불필요한 객체 의존성을 줄이려면 생성 위치를 실제 사용 범위로 옮깁니다. 의존성은 방 ID 같은 실제 입력을 계속 포함하며 실행 빈도만 줄이려고 숨기지 않습니다.",
    relatedTermIds: ['effect-dependencies', 'reference-equality', 'use-effect'], source: 'https://react.dev/learn/removing-effect-dependencies',
  },
  {
    id: 'react-extra-effect-helper-scope', kind: 'practical', topic: 'Effect 함수 의존성',
    prompt: "createConnection은 외부 모듈 함수이고 createOptions는 이 Effect에서만 사용합니다. roomId가 같아도 함수 참조 때문에 재연결됩니다. 아래 createOptions의 위치와 의존성을 어떻게 고치는 것이 적절한가요?",
    codeLanguage: "jsx", code: "import { useEffect } from 'react';\nimport { createConnection } from './chat';\nexport function Room({ roomId }) {\n  function createOptions() { return { roomId }; }\n  useEffect(() => {\n    const connection = createConnection(createOptions());\n    connection.connect();\n    return () => connection.disconnect();\n  }, [createOptions]);\n  return <p>{roomId}</p>;\n}",
    correct: ['해당 함수를 Effect setup 안으로 옮기고 함수가 읽는 반응형 입력을 의존성에 둔다', "외부 새 함수 참조 대신 실제 입력을 추적하며 Effect 내부 로직으로 정리합니다."],
    wrong: [['함수 의존성을 빼고 내부 props 변경도 무시한다', "필요한 반응형 입력 변경을 놓치며 stale 연결을 만들 수 있습니다."], ['함수 이름을 대문자로 바꾼다', "이름의 대소문자는 렌더마다 생기는 함수 참조를 안정화하지 않습니다."], ['함수를 문자열로 변환해 호출한다', "문자열 변환은 실행할 함수를 유지하는 정상 의존성 관리 전략이 아닙니다."]],
    explanation: "Effect에서만 쓰는 도우미는 Effect 내부에 두면 함수 자체를 의존성으로 추적할 필요가 줄어듭니다. 도우미가 읽던 props나 state는 여전히 실제 의존성입니다.",
    relatedTermIds: ['effect-dependencies', 'use-callback', 'use-effect'], source: 'https://react.dev/reference/react/useCallback',
  },
  {
    id: 'react-extra-effect-self-cycle', kind: 'practical', topic: 'Effect 갱신 루프',
    prompt: "useEffect(() => setConfig({ ...config }), [config])가 반복 갱신하는 직접 원인은 무엇인가요?",
    codeLanguage: 'jsx', code: `import { useEffect, useState } from 'react';
function Settings() {
  const [config, setConfig] = useState({ mode: 'light' });
  useEffect(() => setConfig({ ...config }), [config]);
  return <p>{config.mode}</p>;
}`,
    correct: ['Effect가 매번 새 config 객체를 만들고 의존성 config가 다시 바뀐다', "자신이 갱신한 새 참조를 다시 의존성으로 읽어 다음 Effect를 유발합니다."],
    wrong: [['spread는 항상 기존 객체와 같은 참조를 반환한다', "객체 spread 결과는 새 객체 참조입니다."], ['useEffect는 의존성 배열이 있으면 매초 실행되는 타이머다', "Effect는 배열 비교를 통한 동기화이며 주기적 타이머가 아닙니다."], ['config prop 이름은 React 예약어다', "이름 자체가 문제는 아니며 자기 갱신과 의존성 변화가 연결되어 있습니다."]],
    explanation: "Effect가 state를 갱신하고 그 갱신이 Effect 의존성을 바꾸면 루프가 생길 수 있습니다. 외부 동기화가 필요한지 먼저 확인하고 불필요한 복사 state나 Effect를 제거합니다.",
    relatedTermIds: ['effect-dependencies', 'reference-equality', 'use-effect'], source: 'https://react.dev/reference/react/useEffect',
  },
  {
    id: 'react-extra-purchase-specific-event', kind: 'practical', topic: '사용자 행동과 Effect',
    prompt: "purchase는 실제 구매 요청을 보내는 Promise 반환 함수입니다. 아래 코드는 화면 표시나 수량 변경도 구매로 처리합니다. 구매 버튼을 눌렀을 때만 요청하도록 호출 위치를 어디로 옮겨야 하나요?",
    codeLanguage: "jsx", code: "import { useEffect, useState } from 'react';\nexport function Product({ purchase }) {\n  const [quantity, setQuantity] = useState(1);\n  useEffect(() => { purchase(quantity); }, [quantity, purchase]);\n  return <>\n    <button onClick={() => setQuantity(q => q + 1)}>수량 추가</button>\n    <button>구매 {quantity}개</button>\n  </>;\n}",
    correct: ['구매 버튼의 이벤트 핸들러에서 요청한다', "특정 사용자 행동이 원인인 작업을 그 이벤트 흐름에서 실행합니다."],
    wrong: [['상품 컴포넌트의 마운트 Effect에서 구매 요청한다', "화면을 보기만 해도 구매 요청이 발생하여 사용자 행동 조건과 다릅니다."], ['수량을 의존성에 둔 Effect에서 매번 구매 요청한다', "수량 수정이 실제 구매 버튼 클릭과 동일한 의도는 아닙니다."], ['컴포넌트 JSX 계산 직전에 요청한다', "렌더 재계산이 구매 부수 효과를 반복할 수 있습니다."]],
    explanation: "이벤트는 사용자의 특정 행동을 처리하고 Effect는 렌더 결과에 맞춰 외부 시스템을 동기화합니다. 구매 요청의 원인이 클릭이라면 해당 이벤트와 실패·진행 상태를 함께 관리합니다.",
    relatedTermIds: ['effect-vs-event', 'react-event-handler', 'idempotency-key'], source: 'https://react.dev/learn/you-might-not-need-an-effect',
  },
  {
    id: 'react-extra-separate-effects-sync', kind: 'practical', topic: '독립적인 Effect 분리',
    prompt: "loadCities와 loadAreas는 외부 모듈의 조회 함수입니다. 도시 city만 바꿔도 아래 loadCities(country)가 다시 실행됩니다. 독립적인 두 동기화를 어떻게 분리해야 하나요?",
    codeLanguage: "jsx", code: "import { useEffect, useState } from 'react';\nimport { loadCities, loadAreas } from './location-api';\nexport function Places({ country, city }) {\n  const [cities, setCities] = useState([]);\n  const [areas, setAreas] = useState([]);\n  useEffect(() => {\n    let ignore = false;\n    loadCities(country).then(value => { if (!ignore) setCities(value); });\n    loadAreas(city).then(value => { if (!ignore) setAreas(value); });\n    return () => { ignore = true; };\n  }, [country, city]);\n  return <p>{cities.length}개 도시, {areas.length}개 지역</p>;\n}",
    correct: ['독립된 조회를 각각의 Effect와 실제 의존성으로 분리한다', "city 변화가 country 조회를 불필요하게 다시 시작하지 않도록 동기화 책임을 나눕니다."],
    wrong: [['country와 city를 모두 의존성에서 제거한다', "필요한 조회 입력 변경을 추적하지 못합니다."], ['지역 조회 결과를 country 값으로 덮어쓴다', "조회 결과와 입력값의 데이터 계약을 섞는 잘못된 갱신입니다."], ['도시 변경을 막아 두 번째 조회를 없앤다', "버그를 줄이는 대신 사용자에게 필요한 기능을 제거합니다."]],
    explanation: "하나의 Effect에 독립된 동기화를 묶으면 의존성 범위도 합쳐집니다. 각 Effect가 한 외부 동기화 목적을 갖게 나누면 입력 변경과 요청 관계가 명확해집니다.",
    relatedTermIds: ['use-effect', 'effect-dependencies', 'dependent-query'], source: 'https://react.dev/learn/removing-effect-dependencies',
  },
  {
    id: 'react-extra-abort-effect-request', kind: 'practical', topic: '요청 중단과 자원 수명',
    prompt: "조회 Effect마다 새 AbortController를 만들었습니다. 그 Effect의 fetch를 정리 시 중단하려면 필요한 연결은 무엇인가요?",
    codeLanguage: 'jsx', code: `import { useEffect } from 'react';
function Loader({ url }) {
  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal }).catch(error => {
      if (!controller.signal.aborted) console.error(error);
    });
    return () => controller.abort();
  }, [url]);
  return <p>조회 연결 예시</p>;
}`,
    correct: ['fetch에 controller.signal을 전달하고 cleanup에서 controller.abort()를 호출한다', "요청과 취소 신호를 연결한 뒤 해당 Effect의 수명 종료 시 중단합니다."],
    wrong: [['signal을 전달하지 않고 abort만 호출한다', "해당 fetch가 그 신호를 구독하지 않아 그 controller로 요청을 중단할 수 없습니다."], ['controller를 state에 넣기만 한다', "보관 위치만 바꾸는 것으로 fetch와 취소 신호가 연결되지 않습니다."], ['이미 abort한 controller를 다음 요청에도 재사용한다', "한 번 중단된 signal은 중단 상태를 유지하므로 새 요청에 새 controller를 사용합니다."]],
    explanation: "AbortController는 요청을 실제로 중단할 수 있는 신호 경로를 제공합니다. 응답을 무시하는 플래그와 역할이 다르며 취소가 서버의 모든 작업을 되돌린다고 가정하지 않습니다.",
    relatedTermIds: ['abort-controller', 'effect-cleanup', 'fetch'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController',
  },
  {
    id: 'react-extra-fetch-http-error-state', kind: 'practical', topic: 'HTTP 실패 UI',
    prompt: "url의 응답은 404이지만 JSON 형식은 정상입니다. 아래 load가 이 응답을 success로 처리하는 문제를 고치려면 무엇을 추가해야 하나요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport function Article({ url }) {\n  const [data, setData] = useState(null);\n  const [status, setStatus] = useState('idle');\n  async function load() {\n    try {\n      const response = await fetch(url);\n      setData(await response.json());\n      setStatus('success');\n    } catch { setStatus('error'); }\n  }\n  return <button onClick={load}>{status}: {JSON.stringify(data)}</button>;\n}",
    correct: ['response.ok를 검사하고 실패 응답을 명시적으로 처리한다', "fetch는 404만으로 Promise를 거부하지 않으므로 HTTP 상태 검사가 필요합니다."],
    wrong: [['catch가 모든 404 응답을 자동으로 처리한다고만 가정한다', "fetch 거부와 HTTP 실패 응답은 같은 조건이 아닙니다."], ['JSON 파싱에 성공하면 요청 성공으로 간주한다', "오류 응답도 유효한 JSON 본문을 가질 수 있습니다."], ['상태 코드를 읽지 않고 항상 success로 저장한다', "실패 응답을 정상 데이터로 렌더하여 사용자에게 잘못된 결과를 줄 수 있습니다."]],
    explanation: "HTTP 실패·네트워크 오류·파싱 오류를 구별하여 조회 결과를 처리합니다. 404 응답은 명시적인 상태 검사를 거쳐 오류나 없는 데이터 UI로 변환합니다.",
    relatedTermIds: ['fetch', 'fetch-network-error', 'http-status-code'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
  },
  {
    id: 'react-extra-cancel-not-failure-toast', kind: 'practical', topic: '취소와 실패 구별',
    prompt: "showFailure는 안정적인 실패 알림 함수입니다. 아래 Effect는 화면 이동 때 요청을 의도적으로 취소해도 실패 알림이 나올 수 있습니다. catch 처리를 어떻게 바꾸는 것이 적절한가요?",
    codeLanguage: "jsx", code: "import { useEffect } from 'react';\nexport function Viewer({ url, showFailure }) {\n  useEffect(() => {\n    const controller = new AbortController();\n    fetch(url, { signal: controller.signal })\n      .catch(error => showFailure(error.message));\n    return () => controller.abort();\n  }, [url, showFailure]);\n  return <p>문서를 불러옵니다</p>;\n}",
    correct: ['해당 signal의 취소 상태를 확인하여 의도적 취소를 일반 조회 실패와 구별한다', "수명 종료에 따른 취소를 서버 장애처럼 표시하지 않도록 실패 원인을 분류합니다."],
    wrong: [['모든 catch 오류를 조용히 무시한다', "의도적 취소뿐 아니라 실제 네트워크·서버 실패까지 사용자에게 감춥니다."], ['AbortError가 오면 실패 요청을 무한 재시도한다', "떠난 화면의 취소된 작업을 계속 재시도하여 불필요한 부하와 오류를 만듭니다."], ['abort를 호출하면 catch가 절대 실행되지 않는다', "fetch 취소는 Promise 거부 경로로 전달될 수 있습니다."]],
    explanation: "취소된 요청은 화면 수명 종료 같은 정상 흐름일 수 있습니다. 취소와 실제 실패를 구별해 사용자 안내를 정하고 signal.reason 등 앱이 사용하는 취소 계약도 함께 살핍니다.",
    relatedTermIds: ['abort-controller', 'fetch', 'error-cause'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
  },
  {
    id: 'react-extra-loading-finally', kind: 'practical', topic: '요청 진행 상태 정리',
    prompt: "아래 함수에 겹치는 요청은 없습니다. save는 Promise를 반환하며 setLoading과 setError는 React setter입니다. 성공·실패 뒤 진행 상태를 모두 정리할 블록을 빈칸 위치에 추가하는 방법은 무엇인가요?",
    codeLanguage: "javascript", code: "async function submit(save, setLoading, setError) {\n  setLoading(true);\n  try { await save(); }\n  catch (error) { setError(error.message); }\n  __BLANK__;\n}",
    correct: ["finally { setLoading(false); }","성공과 실패 경로가 끝난 뒤 공통 정리를 수행하여 버튼이 계속 잠기는 문제를 줄입니다."],
    wrong: [["try 안에서 await save() 뒤에만 setLoading(false)를 추가합니다.","실패하면 loading이 true로 남아 재시도 UI가 잠길 수 있습니다."],["요청을 시작하기 전에만 setLoading(false)를 호출합니다.","실제 요청 진행 중이라는 상태를 표현하지 못합니다."],["catch 안에서만 setLoading(false)를 호출합니다.","정상 성공에서는 진행 상태가 남습니다."]],
    explanation: "finally는 try가 성공하든 catch로 실패를 처리하든 정리 작업을 실행합니다. 이 예제처럼 요청이 겹치지 않는 전제에서는 setLoading(false)를 finally에 두어 양쪽 종료를 일관되게 처리할 수 있습니다.",
    relatedTermIds: ['try-catch', 'promise', 'state'], source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch',
  },
  {
    id: 'react-extra-retry-user-flow', kind: 'practical', topic: '재시도 UI',
    prompt: "이 예제의 요청은 겹치지 않습니다. 이전 load가 실패한 뒤 재시도하면 아래 error가 성공 후에도 남습니다. load 시작과 완료 상태를 어떻게 고치는 것이 적절한가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport function Results({ loadData }) {\n  const [status, setStatus] = useState('idle');\n  const [error, setError] = useState(null);\n  async function load() {\n    try { await loadData(); setStatus('success'); }\n    catch (failure) { setError(failure.message); setStatus('error'); }\n  }\n  return <><button onClick={load}>재시도</button>\n    <p>{status}: {error}</p></>;\n}",
    correct: ['새 요청 시작 시 진행 상태로 전환하고 이전 오류를 정리한 뒤 새 결과에 따라 상태를 갱신한다', "재시도를 새로운 요청 수명으로 처리하여 오래된 실패 상태와 새 결과를 섞지 않습니다."],
    wrong: [['이전 오류를 그대로 두고 항상 success만 true로 바꾼다', "오류와 성공 표시가 충돌할 수 있습니다."], ['버튼에서 페이지 DOM을 삭제만 한다', "새 데이터 요청이나 상태 전이가 실제로 이루어지지 않습니다."], ['모든 실패를 사용자 입력과 관계없이 무한 재시도한다', "영구 실패와 취소까지 반복하며 사용자가 중단할 수 없는 부하를 만들 수 있습니다."]],
    explanation: "재시도는 시작 상태와 완료 결과를 명확히 갖는 새 요청입니다. 자동 재시도가 필요하면 오류 유형·최대 횟수·대기 간격을 정하며 사용자 재시도와 구별합니다.",
    relatedTermIds: ['finite-state-machine', 'exponential-backoff'], source: 'https://react.dev/learn/choosing-the-state-structure',
  },
  {
    id: 'react-extra-mutation-cache-refresh', kind: 'practical', topic: 'Mutation 뒤 서버 캐시',
    prompt: "상위에 QueryClientProvider가 있고 상품 목록의 키는 [\"products\"]입니다. saveProduct는 서버 저장 함수입니다. 성공 후 목록을 서버와 다시 맞추기 위한 onSuccess의 빈칸에는 어떤 코드가 적절한가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nimport { useMutation, useQueryClient } from '@tanstack/react-query';\nexport function Editor({ saveProduct, product }) {\n  const client = useQueryClient();\n  const [draft, setDraft] = useState(product);\n  const mutation = useMutation({\n    mutationFn: saveProduct,\n    onSuccess: response => __BLANK__\n  });\n  return <button onClick={() => mutation.mutate(draft)}>저장</button>;\n}",
    correct: ["client.invalidateQueries({ queryKey: [\"products\"] })","변경된 서버 데이터와 해당 조회 캐시를 연결하는 전략을 적용합니다."],
    wrong: [["(<ul key={Date.now()} />)를 반환하면 서버 캐시도 무효화됩니다.","컴포넌트 상태 정체성과 Query 캐시의 식별·무효화는 다른 기능입니다."],["setDraft(null)로 로컬 상태를 지웁니다.","로컬 초안만 지우며 상품 목록 Query 캐시는 갱신하거나 무효화하지 않습니다. 서버 저장 후 목록을 다시 맞추려는 요구를 충족하지 못합니다."],["Object.assign(product, response)로 prop 객체를 수정합니다.","props 변경은 Query 캐시의 정상 갱신 경로가 아닙니다."]],
    explanation: "서버 상태 라이브러리는 조회 키와 캐시 수명을 관리합니다. mutation 성공 뒤 관련 캐시를 무효화하거나 서버가 반환한 신뢰 가능한 결과로 갱신하여 목록 UI를 맞춥니다.",
    relatedTermIds: ['query-invalidation', 'query-key', 'query-use-mutation'], source: 'https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations',
  },
  {
    id: 'react-extra-url-filter-history', kind: 'practical', topic: 'URL과 필터 상태',
    prompt: "필터가 공유 링크와 브라우저 뒤로가기에 유지되어야 합니다. React 화면 안의 임시 state만 사용하는 대신 고려할 기준 값은 무엇인가요?",
    correct: ['URL 검색 매개변수와 라우터의 경로 상태', "공유·방문 기록으로 복원할 조건을 URL에 표현하면 새 진입과 뒤로가기에서도 읽을 수 있습니다."],
    wrong: [['컴포넌트 렌더마다 무작위 ref 값', "공유하거나 방문 기록에서 복원할 안정적인 값이 아닙니다."], ['필터 버튼의 CSS 색만 저장한다', "화면 색은 실제 필터 조건을 표현하는 데이터 기준이 아닙니다."], ['history를 바꾸면 모든 React state가 자동 복원된다고 가정한다', "URL 변화와 React 상태 동기화는 라우터나 명시적인 읽기 경로가 필요합니다."]],
    explanation: "필터의 공유·복원 요구가 있다면 URL에 의미 있는 상태를 표현합니다. 라우터가 제공하는 URL 상태를 기준으로 읽고 화면 전용 초안과 중복 동기화되지 않도록 구분합니다.",
    relatedTermIds: ['url-state', 'url-search-params', 'history-api'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/History_API',
  },
  {
    id: 'react-extra-validation-touched', kind: 'practical', topic: '입력 오류 표시 시점',
    prompt: "필수 입력이 아직 비어 있지만 사용자가 한 번도 건드리지 않았습니다. 첫 화면부터 모든 오류를 공격적으로 보여 주는 대신 필요한 UI 상태는 무엇인가요?",
    correct: ['필드의 touched 또는 제출 시도 상태와 검증 결과를 구별한다', "유효성 자체와 사용자에게 오류를 언제 보여 줄지를 별도의 조건으로 다룹니다."],
    wrong: [['빈 필드는 항상 유효하다고 처리한다', "표시 시점을 늦추는 것과 필수 입력 조건을 제거하는 것은 다릅니다."], ['오류 메시지만 숨기고 제출 검증도 생략한다', "사용자 안내와 데이터 검증 모두 사라져 잘못된 값이 전달될 수 있습니다."], ['한 번 오류가 생기면 수정 후에도 영구 표시한다', "현재 입력의 검증 결과를 다시 반영하지 않아 사용자에게 오래된 오류를 보여 줍니다."]],
    explanation: "검증 결과는 현재 데이터가 조건을 만족하는지 나타내고 touched·제출 시도는 표시 정책을 결정합니다. 올바른 값으로 수정한 뒤에는 현재 결과에 따라 오류 표시도 갱신합니다.",
    relatedTermIds: ['validation', 'controlled-input'], source: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation',
  },
  {
    id: 'react-extra-ime-enter-submit', kind: 'practical', topic: '한글 조합과 Enter',
    prompt: "한글을 입력한 사용자도 조합이 끝난 뒤에는 Enter로 검색할 수 있어야 합니다. 조합 확정 Enter만 검색으로 오인하지 않도록, 빈칸의 조건 또는 대응으로 적절한 것은 무엇인가요?",
    codeLanguage: "jsx", code: "export function Search({ onSearch }) {\n  return <input aria-label=\"검색\" onKeyDown={event => {\n    if (event.key !== 'Enter') return;\n    if (__BLANK__) return;\n    onSearch(event.currentTarget.value);\n  }} />;\n}",
    correct: ["event.nativeEvent.isComposing","입력기 조합 중 키 입력을 일반 제출 의도와 구별할 수 있습니다."],
    wrong: [["/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(event.currentTarget.value)","완성된 한글 검색어도 정상적으로 제출할 수 있어야 합니다."],["false로 두어 Enter이면 조합 상태를 무시합니다.","조합 확정도 Enter로 발생할 수 있어 입력 도중 불필요한 검색을 만들 수 있습니다."],["(event.currentTarget.value = \"English\", false)","사용자의 실제 검색 의도와 입력 언어를 손상시킵니다."]],
    explanation: "React의 키보드 이벤트에서 nativeEvent.isComposing으로 원래 입력기의 조합 상태를 확인할 수 있습니다. 문자열에 한글이 들어 있는지를 검사하면 조합이 끝난 정상 검색까지 막고, 입력값 치환은 조합 확정과 검색 의도를 구분하지 못합니다.",
    relatedTermIds: ['ime-composition', 'react-event-handler', 'controlled-input'], source: 'https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing',
  },
  {
    id: 'react-extra-field-id-create-on-add', kind: 'practical', topic: '동적 입력 행 ID 생성',
    prompt: "서버 ID가 없는 새 연락처 행을 사용자가 추가합니다. 정렬·삭제에도 각 행의 초안을 유지할 ID 생성 시점은 무엇인가요?",
    correct: ['행을 추가하는 이벤트에서 ID를 한 번 만들어 데이터와 함께 저장한다', "행 데이터의 생명주기 동안 유지할 식별자를 생성하여 이후 렌더에서 재사용합니다."],
    wrong: [['map 렌더마다 crypto.randomUUID()를 key로 호출한다', "같은 행의 key가 렌더마다 달라져 입력 상태와 포커스를 잃을 수 있습니다."], ['현재 목록 길이를 모든 새 행의 영구 ID로 쓴다', "삭제 후 재추가 과정에서 기존 ID와 충돌할 수 있습니다."], ['입력 문자열을 key로 사용한다', "타이핑할 때 식별자가 바뀌며 같은 내용의 행끼리 충돌할 수 있습니다."]],
    explanation: "동적 행의 ID는 표시 중 만들어내는 값이 아니라 데이터의 일부입니다. 추가 시 생성해 보관하면 key와 업데이트 대상 식별에 같은 안정적인 ID를 사용할 수 있습니다.",
    relatedTermIds: ['field-array-identity', 'key', 'react-state-immutability'], source: 'https://react.dev/learn/rendering-lists',
  },
  {
    id: 'react-extra-client-validation-not-trust', kind: 'practical', topic: '클라이언트·서버 검증',
    prompt: "React 폼에서 required와 길이 검사를 통과한 입력만 보내도록 했습니다. 서버에서도 같은 데이터의 권한·형식을 확인해야 하나요?",
    correct: ['해야 한다. 클라이언트 검증은 우회 가능한 사용자 편의 기능이다', "직접 API 호출이나 변조된 요청이 가능하므로 서버가 신뢰 경계를 검증합니다."],
    wrong: [['React state로 보냈으므로 서버는 무조건 믿어도 된다', "프론트엔드 라이브러리는 요청 내용의 신뢰성을 보증하지 않습니다."], ['required 속성만 있으면 권한 검증도 자동 완료된다', "입력의 필수 여부와 사용자의 변경 권한은 다른 조건입니다."], ['프론트와 서버 검증 중 하나를 반드시 제거해야 한다', "사용자 안내와 신뢰 경계 검증은 함께 필요한 역할입니다."]],
    explanation: "클라이언트는 빠른 피드백을 제공하고 서버는 형식·권한·도메인 규칙을 최종 검증합니다. 브라우저에서 한 검사를 서버의 보안 보장으로 해석하지 않습니다.",
    relatedTermIds: ['server-side-validation', 'validation', 'least-privilege'], source: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation',
  },
  {
    id: 'react-extra-numeric-input-empty', kind: 'practical', topic: '숫자 입력의 빈 상태',
    prompt: "아래 number 입력에서 사용자가 내용을 모두 지우면 Number(\"\")가 0이 되어 빈 초안이 사라집니다. amount의 편집 상태를 어떻게 관리하는 것이 적절한가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport function Amount() {\n  const [amount, setAmount] = useState(1);\n  return <input type=\"number\" value={amount}\n    onChange={event => setAmount(Number(event.currentTarget.value))} />;\n}",
    correct: ['편집 중 문자열 초안을 보관하고 빈 값·유효성을 확인한 뒤 숫자로 변환한다', "사용자의 빈 편집 상태와 도메인의 숫자 값을 구별하여 입력을 방해하지 않습니다."],
    wrong: [['빈 값은 무조건 0과 완전히 같은 입력이라고 간주한다', "의도적으로 비우는 편집 과정과 숫자 0이라는 확정 값을 구별하지 못합니다."], ['입력값을 읽지 않고 항상 1을 저장한다', "사용자가 선택한 수량을 반영하지 않습니다."], ['type="number"면 value가 항상 JavaScript number라고 가정한다', "DOM input의 value는 문자열이며 숫자 변환과 빈 값 처리가 별도로 필요합니다."]],
    explanation: "텍스트 입력에서 편집 가능한 상태와 서버에 보낼 숫자 값은 같지 않을 수 있습니다. 빈 문자열을 허용하고 제출이나 적절한 검증 시점에 숫자 변환과 범위 검사를 수행합니다.",
    relatedTermIds: ['controlled-input', 'type-coercion', 'validation'], source: 'https://react.dev/reference/react-dom/components/input',
  },
  {
    id: 'react-extra-input-caret-transform', kind: 'practical', topic: '입력 변환과 Caret',
    prompt: "controlled input에서 onChange마다 e.target.value와 다른 대문자 문자열로 즉시 state를 갱신해 caret이 튑니다. 우선 검토할 방식은 무엇인가요?",
    correct: ['편집 값은 원래 입력값으로 동기 갱신하고 변환 표시나 확정 시점을 분리한다', "입력 중 DOM이 기대한 값과 다른 값으로 덮어쓰는 일을 줄여 선택 위치 문제를 피합니다."],
    wrong: [['onChange 상태 갱신을 항상 늦은 타이머로 보낸다', "controlled 입력의 동기 갱신 조건을 어겨 입력 복원이나 위치 문제를 더 만들 수 있습니다."], ['렌더마다 input key를 무작위로 바꾼다', "입력을 remount하여 포커스와 caret을 잃게 만듭니다."], ['caret이 튀면 label을 제거한다', "입력 위치 문제와 label 연결은 다른 기능입니다."]],
    explanation: "controlled 입력은 이벤트에서 DOM의 현재 입력값으로 동기 갱신하는 것이 기본입니다. 포맷 변환이 필요하면 별도 표시·blur 시 확정·선택 위치 관리 등 요구에 맞는 편집 전략을 설계합니다.",
    relatedTermIds: ['controlled-input', 'focus-management'], source: 'https://react.dev/reference/react-dom/components/input',
  },
  {
    id: 'react-extra-controlled-reset-state', kind: 'practical', topic: '폼 Reset과 State',
    prompt: "아래 title은 React가 value로 제어합니다. form의 기본 reset 동작만으로 title state까지 초기값으로 바뀐다고 가정해도 되나요? 필요한 처리는 무엇인가요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport function TitleForm() {\n  const [title, setTitle] = useState('초기 제목');\n  return <form>\n    <input value={title} onChange={event => setTitle(event.target.value)} />\n    <button type=\"reset\">초기화</button>\n  </form>;\n}",
    correct: ['아니다. controlled 값의 기준 state를 초기화해야 한다', "DOM reset 동작이 React state setter를 자동 실행하는 것은 아닙니다."],
    wrong: [['항상 모든 React state가 자동 초기화된다', "form reset은 컴포넌트 전체 상태 관리 API가 아닙니다."], ['reset이 props 객체를 직접 빈 객체로 바꾼다', "브라우저 폼 reset이 React props를 변경하지 않습니다."], ['controlled input은 초기화할 수 없다', "상태 setter로 초기값을 지정하면 정상적으로 초기화할 수 있습니다."]],
    explanation: "controlled 입력의 표시값은 React state가 소유합니다. 초기화 버튼에서 해당 state를 명시적으로 바꾸고 uncontrolled DOM 초기화와 구별합니다.",
    relatedTermIds: ['controlled-input', 'uncontrolled-input', 'use-state'], source: 'https://react.dev/reference/react-dom/components/input',
  },
  {
    id: 'react-extra-new-node-ref-timing', kind: 'practical', topic: 'Ref 연결과 Commit',
    prompt: "클릭 핸들러에서 setOpen(true)로 조건부 input을 처음 표시한 직후 ref.current를 읽었더니 null입니다. 기본 이유는 무엇인가요?",
    correct: ['상태 요청 직후에는 새 DOM의 커밋과 ref 연결이 아직 끝나지 않았을 수 있다', "setter 호출은 DOM 생성 완료를 동기적으로 보장하지 않습니다."],
    wrong: [['useRef는 조건부 DOM에 절대 사용할 수 없다', "조건부로 렌더한 DOM에도 ref를 연결할 수 있지만 연결 시점을 알아야 합니다."], ['JSX input은 실제 DOM이 되지 않는다', "React가 커밋하면 실제 DOM input 노드가 생성됩니다."], ['ref.current는 읽기만 해도 자동 초기화된다', "읽기 자체가 DOM 생성이나 ref 값을 지우는 동작은 아닙니다."]],
    explanation: "새 노드에 포커스를 주려면 연결 후 실행되는 Effect나 적절한 ref 연결 경로를 사용합니다. 상태 setter 다음 줄이 새 DOM의 존재를 보장한다고 가정하지 않습니다.",
    relatedTermIds: ['react-commit', 'use-ref', 'use-effect'], source: 'https://react.dev/learn/manipulating-the-dom-with-refs',
  },
  {
    id: 'react-extra-sort-state-copy', kind: 'practical', topic: 'State 목록 정렬',
    prompt: "가격은 숫자이고 products는 React state입니다. 원본 상태를 바꾸거나 항목을 제거하지 않고 오름차순 목록을 표시하려면 빈칸에 어떤 코드를 넣어야 하나요?",
    codeLanguage: "jsx", code: "import { useState } from 'react';\nexport function Prices({ initialProducts }) {\n  const [products] = useState(initialProducts);\n  const sorted = __BLANK__;\n  return <ul>{sorted.map(product =>\n    <li key={product.id}>{product.price}</li>\n  )}</ul>;\n}",
    correct: ['[...products].sort((a, b) => a.price - b.price)', "새 배열을 만든 뒤 정렬하여 state의 원본 배열을 직접 변경하지 않습니다."],
    wrong: [['products.sort((a, b) => a.price - b.price)', "sort는 호출한 배열을 제자리에서 바꾸어 기존 state를 변경합니다."], ['products.reverse()만 호출한다', "원본을 변경하며 가격순이라는 조건도 일반적으로 충족하지 않습니다."], ['products.filter(p => p.price)', "filter는 가격순으로 정렬하는 함수가 아닙니다."]],
    explanation: "sort는 원본 배열을 변경하므로 상태에서 파생된 표시용 배열을 먼저 복사합니다. 지원 환경에 따라 toSorted를 선택할 수도 있으며 항목 객체까지 수정할 때는 별도의 복사가 필요합니다.",
    relatedTermIds: ['array-sort', 'array-to-sorted', 'react-state-immutability'], source: 'https://react.dev/learn/updating-arrays-in-state',
  },
  {
    id: 'react-extra-memo-real-dependencies', kind: 'practical', topic: '비용 있는 계산의 Memo',
    prompt: "측정 결과 filterItems(items, query)가 비싸서 useMemo로 감쌌습니다. 최신 검색 결과를 계산하는 의존성 배열은 무엇인가요?",
    codeLanguage: 'jsx', code: `import { useMemo } from 'react';
import { filterItems } from './search';
function Results({ items, query }) {
  const result = useMemo(() => filterItems(items, query), [items, query]);
  return <ul>{result.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
}`,
    correct: ['[items, query]', "계산이 읽는 반응형 입력을 모두 추적하여 데이터나 검색어 변경 시 다시 계산합니다."],
    wrong: [['[]', "처음 계산한 결과만 유지하여 items나 query 변경을 놓칩니다."], ['[items.length]', "내용이 바뀌어도 길이가 같을 수 있고 query 변화도 추적하지 않습니다."], ['[query.length]', "같은 길이의 다른 검색어와 items 변경을 놓칩니다."]],
    explanation: "useMemo는 정확한 입력 관계 위에 계산 비용 최적화를 더하는 도구입니다. 의존성을 줄이려고 필요한 입력을 생략하면 최신 값을 보장할 수 없습니다.",
    relatedTermIds: ['use-memo', 'effect-dependencies', 'derived-state'], source: 'https://react.dev/reference/react/useMemo',
  },
  {
    id: 'react-extra-use-callback-value', kind: 'concept', topic: 'Callback 캐시의 대상',
    prompt: "save는 외부에서 받은 저장 함수입니다. 아직 버튼을 누르지 않았고 memoizedSave를 직접 호출하지도 않았습니다. useCallback의 반환값을 받은 memoizedSave는 무엇인가요?",
    codeLanguage: "jsx", code: "import { useCallback } from 'react';\nexport function Editor({ id, save }) {\n  const memoizedSave = useCallback(() => save(id), [id, save]);\n  return <button onClick={memoizedSave}>저장</button>;\n}",
    correct: ['전달한 함수의 참조', "useCallback은 실행 결과가 아니라 후속 렌더에서 재사용할 함수 값을 반환합니다."],
    wrong: [['save 요청의 서버 응답', "함수 참조 캐시는 서버 응답 캐시와 다른 기능입니다."], ['id의 영구 저장 값', "의존성 id를 디스크나 서버에 저장하는 API가 아닙니다."], ['save(id)를 즉시 실행한 결과', "Hook에 전달한 함수를 반환하며 그 본문을 저장 요청으로 즉시 실행하는 API가 아닙니다."]],
    explanation: "useCallback은 함수 참조 안정화가 필요한 곳에서 사용합니다. 계산 결과 재사용은 useMemo, 서버 응답 재사용은 서버 상태 캐시처럼 각각의 역할을 구별합니다.",
    relatedTermIds: ['use-callback', 'use-memo', 'react-memo'], source: 'https://react.dev/reference/react/useCallback',
  },
  {
    id: 'react-extra-fake-timer-test-cleanup', kind: 'practical', topic: 'Timer 테스트 격리',
    prompt: "React 자동 저장 컴포넌트 테스트에서 fake timer를 켰습니다. 다음 테스트의 실제 타이머 동작을 오염시키지 않으려면 어떻게 해야 하나요?",
    correct: ['테스트 정리에서 보류 타이머를 적절히 처리하고 실제 타이머로 복원한다', "가상 타이머 환경과 남은 작업이 다음 테스트에 전파되지 않게 수명을 정리합니다."],
    wrong: [['전체 테스트에서 fake timer를 영구 유지한다', "다른 테스트의 지연·사용자 이벤트까지 예상과 다른 타이머 환경에서 실행됩니다."], ['타이머가 있으므로 모든 테스트에 고정 5초 sleep을 추가한다', "가상 타이머 진행과 상태 검증을 대체하지 못하며 테스트만 느려집니다."], ['자동 저장 값을 DOM에 직접 대입한다', "실제 타이머와 컴포넌트 동작을 검증하지 않고 결과를 조작합니다."]],
    explanation: "가상 타이머는 시간 의존 로직을 빠르게 검증하는 도구지만 테스트가 끝나면 환경을 복원해야 합니다. React 상태 갱신과 사용자 이벤트 라이브러리의 타이머 옵션도 함께 맞춰 검증합니다.",
    relatedTermIds: ['fake-timers', 'test-isolation', 'debounce'], source: 'https://testing-library.com/docs/using-fake-timers/',
  },
  {
    id: 'react-extra-field-error-description', kind: 'practical', topic: '입력 오류 접근성 연결',
    prompt: "이메일 오류 문구를 input과 연결하여 보조 기술이 읽을 수 있게 하려 합니다. 적절한 구성은 무엇인가요?",
    correct: ['오류 요소에 id를 두고 input의 aria-describedby로 연결하며 오류 상태를 aria-invalid로 표시한다', "오류 설명 관계와 현재 유효성 상태를 의미 있는 속성으로 전달합니다."],
    wrong: [['오류 글자를 빨간색으로만 바꾼다', "색상만으로는 보조 기술에 입력과 오류의 관계를 전달하지 못합니다."], ['label을 삭제하고 오류 문구로 대체한다', "입력의 기본 이름이 사라져 필드 의미를 이해하기 어려워질 수 있습니다."], ['모든 입력에 같은 오류 id를 반복한다', "ID 충돌로 각 입력이 자기 오류에 정확히 연결되지 않을 수 있습니다."]],
    explanation: "입력의 이름과 오류 설명은 각각 필요한 정보입니다. 오류 상태와 문구를 해당 입력에 연결하고 수정 후 오류가 해소되면 현재 상태에 맞춰 갱신합니다.",
    relatedTermIds: ['aria', 'accessible-name', 'validation'], source: 'https://www.w3.org/WAI/tutorials/forms/notifications/',
  },
  {
    id: 'react-extra-async-live-status', kind: 'practical', topic: '비동기 결과 알림',
    prompt: "검색 결과 개수가 비동기로 바뀌지만 입력 포커스는 유지해야 합니다. 결과 요약을 보조 기술에 알리는 방식은 무엇인가요?",
    correct: ['적절한 live region이나 role="status"로 결과 요약을 알린다', "중요하지 않은 상태 갱신을 포커스 이동 없이 전달할 수 있습니다."],
    wrong: [['응답마다 결과 제목에 강제로 포커스를 옮긴다', "사용자의 계속 입력하는 흐름을 깨며 문제의 포커스 유지 조건을 충족하지 않습니다."], ['페이지 제목만 바꾸면 모든 보조 기술이 즉시 결과를 읽는다', "해당 상태 변화의 확실한 알림 경로로 가정할 수 없습니다."], ['숨겨진 div에 data-count만 갱신한다', "데이터 속성 변경만으로 접근성 알림이 생성되지 않습니다."]],
    explanation: "상태 알림은 사용자가 하던 동작을 방해하지 않으면서 필요한 정보를 전달해야 합니다. 결과 전체를 반복 읽히기보다 짧은 요약을 알리고 과도한 알림 빈도도 검토합니다.",
    relatedTermIds: ['live-region', 'aria', 'focus-management'], source: 'https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html',
  },
  {
    id: 'react-extra-dialog-return-focus', kind: 'practical', topic: 'Dialog 닫기 후 Focus',
    prompt: "설정 버튼으로 모달을 열었다가 닫았습니다. 호출 버튼이 아직 화면에 있다면 일반적인 포커스 복원은 무엇인가요?",
    correct: ['설정 모달을 연 버튼으로 돌아간다', "모달 작업이 끝난 뒤 사용자가 시작한 위치에서 이어서 탐색할 수 있습니다."],
    wrong: [['항상 페이지 맨 아래로 이동한다', "작업 흐름과 관계없는 위치로 이동하여 탐색 맥락을 잃게 합니다."], ['닫힌 모달의 제거된 input에 포커스를 유지한다', "제거된 노드는 더 이상 유효한 포커스 대상이 아닙니다."], ['모든 경우 document.body로만 이동한다', "사용자의 이전 위치를 복원하는 일반적인 모달 흐름을 제공하지 않습니다."]],
    explanation: "모달은 열린 동안 내부 포커스를 관리하고 닫은 뒤 호출 위치로 복원합니다. 호출 요소가 없어졌거나 작업 결과가 다른 위치를 요구하면 합리적인 다음 대상으로 이동하는 예외를 검토합니다.",
    relatedTermIds: ['focus-management', 'dialog-dismissal', 'focus-order'], source: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
  },
  {
    id: 'react-extra-native-action-button', kind: 'practical', topic: '네이티브 버튼 동작',
    prompt: "클릭 가능한 저장 UI를 div로 만들고 onClick만 연결했습니다. 키보드 사용자를 위해 우선 검토할 구현은 무엇인가요?",
    correct: ['적절한 type의 button 요소를 사용한다', "네이티브 버튼의 포커스·키보드 활성화·의미를 활용할 수 있습니다."],
    wrong: [['div 글자색만 진하게 한다', "시각 강조만으로 포커스와 키보드 활성화 동작이 생기지 않습니다."], ['role="button"만 넣으면 키보드 기능까지 모두 자동 생긴다', "ARIA 역할은 동작을 구현하지 않으므로 div에는 별도 키보드·포커스 처리가 필요합니다."], ['버튼을 클릭 못 하게 숨긴다', "접근성을 개선하는 대신 저장 기능을 제거합니다."]],
    explanation: "표준 요소가 목적에 맞으면 기본 동작을 활용하는 것이 안정적인 출발점입니다. 사용자 정의 위젯은 의미뿐 아니라 실제 키보드 조작과 초점 동작도 구현해야 합니다.",
    relatedTermIds: ['semantic-html', 'aria', 'focus-order'], source: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
  },
  {
    id: 'react-extra-navigation-anchor', kind: 'practical', topic: '이동과 동작 의미',
    prompt: "새 문서 URL로 이동하는 링크를 만들며 새 탭 열기·주소 복사도 자연스럽게 지원하려 합니다. 기본 요소는 무엇인가요?",
    correct: ['실제 href를 가진 a 요소 또는 이를 보존하는 라우터 링크', "주소를 가진 링크 의미와 브라우저 기본 탐색 기능을 제공합니다."],
    wrong: [['button onClick에서만 location을 바꾼다', "동작 버튼만으로는 링크의 주소 복사와 새 탭 탐색 의미를 자연스럽게 제공하지 않습니다."], ['href 없는 span에 파란색을 준다', "외형만 링크처럼 만들어도 주소와 키보드 링크 동작이 생기지 않습니다."], ['div에 role="link"만 넣는다', "ARIA 역할만으로 브라우저의 실제 링크 탐색 기능을 구현하지 않습니다."]],
    explanation: "이동은 링크, 화면 내 동작은 버튼이라는 기본 의미를 맞춥니다. 클라이언트 라우터를 쓰더라도 링크의 href와 브라우저 기본 사용 방식을 유지하는지 확인합니다.",
    relatedTermIds: ['semantic-html', 'url-state', 'accessible-name'], source: 'https://www.w3.org/WAI/ARIA/apg/patterns/link/',
  },
  {
    id: 'react-extra-test-role-name', kind: 'practical', topic: '사용자 관점 테스트 선택',
    prompt: "자동 JSX 변환이 설정된 Vitest 테스트입니다. 클래스나 태그 배치가 바뀌어도 사용자가 인식하는 저장 버튼 이름을 검증하려면 빈칸에 넣을 선택자는 무엇인가요?",
    codeLanguage: "jsx", code: "import { render, screen } from '@testing-library/react';\nimport { test, expect } from 'vitest';\nfunction SaveButton() { return <button className=\"generated-x7\">저장</button>; }\ntest('저장 버튼', () => {\n  render(<SaveButton />);\n  const button = __BLANK__;\n  expect(button).toBeTruthy();\n});",
    correct: ["screen.getByRole(\"button\", { name: \"저장\" })","역할과 접근성 이름으로 기능을 찾으면 사용자 의미를 검증하고 스타일 구현 의존을 줄입니다."],
    wrong: [["document.querySelectorAll(\"div\")[0]","레이아웃 구조 변화에 취약하며 저장 기능의 의미를 표현하지 못합니다."],["document.querySelector(\".generated-x7\")","빌드나 스타일 변경에 쉽게 깨지는 내부 구현 의존입니다."],["SaveButton.state","사용자가 실제로 누를 버튼과 표시 결과를 검증하는 경로가 아닙니다."]],
    explanation: "접근 가능한 역할과 이름으로 찾으면 사용자가 인식하는 버튼 계약을 검증합니다. 클래스 선택자가 현재 우연히 통과해도 클래스 변경에 독립적이라는 요구를 만족하지 못합니다. 함수의 지역 상태는 UI 선택자가 아닙니다.",
    relatedTermIds: ['unit-test', 'accessible-name', 'integration-test'], source: 'https://testing-library.com/docs/queries/about/',
  },
  {
    id: 'react-extra-test-await-result', kind: 'practical', topic: '비동기 UI 테스트',
    prompt: "SaveStatus는 아래 경로에 정의된 컴포넌트이고 저장 버튼 클릭 후 늦게 도착하는 테스트 응답을 받아 \"완료\"를 표시합니다. 응답 시각에 고정 지연으로 의존하거나 DOM을 조작하지 않고 실제 완료 UI를 기다리려면 빈칸에 무엇을 넣어야 하나요?",
    codeLanguage: "jsx", code: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport { test, expect } from 'vitest';\nimport { SaveStatus } from './SaveStatus';\ntest('저장 완료', async () => {\n  const user = userEvent.setup();\n  render(<SaveStatus />);\n  await user.click(screen.getByRole('button', { name: '저장' }));\n  const message = __BLANK__;\n  expect(message).toBeTruthy();\n});",
    correct: ["await screen.findByText(\"완료\")","조건이 실제로 충족될 때까지 재시도하는 쿼리로 비동기 결과를 검증합니다."],
    wrong: [["(screen.getByText(\"완료\"), screen.getByText(\"완료\"))","동기 호출 반복은 비동기 완료를 기다리는 흐름이 아닙니다."],["await new Promise(resolve => setTimeout(resolve, 5000))","시간만 추측하면 느리고 환경에 따라 불안정한 테스트가 됩니다."],["document.body.appendChild(Object.assign(document.createElement(\"p\"), { textContent: \"완료\" }))","애플리케이션의 실제 저장 완료 동작을 검증하지 않습니다."]],
    explanation: "findBy 쿼리는 지정한 요소의 비동기 출현을 기다리는 데 적합합니다. waitFor 콜백은 실패 조건에서 예외를 던지는 검증을 사용하며 결과가 늦는 원인과 테스트 환경도 함께 확인합니다.",
    relatedTermIds: ['assertion-retry', 'flaky-test', 'integration-test'], source: 'https://testing-library.com/docs/dom-testing-library/api-async/',
  },
  {
    id: 'react-extra-network-test-contract', kind: 'practical', topic: 'React 조회 테스트 경계',
    prompt: "조회 화면의 로딩·성공·실패를 테스트합니다. 컴포넌트의 Hook 구현을 매번 바꾸기보다 안정적인 테스트 경계는 무엇인가요?",
    correct: ['네트워크 응답을 테스트용으로 제어하고 실제 UI 흐름을 검증한다', "컴포넌트 내부 Hook 계약을 우회하지 않고 외부 응답 경계를 통해 각 상태를 재현합니다."],
    wrong: [['테스트마다 useState를 임의 함수로 교체한다', "React Hook 규칙과 실제 상태 동작을 우회하여 구현 변경에 취약한 테스트가 됩니다."], ['실제 운영 서버의 불안정한 데이터에 항상 의존한다', "네트워크·사용자 데이터 변화가 테스트를 불안정하게 만들 수 있습니다."], ['실패 상태는 테스트하기 어렵기 때문에 아예 구현하지 않는다', "사용자에게 필요한 실패 처리 기능을 제거하는 선택입니다."]],
    explanation: "외부 요청 경계에서 성공·실패·지연을 제어하면 실제 컴포넌트의 상태 전이를 검증하기 쉽습니다. 테스트용 응답과 구독·타이머를 정리하여 테스트 간 상태 오염도 방지합니다.",
    relatedTermIds: ['network-interception', 'test-isolation', 'integration-test'], source: 'https://testing-library.com/docs/react-testing-library/example-intro/',
  },
];

export const reactExtraQuizzes: QuizQuestion[] = [
  ...build(foundation, 'foundation'),
  ...build(practical, 'practical'),
  ...reactAdvancedExtraQuizzes,
];
