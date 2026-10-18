import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import { useState,useEffect,useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import VideoDetail from './components/VideoDetail';

function App(){
  const [keyword, setKeyword] = useState('');
  const [videos, setVideos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState('');
  const [moreLoading, setMoreLoading] = useState(false);
  const [moreError, setMoreError] = useState('');
  const moreControllerRef = useRef(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarDialogRef = useRef(null);
  const navigate = useNavigate();

  function handleSearch(query){
    setKeyword(query);
    navigate('/')
  }
  function toggleSidebar(){
    setIsSidebarOpen((prev)=> !prev);
  }

  function closeSidebar(){
    setIsSidebarOpen(false);
  }

  function handleDialogClick(event){
    if(event.target === event.currentTarget){
      closeSidebar();
    }
  }
  async function loadMoreVideos(){
    if(listLoading || nextPageToken === '' || moreControllerRef.current !== null) return;

    const controller = new AbortController();
    moreControllerRef.current = controller;

    setMoreLoading(true);
    setMoreError('');

    try {
      const collected = new Map();
      const existingIds = new Set(videos.map((video) => video.id));
      let token = nextPageToken;
      while (collected.size < 24 && token !== '') {
        const remaining = 24 - collected.size;

        const params = new URLSearchParams({
          q: keyword,
          pageToken: token,
          maxResults: String(remaining),
        });

        const response = await fetch(`/api/videos?${params}`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message ?? '추가 영상 요청 실패');
        }

        for (const video of data.items ?? []) {
          if (!existingIds.has(video.id)) {
            collected.set(video.id, video);
          }
        }

        token = data.nextPageToken ?? '';
      }
      if (!controller.signal.aborted) {
        setVideos((prev) => {
          const merged = [...prev, ...collected.values()];
          const pairs = merged.map((video) => [video.id, video]);

          return [...new Map(pairs).values()];
        });

        setNextPageToken(token);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setMoreError(err.message);
      }
    } finally {
      if (moreControllerRef.current === controller) {
        moreControllerRef.current = null;
        setMoreLoading(false);
      }
    }
  }

  useEffect(()=>{
    const controller = new AbortController();
    async function loadVideos(){
      setListLoading(true);
      setListError('');
      setVideos([]);
      setNextPageToken('');

      setMoreLoading(false);
      setMoreError('');
      try{
        const params = new URLSearchParams({q:keyword});
        const response = await fetch(`/api/videos?${params}`, { signal: controller.signal, });
        const data = await response.json();
        if(!response.ok){ throw new Error(data.error?.message ?? "영상 요청 실패"); }
        if (!controller.signal.aborted) { setVideos(data.items ?? []); setNextPageToken(data.nextPageToken ?? ''); }
      }catch(err){ if (!controller.signal.aborted && err.name !== 'AbortError') { setListError(err.message); } }
      finally{ if (!controller.signal.aborted) { setListLoading(false); } }
    }
    loadVideos();
    return () => {
      controller.abort();
      if(moreControllerRef.current !== null){
        moreControllerRef.current.abort();
        moreControllerRef.current = null;
      }
    }
  },[keyword]);

  useEffect(()=>{
    const dialog = sidebarDialogRef.current;
    if(isSidebarOpen){
      dialog.showModal();
    }else{
      dialog.close();
    }
  },[isSidebarOpen]);
  return(
    <div className="app">
      <Header onSearch={handleSearch} onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen}></Header>
      <Sidebar></Sidebar>
      <Routes>
        <Route path="/"
          element={
            <Content
              keyword={keyword}
              videos={videos}
              listLoading={listLoading}
              listError={listError}
              nextPageToken={nextPageToken}
              moreLoading={moreLoading}
              moreError={moreError}
              onLoadMore={loadMoreVideos}
            />
          }
        />
        <Route path="/watch/:videoId" element={<VideoDetail/>} />
      </Routes>

      <dialog
        id="SIDEBAR_DIALOG"
        ref={sidebarDialogRef}
        className="sidebar-dialog"
        aria-label="메뉴"
        onClick={handleDialogClick}
        onClose={closeSidebar}
      >
        <div className="sidebar-panel">
          <button type="button" onClick={closeSidebar} className="m-4">
            메뉴 닫기
          </button>
          <Sidebar />
        </div>
      </dialog>
    </div>
  );
}
export default App;
