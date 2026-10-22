// 전달받은 데이터를 화면에 표시
const documentTitle = document.querySelector(".doc-canvas__title");
const documentDescription = document.querySelector(".doc-canvas__description");
const navbarPath = document.querySelector(".navbar__path");
const documentList = document.querySelector(".doc-list");


// 전달받은 문서의 제목·설명·상단 경로를 화면에 표시
export function renderDocument(documentData) {
  documentTitle.value = documentData.title;
  documentDescription.textContent = documentData.description;
  renderDocumentPath(documentData);
}

// 전체 문서 목록을 다시 만들고 현재 선택된 문서 링크에 표시
export function renderDocumentList(documentDataList, selectedDocumentId){
  documentList.replaceChildren();

  for(const documentData of documentDataList){
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    listItem.className = "doc-list__item";
    link.className = "doc-list__link";
    link.href = "#/documents/" + documentData.id;
    link.dataset.documentId = documentData.id;
    link.textContent = documentData.title;

    if (documentData.id === selectedDocumentId) { link.setAttribute("aria-current", "page"); }
    listItem.append(link);
    documentList.append(listItem);
  }
}

// 전달받은 문서 제목으로 상단 경로 표시
export function renderDocumentPath(documentData) {
  navbarPath.textContent = "Zeno Notion / " + documentData.title;
}
