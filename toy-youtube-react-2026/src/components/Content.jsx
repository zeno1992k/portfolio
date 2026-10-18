// Header.jsx
import VideoCard from './VideoCard';
import VideoCardSkeleton from './VideoCardSkeleton';
import { useRef ,useEffect } from 'react';


function Content({keyword, videos, listLoading, listError, nextPageToken, moreLoading, moreError, onLoadMore, }){
  const loadMoreRef = useRef(null);
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || listLoading || listError !== '' || moreLoading || moreError !== '' || nextPageToken === '') return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];

      if (entry.isIntersecting) { onLoadMore(); }
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [ listLoading,listError,moreLoading,moreError,nextPageToken,onLoadMore,]);

  return(
    <main className="[grid-area:content] min-w-0 p-6">
      {keyword !=='' && <p>검색어: {keyword}</p>}
      <div role="group" aria-label="영상 카테고리">
        <button type="button">전체</button>
        <button type="button">음악</button>
        <button type="button">게임</button>
      </div>
      {listLoading && (
        <div>
          <p role="status" className="sr-only">영상 목록을 불러오는 중입니다.</p>
          <ul aria-hidden="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 24 }, (_, index) => (
            <li key={index}>
              <VideoCardSkeleton />
            </li>
          ))}
          </ul>
        </div>


      )}
      {!listLoading && listError !=='' && (<p role="alert">{listError}</p>)}
      {!listLoading && listError === '' && videos.length === 0 && (<p>표시할 영상이 없습니다.</p>)}

      {!listLoading && listError === '' && videos.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <li key={video.id}>
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
      )}
      {!listLoading && listError === '' && videos.length > 0 && (
        <div ref={loadMoreRef} className="mt-6 flex flex-col items-center gap-3">
          <p role="status" className="sr-only">
            {moreLoading ? '추가 영상을 불러오는 중입니다.' : ''}
          </p>
          {moreError !== '' && (<p role="alert">{moreError}</p>)}
          {nextPageToken !=='' &&(
            <button type="button" onClick={onLoadMore} disabled={moreLoading} className="rounded-full border px-6 py-2 disabled:opacity-50">
              {moreLoading ? '불러오는 중…' : '더 보기'}
            </button>
          )}
        </div>
      )}
    </main>
  )
}
export default Content;
