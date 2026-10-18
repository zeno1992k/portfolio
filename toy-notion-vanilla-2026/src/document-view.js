// 전달받은 데이터를 화면에 표시
const documentTitle = document.querySelector(".doc-canvas__title");
const documentDescription = document.querySelector(".doc-canvas__description");
const navbarPath = document.querySelector(".navbar__path");
const documentList = document.querySelector(".doc-list");


export function renderDocument(documentData) {
  documentTitle.textContent = documentData.title;
  documentDescription.textContent = documentData.description;
  navbarPath.textContent = "Zeno Notion / " + documentData.title;
}

export function renderDocumentList(documentDataList, selectedDocumentId){
  documentList.replaceChildren();

  for(const documentData of documentDataList){
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    listItem.className = "doc-list__item";
    link.className = "doc-list__link";
    link.href = "#document-" + documentData.id;
    link.textContent = documentData.title;

    if (documentData.id === selectedDocumentId) { link.setAttribute("aria-current", "page"); }
    listItem.append(link);
    documentList.append(listItem);
  }
}
