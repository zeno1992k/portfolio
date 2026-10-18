import type { QuizQuestion } from './types';

export const javascriptQuizzes: QuizQuestion[] = [
  {
    id: 'js-nullish-or', part: 'javascript', level: 'foundation', kind: 'concept', topic: '기본값과 조건',
    prompt: "두 console.log의 출력값은 각각 무엇인가요? 첫 번째 호출과 두 번째 호출을 구분해 주세요.",
    codeLanguage: 'javascript',
    code: `const text = '';
console.log(text ?? 'OK');
console.log(text || 'OK');`,
    choices: [
      { id: 'a', text: "첫 번째 출력: \"\" (빈 문자열)\n두 번째 출력: \"OK\"", explanation: "??는 null 또는 undefined만 대체하므로 빈 문자열을 유지합니다. ||는 빈 문자열을 falsy로 보고 오른쪽 값을 반환합니다." },
      { id: 'b', text: "첫 번째 출력: \"OK\"\n두 번째 출력: \"\" (빈 문자열)", explanation: "두 연산자의 조건을 거꾸로 적용했습니다. 빈 문자열은 nullish가 아니지만 falsy입니다." },
      { id: 'c', text: "첫 번째 출력: \"OK\"\n두 번째 출력: \"OK\"", explanation: "??는 빈 문자열·0·false를 기본값으로 바꾸지 않습니다. 첫 번째 출력은 빈 문자열입니다." },
      { id: 'd', text: "첫 번째 출력: \"\" (빈 문자열)\n두 번째 출력: \"\" (빈 문자열)", explanation: "||는 빈 문자열처럼 falsy인 왼쪽 피연산자 대신 오른쪽 값을 반환합니다." },
    ],
    correctChoiceId: 'a',
    explanation: "누락된 값만 채우려면 ??가 맞습니다. 0점이나 빈 입력을 허용하는 폼에 ||를 쓰면 사용자가 준 값이 기본값으로 바뀔 수 있습니다. 두 연산자는 true/false로 결과를 강제하지 않고 선택한 피연산자를 반환합니다.",
    relatedTermIds: ['truthy-falsy', 'optional-chaining'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing',
    expectedLogs: ['', 'OK'],
  },
  {
    id: 'js-set-object-reference', part: 'javascript', level: 'foundation', kind: 'concept', topic: 'Set과 객체 참조',
    prompt: "서로 다른 객체 리터럴 두 개를 Set에 넣었습니다. result에는 무엇이 들어가나요?",
    codeLanguage: 'javascript',
    code: `const values = new Set([{ a: 1 }, { a: 1 }]);
const result = [...values];
console.log(result);`,
    choices: [
      { id: 'a', text: '[{ a: 1 }]', explanation: "Set은 객체 내부의 속성을 깊게 비교하지 않습니다. 모양이 같아도 서로 다른 참조인 두 객체는 남습니다." },
      { id: 'b', text: '[{ a: 1 }, { a: 1 }]', explanation: "각 객체 리터럴은 별개의 참조를 만듭니다. Set은 두 값을 서로 다른 항목으로 보며 삽입 순서를 유지합니다." },
      { id: 'c', text: '[1, 1]', explanation: "Set이나 펼침 문법은 객체의 속성값을 자동으로 추출하지 않습니다. 항목 자체가 객체입니다." },
      { id: 'd', text: '[{ a: 2 }]', explanation: "Set은 같은 속성을 합산하거나 병합하지 않습니다. 값의 동일성에 따라 항목을 보관합니다." },
    ],
    correctChoiceId: 'b',
    explanation: "Set의 객체 비교 기준은 참조 동일성입니다. 같은 객체 변수 하나를 두 번 넣으면 한 개만 남지만, 여기서는 객체를 두 번 생성했습니다. API 목록을 id 기준으로 중복 제거하려면 id를 키로 쓰는 Map 같은 별도 기준이 필요합니다.",
    relatedTermIds: ['set-object', 'reference-equality'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set',
    expectedLogs: ['[{"a":1},{"a":1}]'],
  },
  {
    id: 'js-map-return', part: 'javascript', level: 'foundation', kind: 'practical', topic: '배열 변환',
    prompt: "이 코드를 실행하면 result의 각 항목은 어떤 값일까요?",
    codeLanguage: 'javascript',
    code: `const result = [2, 4].map(value => {
  value * 2;
});
console.log(result);`,
    choices: [
      { id: 'a', text: '[4, 8]', explanation: "중괄호가 있는 화살표 함수 본문에서는 return이 필요합니다. 계산식만 써도 자동 반환되지는 않습니다." },
      { id: 'b', text: '[2, 4]', explanation: "map은 원본 배열이 아니라 콜백 반환값으로 새 배열을 만듭니다. 콜백이 원래 값을 반환하지 않았습니다." },
      { id: 'c', text: '[undefined, undefined]', explanation: "콜백에 return이 없으므로 두 번 모두 undefined를 반환하고, map은 그 값을 결과 배열에 넣습니다." },
      { id: 'd', text: '[]', explanation: "undefined를 반환해도 map은 항목을 제거하지 않습니다. 제거하려면 filter 등 다른 연산이 필요합니다." },
    ],
    correctChoiceId: 'c',
    explanation: "value => value * 2는 표현식을 반환하지만, value => { value * 2; }는 반환문 없는 함수입니다. { return value * 2; }로 고치면 [4, 8]이 됩니다. 결과 배열은 undefined 두 개이며 JSON 직렬화에서는 배열의 undefined가 null로 보일 수 있습니다.",
    relatedTermIds: ['array-map', 'array-filter'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map',
    expectedLogs: ["[undefined,undefined]"],
  },
  {
    id: 'js-shallow-copy', part: 'javascript', level: 'foundation', kind: 'practical', topic: '객체 복사',
    prompt: "스프레드로 복사한 객체의 중첩 속성을 바꿨습니다. 두 출력은 무엇일까요?",
    codeLanguage: 'javascript',
    code: `const original = { profile: { name: '민수' } };
const copy = { ...original };
copy.profile.name = '지우';
console.log(original === copy);
console.log(original.profile.name);`,
    choices: [
      { id: 'a', text: "첫 번째 출력: true\n두 번째 출력: \"지우\"", explanation: "스프레드는 새로운 최상위 객체를 만듭니다. original과 copy 자체는 같은 참조가 아닙니다." },
      { id: 'b', text: "첫 번째 출력: false\n두 번째 출력: \"민수\"", explanation: "중첩된 profile 객체는 복제되지 않았습니다. 같은 참조를 공유하므로 내부 변경은 original에도 보입니다." },
      { id: 'c', text: "첫 번째 출력: true\n두 번째 출력: \"민수\"", explanation: "최상위 참조는 다르고 중첩 참조는 같습니다. 두 판단을 모두 반대로 적용한 결과입니다." },
      { id: 'd', text: "첫 번째 출력: false\n두 번째 출력: \"지우\"", explanation: "최상위 객체는 새로 만들지만 profile은 같은 객체를 가리킵니다. 공유한 객체의 name을 바꿨습니다." },
    ],
    correctChoiceId: 'd',
    explanation: "스프레드는 얕은 복사입니다. 중첩 상태를 독립적으로 수정하려면 변경할 경로의 객체도 { ...original, profile: { ...original.profile, name: \"지우\" } }처럼 새로 만들어야 합니다. 지원되는 데이터의 깊은 복사가 목적이면 structuredClone을 검토할 수 있습니다.",
    relatedTermIds: ['spread-syntax', 'shallow-copy'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax',
    expectedLogs: ['false', '지우'],
  },
  {
    id: 'js-numeric-sort', part: 'javascript', level: 'foundation', kind: 'coding-test', topic: '숫자 정렬',
    prompt: "첫 줄은 기본 정렬, 둘째 줄은 비교 함수를 사용합니다. 출력 순서는 무엇인가요?",
    codeLanguage: 'javascript',
    code: `const values = [8, 30, 4];
console.log([...values].sort());
console.log([...values].sort((a, b) => a - b));`,
    choices: [
      { id: 'a', text: "첫 번째 출력: [30, 4, 8]\n두 번째 출력: [4, 8, 30]", explanation: "기본 sort는 문자열로 비교하므로 \"30\"이 \"4\"보다 앞섭니다. a - b는 숫자 오름차순 비교입니다." },
      { id: 'b', text: "첫 번째 출력: [4, 8, 30]\n두 번째 출력: [4, 8, 30]", explanation: "기본 sort는 숫자 오름차순을 보장하지 않습니다. 숫자 배열이어도 기본 비교는 문자열 기준입니다." },
      { id: 'c', text: "첫 번째 출력: [30, 8, 4]\n두 번째 출력: [30, 8, 4]", explanation: "둘 다 내림차순이 아닙니다. 숫자 내림차순은 b - a 비교 함수를 사용합니다." },
      { id: 'd', text: "첫 번째 출력: [8, 30, 4]\n두 번째 출력: [4, 8, 30]", explanation: "첫 번째 정렬도 실제로 순서를 바꿉니다. 비교 함수를 생략한다고 정렬이 생략되지는 않습니다." },
    ],
    correctChoiceId: 'a',
    explanation: "코딩테스트에서 숫자 정렬은 비교 함수를 명시해야 합니다. sort는 호출한 배열을 변경하므로 예제는 스프레드로 각각 복사했습니다. 원본을 보존하는 toSorted((a, b) => a - b)도 사용할 수 있습니다.",
    relatedTermIds: ['array-sort', 'sorting'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort',
    expectedLogs: ['[30,4,8]', '[4,8,30]'],
  },
  {
    id: 'js-frequency-map', part: 'javascript', level: 'foundation', kind: 'coding-test', topic: '빈도 세기',
    prompt: "문자열 배열을 한 번 순회했습니다. 마지막 출력은 무엇일까요?",
    codeLanguage: 'javascript',
    code: `const counts = new Map();
for (const value of ['a', 'b', 'a', 'a']) {
  counts.set(value, (counts.get(value) ?? 0) + 1);
}
console.log([...counts]);`,
    choices: [
      { id: 'a', text: '[["a", 1], ["b", 1]]', explanation: "중복된 키를 무시하지 않습니다. 기존 count를 읽고 1씩 증가시키므로 a의 빈도는 3입니다." },
      { id: 'b', text: '[["a", 3], ["b", 1]]', explanation: "처음 보는 키는 0에서 시작하고, 이후 기존 빈도를 증가시킵니다. Map은 키의 최초 삽입 순서로 순회합니다." },
      { id: 'c', text: '[["b", 1], ["a", 3]]', explanation: "기존 a의 값을 다시 set해도 키가 마지막으로 이동하지 않습니다. 최초 삽입 순서는 a, b입니다." },
      { id: 'd', text: '["a", "b", "a", "a"]', explanation: "Map은 같은 키에 여러 엔트리를 저장하지 않습니다. 이 코드는 원본 목록이 아니라 빈도표를 만듭니다." },
    ],
    correctChoiceId: 'b',
    explanation: "빈도표는 각 값의 등장 횟수를 모으는 패턴입니다. Map.get은 키가 없으면 undefined를 반환하므로 ?? 0으로 첫 값을 준비합니다. 아나그램 비교나 재고 수량 집계에서는 전체 목록을 반복 검색하기보다 이런 집계를 먼저 만드는 편이 유용합니다.",
    relatedTermIds: ['map-object', 'array-data-structure'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map',
    expectedLogs: ['[["a",3],["b",1]]'],
  },
  {
    id: 'js-filter-find', part: 'javascript', level: 'foundation', kind: 'practical', topic: '검색과 목록 필터',
    prompt: "활성 항목 전체와 활성 항목 하나를 각각 구했습니다. 출력은 무엇일까요?",
    codeLanguage: 'javascript',
    code: `const items = [
  { id: 1, active: false },
  { id: 2, active: true },
  { id: 3, active: true },
];
console.log(items.filter(item => item.active).length);
console.log(items.find(item => item.active).id);`,
    choices: [
      { id: 'a', text: "첫 번째 출력: 1\n두 번째 출력: 2", explanation: "find는 첫 항목 하나를 반환하지만 filter는 조건을 만족하는 항목 두 개를 담는 배열을 반환합니다." },
      { id: 'b', text: "첫 번째 출력: 2\n두 번째 출력: 3", explanation: "find는 마지막이 아니라 첫 번째로 조건을 만족한 항목을 반환합니다. 그 id는 2입니다." },
      { id: 'c', text: "첫 번째 출력: 2\n두 번째 출력: 2", explanation: "활성 항목은 id 2, 3 두 개이고, 그중 처음 찾는 항목의 id는 2입니다." },
      { id: 'd', text: "첫 번째 출력: 3\n두 번째 출력: 1", explanation: "두 함수 모두 콜백 조건을 적용합니다. active가 false인 첫 항목은 결과에서 제외됩니다." },
    ],
    correctChoiceId: 'c',
    explanation: "화면에 여러 결과를 보여줄 때는 filter, 상세 항목 하나를 찾을 때는 find를 사용합니다. find가 찾지 못하면 undefined이므로 실제 API 데이터에서는 찾은 값의 존재를 확인한 뒤 속성에 접근해야 합니다.",
    relatedTermIds: ['array-filter', 'array-find'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter',
    expectedLogs: ['2', '2'],
  },
  {
    id: 'js-closure-shared-variable', part: 'javascript', level: 'foundation', kind: 'concept', topic: '클로저',
    prompt: "반환된 함수는 바깥 변수의 첫 값만 기억할까요? 마지막 출력은 무엇인가요?",
    codeLanguage: 'javascript',
    code: `function createCounter() {
  let count = 0;
  return () => ++count;
}
const next = createCounter();
console.log([next(), next(), next()]);`,
    choices: [
      { id: 'a', text: '[1, 1, 1]', explanation: "반환된 함수를 호출할 때마다 count를 새로 선언하지 않습니다. 하나의 createCounter 호출이 만든 변수를 계속 사용합니다." },
      { id: 'b', text: '[0, 1, 2]', explanation: "++count는 증가한 값을 반환하는 전위 증가 연산자입니다. count++였다면 첫 결과가 0이 됩니다." },
      { id: 'c', text: 'ReferenceError가 발생한다', explanation: "클로저는 바깥 함수가 반환된 후에도 렉시컬 환경의 변수에 접근할 수 있습니다." },
      { id: 'd', text: '[1, 2, 3]', explanation: "같은 count 변수를 읽고 증가시킵니다. 바깥 함수 실행이 끝나도 반환된 함수가 그 환경에 접근합니다." },
    ],
    correctChoiceId: 'd',
    explanation: "클로저는 생성 당시 값의 고정 복사본만 저장하는 장치가 아닙니다. 해당 렉시컬 환경의 변수에 접근하기 때문에 수정한 count를 다음 호출도 읽습니다. createCounter를 한 번 더 호출하면 별도 환경을 가진 독립적인 카운터가 생깁니다.",
    relatedTermIds: ['closure', 'lexical-environment'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures',
    expectedLogs: ['[1,2,3]'],
  },
  {
    id: 'js-stack-lifo', part: 'javascript', level: 'foundation', kind: 'coding-test', topic: '스택',
    prompt: "배열의 끝을 스택의 위로 사용합니다. 두 번 pop한 결과는 무엇인가요?",
    codeLanguage: 'javascript',
    code: `const stack = [];
stack.push(1);
stack.push(2);
stack.push(3);
console.log([stack.pop(), stack.pop()]);`,
    choices: [
      { id: 'a', text: '[1, 2]', explanation: "이는 먼저 넣은 것을 먼저 꺼내는 큐의 순서입니다. pop은 배열 끝에서 꺼냅니다." },
      { id: 'b', text: '[3, 2]', explanation: "마지막에 넣은 3을 먼저 꺼내고, 그 다음으로 최근에 넣은 2를 꺼냅니다. 스택의 LIFO 규칙입니다." },
      { id: 'c', text: '[3, 3]', explanation: "pop은 조회만 하지 않고 항목을 제거합니다. 두 번째 pop 때 3은 이미 없습니다." },
      { id: 'd', text: '[2, 1]', explanation: "3을 먼저 제거하는 별도 연산이 없습니다. 첫 번째 pop 결과부터 3이어야 합니다." },
    ],
    correctChoiceId: 'b',
    explanation: "스택은 마지막에 넣은 항목을 먼저 꺼내는 자료구조입니다. 괄호 짝 확인이나 되돌리기 기록을 처리할 때 사용할 수 있습니다. 배열의 push/pop과 앞쪽에서 빼는 shift를 섞으면 서로 다른 탐색 순서가 되므로 사용 방향을 먼저 정합니다.",
    relatedTermIds: ['stack', 'queue'],
    source: 'https://xlinux.nist.gov/dads/HTML/stack.html',
    expectedLogs: ['[3,2]'],
  },
  {
    id: 'js-destructuring-default', part: 'javascript', level: 'foundation', kind: 'concept', topic: '구조 분해 기본값',
    prompt: "구조 분해의 기본값은 언제 적용될까요? 두 출력의 순서는 무엇인가요?",
    codeLanguage: 'javascript',
    code: `const { page = 1, title = '없음' } = {
  page: 0,
  title: null,
};
console.log(page);
console.log(title);`,
    choices: [
      { id: 'a', text: "첫 번째 출력: 1\n두 번째 출력: \"없음\"", explanation: "구조 분해 기본값은 모든 falsy 값을 대체하지 않습니다. 0과 null은 그대로 남습니다." },
      { id: 'b', text: "첫 번째 출력: 0\n두 번째 출력: \"없음\"", explanation: "null은 undefined와 다릅니다. title 속성이 null인 경우 기본값이 적용되지 않습니다." },
      { id: 'c', text: "첫 번째 출력: 0\n두 번째 출력: null", explanation: "속성이 없거나 값이 undefined일 때만 기본값이 적용됩니다. 여기서는 0과 null이 명시된 값입니다." },
      { id: 'd', text: "첫 번째 출력: 1\n두 번째 출력: null", explanation: "0은 undefined가 아니므로 page의 기본값 1을 사용하지 않습니다." },
    ],
    correctChoiceId: 'c',
    explanation: "구조 분해의 = 기본값은 undefined에만 반응합니다. null도 누락으로 취급하려면 구조 분해 후 title ?? \"없음\"처럼 별도의 정책을 적용합니다. API 응답에서 0·null·속성 부재를 각각 어떻게 취급할지 구분하면 기본값 오류를 줄일 수 있습니다.",
    relatedTermIds: ['destructuring', 'truthy-falsy'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring',
    expectedLogs: ['0', 'null'],
  },
  {
    id: 'js-event-loop-order', part: 'javascript', level: 'practical', kind: 'concept', topic: '이벤트 루프',
    prompt: "브라우저에서 이 스크립트를 실행합니다. 다른 작업이 없다면 출력 순서는 무엇인가요?",
    codeLanguage: 'javascript',
    code: `console.log('A');
setTimeout(() => console.log('C'), 0);
Promise.resolve().then(() => console.log('B'));
console.log('D');`,
    choices: [
      { id: 'a', text: "첫 번째 출력: A\n두 번째 출력: D\n세 번째 출력: B\n네 번째 출력: C", explanation: "동기 코드 A, D가 먼저 끝나고, Promise 마이크로태스크 B가 타이머 태스크 C보다 먼저 처리됩니다." },
      { id: 'b', text: "첫 번째 출력: A\n두 번째 출력: B\n세 번째 출력: C\n네 번째 출력: D", explanation: "Promise.then과 타이머 콜백은 현재 동기 실행을 중간에 끊지 않습니다. D가 먼저 출력됩니다." },
      { id: 'c', text: "첫 번째 출력: A\n두 번째 출력: D\n세 번째 출력: C\n네 번째 출력: B", explanation: "현재 태스크 뒤에는 마이크로태스크를 처리합니다. 작성 순서만으로 타이머가 Promise.then보다 먼저 실행되지는 않습니다." },
      { id: 'd', text: "첫 번째 출력: A\n두 번째 출력: B\n세 번째 출력: D\n네 번째 출력: C", explanation: "이미 이행한 Promise라도 then 콜백은 동기 실행되지 않습니다. D 다음에 B가 나옵니다." },
    ],
    correctChoiceId: 'a',
    explanation: "현재 스크립트 실행이 끝난 뒤 마이크로태스크 큐를 처리하고, 이후 실행 가능한 다음 태스크를 처리합니다. setTimeout의 0은 즉시 실행이 아니라 최소 지연 이후 실행 가능한 태스크 등록입니다. 오래 걸리는 동기 코드 자체는 여전히 화면 반응을 막을 수 있습니다.",
    relatedTermIds: ['event-loop', 'promise'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide',
  },
  {
    id: 'js-promise-all-order', part: 'javascript', level: 'practical', kind: 'practical', topic: '병렬 요청 결과',
    prompt: "fast가 먼저 완료됩니다. Promise.all 결과 배열의 순서는 무엇일까요?",
    codeLanguage: 'javascript',
    code: `const slow = new Promise(resolve => {
  setTimeout(() => resolve('slow'), 10);
});
const fast = Promise.resolve('fast');
Promise.all([slow, fast]).then(values => {
  console.log(values);
});`,
    choices: [
      { id: 'a', text: '["fast", "slow"]', explanation: "완료 순서가 결과 배열의 순서를 결정하지 않습니다. 입력 iterable의 순서를 유지합니다." },
      { id: 'b', text: '["slow", "fast"]', explanation: "slow의 결과는 입력 인덱스 0에, fast의 결과는 인덱스 1에 들어갑니다. 모든 작업이 이행한 뒤 반환됩니다." },
      { id: 'c', text: '["fast"]', explanation: "Promise.all은 첫 완료 값 하나를 고르는 함수가 아닙니다. 모든 입력의 이행 결과를 모읍니다." },
      { id: 'd', text: '완료 순서가 달라지므로 배열 순서를 알 수 없다', explanation: "네트워크나 타이머 완료 순서와 무관하게 결과 위치는 입력 순서로 정의되어 있습니다." },
    ],
    correctChoiceId: 'b',
    explanation: "Promise.all은 결과를 입력 순서로 모으므로 여러 요청을 각각의 UI 영역에 대응시키기 좋습니다. 하나가 거부되면 전체도 거부되지만 나머지 작업을 자동 취소하지 않습니다. 모든 성공·실패 결과가 필요하면 Promise.allSettled를 검토합니다.",
    relatedTermIds: ['promise-all', 'promise-all-settled'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all',
  },
  {
    id: 'js-abort-request', part: 'javascript', level: 'practical', kind: 'practical', topic: '요청 취소',
    prompt: "검색어가 바뀌어 진행 중인 fetch에 연결한 AbortController.abort()를 호출했습니다. 맞는 설명은 무엇인가요?",
    choices: [
      { id: 'a', text: '서버에서 시작한 모든 작업도 반드시 되돌린다', explanation: "클라이언트 요청 취소는 서버의 처리나 저장 변경을 되돌린다는 보장이 아닙니다. 서버 작업의 정책은 별도로 설계합니다." },
      { id: 'b', text: 'fetch는 취소되어도 보통 정상 Response를 반환한다', explanation: "진행 중인 fetch가 해당 signal로 취소되면 일반적으로 AbortError로 거부됩니다. 정상 HTTP 응답과 다르게 처리해야 합니다." },
      { id: 'c', text: '진행 중인 fetch가 취소되며, 취소 오류를 구분해서 처리해야 한다', explanation: "signal을 전달한 진행 중 작업을 중단시키고 취소로 인한 거부를 처리합니다. 사용자에게 일반 네트워크 장애처럼 표시할 필요는 없습니다." },
      { id: 'd', text: '취소한 signal은 다음 요청에서 자동으로 초기화된다', explanation: "한 번 취소된 signal은 다시 미취소 상태가 되지 않습니다. 다음 요청에는 새 AbortController가 필요합니다." },
    ],
    correctChoiceId: 'c',
    explanation: "AbortController는 연결한 비동기 작업에 취소 의사를 전달합니다. 검색 자동완성에서는 이전 요청의 signal을 취소하고 다음 요청에 새 controller를 만듭니다. 이미 완료된 작업을 되돌리지는 않으므로 이전 응답이 상태를 덮지 않도록 최신 요청인지 확인하는 설계도 유용합니다.",
    relatedTermIds: ['abort-controller', 'fetch'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController',
  },
  {
    id: 'js-flatmap-expansion', part: 'javascript', level: 'practical', kind: 'practical', topic: '항목 제거와 확장',
    prompt: "flatMap으로 각 항목을 0개 또는 2개로 바꿨습니다. 출력은 무엇인가요?",
    codeLanguage: 'javascript',
    code: `const result = [1, 2, 3].flatMap(value =>
  value % 2 === 0 ? [] : [value, value * 10]
);
console.log(result);`,
    choices: [
      { id: 'a', text: '[[1, 10], [], [3, 30]]', explanation: "이는 map만 적용한 결과의 모양입니다. flatMap은 반환된 배열을 한 단계 펼칩니다." },
      { id: 'b', text: '[1, 2, 3]', explanation: "콜백의 반환값을 사용하므로 원본 항목을 그대로 유지하지 않습니다. 짝수 2는 빈 배열로 바꿨습니다." },
      { id: 'c', text: '[10, 30]', explanation: "홀수마다 [value, value * 10] 두 값을 반환합니다. 원래 홀수 값도 결과에 포함됩니다." },
      { id: 'd', text: '[1, 10, 3, 30]', explanation: "홀수는 두 항목으로 확장하고 짝수는 빈 배열로 제거합니다. 반환한 배열을 한 단계 펼친 결과입니다." },
    ],
    correctChoiceId: 'd',
    explanation: "flatMap은 각 입력을 여러 출력으로 바꾸거나 []로 제거할 수 있습니다. API의 그룹별 항목을 하나의 목록으로 만드는 데 활용합니다. 중첩을 무한히 펼치지 않고 한 단계만 펼치므로 반환값의 깊이를 확인해야 합니다.",
    relatedTermIds: ['array-map', 'array-filter'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap',
    expectedLogs: ['[1,10,3,30]'],
  },
  {
    id: 'js-fixed-window', part: 'javascript', level: 'practical', kind: 'coding-test', topic: '슬라이딩 윈도우',
    prompt: "길이가 3인 연속 구간의 최대 합을 구합니다. 출력값과 올바른 설명은 무엇인가요?",
    codeLanguage: 'javascript',
    code: `const values = [2, 5, 1, 4, 3];
const size = 3;
let sum = values.slice(0, size).reduce((a, b) => a + b, 0);
let best = sum;
for (let right = size; right < values.length; right++) {
  sum += values[right] - values[right - size];
  best = Math.max(best, sum);
}
console.log(best);`,
    choices: [
      { id: 'a', text: '10 · 들어오는 값은 더하고 나가는 값은 뺀다', explanation: "구간 합은 8, 10, 8입니다. 이전 합에 새 오른쪽 값과 빠지는 왼쪽 값의 차이만 반영하면 됩니다." },
      { id: 'b', text: '12 · 큰 값 5, 4, 3을 골라 더한다', explanation: "문제는 임의의 세 값이 아니라 연속한 세 값입니다. 떨어진 위치의 값을 고를 수 없습니다." },
      { id: 'c', text: '8 · 첫 구간 이후 합을 고정한다', explanation: "루프에서 구간이 이동하고 sum이 갱신됩니다. 두 번째 구간 [5, 1, 4]의 합 10을 놓쳤습니다." },
      { id: 'd', text: '15 · 전체 배열의 합을 구한다', explanation: "창의 크기는 3입니다. 매 단계 빠지는 값을 빼므로 전체 누적 합을 유지하는 코드가 아닙니다." },
    ],
    correctChoiceId: 'a',
    explanation: "고정 길이 구간의 합을 처음 한 번 계산한 뒤 창을 한 칸씩 옮기면 전체를 선형 시간에 처리합니다. 매 구간을 다시 합산하는 비용을 줄일 수 있습니다. best를 0이 아니라 첫 구간 합으로 시작했기 때문에 값이 모두 음수인 입력도 처리할 수 있습니다.",
    relatedTermIds: ['sliding-window', 'array-reduce'],
    source: 'https://usaco.guide/silver/two-pointers#sliding-window',
    expectedLogs: ['10'],
  },
  {
    id: 'js-two-pointers-direction', part: 'javascript', level: 'practical', kind: 'coding-test', topic: '정렬 배열의 투 포인터',
    prompt: "오름차순 배열 [1, 3, 6, 8]에서 합이 10인 두 값을 찾습니다. 양 끝의 합 9가 목표보다 작을 때 어떤 이동이 맞을까요?",
    choices: [
      { id: 'a', text: '오른쪽 포인터를 왼쪽으로 옮긴다', explanation: "오른쪽 값을 작게 만들면 이미 작은 합이 더 작아질 수 있습니다. 목표보다 작을 때의 배제 방향이 아닙니다." },
      { id: 'b', text: '왼쪽 포인터를 오른쪽으로 옮긴다', explanation: "현재 왼쪽 값과 가장 큰 오른쪽 값을 더해도 작다면, 같은 왼쪽 값으로는 답을 만들 수 없습니다. 왼쪽 값을 키웁니다." },
      { id: 'c', text: '두 포인터를 매번 동시에 안쪽으로 옮긴다', explanation: "둘을 동시에 옮기면 검사해야 할 조합을 건너뛸 수 있습니다. 합의 비교 결과에 따라 한쪽만 이동합니다." },
      { id: 'd', text: '정렬 여부에 관계없이 어느 포인터든 옮겨도 된다', explanation: "정렬에 따른 값의 단조성이 탐색 영역을 안전하게 버리는 근거입니다. 정렬하지 않은 입력에는 같은 규칙을 그대로 적용할 수 없습니다." },
    ],
    correctChoiceId: 'b',
    explanation: "오름차순 정렬이 이동 방향의 근거입니다. 합이 작으면 왼쪽을 키우고, 크면 오른쪽을 줄이며, 같으면 답을 찾았습니다. 이미 정렬된 배열의 탐색 자체는 O(n)이며, 원래 인덱스가 필요하다면 정렬 전 인덱스를 함께 보관합니다.",
    relatedTermIds: ['two-pointers', 'sorting'],
    source: 'https://usaco.guide/silver/two-pointers#sum-of-two-values',
  },
  {
    id: 'js-binary-search-progress', part: 'javascript', level: 'practical', kind: 'coding-test', topic: '이진 탐색 경계',
    prompt: "오름차순 배열에서 target을 찾는 코드입니다. 출력되는 인덱스는 무엇인가요?",
    codeLanguage: 'javascript',
    code: `const values = [2, 5, 8, 12, 16];
const target = 8;
let left = 0, right = values.length - 1;
let found = -1;
while (left <= right) {
  const middle = Math.floor((left + right) / 2);
  if (values[middle] === target) { found = middle; break; }
  if (values[middle] < target) left = middle + 1;
  else right = middle - 1;
}
console.log(found);`,
    choices: [
      { id: 'a', text: '8', explanation: "found에는 배열의 값이 아니라 middle 인덱스를 저장합니다. target의 값과 결과 인덱스를 구분해야 합니다." },
      { id: 'b', text: '3', explanation: "JavaScript 배열의 인덱스는 0부터 시작합니다. 세 번째 원소 8의 인덱스는 2입니다." },
      { id: 'c', text: '2', explanation: "첫 middle은 2이고 values[2]가 8이므로 해당 인덱스를 저장하고 반복을 끝냅니다." },
      { id: 'd', text: '-1', explanation: "8은 입력 배열에 있으며 첫 비교에서 일치합니다. -1은 끝까지 찾지 못할 경우의 초기값입니다." },
    ],
    correctChoiceId: 'c',
    explanation: "이진 탐색은 정렬된 탐색 구간을 매번 줄입니다. 일치하지 않을 때 middle을 제외하는 +1과 -1이 반복의 진전을 보장합니다. 중복된 값의 첫 위치를 구하는 lower bound는 일치 시 종료하는 이 코드와 경계 갱신 규칙이 다릅니다.",
    relatedTermIds: ['binary-search', 'array-data-structure'],
    source: 'https://www.cs.cornell.edu/courses/cs2112/2020fa/lectures/loopinv/',
    expectedLogs: ['2'],
  },
  {
    id: 'js-prefix-sum-range', part: 'javascript', level: 'practical', kind: 'coding-test', topic: '누적 합',
    prompt: "prefix[k]는 앞의 k개 값의 합입니다. 인덱스 1 이상, 4 미만 구간의 합은 무엇인가요?",
    codeLanguage: 'javascript',
    code: `const values = [3, 1, 4, 2];
const prefix = [0];
for (const value of values) {
  prefix.push(prefix[prefix.length - 1] + value);
}
console.log(prefix[4] - prefix[1]);`,
    choices: [
      { id: 'a', text: '10', explanation: "10은 전체 배열 합입니다. 인덱스 1부터의 구간에서는 앞의 값 3을 빼야 합니다." },
      { id: 'b', text: '5', explanation: "5는 인덱스 1, 2 두 값만 더한 결과입니다. 이 구간은 인덱스 3의 값 2도 포함합니다." },
      { id: 'c', text: '6', explanation: "6은 인덱스 2, 3의 합입니다. 구간의 시작 인덱스 1에 있는 값 1도 포함됩니다." },
      { id: 'd', text: '7', explanation: "prefix[4]는 10, prefix[1]은 3입니다. 앞부분을 제외하면 인덱스 1, 2, 3의 합 7이 남습니다." },
    ],
    correctChoiceId: 'd',
    explanation: "prefix를 [0]부터 만들면 반열린 구간 [left, right)의 합은 prefix[right] - prefix[left]입니다. O(n) 전처리 후 여러 구간 합을 각각 O(1)에 구할 수 있습니다. 원본 값이 자주 바뀐다면 누적 합을 다시 계산하는 비용까지 고려해야 합니다.",
    relatedTermIds: ['array-reduce', 'array-data-structure'],
    source: 'https://usaco.guide/silver/prefix-sums',
    expectedLogs: ['7'],
  },
  {
    id: 'js-bfs-discovery', part: 'javascript', level: 'practical', kind: 'coding-test', topic: 'BFS 방문 처리',
    prompt: "가중치 없는 그래프를 BFS로 순회합니다. 같은 정점이 큐에 여러 번 들어가는 것을 막는 방법은 무엇인가요?",
    choices: [
      { id: 'a', text: '큐에 넣는 시점에 방문 처리하고, 이미 방문한 이웃은 넣지 않는다', explanation: "처음 발견할 때 방문 표시를 하면 다른 정점에서 같은 이웃을 발견해도 큐에 중복 등록하지 않습니다." },
      { id: 'b', text: '큐에서 꺼낸 뒤에만 방문 표시하고 이웃은 조건 없이 넣는다', explanation: "꺼내기 전까지 동일 정점이 여러 경로에서 등록될 수 있습니다. 조건 없이 넣으면 순환 그래프에서도 문제가 생깁니다." },
      { id: 'c', text: '큐 대신 스택을 쓰면 자동으로 중복이 사라진다', explanation: "스택과 큐 모두 중복 항목을 담을 수 있습니다. 스택으로 바꾸면 탐색 순서도 BFS와 달라집니다." },
      { id: 'd', text: '시작 정점을 방문 표시하지 않고 마지막에만 표시한다', explanation: "순환 경로를 통해 시작 정점이 다시 등록될 수 있습니다. 시작 정점도 최초 등록 시 표시합니다." },
    ],
    correctChoiceId: 'a',
    explanation: "BFS는 큐로 가까운 정점부터 처리합니다. 시작 정점부터 큐에 넣을 때 방문 처리하면 중복 등록을 막을 수 있습니다. 가중치가 모두 같은 그래프에서는 최초 발견 거리로 최단 경로를 구하지만, 일반적인 가중치 그래프에는 다른 알고리즘이 필요합니다.",
    relatedTermIds: ['breadth-first-search', 'queue'],
    source: 'https://xlinux.nist.gov/dads/HTML/breadthfirst.html',
  },
  {
    id: 'js-debounce-search', part: 'javascript', level: 'practical', kind: 'practical', topic: '검색 입력과 디바운스',
    prompt: "입력할 때마다 기존 타이머를 취소하고 300ms 후 검색하도록 다시 예약합니다. 입력이 계속되면 어떤 동작을 할까요?",
    choices: [
      { id: 'a', text: '입력 중에도 반드시 300ms마다 검색한다', explanation: "일정 주기로 실행 빈도를 제한하는 것은 보통 throttle 쪽 동작입니다. 이 디바운스는 입력마다 예약을 다시 시작합니다." },
      { id: 'b', text: '마지막 입력 이후 300ms 동안 추가 입력이 없을 때 검색한다', explanation: "기존 예약을 취소하고 새 예약을 남기므로, 연속 입력이 멈춘 뒤 마지막 예약이 실행됩니다." },
      { id: 'c', text: '디바운스만으로 이전 네트워크 응답이 최신 결과를 덮는 것도 막는다', explanation: "예약 빈도 제한과 요청 경쟁 방지는 별개입니다. 이미 전송한 요청은 취소나 최신 요청 판별이 필요할 수 있습니다." },
      { id: 'd', text: '모든 키 입력의 검색 요청을 순서대로 보관해 실행한다', explanation: "취소된 타이머는 실행하지 않습니다. 입력 전체를 큐처럼 보관하는 방식이 아닙니다." },
    ],
    correctChoiceId: 'b',
    explanation: "설명한 방식은 마지막 호출 이후 대기하는 trailing debounce입니다. 검색 요청 수를 줄이는 데 유용하지만 입력에 즉시 반응해야 하는 UI 상태까지 함께 늦출 필요는 없습니다. 기존 예약을 정리하고, 요청 취소나 응답 경쟁 처리는 별도로 설계합니다.",
    relatedTermIds: ['debounce', 'abort-controller'],
    source: 'https://developer.mozilla.org/en-US/docs/Glossary/Debounce',
  },
  {
    id: 'js-var-loop-closure', part: 'javascript', level: 'advanced', kind: 'concept', topic: '반복문과 클로저',
    prompt: "반복문이 끝난 뒤 저장한 함수들을 호출합니다. 출력은 무엇인가요?",
    codeLanguage: 'javascript',
    code: `const readers = [];
for (var index = 0; index < 3; index++) {
  readers.push(() => index);
}
console.log(readers.map(read => read()));`,
    choices: [
      { id: 'a', text: '[0, 1, 2]', explanation: "var index는 반복마다 별도의 바인딩을 만들지 않습니다. 이 결과는 let으로 선언할 때 얻습니다." },
      { id: 'b', text: '[1, 2, 3]', explanation: "함수 생성 시 값을 저장한 것이 아닙니다. 모든 함수는 반복문 이후 같은 index를 읽습니다." },
      { id: 'c', text: '[3, 3, 3]', explanation: "var의 하나의 index 바인딩을 세 클로저가 공유합니다. 반복 종료 시 값 3을 모두 읽습니다." },
      { id: 'd', text: 'ReferenceError가 발생한다', explanation: "var 바인딩은 반복문 블록 밖에서도 해당 스코프에 남아 있고 클로저에서도 접근할 수 있습니다." },
    ],
    correctChoiceId: 'c',
    explanation: "클로저는 공유한 변수의 최신 값을 읽습니다. for (let index = ...)는 각 반복을 위한 별도 바인딩을 만들어 [0, 1, 2]가 됩니다. 타이머나 이벤트 콜백을 루프 안에서 생성할 때도 값 복사와 바인딩 공유를 구분해야 합니다.",
    relatedTermIds: ['closure', 'let-const'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures#creating_closures_in_loops_a_common_mistake',
    expectedLogs: ['[3,3,3]'],
  },
  {
    id: 'js-microtask-starvation', part: 'javascript', level: 'advanced', kind: 'practical', topic: '마이크로태스크와 응답성',
    prompt: "작업을 잘게 쪼갠 뒤 queueMicrotask로 다음 조각을 계속 예약합니다. 긴 작업 중 UI가 여전히 멈출 수 있는 이유는 무엇인가요?",
    choices: [
      { id: 'a', text: 'queueMicrotask가 작업을 별도의 워커 스레드로 옮기기 때문이다', explanation: "queueMicrotask는 현재 실행 환경의 마이크로태스크를 예약합니다. Web Worker처럼 별도 스레드를 만들지 않습니다." },
      { id: 'b', text: '마이크로태스크는 반드시 타이머 태스크 뒤에만 실행되기 때문이다', explanation: "현재 태스크가 끝나면 다음 태스크로 넘어가기 전에 마이크로태스크를 처리합니다. 설명한 순서는 반대입니다." },
      { id: 'c', text: 'Promise.then으로만 바꾸면 렌더링 기회가 항상 생긴다', explanation: "Promise.then도 마이크로태스크를 예약하므로 같은 문제가 생길 수 있습니다. 단순 교체가 해결책은 아닙니다." },
      { id: 'd', text: '새 마이크로태스크도 계속 처리해 큐가 비지 않으면 다음 태스크나 렌더링 기회가 지연될 수 있기 때문이다', explanation: "마이크로태스크 처리 중 추가한 마이크로태스크도 큐가 빌 때까지 처리합니다. 긴 연쇄는 화면 작업을 늦출 수 있습니다." },
    ],
    correctChoiceId: 'd',
    explanation: "비동기 문법을 사용했다는 것만으로 브라우저에 화면 갱신 기회를 주는 것은 아닙니다. 큰 계산은 Web Worker로 분리하거나 적절한 태스크 경계에서 양보하는 방식을 검토합니다. 실제 입력 지연을 측정해 어느 작업이 메인 스레드를 점유하는지 확인합니다.",
    relatedTermIds: ['microtask-starvation', 'event-loop'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide#tasks_vs_microtasks',
  },
  {
    id: 'js-promise-any', part: 'javascript', level: 'advanced', kind: 'practical', topic: '첫 성공 결과',
    prompt: "첫 Promise는 거부되고 두 번째는 이행됩니다. Promise.any는 어떤 결과를 사용할까요?",
    codeLanguage: 'javascript',
    code: `const jobs = [
  Promise.reject('A'),
  Promise.resolve('B'),
];
Promise.any(jobs).then(value => console.log(value));`,
    choices: [
      { id: 'a', text: '이행 값 "B"', explanation: "Promise.any는 첫 이행 값을 선택합니다. 일부 거부는 무시하고 성공하는 입력을 기다립니다." },
      { id: 'b', text: '거부 이유 "A"', explanation: "첫 거부를 그대로 따르는 것은 이 입력에서 Promise.race의 동작입니다. any는 첫 성공을 기다립니다." },
      { id: 'c', text: '["A", "B"]', explanation: "Promise.any는 결과 전체를 배열로 모으지 않습니다. A는 거부 이유이고 선택된 성공 값은 B입니다." },
      { id: 'd', text: 'AggregateError', explanation: "모든 입력이 거부될 때 AggregateError로 거부합니다. 여기에는 이행하는 Promise가 있습니다." },
    ],
    correctChoiceId: 'a',
    explanation: "여러 대체 경로 중 하나만 성공하면 되는 작업에는 Promise.any가 적합할 수 있습니다. Promise.race는 첫 성공 또는 첫 실패를 그대로 따릅니다. 어느 함수를 쓰든 나머지 요청은 자동 취소되지 않으므로 자원 정리 정책을 별도로 정합니다.",
    relatedTermIds: ['promise-any', 'promise-race'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any',
  },
  {
    id: 'js-freeze-shallow', part: 'javascript', level: 'advanced', kind: 'practical', topic: '객체 동결의 범위',
    prompt: "최상위 객체만 Object.freeze했습니다. 중첩된 theme의 변경 결과는 무엇인가요?",
    codeLanguage: 'javascript',
    code: `const model = Object.freeze({ theme: { dark: false } });
model.theme.dark = true;
console.log(model.theme.dark);
console.log(Object.isFrozen(model.theme));`,
    choices: [
      { id: 'a', text: "첫 번째 출력: false\n두 번째 출력: true", explanation: "freeze는 중첩 객체까지 자동 동결하지 않습니다. theme은 여전히 변경할 수 있는 별도의 객체입니다." },
      { id: 'b', text: "첫 번째 출력: true\n두 번째 출력: false", explanation: "model 자체의 속성 변경만 제한했습니다. 중첩 객체 theme은 동결되지 않아 dark 값이 바뀝니다." },
      { id: 'c', text: "첫 번째 출력: true\n두 번째 출력: true", explanation: "dark가 바뀌는 점은 맞지만 theme은 동결되지 않았습니다. Object.isFrozen(model.theme)는 false입니다." },
      { id: 'd', text: '중첩 속성 대입에서 항상 TypeError가 발생한다', explanation: "이 대입은 동결되지 않은 theme의 속성을 바꿉니다. 최상위 동결이 내부 속성 대입까지 막지 않습니다." },
    ],
    correctChoiceId: 'b',
    explanation: "Object.freeze는 얕게 적용됩니다. 중첩 구조까지 동결하려면 참조 순환 등을 고려해 내부 객체도 처리해야 합니다. 불변 업데이트, 타입 수준 readonly, 런타임 동결은 각각 다른 역할이며 하나가 나머지를 자동 보장하지 않습니다.",
    relatedTermIds: ['object-freeze', 'shallow-copy'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze',
    expectedLogs: ['true', 'false'],
  },
  {
    id: 'js-stable-sort-ties', part: 'javascript', level: 'advanced', kind: 'coding-test', topic: '안정 정렬',
    prompt: "현재 ECMAScript의 sort는 안정 정렬입니다. score가 같은 항목의 순서는 어떻게 될까요?",
    codeLanguage: 'javascript',
    code: `const items = [
  { id: 'B', score: 1 },
  { id: 'A', score: 1 },
  { id: 'C', score: 2 },
];
items.sort((left, right) => left.score - right.score);
console.log(items.map(item => item.id));`,
    choices: [
      { id: 'a', text: '["A", "B", "C"]', explanation: "id의 문자 순서는 비교 함수에 사용하지 않았습니다. 동일 score 항목은 원래 순서 B, A를 유지합니다." },
      { id: 'b', text: '["C", "B", "A"]', explanation: "left.score - right.score는 score 오름차순입니다. score 2인 C가 먼저 오지 않습니다." },
      { id: 'c', text: '["B", "A", "C"]', explanation: "동일 score 비교 결과는 0입니다. 안정 정렬이므로 B, A의 기존 상대 순서가 유지됩니다." },
      { id: 'd', text: 'score가 같으면 둘 중 하나가 배열에서 제거된다', explanation: "정렬은 항목 순서를 정할 뿐 중복을 제거하지 않습니다. 비교 결과 0인 두 항목도 모두 남습니다." },
    ],
    correctChoiceId: 'c',
    explanation: "안정 정렬은 동등한 키의 상대 순서를 보존합니다. 여러 기준의 정렬이나 기존 우선순서를 유지하는 UI에 유용합니다. 비교 함수가 반사성·반대칭성·추이성을 위반하면 결과가 엔진에 따라 달라질 수 있으므로 boolean 대신 올바른 음수·0·양수를 반환합니다.",
    relatedTermIds: ['stable-sort', 'array-sort'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sort_stability',
    expectedLogs: ['["B","A","C"]'],
  },
  {
    id: 'js-dynamic-programming-steps', part: 'javascript', level: 'advanced', kind: 'coding-test', topic: '동적 계획법',
    prompt: "계단은 한 번에 1칸 또는 2칸 올라갑니다. 4칸에 도착하는 서로 다른 이동 순서의 수는 무엇인가요?",
    codeLanguage: 'javascript',
    code: `const steps = 4;
const ways = Array(steps + 1).fill(0);
ways[0] = 1;
ways[1] = 1;
for (let index = 2; index <= steps; index++) {
  ways[index] = ways[index - 1] + ways[index - 2];
}
console.log(ways[steps]);`,
    choices: [
      { id: 'a', text: '2', explanation: "1칸만 또는 2칸만 이동하는 경우뿐 아니라 섞어서 이동하는 순서도 포함됩니다." },
      { id: 'b', text: '4', explanation: "마지막 이동이 1칸인 경우 3개, 2칸인 경우 2개를 합해야 합니다. 계단 수 자체가 답은 아닙니다." },
      { id: 'c', text: '8', explanation: "각 위치에서 항상 두 선택지가 가능한 것은 아닙니다. 목표를 넘는 이동을 세지 않도록 점화식을 적용합니다." },
      { id: 'd', text: '5', explanation: "ways는 1, 1, 2, 3, 5로 계산됩니다. 직전 1칸 전과 2칸 전의 경우를 합해 구합니다." },
    ],
    correctChoiceId: 'd',
    explanation: "마지막 이동이 1칸이면 n-1칸의 경우를, 2칸이면 n-2칸의 경우를 이어 붙입니다. 부분 문제의 답을 보관해 중복 계산을 줄이는 DP입니다. 이 구현은 O(n) 시간과 O(n) 공간이며 직전 두 값만 보관하면 O(1) 추가 공간으로 줄일 수 있습니다.",
    relatedTermIds: ['dynamic-programming', 'space-complexity'],
    source: 'https://xlinux.nist.gov/dads/HTML/dynamicprog.html',
    expectedLogs: ['5'],
  },
  {
    id: 'js-monotonic-stack', part: 'javascript', level: 'advanced', kind: 'coding-test', topic: '단조 스택',
    prompt: "각 위치에서 오른쪽의 첫 번째 더 큰 값을 찾습니다. -1은 없음을 뜻합니다. 출력은 무엇인가요?",
    codeLanguage: 'javascript',
    code: `const values = [2, 1, 4, 3];
const answer = Array(values.length).fill(-1);
const stack = [];
for (let index = 0; index < values.length; index++) {
  while (stack.length && values[stack[stack.length - 1]] < values[index]) {
    answer[stack.pop()] = values[index];
  }
  stack.push(index);
}
console.log(answer);`,
    choices: [
      { id: 'a', text: '[4, 4, -1, -1]', explanation: "2와 1은 오른쪽에서 처음 만나는 더 큰 값이 4입니다. 4와 3 뒤에는 더 큰 값이 없습니다." },
      { id: 'b', text: '[1, 4, 3, -1]', explanation: "이는 바로 다음 값입니다. 문제는 다음 위치가 아니라 오른쪽의 첫 번째 더 큰 값을 찾습니다." },
      { id: 'c', text: '[4, 4, 4, 4]', explanation: "전체 최댓값을 모든 위치에 쓰지 않습니다. 현재 위치보다 오른쪽에 있으며 더 큰 값이어야 합니다." },
      { id: 'd', text: '[2, 1, 4, 3]', explanation: "answer에는 자기 값이 아닌 오른쪽에서 발견한 값을 저장합니다. 자기 자신은 더 큰 값이 아닙니다." },
    ],
    correctChoiceId: 'a',
    explanation: "아직 답을 못 찾은 인덱스를 스택에 보관합니다. 새 값이 스택 위 값보다 크면 그 인덱스의 답이 확정되어 pop합니다. while이 중첩돼도 각 인덱스는 한 번 들어가고 한 번만 나오므로 전체 처리 횟수는 O(n)입니다.",
    relatedTermIds: ['stack', 'amortized-analysis'],
    source: 'https://usaco.guide/gold/stacks',
    expectedLogs: ['[4,4,-1,-1]'],
  },
  {
    id: 'js-greedy-counterexample', part: 'javascript', level: 'advanced', kind: 'coding-test', topic: '탐욕법의 한계',
    prompt: "동전 1, 3, 4로 합 6을 만듭니다. 가장 큰 동전부터 고르는 코드에 관한 맞는 설명은 무엇인가요?",
    codeLanguage: 'javascript',
    code: `let amount = 6;
let count = 0;
for (const coin of [4, 3, 1]) {
  const used = Math.floor(amount / coin);
  count += used;
  amount %= coin;
}
console.log(count);`,
    choices: [
      { id: 'a', text: '2가 출력되고 모든 동전 체계에서 최적이다', explanation: "이 코드는 4, 1, 1을 골라 3을 출력합니다. 큰 동전 우선이 모든 체계에서 최적이지도 않습니다." },
      { id: 'b', text: '3이 출력되지만, 3 + 3을 고르면 2개로 만들 수 있다', explanation: "현재 최선인 4를 먼저 골라 1 두 개를 더합니다. 전체 최선은 3 두 개이며 탐욕 선택의 반례입니다." },
      { id: 'c', text: '3이 출력되므로 최소 동전 수도 반드시 3이다', explanation: "한 알고리즘의 결과가 최적이라는 증거는 아닙니다. 3 + 3이라는 더 나은 해가 있습니다." },
      { id: 'd', text: '1이 있으므로 탐욕법은 언제나 최소 개수를 보장한다', explanation: "1은 금액을 만들 수 있도록 도울 뿐 최소 개수 보장은 아닙니다. 이 입력에서 실제 반례가 나옵니다." },
    ],
    correctChoiceId: 'b',
    explanation: "탐욕법을 선택하려면 당장의 선택이 전체 최적해를 해치지 않는 이유가 필요합니다. 1이 있다는 사실이나 몇 가지 성공 예제만으로 보장할 수 없습니다. 임의의 동전 체계에서 최소 개수를 구해야 한다면 금액별 DP 같은 방법을 검토합니다.",
    relatedTermIds: ['greedy-algorithm', 'dynamic-programming'],
    source: 'https://xlinux.nist.gov/dads/HTML/greedyalgo.html',
    expectedLogs: ['3'],
  },
  {
    id: 'js-map-nan-key', part: 'javascript', level: 'advanced', kind: 'concept', topic: 'Map의 키 동일성',
    prompt: "NaN은 ===로 자기 자신과 같지 않습니다. Map의 키로 사용하면 어떻게 될까요?",
    codeLanguage: 'javascript',
    code: `const cache = new Map();
cache.set(NaN, 'first');
cache.set(Number('no-number'), 'second');
console.log(cache.size);
console.log(cache.get(NaN));`,
    choices: [
      { id: 'a', text: "첫 번째 출력: 2\n두 번째 출력: \"first\"", explanation: "Map의 키 비교는 ===와 완전히 같지 않습니다. 두 NaN은 같은 키로 취급되어 값을 갱신합니다." },
      { id: 'b', text: "첫 번째 출력: 2\n두 번째 출력: undefined", explanation: "Map은 NaN 키를 찾을 수 있습니다. NaN !== NaN이라는 사실을 Map 조회에 그대로 적용하면 안 됩니다." },
      { id: 'c', text: "첫 번째 출력: 1\n두 번째 출력: \"first\"", explanation: "같은 키 한 개가 남는 것은 맞지만, 두 번째 set이 그 키의 값을 second로 갱신합니다." },
      { id: 'd', text: "첫 번째 출력: 1\n두 번째 출력: \"second\"", explanation: "키 비교에 SameValueZero를 사용하므로 NaN 키는 같은 것으로 봅니다. 두 번째 set이 기존 키 값을 바꿉니다." },
    ],
    correctChoiceId: 'd',
    explanation: "Map은 SameValueZero 규칙으로 키를 비교합니다. NaN과 NaN은 같은 키이고 +0과 -0도 같은 키이며, 객체 키는 참조를 비교합니다. 키를 설계할 때 엄격한 동등 비교나 객체의 깊은 내용 비교와 혼동하지 않아야 합니다.",
    relatedTermIds: ['map-object', 'strict-equality'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#key_equality',
    expectedLogs: ['1', 'second'],
  },
  {
    id: 'js-async-map-results', part: 'javascript', level: 'advanced', kind: 'practical', topic: 'async 배열 콜백',
    prompt: "async 콜백으로 만든 배열을 실제 결과 배열로 받는 방법은 무엇인가요?",
    codeLanguage: 'javascript',
    code: `async function loadAll(ids) {
  const jobs = ids.map(async id => {
    const response = await fetch('/api/items/' + id);
    if (!response.ok) throw new Error('요청 실패');
    return response.json();
  });
  return jobs;
}`,
    choices: [
      { id: 'a', text: 'return Promise.all(jobs)로 바꾼다', explanation: "각 async 콜백이 반환한 Promise들을 Promise.all로 모으면 전체 이행 결과 배열을 받을 수 있습니다." },
      { id: 'b', text: 'return await jobs로만 바꾼다', explanation: "await는 배열 내부 Promise를 자동으로 기다리지 않습니다. 배열 자체를 기다려도 요소는 여전히 Promise입니다." },
      { id: 'c', text: 'map을 forEach로 바꾸고 나머지를 유지한다', explanation: "forEach는 undefined를 반환하고 async 콜백 완료를 기다리지 않습니다. 결과를 모으는 배열 연산이 아닙니다." },
      { id: 'd', text: 'async를 썼으므로 원래 코드도 응답 JSON 배열을 반환한다', explanation: "jobs는 Promise 배열입니다. 바깥 async 함수는 그 배열로 이행하며 내부 Promise들을 자동 집계하지 않습니다." },
    ],
    correctChoiceId: 'a',
    explanation: "async 콜백의 반환값은 Promise이고 map은 그 반환값들을 배열에 담습니다. Promise.all은 모든 결과를 모으지만 하나가 거부되면 전체가 거부됩니다. 매우 많은 요청이라면 서버 부하를 고려해 동시 실행 수 제한이나 배치 API를 검토합니다.",
    relatedTermIds: ['promise-all', 'async-concurrency-limit'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#using_promise.all_with_async_functions',
  },

];
