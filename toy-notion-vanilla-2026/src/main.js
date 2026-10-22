// 앱 시작과 이벤트 연결
import {
  createAndSelectDocument,
  getSelectedDocument,
  getDocuments,
  selectDocument,
  updateSelectedDocumentTitle,
} from "./document-store.js";

import {
  renderDocument,
  renderDocumentList,
  renderDocumentPath,
} from "./document-view.js";

const newPageBtn = document.querySelector("#NEW_PAGE_BTN");
const documentList = document.querySelector(".doc-list");
const documentTitleInput = document.querySelector("#DOCUMENT_TITLE");

// 현재 선택된 문서의 본문·상단 경로와 사이드바 목록을 화면에 표시
function renderSelectedDocument() {
  const selectedDocument = getSelectedDocument();
  const documentDataList = getDocuments();
  renderDocument(selectedDocument);
  renderDocumentList(documentDataList, selectedDocument.id);
}

// 주소의 문서 번호를 읽어 해당 문서를 선택하고 화면 갱신 (없는 번호는 1번 선택)
function syncFromLocation(){
  const match = location.hash.match(/^#\/documents\/(\d+)$/);
  const documentId = match ? Number(match[1]) : 1;
  const documents = getDocuments();
  // 주소에서 읽은 번호와 같은 ID의 문서 찾기
  const documentData = documents.find(function(documentData){
    return documentData.id === documentId;
  });

  selectDocument(documentData ? documentData.id : 1);
  renderSelectedDocument();
}

// 전달받은 문서 번호로 주소 변경 (이미 같은 주소면 바로 선택·화면 갱신)
function navigateTo(documentId){
  const hash = "#/documents/" + documentId;
  if(location.hash === hash){
    syncFromLocation();
    return;
  }
  location.hash = hash;
}

// 새 페이지 버튼 클릭 시 문서를 만들고 그 문서의 주소로 이동
function handleNewPageClick() {
  createAndSelectDocument();
  navigateTo(getSelectedDocument().id);
}

// 목록에서 클릭한 문서의 번호를 읽어 그 문서의 주소로 이동
function handleDocumentListClick(event) {
  const link = event.target.closest(".doc-list__link");

  if (!link) { return;}

  event.preventDefault();

  const documentId = Number(link.dataset.documentId);
  navigateTo(documentId);
}

// 입력한 제목을 데이터에 반영하고 목록·상단 경로 갱신
function handleDocumentTitleInput() {
  updateSelectedDocumentTitle(documentTitleInput.value);

  const selectedDocument = getSelectedDocument();
  renderDocumentList(getDocuments(), selectedDocument.id);
  renderDocumentPath(selectedDocument);
}

window.addEventListener("hashchange", syncFromLocation);

newPageBtn.addEventListener("click", handleNewPageClick);
documentList.addEventListener("click", handleDocumentListClick);
documentTitleInput.addEventListener("input", handleDocumentTitleInput);

syncFromLocation();
