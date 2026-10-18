// 앱 시작과 이벤트 연결
import {
  createAndSelectDocument,
  getSelectedDocument,
  getDocuments,
} from "./document-store.js";

import {
  renderDocument,
  renderDocumentList,
} from "./document-view.js";

const newPageBtn = document.querySelector("#NEW_PAGE_BTN");

function renderSelectedDocument() {
  const selectedDocument = getSelectedDocument();
  const documentDataList = getDocuments();
  renderDocument(selectedDocument);
  renderDocumentList(documentDataList, selectedDocument.id);
}

function handleNewPageClick() {
  createAndSelectDocument();
  renderSelectedDocument();
}

renderSelectedDocument();

newPageBtn.addEventListener("click", handleNewPageClick);
