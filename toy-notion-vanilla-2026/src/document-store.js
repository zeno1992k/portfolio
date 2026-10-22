// 문서 데이터를 보관하고 변경
// 문서 데이터를 보관하고 변경
const documents = [
  {
    id: 1,
    title: "Welcome",
    description: "나만의 문서 편집기를 만들어 봅니다.",
  },
];

let selectedDocumentId = 1;
let nextDocumentId = 2;

// 현재 선택된 번호에 해당하는 문서 데이터 반환
export function getSelectedDocument() {
  // 현재 선택 번호와 같은 ID의 문서 찾기
  return documents.find(function (documentData) {
    return documentData.id === selectedDocumentId;
  });
}

// 새 문서를 배열에 추가하고 그 문서를 현재 문서로 선택
export function createAndSelectDocument() {
  const newDocument = {
    id: nextDocumentId,
    title: "제목 없음",
    description: "",
  };

  documents.push(newDocument);
  selectedDocumentId = newDocument.id;
  nextDocumentId = nextDocumentId + 1;
}

// 전체 문서 배열 반환
export function getDocuments(){
  return documents;
}

// 현재 선택 번호를 전달받은 문서 번호로 변경 (화면 갱신은 하지 않음)
export function selectDocument(documentId) {
  selectedDocumentId = documentId;
}

export function updateSelectedDocumentTitle(title) {
  const selectedDocument = getSelectedDocument();
  selectedDocument.title = title;
}
