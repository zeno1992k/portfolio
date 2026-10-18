import type { QuizChoice, QuizQuestion } from './types';

type Seed = [text: string, explanation: string];
const mdn = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/';
const ts = 'https://www.typescriptlang.org/';
const cp = 'https://cp-algorithms.com/';
const outputLabels = ['첫 번째 출력', '두 번째 출력', '세 번째 출력', '네 번째 출력'];
function outputs(...values: string[]): string { return values.map((value, index) => `${outputLabels[index]}: ${value}`).join('\n'); }
function make(number: number, level: QuizQuestion['level'], kind: QuizQuestion['kind'], topic: string, prompt: string, seeds: [Seed, Seed, Seed, Seed], explanation: string, relatedTermIds: string[], source: string, code?: string, expectedLogs?: string[], codeLanguage: QuizQuestion['codeLanguage'] = 'javascript'): QuizQuestion {
  const choiceIds = ['a', 'b', 'c', 'd'] as const;
  const correctIndex = (number - 1) % 4;
  const ordered = seeds.slice(1);
  ordered.splice(correctIndex, 0, seeds[0]);
  const choices = ordered.map(([text, reason], index) => ({ id: choiceIds[index], text, explanation: reason })) as [QuizChoice, QuizChoice, QuizChoice, QuizChoice];
  return { id: `js-coverage-${level}-${String(number).padStart(2, '0')}`, part: 'javascript', level, kind, topic, prompt, choices, correctChoiceId: choiceIds[correctIndex], explanation, relatedTermIds, source, ...(code ? { code, codeLanguage } : {}), ...(expectedLogs ? { expectedLogs } : {}) };
}

const foundation: QuizQuestion[] = [
  make(1, 'foundation', 'concept', 'BigInt와 Number의 산술', 'BigInt와 Number를 +로 직접 더한 결과를 catch에서 확인합니다. 무엇이 출력되나요?', [
    ['TypeError', '정수 BigInt와 Number는 이 산술 연산에서 타입을 통일하지 않으면 오류가 발생합니다.'],
    ['3', '비교 연산과 달리 덧셈이 BigInt를 자동으로 Number로 바꿔 합산하지는 않습니다.'],
    ['3n', 'Number를 자동으로 BigInt로 바꿔 정수 덧셈을 수행하지는 않습니다.'],
    ['SyntaxError', '1n과 덧셈 문법은 유효합니다. 실행 중 피연산자 타입 때문에 TypeError가 발생합니다.'],
  ], '큰 정수의 정확한 계산을 위해 BigInt를 선택했다면 연산에 참여하는 값의 타입을 일관되게 유지해야 합니다. 이미 정밀도를 잃은 Number를 뒤늦게 BigInt로 바꾸어도 원래 값을 복구하지 못합니다.', ['bigint', 'type-coercion'], mdn + 'Reference/Global_Objects/BigInt', 'try { console.log(1n + 2); }\ncatch (error) { console.log(error.name); }', ['TypeError']),
  make(2, 'foundation', 'concept', 'BigInt 나눗셈', 'BigInt 나눗셈 결과를 문자열로 출력합니다. 소수 부분은 어떻게 처리되나요?', [
    ['3', 'BigInt는 정수 타입이며 7n / 2n의 소수 부분은 0 방향으로 버려 3n을 얻습니다.'],
    ['3.5', 'BigInt는 소수 부분이 있는 값을 표현하지 않습니다. Number의 나눗셈과 다릅니다.'],
    ['4', '가까운 정수로 반올림하는 연산이 아니므로 4n이 되지 않습니다.'],
    ['TypeError', '두 피연산자가 모두 BigInt이고 0으로 나누지 않아 정상적으로 계산됩니다.'],
  ], 'BigInt가 큰 수를 정확히 표현한다는 사실과 소수 계산을 지원한다는 주장은 구분해야 합니다. 정수 몫과 나머지에 적합하며 십진 소수 금액 계산은 별도 표현과 반올림 정책이 필요합니다.', ['bigint', 'primitive-types'], mdn + 'Reference/Global_Objects/BigInt', 'console.log(String(7n / 2n));', ['3']),
  make(3, 'foundation', 'concept', '작은 소수 계산의 오차', '1 근처 규모의 아래 계산에서 두 비교 결과는 무엇인가요?', [
    [outputs('false', 'true'), '이진 표현 오차 때문에 엄격한 동등 비교는 실패하지만 이 예제의 차이는 EPSILON보다 작습니다.'],
    [outputs('true', 'true'), '0.1 + 0.2는 Number에서 정확히 0.3과 같은 값으로 표현되지 않습니다.'],
    [outputs('false', 'false'), '이 예제의 오차는 Number.EPSILON보다 작으므로 두 번째 검사는 true입니다.'],
    [outputs('true', 'false'), '엄격 비교와 허용 오차 비교의 결과를 모두 반대로 해석한 선택지입니다.'],
  ], '부동소수점 오차를 다룰 때는 값의 규모와 요구 정확도에 맞는 기준이 필요합니다. 이 예제의 EPSILON 비교가 성공하더라도 매우 큰 수나 모든 업무 계산에 같은 기준이 항상 적절한 것은 아닙니다.', ['floating-point', 'strict-equality'], mdn + 'Reference/Global_Objects/Number/EPSILON', 'console.log(0.1 + 0.2 === 0.3);\nconsole.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);', ['false', 'true']),
  make(4, 'foundation', 'practical', '조건부 기본값 대입', '재시도 횟수 0에 ??=와 ||=를 순서대로 적용했습니다. 두 출력은 무엇인가요?', [
    [outputs('0', '3'), '0은 nullish가 아니어서 ??=로 바뀌지 않지만 falsy이므로 ||=에서 3을 대입합니다.'],
    [outputs('3', '3'), '??=는 0을 부재로 보지 않으므로 첫 번째 대입이 실행되지 않습니다.'],
    [outputs('0', '0'), '||=는 왼쪽이 falsy이면 오른쪽 값을 대입하므로 두 번째 값이 바뀝니다.'],
    [outputs('3', '0'), '어느 연산에도 원래 값을 0으로 되돌리는 대입이 없습니다.'],
  ], '기본값을 채우는 대입에서도 부재와 falsy를 구분해야 합니다. 논리 할당은 조건을 만족할 때만 오른쪽을 평가하고 대입하므로 함수 호출의 부수 효과도 조건에 따라 실행됩니다.', ['logical-assignment', 'nullish-coalescing'], mdn + 'Reference/Operators/Nullish_coalescing_assignment', 'let retries = 0;\nretries ??= 3;\nconsole.log(retries);\nretries ||= 3;\nconsole.log(retries);', ['0', '3']),
  make(5, 'foundation', 'concept', 'return과 줄바꿈', 'return 다음 줄에 숫자를 적었습니다. 함수 호출 결과는 무엇인가요?', [
    ['undefined', 'return 직후 줄바꿈에서는 반환 식이 연결되지 않아 값 없는 return이 됩니다.'],
    ['10', '다음 줄의 10이 return의 반환 식으로 이어지지 않습니다.'],
    ['null', '값 없는 반환은 null이 아니라 undefined를 반환합니다.'],
    ['SyntaxError', '이 코드는 유효한 문법입니다. 의도와 다른 반환이 발생하는 문제입니다.'],
  ], '자동 세미콜론 삽입은 줄바꿈마다 무조건 작동하는 규칙이 아닙니다. return 같은 제한된 문법을 알고 반환 식의 시작을 같은 줄에 두면 객체와 숫자를 의도대로 반환할 수 있습니다.', ['automatic-semicolon-insertion', 'scope'], mdn + 'Reference/Lexical_grammar#automatic_semicolon_insertion', 'function result() {\n  return\n    10;\n}\nconsole.log(result());', ['undefined']),
  make(6, 'foundation', 'concept', '희소 배열의 map', '빈 슬롯 두 개를 가진 배열에 map을 호출했습니다. 콜백 횟수와 결과의 인덱스 존재 여부는 무엇인가요?', [
    [outputs('0', 'false'), 'map은 존재하지 않는 빈 슬롯의 콜백을 건너뛰고 결과에서도 그 위치를 빈 슬롯으로 남깁니다.'],
    [outputs('2', 'true'), 'undefined가 들어 있는 실제 슬롯 두 개와 빈 슬롯 두 개는 다릅니다.'],
    [outputs('0', 'true'), '콜백을 건너뛴 빈 슬롯을 map이 자동으로 실제 속성으로 채우지 않습니다.'],
    [outputs('2', 'false'), '이 배열의 두 인덱스에는 속성이 없으므로 해당 콜백이 실행되지 않습니다.'],
  ], '배열 길이가 있다고 모든 인덱스가 존재하는 것은 아닙니다. 배열을 생성할 때 빈 슬롯과 명시적인 undefined를 구분하고, 일정한 값을 만들 목적이라면 Array.from 등의 채우는 동작을 선택해야 합니다.', ['sparse-array', 'array-map'], mdn + 'Reference/Global_Objects/Array#array_methods_and_empty_slots', 'let calls = 0;\nconst result = new Array(2).map(() => { calls++; return 1; });\nconsole.log(calls);\nconsole.log(0 in result);', ['0', 'false']),
  make(7, 'foundation', 'concept', '실제 배열 판별', '숫자 인덱스와 length가 있는 일반 객체입니다. Array.isArray의 결과는 무엇인가요?', [
    ['false', '유사 배열의 모양을 갖춰도 일반 객체는 실제 Array 인스턴스가 아닙니다.'],
    ['true', 'length 속성만으로 Array 여부가 결정되지는 않습니다.'],
    ['2', 'Array.isArray는 길이가 아니라 배열인지 나타내는 boolean을 반환합니다.'],
    ['TypeError', '일반 객체도 검사할 수 있으며 배열이 아니라면 false를 반환합니다.'],
  ], 'Array.isArray는 배열과 비슷한 모양을 확인하는 함수가 아닙니다. 외부 입력의 구조를 검증할 때 실제 배열을 요구하는지, 유사 배열을 변환해 허용할지 계약을 먼저 결정해야 합니다.', ['array-like', 'array-data-structure'], mdn + 'Reference/Global_Objects/Array/isArray', 'console.log(Array.isArray({ 0: "A", 1: "B", length: 2 }));', ['false']),
  make(8, 'foundation', 'practical', '유사 배열과 반복 가능성', '이 객체에는 Symbol.iterator가 없습니다. Array.from과 배열 펼침의 결과는 무엇인가요?', [
    [outputs('["A","B"]', 'TypeError'), 'Array.from은 유사 배열을 처리하지만 펼침은 반복 프로토콜이 필요해 실패합니다.'],
    [outputs('["A","B"]', '["A","B"]'), '숫자 인덱스와 length만으로 배열 펼침이 가능한 것은 아닙니다.'],
    [outputs('[]', 'TypeError'), 'Array.from은 length와 인덱스 값을 이용해 두 항목을 만듭니다.'],
    [outputs('TypeError', 'TypeError'), 'Array.from은 반복자가 없어도 유사 배열 입력을 허용합니다.'],
  ], '유사 배열과 iterable은 독립적인 성질입니다. 변환 코드에서 어떤 규약을 요구하는지 구분하면 DOM 컬렉션이나 외부 라이브러리의 반환 형태가 달라도 의도한 방식으로 처리할 수 있습니다.', ['array-like', 'iterator-protocol'], mdn + 'Reference/Global_Objects/Array/from', 'const items = { 0: "A", 1: "B", length: 2 };\nconsole.log(Array.from(items));\ntry { console.log([...items]); }\ncatch (error) { console.log(error.name); }', ['["A","B"]', 'TypeError']),
  make(9, 'foundation', 'practical', '정규식의 전체 입력 검사', 'ASCII 숫자만 허용하도록 시작과 끝을 제한했습니다. 두 검사 결과는 무엇인가요?', [
    [outputs('true', 'false'), '123은 전체가 숫자이고 x123은 시작의 x 때문에 전체 패턴에 맞지 않습니다.'],
    [outputs('true', 'true'), '숫자 부분만 있으면 되는 검색과 다르게 ^와 $는 입력 전체를 제한합니다.'],
    [outputs('false', 'false'), '+는 숫자가 한 개 이상인 경우를 허용하므로 123은 일치합니다.'],
    [outputs('false', 'true'), '입력 전체를 제한한 패턴에서 숫자로만 된 입력이 실패하고 혼합 입력이 성공하지 않습니다.'],
  ], '형식 검사는 부분 검색과 다른 목적입니다. 허용 문자와 길이, 전체 일치 여부를 명시해야 하며 정규식 하나로 모든 데이터의 업무상 유효성이 검증된다고 생각하지 않아야 합니다.', ['regular-expression', 'validation'], mdn + 'Reference/Global_Objects/RegExp', 'const pattern = /^[0-9]+$/;\nconsole.log(pattern.test("123"));\nconsole.log(pattern.test("x123"));', ['true', 'false']),
  make(10, 'foundation', 'practical', '같아 보이는 유니코드 입력', '정준적으로 같은 문자 두 표현을 비교합니다. NFC 정규화 전후의 출력은 무엇인가요?', [
    [outputs('false', 'true'), '원래 코드 포인트 조합은 다르지만 NFC로 정규화하면 이 두 표현이 같아집니다.'],
    [outputs('true', 'true'), '===는 시각적 모양이 아니라 문자열의 코드 단위 시퀀스를 비교합니다.'],
    [outputs('false', 'false'), '이 예제는 정준적으로 동등한 조합이므로 NFC 결과는 같습니다.'],
    [outputs('true', 'false'), 'NFC가 원래 같던 이 두 문자열을 서로 다른 표현으로 바꾸는 상황이 아닙니다.'],
  ], '사용자가 같은 글자로 인식해도 입력의 코드 포인트가 다를 수 있습니다. 정규화는 정준적 표현을 맞추는 도구이며 대소문자 무시나 모든 비슷한 문자 통합과는 별도의 정책입니다.', ['unicode-normalization', 'strict-equality'], mdn + 'Reference/Global_Objects/String/normalize', 'const a = "\u00e9";\nconst b = "e\u0301";\nconsole.log(a === b);\nconsole.log(a.normalize("NFC") === b.normalize("NFC"));', ['false', 'true']),
  make(11, 'foundation', 'practical', '숫자가 있는 파일 이름 정렬', 'Intl.Collator의 numeric 옵션을 켰습니다. 정렬한 파일 이름의 순서는 무엇인가요?', [
    ['["file2","file10"]', '문자열 안의 숫자를 수치 순서로 비교해 2가 10보다 먼저 옵니다.'],
    ['["file10","file2"]', '이는 숫자 옵션 없는 일반 코드 단위 비교에서 기대할 수 있는 순서입니다.'],
    ['[2,10]', 'Collator는 원래 문자열을 숫자로 변환해 반환하지 않고 비교 순서만 제공합니다.'],
    ['[]', '두 파일 이름은 유효한 비교 대상이며 정렬이 항목을 삭제하지 않습니다.'],
  ], '표시용 문자열의 정렬은 사용자의 언어와 숫자 포함 여부에 따라 달라집니다. Collator의 compare 반환 부호로 순서를 판단하고 지역 및 sensitivity 옵션도 제품 정책에 맞춰 명시합니다.', ['intl-collator', 'array-sort'], mdn + 'Reference/Global_Objects/Intl/Collator', 'const compare = new Intl.Collator("en", { numeric: true }).compare;\nconsole.log(["file10", "file2"].sort(compare));', ['["file2","file10"]']),
  make(12, 'foundation', 'concept', '클래스 비공개 필드와 키', '클래스 인스턴스의 키 목록과 메서드 결과를 읽었습니다. 두 출력은 무엇인가요?', [
    [outputs('["label"]', '1'), '#value는 일반 열거 속성이 아니며 next 메서드는 인스턴스의 비공개 필드를 증가시킵니다.'],
    [outputs('["#value","label"]', '1'), '비공개 요소는 문자열 키 #value로 Object.keys에 나타나지 않습니다.'],
    [outputs('["label"]', '0'), 'next는 전위 증가를 반환하므로 첫 호출의 반환값은 1입니다.'],
    [outputs('[]', 'TypeError'), 'label은 공개 자체 필드이며 올바른 인스턴스의 메서드 호출은 정상입니다.'],
  ], '비공개 필드는 언어의 접근 제한을 받으며 이름에 #을 붙인 일반 문자열 속성과 다릅니다. 공개 필드와 프로토타입 메서드, 비공개 요소의 저장 및 열거 규칙을 구분해야 합니다.', ['class-private-field', 'property-descriptor'], mdn + 'Reference/Classes/Private_elements', 'class Counter {\n  #value = 0;\n  label = "count";\n  next() { return ++this.#value; }\n}\nconst counter = new Counter();\nconsole.log(Object.keys(counter));\nconsole.log(counter.next());', ['["label"]', '1']),
  make(13, 'foundation', 'concept', '엄격 모드의 선언 없는 대입', '엄격 모드에서 선언하지 않은 이름에 대입했습니다. catch에서 무엇이 출력되나요?', [
    ['ReferenceError', '엄격 모드는 선언 없는 대입으로 암묵적인 전역을 만드는 동작을 허용하지 않습니다.'],
    ['1', '이 코드에서는 대입이 성공하지 않아 뒤의 로그까지 진행하지 못합니다.'],
    ['undefined', '실패를 무시하고 undefined를 읽는 것이 아니라 예외가 발생합니다.'],
    ['SyntaxError', '대입 구문 자체는 파싱되며 실행 중 이름이 없어서 ReferenceError가 발생합니다.'],
  ], '엄격 모드는 일부 흔한 실수를 즉시 오류로 바꿉니다. 모듈은 자동으로 엄격 모드이며 React StrictMode와는 적용 범위와 목적이 다른 기능임을 구분해야 합니다.', ['javascript-strict-mode', 'scope'], mdn + 'Reference/Strict_mode', '"use strict";\ntry {\n  coverageUndeclaredValue = 1;\n  console.log(coverageUndeclaredValue);\n} catch (error) { console.log(error.name); }', ['ReferenceError']),
  make(14, 'foundation', 'concept', '파생 생성자의 초기화', '파생 클래스 생성자에서 super보다 먼저 this를 사용했습니다. 무엇이 출력되나요?', [
    ['ReferenceError', '일반적인 파생 생성자의 this는 super 호출 전 초기화되지 않아 접근할 수 없습니다.'],
    ['Kim', '이 코드는 this.name 대입 단계에서 실패하므로 이름을 읽는 로그가 실행되지 않습니다.'],
    ['undefined', '초기화되지 않은 this 접근은 조용히 undefined를 반환하지 않습니다.'],
    ['SyntaxError', '작성된 클래스 구문은 파싱되지만 생성자를 실행할 때 this 접근이 실패합니다.'],
  ], '상속된 클래스의 생성 순서를 이해해야 초기화 오류를 피할 수 있습니다. 파생 생성자는 기반 생성자를 호출한 뒤 자신의 필드를 초기화하고, 기본 생성자를 생략했을 때의 자동 동작과 구분해야 합니다.', ['class-inheritance', 'this-binding'], mdn + 'Reference/Classes/extends', 'class Base {}\nclass User extends Base {\n  constructor() { this.name = "Kim"; super(); }\n}\ntry { console.log(new User().name); }\ncatch (error) { console.log(error.name); }', ['ReferenceError']),
  make(15, 'foundation', 'concept', 'switch의 폴스루', '일치한 case에 break가 없습니다. 배열에는 어떤 값이 들어가나요?', [
    ['["one","two"]', 'case 1이 일치한 뒤 break 없이 다음 case 본문까지 진행합니다.'],
    ['["one"]', '일치한 case의 본문이 끝났다고 switch가 자동 종료되는 것은 아닙니다.'],
    ['["two"]', 'case 1도 실행되므로 one을 건너뛰지 않습니다.'],
    ['[]', '값 1과 case 1이 일치하므로 본문이 실행됩니다.'],
  ], 'switch는 일치한 위치부터 제어 흐름을 이어가며 필요한 위치에서 명시적으로 종료해야 합니다. 여러 case가 같은 처리를 공유하도록 폴스루를 사용할 때도 의도를 분명하게 남겨야 합니다.', ['strict-equality', 'scope'], mdn + 'Reference/Statements/switch', 'const result = [];\nswitch (1) {\n  case 1: result.push("one");\n  case 2: result.push("two"); break;\n}\nconsole.log(result);', ['["one","two"]']),
  make(16, 'foundation', 'concept', '화살표 함수의 생성 불가', '화살표 함수를 new로 호출했습니다. 어떤 결과가 나오나요?', [
    ['TypeError', '화살표 함수는 생성자로 호출할 수 없어 new 사용 시 TypeError가 발생합니다.'],
    ['1', '반환값이 있다고 생성자로 사용할 수 있는 함수가 되는 것은 아닙니다.'],
    ['{}', '생성자 호출이 지원되지 않으므로 빈 인스턴스도 만들어지지 않습니다.'],
    ['SyntaxError', '화살표 함수 선언과 new 표현식의 구문은 파싱되고 실행 중 실패합니다.'],
  ], '함수가 호출 가능하다는 성질과 생성자 호출을 지원한다는 성질은 구분됩니다. 화살표 함수는 자신의 this도 만들지 않으므로 생성과 일반 콜백의 요구에 맞는 함수 형태를 선택해야 합니다.', ['arrow-function', 'class-inheritance'], mdn + 'Reference/Functions/Arrow_functions', 'const create = () => 1;\ntry { console.log(new create()); }\ncatch (error) { console.log(error.name); }', ['TypeError']),
  make(17, 'foundation', 'practical', '엔트리 목록의 중복 키', 'Object.fromEntries에 같은 키를 두 번 전달했습니다. 최종 속성 값은 무엇인가요?', [
    ['2', '같은 속성 키에 뒤쪽 엔트리의 값이 대입되어 마지막 값 2가 남습니다.'],
    ['1', '첫 값을 무조건 보존하는 중복 제거 방식이 아닙니다.'],
    ['[1,2]', '같은 키의 값들을 배열로 자동 집계하지 않습니다.'],
    ['TypeError', '중복 키 자체는 이 메서드의 오류 조건이 아닙니다.'],
  ], '엔트리를 객체로 만드는 변환과 같은 키의 모든 값을 그룹화하는 작업은 다릅니다. 중복 데이터가 합산·병합·거부되어야 하는 경우에는 정책에 맞는 집계 코드를 별도로 작성해야 합니다.', ['object-entries', 'map-object'], mdn + 'Reference/Global_Objects/Object/fromEntries', 'const result = Object.fromEntries([["x", 1], ["x", 2]]);\nconsole.log(result.x);', ['2']),
  make(18, 'foundation', 'practical', '배열의 끝에서 접근', 'at(-1)과 [-1]로 배열을 읽었습니다. 두 출력은 무엇인가요?', [
    [outputs('30', 'undefined'), 'at은 음수 인덱스를 끝 기준으로 계산하지만 [-1]은 일반 속성 키를 읽습니다.'],
    [outputs('30', '30'), '대괄호의 음수 접근이 자동으로 끝 기준 인덱스로 바뀌지는 않습니다.'],
    [outputs('undefined', 'undefined'), 'at은 이 배열에서 유효한 끝 원소 30을 반환합니다.'],
    [outputs('10', '30'), 'at(-1)은 처음이 아닌 마지막이며 [-1] 속성도 별도로 만든 적이 없습니다.'],
  ], '배열 인덱스 문법과 at 메서드는 음수에 대한 규칙이 다릅니다. 마지막 원소가 필요하면 at(-1)을 사용하고 빈 배열에서 undefined가 나올 가능성도 처리해야 합니다.', ['array-data-structure', 'null-undefined'], mdn + 'Reference/Global_Objects/Array/at', 'const values = [10, 20, 30];\nconsole.log(values.at(-1));\nconsole.log(values[-1]);', ['30', 'undefined']),
  make(19, 'foundation', 'practical', '숫자 표시와 결과 타입', 'toFixed로 만든 값과 그 타입을 출력했습니다. 두 결과는 무엇인가요?', [
    [outputs('"2.5"', '"string"'), 'toFixed는 지정 자리수로 표시할 문자열을 반환합니다.'],
    [outputs('2.5', '"number"'), '원래 값은 Number지만 toFixed의 결과 타입은 string입니다.'],
    [outputs('"2.50"', '"string"'), '소수 한 자리만 요구했으므로 두 자리 문자열이 반환되지 않습니다.'],
    [outputs('3', '"number"'), '정수 반올림이 아니라 소수 한 자리 형식의 문자열 변환입니다.'],
  ], '표시용 문자열과 계산용 숫자를 분리해야 합니다. toFixed를 사용한 값에 +를 적용하면 문자열 연결이 일어날 수 있으며, 표시 자리수 조정이 원래 계산의 정확성을 보장하지도 않습니다.', ['floating-point', 'type-coercion'], mdn + 'Reference/Global_Objects/Number/toFixed', 'const value = (2.5).toFixed(1);\nconsole.log(value);\nconsole.log(typeof value);', ['2.5', 'string']),
  make(20, 'foundation', 'concept', '불리언 래퍼 객체', 'Boolean 객체에 false를 넣었습니다. 조건식 변환과 내부 값은 각각 무엇인가요?', [
    [outputs('true', 'false'), '객체 자체는 truthy이고 valueOf로 읽은 내부 원시값은 false입니다.'],
    [outputs('false', 'false'), 'Boolean 객체는 원시 false와 달리 조건식에서 truthy로 취급됩니다.'],
    [outputs('true', 'true'), '래퍼가 객체라는 사실이 내부에 저장한 false까지 바꾸지는 않습니다.'],
    [outputs('false', 'true'), '객체의 조건식 변환과 원시값 읽기를 모두 반대로 해석한 선택지입니다.'],
  ], '원시 불리언과 래퍼 객체는 다릅니다. 조건용 값은 대개 new Boolean 대신 Boolean(value) 또는 원시 boolean으로 만들고, 외부 라이브러리에서 래퍼가 넘어오는지 확인해야 합니다.', ['truthy-falsy', 'primitive-types'], mdn + 'Reference/Global_Objects/Boolean', 'const value = new Boolean(false);\nconsole.log(Boolean(value));\nconsole.log(value.valueOf());', ['true', 'false']),
];

const practical: QuizQuestion[] = [
  make(1, 'practical', 'practical', 'Proxy의 쓰기 검증', 'Proxy의 set trap에서 음수 나이를 거부하고 정상 대입은 기본 동작에 위임하려고 합니다. 적절한 구현은 무엇인가요?', [
    ['조건을 검사하고 정상 값은 Reflect.set(target, key, value, receiver)의 결과를 반환합니다.', '기본 대입 동작과 수신자를 유지하고 trap이 요구하는 성공 여부를 반환합니다.'],
    ['항상 true만 반환하고 대상 객체에는 값을 쓰지 않습니다.', '성공을 보고하는 것과 실제 값을 저장하는 일은 별개여서 정상 대입도 사라집니다.'],
    ['trap 안에서 같은 Proxy에 같은 값을 다시 대입합니다.', '같은 set trap을 다시 호출해 끝없는 재귀가 발생할 수 있습니다.'],
    ['검증 실패 때 false를 반환하면 엄격 모드에서도 오류 없이 무시됩니다.', 'set trap의 false 결과는 엄격 모드 대입에서 TypeError를 발생시킬 수 있습니다.'],
  ], 'Proxy는 가로채는 동작의 결과 계약을 지켜야 합니다. 검증 실패를 예외로 처리할지 false로 보고할지 호출 환경에 맞게 정하고, 정상 동작은 원래 대상에 위임해 저장과 접근자 규칙을 유지합니다.', ['proxy-object', 'reflect-object'], mdn + 'Reference/Global_Objects/Proxy/Proxy/set'),
  make(2, 'practical', 'practical', 'Reflect.get의 수신자', 'Reflect.get에 별도 receiver를 전달했습니다. getter에서 읽는 name은 무엇인가요?', [
    ['B', 'Reflect.get의 receiver가 getter의 this로 사용되므로 receiver.name을 읽습니다.'],
    ['A', 'getter의 this가 반드시 속성을 가진 target으로 고정되는 것은 아닙니다.'],
    ['undefined', 'receiver에는 name 속성이 있으므로 읽은 값이 존재합니다.'],
    ['TypeError', '일반 getter와 유효한 receiver의 사용은 정상입니다.'],
  ], '객체 속성 읽기는 단순한 저장 값 조회뿐 아니라 접근자 호출일 수 있습니다. Proxy에서 Reflect.get에 receiver를 유지해야 상속된 getter도 호출자의 의도한 this로 실행됩니다.', ['reflect-object', 'getter-setter'], mdn + 'Reference/Global_Objects/Reflect/get', 'const target = { name: "A", get label() { return this.name; } };\nconst receiver = { name: "B" };\nconsole.log(Reflect.get(target, "label", receiver));', ['B']),
  make(3, 'practical', 'practical', '바이트 배열의 정수 변환', 'Uint8Array에 256과 -1을 넣었습니다. 실제로 저장되는 값은 무엇인가요?', [
    ['[0,255]', '8비트 부호 없는 정수의 변환 규칙에 따라 256은 0, -1은 255가 됩니다.'],
    ['[256,-1]', 'Uint8Array는 일반 Array처럼 모든 Number 값을 그대로 보관하지 않습니다.'],
    ['[255,0]', '이 결과는 범위 양끝으로 제한하는 Uint8ClampedArray의 동작과 비슷하며 Uint8Array 규칙과 다릅니다.'],
    ['TypeError', '이 입력은 정수 뷰의 숫자 변환을 거쳐 저장되며 범위를 벗어났다는 이유만으로 오류가 나지 않습니다.'],
  ], '바이너리 형식에서는 저장할 숫자의 범위와 변환 규칙이 계약의 일부입니다. 값이 손실되는 것이 허용되지 않는다면 대입 전에 범위를 검증하고 일반 배열과 TypedArray를 혼동하지 않아야 합니다.', ['typed-array', 'validation'], mdn + 'Reference/Global_Objects/TypedArray', 'console.log([...new Uint8Array([256, -1])]);', ['[0,255]']),
  make(4, 'practical', 'practical', '바이트 순서와 DataView', '두 바이트 1, 2를 16비트 정수로 읽습니다. 기본 읽기와 리틀 엔디언 읽기의 출력은 무엇인가요?', [
    [outputs('258', '513'), '기본은 빅 엔디언으로 1×256+2이며 true를 전달하면 2×256+1입니다.'],
    [outputs('513', '258'), 'DataView의 기본 엔디언은 리틀이 아니라 빅 엔디언입니다.'],
    [outputs('1', '2'), 'getUint16은 각각 한 바이트만 읽지 않고 두 바이트를 하나의 정수로 읽습니다.'],
    [outputs('258', '258'), 'littleEndian 인수가 true이면 두 바이트의 의미가 바뀝니다.'],
  ], '바이트 순서는 파일과 프로토콜에서 명시한 규칙을 따라야 합니다. 실행 장치의 기본 엔디언에 기대지 않고 DataView 인수를 지정하며 읽는 필드 크기가 실제 버퍼 범위 안인지 검증합니다.', ['data-view', 'typed-array'], mdn + 'Reference/Global_Objects/DataView/getUint16', 'const bytes = new Uint8Array([1, 2]);\nconst view = new DataView(bytes.buffer);\nconsole.log(view.getUint16(0));\nconsole.log(view.getUint16(0, true));', ['258', '513']),
  make(5, 'practical', 'practical', '외부 완료 콜백과 Promise', 'Promise.withResolvers()를 호출했습니다. 반환된 객체가 제공하는 것은 무엇인가요?', [
    ['하나의 Promise와 이를 이행·거부하는 resolve, reject 함수입니다.', '생성한 Promise의 완료 함수를 함께 반환해 외부 콜백에서 사용할 수 있습니다.'],
    ['완료된 Promise와 결과 배열만 제공합니다.', '자동으로 결과를 계산하거나 완료된 상태로 만드는 메서드가 아닙니다.'],
    ['요청을 자동 시작하고 취소하는 함수입니다.', '네트워크 요청의 시작과 취소는 이 메서드가 대신 구현하지 않습니다.'],
    ['여러 Promise를 생성해 첫 성공을 고릅니다.', '여러 작업의 첫 성공 집계는 Promise.any의 역할입니다.'],
  ], '완료 시점이 생성 위치 밖에 있는 비동기 코드를 연결할 때 사용할 수 있습니다. Promise가 영원히 pending으로 남지 않도록 성공·실패 경로를 연결하고 완료 후 리스너와 보관 참조를 정리해야 합니다.', ['promise-with-resolvers', 'promise'], mdn + 'Reference/Global_Objects/Promise/withResolvers'),
  make(6, 'practical', 'practical', '반복자 변환의 지연 처리', '지원 환경에서 Iterator.from(values).map(transform).take(3)을 만들고 아직 소비하지 않았습니다. transform은 언제 실행되나요?', [
    ['반복자를 소비하면서 필요한 값이 요청될 때 실행됩니다.', '반복자 map은 지연 처리하므로 파이프라인을 만든 것만으로 전체 입력을 변환하지 않습니다.'],
    ['map을 호출한 순간 전체 values에 즉시 실행됩니다.', '이는 일반 배열 map의 즉시 처리와 혼동한 설명입니다.'],
    ['take(3)이 원본을 세 개로 잘라야만 모든 변환이 실행됩니다.', 'take는 원본 배열을 수정하는 메서드가 아니라 소비 개수를 제한하는 반복자 도구입니다.'],
    ['toArray가 없으면 transform은 절대 실행되지 않습니다.', 'for...of나 next 등 다른 소비 방식도 반복자에서 값을 요청할 수 있습니다.'],
  ], '지연 처리는 필요 없는 중간 값 계산과 배열 생성을 줄일 수 있습니다. 같은 반복자의 소비 상태가 진행되므로 재사용 요구를 확인하고, 실행 환경이 Iterator 도구를 제공하는지도 확인해야 합니다.', ['iterator-helpers', 'iterator-protocol'], mdn + 'Reference/Global_Objects/Iterator/map'),
  make(7, 'practical', 'concept', 'interface 선언 병합', '같은 이름의 interface를 두 번 선언했습니다. User 값이 갖춰야 하는 필드는 무엇인가요?', [
    ['id와 active를 모두 갖춰야 합니다.', '호환되는 interface 선언이 병합되어 두 필드를 가진 타입이 됩니다.'],
    ['마지막 선언의 active만 갖춰야 합니다.', '선언 병합은 앞선 interface를 단순히 덮어쓰는 방식이 아닙니다.'],
    ['첫 선언의 id만 갖춰야 합니다.', '뒤의 호환되는 interface 선언도 같은 타입에 포함됩니다.'],
    ['같은 이름이라 항상 컴파일 오류가 발생합니다.', 'type 별칭의 중복 선언과 달리 interface는 선언 병합을 지원합니다.'],
  ], '타입 계약의 확장이 필요할 때 interface 병합과 모듈 보강을 사용할 수 있습니다. 동일 속성의 충돌은 규칙을 지켜야 하며 타입을 보강했다고 실제 객체에 필드가 자동으로 생기지는 않습니다.', ['declaration-merging', 'interface'], ts + 'docs/handbook/declaration-merging.html', 'interface User { id: string }\ninterface User { active: boolean }\nconst user: User = { id: "u1", active: true };', undefined, 'typescript'),
  make(8, 'practical', 'practical', '선택 속성의 존재 의미', 'strictNullChecks와 exactOptionalPropertyTypes가 켜져 있습니다. type Settings = { theme?: "dark" }에서 허용되는 값은 무엇인가요?', [
    ['{} 또는 { theme: "dark" }이며 { theme: undefined }는 허용되지 않습니다.', '속성 생략은 허용하지만 명시적 undefined 값은 선언한 속성 타입에 포함되지 않습니다.'],
    ['{ theme: undefined }만 허용됩니다.', '선택 속성의 의미를 반대로 해석했습니다. 선언한 dark와 속성 생략이 허용됩니다.'],
    ['어떤 문자열을 넣어도 허용됩니다.', 'theme 타입은 string 전체가 아니라 dark 리터럴로 제한되어 있습니다.'],
    ['theme를 읽을 때 항상 "dark"이며 부재 처리가 필요 없습니다.', '선택 속성은 생략될 수 있으므로 읽기 결과에 undefined 가능성이 남습니다.'],
  ], '패치 요청이나 객체 병합에서 속성 생략과 undefined 대입은 다른 의미를 가질 수 있습니다. 이 옵션은 쓰기 계약을 정확히 표현하며 런타임 입력 검증과 읽을 때의 부재 처리를 대신하지 않습니다.', ['exact-optional-property-types', 'optional-property'], ts + 'tsconfig/exactOptionalPropertyTypes.html'),
  make(9, 'practical', 'practical', '타입 전용 import의 실행', '모듈의 최상위에 설정 등록 코드가 있습니다. 그 모듈에서 import type만 하면 등록 코드가 실행되나요?', [
    ['아니요. 타입 전용 import는 JavaScript 출력에서 제거되므로 실행을 요구하지 않습니다.', '부수 효과가 필요하면 별도의 런타임 import를 명시해야 합니다.'],
    ['네. 모든 import는 타입 용도와 무관하게 실행됩니다.', 'import type은 런타임 import와 다르게 지워집니다.'],
    ['네. 개발 환경에서만 반드시 실행됩니다.', '타입 전용 import의 제거를 개발 환경의 실행 규칙으로 바꿔 설명할 수 없습니다.'],
    ['등록 함수의 이름이 interface와 같으면 실행됩니다.', '이름 일치 여부가 타입 전용 import를 런타임 호출로 바꾸지 않습니다.'],
  ], '타입 계약을 가져오는 것과 모듈의 실행 효과를 요구하는 것은 구분해야 합니다. 설정 등록처럼 실행이 필요한 코드에는 명시적인 부수 효과 import를 사용하고 실제 빌드 출력도 확인합니다.', ['type-import', 'es-modules'], ts + 'docs/handbook/release-notes/typescript-3-8.html'),
  make(10, 'practical', 'practical', '브랜드 타입과 외부 데이터', '외부 문자열을 as UserId로 단언했습니다. 브랜드 타입만으로 보장되는 것에 대한 올바른 설명은 무엇인가요?', [
    ['타입 수준의 의미 구분을 표현하지만 문자열의 실제 유효성은 별도 검증이 필요합니다.', '단언은 검사기에 판단을 전달하며 ID 형식이나 존재 여부를 실행 중 검증하지 않습니다.'],
    ['단언만으로 서버에 존재하는 사용자 ID임이 확인됩니다.', '서버 조회나 검증 코드가 실행되지 않으므로 존재 여부를 보장하지 않습니다.'],
    ['문자열에 런타임 브랜드 속성이 자동 추가됩니다.', '원시값의 단언은 JavaScript 출력에서 제거되며 자동 태그를 만들지 않습니다.'],
    ['브랜드 타입은 모든 string과 완전히 같은 계약이어서 구분할 수 없습니다.', '브랜드 멤버를 가진 타입은 타입 검사에서 다른 의미의 string과 구분하는 데 사용할 수 있습니다.'],
  ], '브랜드 타입은 검증된 값을 사용하는 함수들의 의미를 분리하는 데 유용합니다. 신뢰 경계에서 검증한 뒤 전용 생성 함수로 브랜드를 부여하고, 강제 단언이 검증을 대신한다고 생각하지 않아야 합니다.', ['branded-type', 'type-assertion'], ts + 'play/typescript/language-extensions/nominal-typing.ts.html'),
  make(11, 'practical', 'concept', '타입으로 표시한 this', '함수의 this: User 매개변수 표기는 실행 코드에서 어떻게 처리되나요?', [
    ['제거되며 this 바인딩은 실제 호출 방식으로 결정됩니다.', '가짜 this 매개변수는 타입 검사에만 사용되어 수신자를 자동 바인딩하지 않습니다.'],
    ['첫 번째 실제 인수 User가 자동으로 this가 됩니다.', '일반 호출 인수와 this 바인딩은 다르며 이 표기는 실제 인수가 아닙니다.'],
    ['함수를 자동으로 화살표 함수로 변환합니다.', '표기는 함수 형태와 화살표 함수의 렉시컬 this 동작을 바꾸지 않습니다.'],
    ['함수를 호출할 때 User 클래스가 자동 생성됩니다.', '수신자 타입 선언은 객체 생성 코드가 아닙니다.'],
  ], 'TypeScript는 수신자 요구를 검사할 수 있지만 실행 동작은 JavaScript 규칙을 따릅니다. 메서드를 꺼내 콜백으로 쓰는 경우 bind나 명시적인 호출자가 필요한지 함께 검토해야 합니다.', ['function-this-parameter', 'this-binding'], ts + 'docs/handbook/2/classes.html#this-parameters'),
  make(12, 'practical', 'practical', '제네릭 추론의 기준', '허용 색 목록에서 C를 추론하고 기본 색은 NoInfer<C>로 받습니다. 목록에 없는 색을 기본값으로 전달하면 어떻게 되나요?', [
    ['목록에서 추론한 C에 맞는지 검사하므로 목록 밖 기본값을 거부할 수 있습니다.', 'NoInfer는 기본값 위치가 새로운 추론 후보를 추가하지 못하게 하지만 호환 검사는 유지합니다.'],
    ['기본값 검사가 꺼져 모든 문자열을 허용합니다.', 'NoInfer는 any가 아니며 타입 호환성 검사를 제거하지 않습니다.'],
    ['런타임에서 기본값을 첫 번째 색으로 교체합니다.', 'NoInfer는 타입 수준의 기능이며 실행 값을 교체하지 않습니다.'],
    ['기본값이 C를 넓혀 목록 밖 색을 항상 포함합니다.', '그 위치의 추론 후보 차단이 이 도구의 목적이므로 일반 추론과 다릅니다.'],
  ], '한 입력이 타입의 기준이고 다른 입력이 그 기준을 따라야 하는 API에 사용할 수 있습니다. 추론 후보를 차단하는 것과 허용 타입을 제한하는 제약을 구분해 함수의 계약을 설계합니다.', ['no-infer', 'generic-constraint'], ts + 'docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type'),
  make(13, 'practical', 'concept', 'const 타입 매개변수의 효과', 'const T extends readonly string[]인 제네릭에 배열 리터럴을 전달합니다. const가 하는 일은 무엇인가요?', [
    ['호출 위치의 리터럴 정보를 구체적으로 추론하도록 유도합니다.', 'readonly 제약과 함께 리터럴 튜플 정보가 유지되도록 추론할 수 있습니다.'],
    ['실행 중 배열을 Object.freeze로 동결합니다.', '타입 매개변수의 const는 런타임 동결 코드를 생성하지 않습니다.'],
    ['이미 string[]인 변수의 모든 원래 리터럴을 복구합니다.', '이미 넓어진 변수 타입의 소실된 정보까지 역으로 되살리는 기능은 아닙니다.'],
    ['함수의 모든 지역 변수를 재할당 불가로 바꿉니다.', 'const 타입 매개변수와 JavaScript 변수 선언 const는 다른 기능입니다.'],
  ], '리터럴 정보를 호출자에게 반복해서 as const로 적게 하고 싶을 때 유용합니다. readonly와 호환되는 제약을 정하고, 타입의 읽기 전용 성질과 실제 객체의 동결을 구분해야 합니다.', ['const-type-parameter', 'as-const'], ts + 'docs/handbook/release-notes/typescript-5-0.html'),
  make(14, 'practical', 'practical', '선언 파일과 실제 구현', '.d.ts에 declare function loadName을 적었지만 런타임 구현은 없습니다. 그 선언이 해 주는 것은 무엇인가요?', [
    ['타입 계약만 알려 주므로 실행할 loadName 구현은 별도로 필요합니다.', '선언 파일은 실제 함수를 생성하거나 네트워크 요청을 구현하지 않습니다.'],
    ['인수 타입에 맞는 함수 본문을 자동으로 생성합니다.', 'TypeScript는 선언의 타입만으로 업무 구현을 만들어 주지 않습니다.'],
    ['Promise를 반환한다고 선언하면 함수 호출 없이 데이터가 도착합니다.', '비동기 반환 타입은 실제 작업과 데이터 도착을 대신하지 않습니다.'],
    ['함수 이름과 같은 npm 패키지를 자동으로 설치합니다.', '선언 파일이 런타임 의존성을 설치하는 도구는 아닙니다.'],
  ], '타입 선언은 외부 구현을 사용하는 코드의 실수를 찾기 위한 계약입니다. 실제 라이브러리 API와 버전에 맞춰 선언을 관리하고 존재하지 않는 API를 선언했다고 실행 가능해지는 것은 아님을 이해해야 합니다.', ['declaration-file', 'type-erasure'], ts + 'docs/handbook/2/type-declarations.html'),
  make(15, 'practical', 'concept', '일반 숫자 enum의 출력', 'const enum이 아닌 일반 숫자 enum입니다. 생성되는 런타임 구조의 설명은 무엇인가요?', [
    ['이름에서 숫자로, 숫자에서 이름으로 접근하는 객체가 만들어질 수 있습니다.', '일반 숫자 enum은 정방향과 역방향 매핑을 출력 코드에 생성합니다.'],
    ['interface와 똑같이 완전히 지워집니다.', '일반 enum은 타입만인 interface와 출력 규칙이 다릅니다.'],
    ['문자열 enum만 숫자에서 이름으로 역매핑됩니다.', '숫자 enum이 역매핑을 제공하며 문자열 enum은 같은 역매핑을 만들지 않습니다.'],
    ['모든 외부 숫자가 enum 멤버인지 실행 중 자동 검증합니다.', 'enum 객체 생성과 외부 데이터의 유효성 검증은 다른 작업입니다.'],
  ], 'TypeScript 기능이 항상 출력에서 제거되는 것은 아닙니다. 일반 enum의 출력 비용과 런타임 사용 필요성을 고려하고 리터럴 유니온이나 as const 객체로 같은 계약을 표현하는 방법과 비교합니다.', ['typescript-enum', 'type-erasure'], ts + 'docs/handbook/enums.html'),
  make(16, 'practical', 'concept', '재귀 타입과 런타임 검증', 'FileNode의 children을 FileNode[]로 선언했습니다. 재귀 타입만으로 보장되지 않는 것은 무엇인가요?', [
    ['외부 데이터가 실제로 해당 구조인지, 순환이 없는지의 실행 중 검사입니다.', '타입 선언은 런타임 외부 값을 검사하거나 객체 그래프의 순환을 제거하지 않습니다.'],
    ['children 요소의 타입을 같은 FileNode로 표현하는 일입니다.', '자기 타입을 재귀 참조하여 자식 요소의 모양을 표현할 수 있습니다.'],
    ['깊이가 고정되지 않은 중첩 구조의 타입 표기입니다.', '재귀 타입은 여러 깊이의 같은 구조를 나타내는 데 사용할 수 있습니다.'],
    ['name 속성을 string으로 요구하는 타입 검사입니다.', '선언한 속성의 타입 요구는 정적 검사에서 적용됩니다.'],
  ], '재귀 타입을 사용하면 고정된 여러 단계의 타입을 복사하지 않고 트리를 표현할 수 있습니다. 외부 JSON은 별도 구조 검증이 필요하며 실제 재귀 순회에는 깊이 한계와 순환 참조 정책이 필요합니다.', ['recursive-type', 'type-erasure'], ts + 'docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types'),
  make(17, 'practical', 'coding-test', '좌표 압축의 순위', '서로 다른 값을 정렬하고 0부터 순위를 부여했습니다. 원래 목록을 순위로 바꾸면 무엇이 출력되나요?', [
    ['[0,2,0,1]', '서로 다른 값 100, 500, 1000의 순위가 각각 0, 1, 2입니다.'],
    ['[0,1,2,3]', '같은 값 100에는 같은 순위를 부여하므로 등장 위치별로 다른 인덱스를 주지 않습니다.'],
    ['[100,1000,100,500]', '이 코드는 원래 값을 출력하지 않고 순위 Map의 조회 결과를 출력합니다.'],
    ['[1,3,1,2]', '인덱스를 0부터 부여했으므로 1 기반 순위가 아닙니다.'],
  ], '좌표 압축은 순서와 동일성을 보존해 큰 값을 작은 배열 인덱스로 바꿉니다. 원래 값의 차이는 보존되지 않으므로 거리가 필요한 문제에서는 원래 좌표를 별도로 유지해야 합니다.', ['coordinate-compression', 'map-object'], 'https://usaco.guide/silver/sorting-custom', 'const values = [100, 1000, 100, 500];\nconst sorted = [...new Set(values)].sort((a, b) => a - b);\nconst rank = new Map(sorted.map((value, index) => [value, index]));\nconsole.log(values.map(value => rank.get(value)));', ['[0,2,0,1]']),
  make(18, 'practical', 'coding-test', '유클리드 호제법의 진행', '두 정수의 최대공약수를 나머지로 갱신합니다. 출력값은 무엇인가요?', [
    ['6', '48과 18의 나머지 과정을 따라 18,12와 12,6을 거쳐 6,0에 도달합니다.'],
    ['12', '12는 중간의 나머지이며 18과 12의 공약수를 다시 구해야 합니다.'],
    ['18', '18은 48을 나누지 못하므로 최대공약수가 아닙니다.'],
    ['864', '두 입력을 곱한 값은 이 코드의 최대공약수 결과가 아닙니다.'],
  ], 'gcd(a,b)=gcd(b,a%b) 관계로 더 작은 문제를 반복하며 b가 0이면 종료합니다. 음수와 0 입력의 정책을 정하고 큰 정수 계산에서는 나머지 연산을 포함한 숫자 표현의 정확성을 확인합니다.', ['gcd', 'recursion'], cp + 'algebra/euclid-algorithm.html', 'function gcd(a, b) {\n  while (b !== 0) [a, b] = [b, a % b];\n  return Math.abs(a);\n}\nconsole.log(gcd(48, 18));', ['6']),
  make(19, 'practical', 'coding-test', '소수 체의 시작 배수', '에라토스테네스의 체에서 아직 소수인 i의 배수를 지우려 합니다. i²부터 시작해도 되는 이유는 무엇인가요?', [
    ['i²보다 작은 i의 배수는 더 작은 소인수의 단계에서 이미 표시되었기 때문입니다.', 'i보다 작은 인수를 가진 배수는 앞서 처리한 소수의 배수로 이미 걸러집니다.'],
    ['i²보다 작은 수는 모두 소수이기 때문입니다.', '작은 범위에도 합성수가 있으며 이미 앞 단계에서 지워졌다는 것이 이유입니다.'],
    ['i² 이후의 모든 수는 i의 배수이기 때문입니다.', 'i² 이후에도 i의 배수가 아닌 수가 있으므로 i 간격으로 표시해야 합니다.'],
    ['0과 1도 소수라서 배수 검사가 필요 없기 때문입니다.', '0과 1은 소수가 아니며 별도로 제외해야 합니다.'],
  ], '체는 이미 처리한 작은 소수의 정보를 재사용해 중복 표시를 줄입니다. 배열 경계와 i² 계산 범위, 0과 1의 초기 상태를 확인하고 한 수의 소수 판별과 범위 전체 전처리를 구분해야 합니다.', ['prime-sieve', 'big-o-notation'], cp + 'algebra/sieve-of-eratosthenes.html'),
  make(20, 'practical', 'coding-test', '자바스크립트 비트 폭', 'Number와 BigInt로 32비트만큼 왼쪽 이동했습니다. 두 출력은 무엇인가요?', [
    [outputs('1', '"4294967296"'), 'Number 시프트의 이동량은 32로 나눈 나머지를 사용하지만 BigInt는 같은 32비트 제한이 없습니다.'],
    [outputs('4294967296', '"4294967296"'), 'Number의 <<는 일반 거듭제곱 계산이 아니므로 32 이동이 그대로 적용되지 않습니다.'],
    [outputs('0', '"0"'), 'Number는 이동량 0으로 처리되고 BigInt는 실제 큰 정수를 만듭니다.'],
    [outputs('-2147483648', '"2147483648"'), '이는 31비트 이동과 관련된 값이며 코드의 이동량은 32입니다.'],
  ], '비트마스크를 Number로 구현할 때는 언어의 32비트 변환과 시프트 규칙을 고려해야 합니다. 더 넓은 상태가 필요하면 BigInt나 집합 표현을 선택하고 BigInt 연산에는 같은 타입의 피연산자를 사용합니다.', ['bitmask', 'bigint'], mdn + 'Reference/Operators/Left_shift', 'console.log(1 << 32);\nconsole.log(String(1n << 32n));', ['1', '4294967296']),
];
const advanced: QuizQuestion[] = [
  make(1, 'advanced', 'practical', '상태를 가진 정규식 검사', '같은 g 플래그 정규식으로 같은 문자열을 연속 검사했습니다. 두 출력은 무엇인가요?', [
    [outputs('true', 'false'), '첫 성공 뒤 lastIndex가 1이 되어 다음 검색은 끝에서 시작하고 일치하지 않습니다.'],
    [outputs('true', 'true'), 'g 플래그의 test는 같은 문자열에도 검색 시작 상태를 유지하므로 독립적인 검사와 다릅니다.'],
    [outputs('false', 'true'), '새 정규식의 첫 검색은 인덱스 0에서 a를 찾아 성공합니다.'],
    [outputs('false', 'false'), '패턴과 첫 문자 a가 일치하므로 첫 검사는 실패하지 않습니다.'],
  ], '전역·sticky 정규식은 lastIndex를 갱신하는 상태를 가집니다. 입력 검증을 반복하려면 상태가 필요 없는 플래그를 선택하거나 각 검사 전에 적절히 초기화하고 검색용 상태와 검증용 함수를 구분해야 합니다.', ['regular-expression', 'validation'], mdn + 'Reference/Global_Objects/RegExp/lastIndex', 'const pattern = /a/g;\nconsole.log(pattern.test("a"));\nconsole.log(pattern.test("a"));', ['true', 'false']),
  make(2, 'advanced', 'concept', 'Proxy의 읽기 불변 조건', '재정의 불가·읽기 전용 데이터 속성에 get trap이 다른 값을 보고합니다. 결과는 무엇인가요?', [
    ['TypeError', '고정된 자체 데이터 속성의 실제 값과 다른 값을 보고하면 Proxy의 명세상 불변 조건을 위반합니다.'],
    ['2', 'get trap이 모든 대상 속성 규칙을 무조건 우회할 수 있는 것은 아닙니다.'],
    ['1', '엔진이 자동으로 trap 결과를 수정해 실제 값으로 바꾸는 것이 아니라 오류를 발생시킵니다.'],
    ['undefined', '불변 조건 위반을 없는 속성처럼 처리하지 않습니다.'],
  ], 'Proxy의 유연성에도 대상 객체가 강제하는 불변 조건이 있습니다. 라이브러리의 반응형 래퍼나 검증 래퍼를 설계할 때 디스크립터와 호환되지 않는 결과를 만들지 않도록 확인해야 합니다.', ['proxy-object', 'property-descriptor'], mdn + 'Reference/Global_Objects/Proxy/Proxy/get#invariants', 'const target = {};\nObject.defineProperty(target, "x", { value: 1, writable: false, configurable: false });\nconst proxy = new Proxy(target, { get() { return 2; } });\ntry { console.log(proxy.x); }\ncatch (error) { console.log(error.name); }', ['TypeError']),
  make(3, 'advanced', 'coding-test', '0-1 BFS의 후보 배치', '간선 비용이 0 또는 1인 그래프에서 Deque로 거리를 완화합니다. 짧아진 거리의 후보를 어디에 넣어야 하나요?', [
    ['비용 0 간선의 후보는 앞에, 비용 1 간선의 후보는 뒤에 넣습니다.', '현재 거리와 같은 후보를 앞에서 처리하고 한 단계 큰 후보를 뒤에 둡니다.'],
    ['모든 후보를 뒤에 넣고 최초 발견 뒤 거리를 고정합니다.', '일반 BFS의 규칙만 사용하면 비용 0 경로의 더 짧은 거리 갱신을 놓칠 수 있습니다.'],
    ['비용 0 후보는 뒤에, 비용 1 후보는 앞에 넣습니다.', '거리 후보의 우선순위를 반대로 만들어 작은 비용 후보의 순서를 유지하지 못합니다.'],
    ['비용이 0인 간선은 경로에 영향을 주지 않으므로 삭제합니다.', '비용 0도 다른 정점에 도달하는 연결이므로 삭제하면 유효한 경로를 잃습니다.'],
  ], '0-1 BFS는 제한된 간선 비용에서 거리 후보의 차이가 작다는 성질을 이용합니다. 임의 가중치에는 그대로 적용하지 않으며 더 짧은 거리일 때만 갱신하고 Deque의 양끝 연산 비용도 확인해야 합니다.', ['zero-one-bfs', 'deque'], cp + 'graph/01_bfs.html'),
  make(4, 'advanced', 'coding-test', 'Union-Find 경로 압축', 'find가 대표를 찾은 뒤 방문한 부모 경로를 압축합니다. 대표와 parent[3]의 출력은 무엇인가요?', [
    [outputs('0', '0'), '3에서 2, 1, 0으로 따라간 뒤 3의 부모를 최종 대표 0으로 갱신합니다.'],
    [outputs('0', '2'), '대표만 반환하는 find와 달리 이 구현은 parent[3]도 대표로 대입합니다.'],
    [outputs('2', '2'), '2는 중간 부모이며 자기 자신이 부모인 대표까지 계속 탐색합니다.'],
    [outputs('3', '0'), '시작 원소 3이 집합의 대표가 아니므로 find 반환값은 3이 아닙니다.'],
  ], '경로 압축은 find의 다음 호출이 긴 부모 사슬을 반복하지 않게 만듭니다. union by rank 또는 size와 함께 효율을 개선하며 대표 번호에 최소값 같은 추가 의미가 있다고 가정하지 않아야 합니다.', ['union-find', 'amortized-analysis'], cp + 'data_structures/disjoint_set_union.html', 'const parent = [0, 0, 1, 2];\nfunction find(x) {\n  if (parent[x] !== x) parent[x] = find(parent[x]);\n  return parent[x];\n}\nconsole.log(find(3));\nconsole.log(parent[3]);', ['0', '0']),
  make(5, 'advanced', 'coding-test', '연결되지 않은 그래프의 MST', '무향 가중 그래프에 Kruskal을 적용했지만 정점들이 두 연결 요소로 남았습니다. 올바른 해석은 무엇인가요?', [
    ['전체를 잇는 신장 트리는 없고 각 요소의 최소 신장 숲을 얻습니다.', '연결할 간선이 없으면 모든 정점을 하나의 트리로 만들 수 없습니다.'],
    ['남은 두 요소의 대표 번호를 바꾸면 전체가 연결됩니다.', '대표 라벨을 바꿔도 실제 그래프에 연결 간선이 생기지는 않습니다.'],
    ['항상 모든 정점까지의 개별 최단 경로가 계산됩니다.', '최소 신장 트리와 시작점의 최단 경로는 목적과 결과가 다릅니다.'],
    ['고른 간선 비용이 작으면 연결 여부는 검사하지 않아도 됩니다.', '신장 트리의 요구에는 전체 연결이 포함되어 비용만으로 성공을 판단할 수 없습니다.'],
  ], '최소 신장 트리를 요구하는 문제에서는 비용 합 외에 연결 완료를 검사해야 합니다. 일반적으로 성공한 합치기 수가 V-1인지 확인하고, 연결이 불가능한 입력의 출력 정책을 명확히 정합니다.', ['minimum-spanning-tree', 'union-find'], cp + 'graph/mst_kruskal.html'),
  make(6, 'advanced', 'coding-test', 'Bellman-Ford의 추가 완화', '정점 수가 V입니다. 시작점에서 도달 가능한 거리만 완화했는데 V번째 전체 간선 순회에서도 거리가 줄었습니다. 무엇을 뜻하나요?', [
    ['시작점에서 도달 가능한 음수 사이클이 존재합니다.', '단순 경로는 최대 V-1개의 간선을 사용하므로 추가 개선은 도달 가능한 음수 사이클과 관련됩니다.'],
    ['그래프에 음수 간선이 하나라도 있으면 항상 같은 현상이 생깁니다.', '음수 간선이 있어도 음수 사이클이 없는 유한 최단 경로는 V-1회 안에 계산됩니다.'],
    ['시작점과 무관한 모든 음수 사이클을 빠짐없이 검출했다는 뜻입니다.', '도달 가능한 거리만 초기화한 검사는 시작점에서 닿지 않는 사이클을 찾지 않을 수 있습니다.'],
    ['최단 거리가 유일하다는 뜻입니다.', '추가 완화는 유일성 판정이 아니라 음수 사이클의 징후입니다.'],
  ], '음수 간선과 음수 사이클은 구분해야 합니다. 시작점에서 도달 가능한 사이클을 찾는지 그래프 전체의 사이클을 찾는지에 따라 초기화가 달라지고, 사이클에서 도달하는 정점의 최단 거리도 무한히 줄어들 수 있습니다.', ['bellman-ford', 'graph'], cp + 'graph/bellman_ford.html'),
  make(7, 'advanced', 'coding-test', 'Floyd-Warshall의 단계', '표준 Floyd-Warshall에서 중간 정점 k를 가장 바깥 반복문에 둡니다. 각 단계가 확장하는 것은 무엇인가요?', [
    ['경로 내부에 사용할 수 있는 중간 정점의 집합입니다.', 'k 단계에서 k를 새 중간 정점으로 허용한 최단 거리로 모든 정점 쌍을 갱신합니다.'],
    ['간선의 가중치를 정렬한 순서입니다.', '알고리즘은 간선 가중치를 정렬하는 단계가 아닙니다.'],
    ['현재 방문한 출발점 하나의 BFS 깊이입니다.', '모든 정점 쌍의 거리 DP이며 무가중 BFS 층을 확장하는 것이 아닙니다.'],
    ['정점들의 사전순 출력 순서입니다.', '정점 이름의 정렬이 최단 경로 점화 관계를 제공하지 않습니다.'],
  ], '반복문 순서는 점화 관계의 단계 의미와 연결되어 있습니다. dist[i][k]+dist[k][j]가 이전 허용 범위를 이용해 새 경유 정점을 포함하도록 갱신하며, 표준 구현의 불변식을 이해한 뒤 최적화해야 합니다.', ['floyd-warshall', 'dynamic-programming'], cp + 'graph/all-pair-shortest-path-floyd-warshall.html'),
  make(8, 'advanced', 'coding-test', '누적합 빈도로 부분합 개수', '음수도 있는 배열에서 합이 0인 비어 있지 않은 연속 부분배열의 개수를 구합니다. 출력은 무엇인가요?', [
    ['4', '같은 누적합의 이전 등장 횟수가 합 0인 구간 수에 더해져 총 네 구간을 셉니다.'],
    ['2', '인접한 길이 2 구간 일부만 세면 길이 4 구간 등의 경우를 놓칩니다.'],
    ['3', '길이 2인 세 구간만 세면 전체 길이 4인 구간 하나를 빠뜨립니다.'],
    ['5', '비어 있지 않은 유효 구간은 네 개입니다. 추가로 빈 구간을 하나 세어서는 안 됩니다.'],
  ], 'prefix[j]-prefix[i]=target 관계를 이용하면 음수가 있어도 이전 누적합의 빈도로 구간 수를 셀 수 있습니다. 초기 누적합 0의 빈도를 1로 두고 조회한 뒤 등록해야 시작점 구간을 포함하며 빈 구간은 제외합니다.', ['prefix-sum', 'map-object'], 'https://usaco.guide/problems/cses-1661-subarray-sums-ii/solution', 'const values = [1, -1, 1, -1];\nconst counts = new Map([[0, 1]]);\nlet sum = 0, answer = 0;\nfor (const value of values) {\n  sum += value;\n  answer += counts.get(sum) ?? 0;\n  counts.set(sum, (counts.get(sum) ?? 0) + 1);\n}\nconsole.log(answer);', ['4']),
  make(9, 'advanced', 'coding-test', '끝점이 만나는 시간 구간', '회의 시간은 [start, end)입니다. 같은 시각에 종료와 시작이 있으면 동시 회의 수를 셀 때 어떤 순서가 맞나요?', [
    ['종료 이벤트를 먼저 처리한 뒤 시작 이벤트를 처리합니다.', '끝 시각을 포함하지 않으므로 기존 회의가 끝난 뒤 새 회의를 시작한 상태로 셉니다.'],
    ['시작을 먼저 처리해 두 회의를 반드시 겹친 것으로 셉니다.', '반열린 구간에서 닿는 끝점은 공통으로 점유하는 시간이 아닙니다.'],
    ['같은 시각의 이벤트는 전부 버립니다.', '종료와 시작이 모두 상태에 영향을 주므로 삭제하면 이후 개수가 잘못됩니다.'],
    ['정렬 없이 입력에 나온 순서대로 처리합니다.', '입력 순서가 시간 순서나 동점 정책을 보장하지 않습니다.'],
  ], '스위프 라인의 같은 좌표 처리 정책은 구간의 포함 조건에서 결정합니다. 최댓값을 언제 갱신할지도 그 정책에 맞춰야 하며 닫힌 구간과 반열린 구간의 이벤트 순서를 그대로 공유하지 않아야 합니다.', ['sweep-line', 'sorting'], 'https://usaco.guide/plat/sweep-line'),
  make(10, 'advanced', 'coding-test', '정답 탐색의 단조성', '처리 용량 x가 가능하면 x보다 큰 용량도 모두 가능합니다. 최소 가능한 정수 용량을 이분 탐색하기 위한 핵심 조건은 무엇인가요?', [
    ['불가능에서 가능으로 한 번 전환하는 판별 조건과 답을 포함하는 초기 범위입니다.', '단조 판별의 경계를 유지하며 후보 범위를 줄여 최소 가능한 값을 찾습니다.'],
    ['모든 후보의 실행 시간이 서로 같아야 합니다.', '판별 비용은 복잡도에 영향을 주지만 모든 후보의 비용이 같아야 탐색 가능한 것은 아닙니다.'],
    ['가능과 불가능이 번갈아 나타나도 중간값만 보면 됩니다.', '비단조 결과는 한쪽 후보를 안전하게 제거하는 근거를 제공하지 않습니다.'],
    ['용량을 정렬한 실제 배열이 반드시 존재해야 합니다.', '수치 답 범위를 판별 함수로 탐색할 수 있으므로 모든 후보 배열을 만들 필요는 없습니다.'],
  ], '정답에 대한 이분 탐색은 후보 값의 저장 여부보다 가능 판별의 단조성이 중요합니다. 최소·최대 요구에 맞는 경계를 정의하고 판별 함수 비용을 곱한 전체 시간과 오버플로 없는 중간값 계산을 검토합니다.', ['binary-search-on-answer', 'binary-search'], cp + 'num_methods/binary_search.html#binary-search-on-the-answer'),
  make(11, 'advanced', 'coding-test', '모듈러 빠른 거듭제곱', 'BigInt로 3의 13제곱을 17로 나눈 나머지를 계산합니다. 출력은 무엇인가요?', [
    ['12', '필요한 지수 비트에서 곱하고 매번 나머지를 유지하면 3^13 mod 17은 12입니다.'],
    ['13', '지수 자체를 결과로 반환하는 코드가 아니며 실제 거듭제곱 나머지와 다릅니다.'],
    ['3', '기본 밑을 그대로 반환하지 않고 여러 지수 비트의 곱을 누적합니다.'],
    ['0', '17은 3의 거듭제곱을 나누지 않으므로 이 결과가 0이 되지 않습니다.'],
  ], '지수를 절반씩 줄이고 밑을 제곱해 곱셈 단계 수를 줄입니다. BigInt 사용은 Number의 중간 곱 정밀도 손실을 피하며, 전체 성능에는 큰 정수 연산의 비트 비용도 포함됩니다.', ['fast-exponentiation', 'bigint'], cp + 'algebra/binary-exp.html', 'let base = 3n, exponent = 13n, result = 1n;\nconst modulus = 17n;\nwhile (exponent > 0n) {\n  if (exponent % 2n === 1n) result = result * base % modulus;\n  base = base * base % modulus;\n  exponent /= 2n;\n}\nconsole.log(String(result));', ['12']),
  make(12, 'advanced', 'coding-test', '펜윅 트리 질의 경로', '1 기반 Fenwick 트리의 prefix(7)에서 i -= i & -i로 이동합니다. 방문하는 인덱스는 무엇인가요?', [
    ['[7,6,4]', '최하위 설정 비트 1, 2, 4를 차례로 빼면 7에서 6, 4, 0으로 진행합니다.'],
    ['[7,8]', '인덱스를 증가시키는 갱신 경로와 감소시키는 누적 질의 경로는 다릅니다.'],
    ['[7,6,5,4,3,2,1]', '저장된 구간을 묶어 더하므로 모든 인덱스를 하나씩 방문하지 않습니다.'],
    ['[7,3,1]', '인덱스를 단순히 절반으로 줄이는 이진 트리 부모 이동과 다른 규칙입니다.'],
  ], '펜윅 트리는 인덱스의 비트 패턴으로 담당 구간을 정합니다. 누적 질의와 점 갱신의 진행 방향을 구분하고 1 기반 구현에서 0을 시작값으로 사용해 무한 반복이 생기지 않도록 검증합니다.', ['fenwick-tree', 'bitmask'], cp + 'data_structures/fenwick.html', 'const visited = [];\nfor (let i = 7; i > 0; i -= i & -i) visited.push(i);\nconsole.log(visited);', ['[7,6,4]']),
  make(13, 'advanced', 'coding-test', '구간 합 트리의 지연 갱신', '세그먼트 트리 노드가 원소 5개의 합 10을 저장합니다. 그 구간의 모든 원소에 3을 더하면 노드 합은 얼마인가요?', [
    ['25', '각 원소가 3씩 증가하므로 합에는 3×5=15를 더합니다.'],
    ['13', '노드 합에 3을 한 번만 더하면 구간 길이만큼의 증가를 반영하지 못합니다.'],
    ['15', '증가량 15를 원래 합 10에 더해야 하며 원래 합을 덮어쓰면 안 됩니다.'],
    ['30', '원소마다 3을 더하는 요청은 합 전체를 3배로 만드는 요청이 아닙니다.'],
  ], 'lazy propagation의 표식은 노드가 저장하는 집계 종류에 맞게 적용해야 합니다. 합에서는 길이에 비례한 변화가 생기며 덧셈과 대입 같은 서로 다른 갱신을 함께 지원하면 표식 합성 순서도 정확히 정의해야 합니다.', ['segment-tree', 'array-reduce'], cp + 'data_structures/segment_tree.html'),
  make(14, 'advanced', 'coding-test', '강한 연결 요소의 압축', '유향 그래프의 각 강한 연결 요소를 한 정점으로 압축하고 요소 사이 간선만 남겼습니다. 결과의 성질은 무엇인가요?', [
    ['방향 비순환 그래프이므로 위상 순서를 구할 수 있습니다.', '요소 사이에 사이클이 있다면 서로 도달 가능해 하나의 강한 연결 요소여야 합니다.'],
    ['항상 하나의 직선 경로가 됩니다.', '사이클이 없다는 성질이 분기나 여러 출발점까지 없애지는 않습니다.'],
    ['무향 트리가 되어 간선 방향은 사라집니다.', '압축은 방향 관계를 보존하며 트리라는 보장은 없습니다.'],
    ['원래 그래프의 모든 사이클이 서로 다른 요소 사이에 그대로 남습니다.', '순환하며 왕복 도달 가능한 정점들은 같은 요소 안으로 묶입니다.'],
  ], 'SCC 압축은 순환 의존 묶음과 묶음 사이의 선행 관계를 분리합니다. 압축 그래프에서 DP나 위상 정렬을 적용할 수 있지만 요소 내부의 상세 경로와 의미는 별도로 보관해야 합니다.', ['strongly-connected-component', 'topological-sort'], cp + 'graph/strongly-connected-components.html'),
  make(15, 'advanced', 'coding-test', '공통 부분 수열과 연속성', '두 문자열의 최장 공통 부분 수열 길이를 계산합니다. abc와 ac의 결과는 무엇인가요?', [
    ['2', '순서를 지키며 b를 건너뛰어 ac를 고를 수 있으므로 길이는 2입니다.'],
    ['1', '공통 부분 문자열의 연속 조건을 적용하면 b를 건너뛰는 유효한 부분 수열을 놓칩니다.'],
    ['3', 'b는 두 번째 문자열에 없으므로 abc 전체를 공통으로 고를 수 없습니다.'],
    ['0', 'a와 c가 공통으로 존재하여 공통 부분 수열이 비어 있지 않습니다.'],
  ], 'LCS는 상대 순서를 유지하는 선택이며 연속할 필요는 없습니다. 끝 문자가 같으면 이전 접두사 답에 1을 더하고 다르면 어느 한쪽 끝을 제외한 두 답의 최댓값을 사용합니다. 길이와 실제 수열 복원 요구도 구분합니다.', ['longest-common-subsequence', 'dynamic-programming'], 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/28461a74f81101874a13d9679a40584d_MIT6_006S20_lec16.pdf', 'const a = "abc", b = "ac";\nconst dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));\nfor (let i = 1; i <= a.length; i++) {\n  for (let j = 1; j <= b.length; j++) {\n    dp[i][j] = a[i - 1] === b[j - 1]\n      ? dp[i - 1][j - 1] + 1\n      : Math.max(dp[i - 1][j], dp[i][j - 1]);\n  }\n}\nconsole.log(dp[a.length][b.length]);', ['2']),
  make(16, 'advanced', 'coding-test', 'KMP의 접두사 함수', '각 접두사에서 자기 자신을 제외한 가장 긴 접두사·접미사 일치 길이를 구합니다. ababaca의 결과는 무엇인가요?', [
    ['[0,0,1,2,3,0,1]', 'abab와 ababa까지 반복되는 접두사를 이용하고 c에서 불일치가 이어져 길이가 0이 됩니다.'],
    ['[1,2,3,4,5,6,7]', '자기 자신 전체는 접두사 함수의 proper prefix 후보에서 제외합니다.'],
    ['[0,0,0,0,0,0,0]', '세 번째 문자 이후에는 a, ab 등의 접두사·접미사 일치가 존재합니다.'],
    ['[0,0,1,2,3,4,5]', 'c가 기대하는 다음 문자 b와 다르므로 기존 일치 길이를 그대로 늘릴 수 없습니다.'],
  ], '접두사 함수는 실패 뒤에도 재사용할 수 있는 패턴의 일치 길이를 저장합니다. 불일치 때 pi[j-1]로 후보를 줄이는 규칙을 지켜 이미 비교한 앞부분을 반복하지 않도록 합니다.', ['kmp', 'array-data-structure'], cp + 'string/prefix-function.html', 'const text = "ababaca";\nconst pi = Array(text.length).fill(0);\nfor (let i = 1; i < text.length; i++) {\n  let j = pi[i - 1];\n  while (j > 0 && text[i] !== text[j]) j = pi[j - 1];\n  if (text[i] === text[j]) j++;\n  pi[i] = j;\n}\nconsole.log(pi);', ['[0,0,1,2,3,0,1]']),
  make(17, 'advanced', 'coding-test', '절반 탐색의 결합 비용', '원소 40개의 부분집합 합을 양쪽 20개씩 열거했습니다. 목표 합 하나의 존재를 찾을 때 결합 비용을 줄이는 방법은 무엇인가요?', [
    ['한쪽 합 목록을 정렬하고 다른 쪽 합마다 필요한 보완 합을 이분 탐색합니다.', '두 목록의 모든 쌍을 비교하지 않고 각 후보의 짝을 효율적으로 찾을 수 있습니다.'],
    ['양쪽의 모든 후보 쌍을 다시 전부 비교합니다.', '2^20×2^20 비교는 다시 2^40 수준이 되어 절반 분할의 이점을 잃습니다.'],
    ['양쪽에서 가장 큰 합 하나만 남깁니다.', '목표 합이 더 작은 후보 조합으로 만들어질 수 있어 유효한 답을 잃습니다.'],
    ['서로 다른 후보를 전부 하나의 0으로 대체합니다.', '원래 부분합 정보를 잃어 목표 합의 존재를 판별할 수 없습니다.'],
  ], 'Meet in the Middle은 열거와 결합 두 비용을 함께 줄여야 합니다. 존재 판별인지 조합 개수 집계인지에 따라 중복 합 처리와 이분 탐색의 경계를 정하고 두 후보 목록의 메모리 비용도 고려합니다.', ['meet-in-the-middle', 'binary-search'], 'https://usaco.guide/gold/meet-in-the-middle'),
  make(18, 'advanced', 'coding-test', '2차원 누적합의 중복 제거', 'P[r][c]는 앞의 r행·c열 합입니다. 행 [1,3), 열 [1,4)의 합을 구하는 식은 무엇인가요?', [
    ['P[3][4] - P[1][4] - P[3][1] + P[1][1]', '위쪽과 왼쪽을 빼면 좌상단이 두 번 빠져 한 번 다시 더해야 합니다.'],
    ['P[3][4] - P[1][4] - P[3][1] - P[1][1]', '중복으로 뺀 좌상단을 또 빼면 원하는 사각형 합에서 더 멀어집니다.'],
    ['P[3][4] - P[1][1]', '큰 사각형에서 좌상단만 빼면 위쪽과 왼쪽의 제외해야 할 띠가 남습니다.'],
    ['P[2][3] - P[1][1]', 'P는 앞의 개수 기준이므로 반열린 끝 3과 4를 그대로 사용해야 합니다.'],
  ], '2차원 구간 합은 포함·배제 원리와 인덱스 정의가 핵심입니다. 0행·0열의 빈 경계 칸을 준비하면 같은 식을 경계 사각형에도 적용할 수 있으며 질의의 양 끝 포함 조건을 먼저 변환해야 합니다.', ['prefix-sum', 'array-data-structure'], 'https://usaco.guide/silver/more-prefix-sums'),
  make(19, 'advanced', 'coding-test', '차분 갱신의 누적 복원', '길이 5의 0 배열에 두 반열린 구간 갱신을 기록했습니다. 누적 복원한 최종 배열은 무엇인가요?', [
    ['[1,3,2,2,0]', '인덱스 1은 두 구간의 증가량을 모두 받고 0은 1만, 2와 3은 2만 받습니다.'],
    ['[1,2,2,2,0]', '겹치는 인덱스 1에서 두 번째 갱신의 +1을 빠뜨렸습니다.'],
    ['[1,3,3,2,0]', '[0,2)는 끝 인덱스 2를 포함하지 않아 그 위치에 +1을 추가하지 않습니다.'],
    ['[1,2,-1,0,-2]', '이는 차분 배열의 앞부분이며 실제 값을 얻으려면 누적해야 합니다.'],
  ], '여러 갱신은 경계의 변화량으로 합쳐지고 마지막 누적에서 각 위치의 값으로 복원됩니다. 차분 배열과 최종 배열을 구분하고 반열린 끝 칸을 위한 추가 저장 공간을 준비해야 합니다.', ['difference-array', 'prefix-sum'], 'https://usaco.guide/silver/more-prefix-sums', 'const diff = Array(6).fill(0);\nfunction add(left, right, value) {\n  diff[left] += value; diff[right] -= value;\n}\nadd(1, 4, 2);\nadd(0, 2, 1);\nlet sum = 0;\nconst result = [];\nfor (let i = 0; i < 5; i++) { sum += diff[i]; result.push(sum); }\nconsole.log(result);', ['[1,3,2,2,0]']),
  make(20, 'advanced', 'coding-test', '정확성과 종료의 증명', '이분 탐색이 답을 후보 범위에 유지하지만 어떤 분기에서 범위가 줄지 않을 수 있습니다. 불변식만으로 무엇이 보장되지 않나요?', [
    ['반복문이 종료한다는 보장이 없으므로 감소하는 범위와 진행 규칙도 필요합니다.', '답을 유지하는 정확성 조건과 반드시 끝나는 종료 조건은 별도로 확인해야 합니다.'],
    ['답이 범위에 남아 있으면 진행 여부와 무관하게 반드시 종료합니다.', '같은 상태가 반복되면 불변식이 유지되더라도 무한 반복이 가능합니다.'],
    ['배열이 정렬되어 있으면 모든 경계 갱신이 자동으로 맞습니다.', '정렬 조건이 잘못된 중간값·경계 갱신을 자동으로 고치지는 않습니다.'],
    ['범위를 임의로 비우면 언제나 올바른 답을 얻습니다.', '후보를 근거 없이 제거하면 종료는 할 수 있어도 실제 답을 잃습니다.'],
  ], '알고리즘을 설명할 때 초기 조건, 각 반복의 불변식 보존, 종료 이후의 결론을 연결합니다. 여기에 감소하는 양을 확인해 종료를 보장하면 작은 범위에서 같은 중간값이 반복되는 경계 오류를 발견할 수 있습니다.', ['loop-invariant', 'binary-search'], cp + 'num_methods/binary_search.html#search-on-arbitrary-predicate'),
];

export const javascriptCoverageQuizzes: QuizQuestion[] = [...foundation, ...practical, ...advanced];
