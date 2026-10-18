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

// 선택한 문서 조회
export function getSelectedDocument() {
  return documents.find(function (documentData) {
    return documentData.id === selectedDocumentId;
  });
}

// 문서 생성 및 선택
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

export function getDocuments(){
  return documents;
}
